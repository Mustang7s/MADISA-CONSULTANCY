const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const auth = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { fullname, email, password } = req.body;

        // Validate input
        if (!fullname || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if user already exists
        const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const [result] = await db.query(
            'INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)',
            [fullname, email, hashedPassword]
        );

        // Create JWT token
        const token = jwt.sign(
            { id: result.insertId, email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: result.insertId,
                fullname,
                email
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Check if user exists
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                fullname: user.fullname,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get current user (protected route)
router.get('/me', auth, async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, fullname, email, role, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(users[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update user profile (protected route)
router.patch('/profile', auth, async (req, res) => {
    try {
        const { fullname, email, currentPassword, newPassword } = req.body;
        const updates = {};

        // Get current user
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];

        // Update basic info
        if (fullname) updates.fullname = fullname;
        if (email && email !== user.email) {
            // Check if email is already taken
            const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.user.id]);
            if (existingUsers.length > 0) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            updates.email = email;
        }

        // Update password if provided
        if (currentPassword && newPassword) {
            const validPassword = await bcrypt.compare(currentPassword, user.password);
            if (!validPassword) {
                return res.status(401).json({ message: 'Current password is incorrect' });
            }
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(newPassword, salt);
        }

        // If there are updates, apply them
        if (Object.keys(updates).length > 0) {
            const updateQuery = Object.keys(updates)
                .map(key => `${key} = ?`)
                .join(', ');
            await db.query(
                `UPDATE users SET ${updateQuery} WHERE id = ?`,
                [...Object.values(updates), req.user.id]
            );
        }

        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
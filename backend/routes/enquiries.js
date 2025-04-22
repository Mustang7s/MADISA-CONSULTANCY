const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Submit new enquiry (public route)
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        const [result] = await db.query(
            'INSERT INTO enquiries (name, email, subject, message) VALUES (?, ?, ?, ?)',
            [name, email, subject, message]
        );
        res.status(201).json({
            id: result.insertId,
            message: 'Enquiry submitted successfully'
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all enquiries (protected route)
router.get('/', auth, async (req, res) => {
    try {
        const [enquiries] = await db.query('SELECT * FROM enquiries ORDER BY created_at DESC');
        res.json(enquiries);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update enquiry status (protected route)
router.patch('/:id', auth, async (req, res) => {
    try {
        const { status } = req.body;
        await db.query(
            'UPDATE enquiries SET status = ? WHERE id = ?',
            [status, req.params.id]
        );
        res.json({ message: 'Enquiry status updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
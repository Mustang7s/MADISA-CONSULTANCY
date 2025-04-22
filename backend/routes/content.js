const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Get all content sections
router.get('/', async (req, res) => {
    try {
        // You'll need to create a content table in your database
        // This is just an example structure
        const [content] = await db.query(`
            SELECT * FROM content 
            WHERE active = true 
            ORDER BY section_order
        `);
        res.json(content);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update content section (protected, admin only)
router.patch('/:id', auth, async (req, res) => {
    try {
        // Check if user is admin
        const [users] = await db.query(
            'SELECT role FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users[0].role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const { title, content, section_order } = req.body;
        await db.query(
            `UPDATE content 
             SET title = ?, content = ?, section_order = ?
             WHERE id = ?`,
            [title, content, section_order, req.params.id]
        );

        res.json({ message: 'Content updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add new content section (protected, admin only)
router.post('/', auth, async (req, res) => {
    try {
        // Check if user is admin
        const [users] = await db.query(
            'SELECT role FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users[0].role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const { title, content, section_order } = req.body;
        const [result] = await db.query(
            `INSERT INTO content (title, content, section_order, active) 
             VALUES (?, ?, ?, true)`,
            [title, content, section_order]
        );

        res.status(201).json({
            id: result.insertId,
            message: 'Content section created successfully'
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete content section (protected, admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        // Check if user is admin
        const [users] = await db.query(
            'SELECT role FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users[0].role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        await db.query('DELETE FROM content WHERE id = ?', [req.params.id]);
        res.json({ message: 'Content section deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
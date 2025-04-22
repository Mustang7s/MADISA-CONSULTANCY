const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Get all team members
router.get('/', async (req, res) => {
    try {
        const [members] = await db.query('SELECT * FROM team_members ORDER BY name');
        res.json(members);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add new team member (protected route)
router.post('/', auth, async (req, res) => {
    try {
        const { name, position, bio, image_url } = req.body;
        const [result] = await db.query(
            'INSERT INTO team_members (name, position, bio, image_url) VALUES (?, ?, ?, ?)',
            [name, position, bio, image_url]
        );
        res.status(201).json({
            id: result.insertId,
            message: 'Team member added successfully'
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
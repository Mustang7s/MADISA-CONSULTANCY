const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Get all blog posts
router.get('/', async (req, res) => {
    try {
        const [posts] = await db.query(`
            SELECT b.*, u.fullname as author_name 
            FROM blog_posts b 
            JOIN users u ON b.author_id = u.id
            ORDER BY b.created_at DESC
        `);
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new blog post (protected route)
router.post('/', auth, async (req, res) => {
    try {
        const { title, content, image_url } = req.body;
        const [result] = await db.query(
            'INSERT INTO blog_posts (title, content, author_id, image_url) VALUES (?, ?, ?, ?)',
            [title, content, req.user.id, image_url]
        );
        res.status(201).json({ 
            id: result.insertId,
            message: 'Blog post created successfully' 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
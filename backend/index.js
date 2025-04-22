// Import required dependencies
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Import route files
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const enquiriesRoutes = require('./routes/enquiries');
const blogRoutes = require('./routes/blog');
const teamRoutes = require('./routes/team');

// Initialize express app
const app = express();

// Middleware
app.use(cors());  // Enable CORS for all routes
app.use(bodyParser.json());  // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));  // Parse URL-encoded bodies

// Welcome route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to MADISA CONSULTANCY Backend API',
        timestamp: new Date().toISOString(),
        status: 'active'
    });
});

// Use the routes
app.use('/api/auth', authRoutes);           // Authentication routes
app.use('/api/content', contentRoutes);      // Content management routes
app.use('/api/enquiries', enquiriesRoutes);  // Enquiries management routes
app.use('/api/blog', blogRoutes);            // Blog management routes
app.use('/api/team', teamRoutes);            // Team management routes

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
});

// Handle 404 routes
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found'
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Started at: ${new Date().toISOString()}`);
    console.log('API Routes available:');
    console.log('- /api/auth');
    console.log('- /api/content');
    console.log('- /api/enquiries');
    console.log('- /api/blog');
    console.log('- /api/team');
});
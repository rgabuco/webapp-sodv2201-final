const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Event = require('../models/eventModel');
const eventController = require('../controllers/eventController');
const router = express.Router();

// Authentication middleware
const verifyToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    // Log the Authorization header for debugging
    console.log('Authorization Header:', req.headers['authorization']); 

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    try {
        // Verify the token and attach the user information to the request
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded Token:', decoded); // Log the decoded token for debugging
        req.user = await User.findById(decoded.id); // Attach user info to req
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// Admin authorization middleware
// Admin authorization middleware
const verifyAdmin = (req, res, next) => {
    // Check if the user is an admin (use isAdmin from the token)
    if (req.user && !req.user.isAdmin) {
        console.log('User is not admin:', req.user); // Log for debugging
        return res.status(403).json({ message: 'Permission denied: You are not an admin' });
    }
    next();
};


// Routes
router.post('/', verifyToken, verifyAdmin, eventController.createEvent); // Only admin users can create events
router.get('/', eventController.getAllEvents);  // Get all events (no authentication required)

module.exports = router;
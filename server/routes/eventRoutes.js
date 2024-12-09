const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Event = require('../models/eventModel');
const eventController = require('../controllers/eventController');
const authController = require('../controllers/authController');
const router = express.Router();

// Route to get all forms and create a form
router
    .route('/')
    .get(eventController.getAllEvents)
    .post(authController.isAdmin, eventController.createEvent); //admin only

// Route to get, update and delete a form
router
    .route('/:id')
    .get(eventController.getEvent)
    .patch(authController.isAdmin, eventController.updateEvent) // admin only
    .delete(authController.isAdmin, eventController.deleteEvent); // admin only

module.exports = router;
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Event = require('../models/eventModel');
const eventController = require('../controllers/eventController');
const router = express.Router();
const authController = require('../controllers/authController');

router
    .route('/')
    .get(eventController.getAllEvents)
    .post(authController.isAdmin, eventController.createEvent); //admin only

    router
    .route('/:id')
    .get((req, res, next) => {
        console.log('GET request for event ID:', req.params.id); // Log the event ID
        eventController.getEvent(req, res, next);
    })
    .patch((req, res, next) => {
        console.log('PATCH request for event ID:', req.params.id); // Log the event ID
        eventController.updateEvent(req, res, next);
    })
    .delete((req, res, next) => {
        console.log('DELETE request for event ID:', req.params.id); // Log the event ID
        eventController.deleteEvent(req, res, next);
    });


module.exports = router;
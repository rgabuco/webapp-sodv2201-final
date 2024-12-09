const Event = require('../models/eventModel'); // Import the Event model
const dayjs = require('dayjs'); // Import dayjs for date validation

exports.createEvent = async (req, res) => {
    try {
        console.log("Request body:", req.body); // Log the request body for debugging
        const { eventName, eventDate } = req.body;

        // Validate required fields
        if (!eventName || !eventDate) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide eventName and eventDate.',
            });
        }

        // Validate eventDate format (ISO 8601)
        const parsedDate = new Date(eventDate);
        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid date format. Please use ISO 8601 format.',
            });
        }

        // Create the event
        const newEvent = await Event.create({
            eventName,
            eventDate: parsedDate,
            createdBy: req.user._id, // Use the authenticated user's ID
        });

        // Respond with success
        res.status(201).json({
            status: 'success',
            data: { event: newEvent },
        });
    } catch (err) {
        console.error('Error creating event:', err); // Log error for debugging
        res.status(500).json({
            status: 'fail',
            message: 'An error occurred while creating the event.',
        });
    }
};

exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.find().populate('createdBy', 'firstName lastName'); // Populate createdBy with user info
        res.status(200).json({
            status: 'success',
            data: { events },
        });
    } catch (err) {
        console.error('Error fetching events:', err); // Log error for debugging
        res.status(500).json({
            status: 'fail',
            message: 'An error occurred while fetching events.',
        });
    }
};

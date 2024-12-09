const Event = require('../models/eventModel'); // Import the Event model
const catchAsync = require('../utils/catchAsync'); // Import the catchAsync utility
const AppError = require('../utils/appError'); // Import the AppError class

// Get all events
exports.getAllEvents = catchAsync(async (req, res, next) => {
    
    const events = await Event.find();
    
    res.json({
        status: 'success',
        results: events.length,
        data: {
            events
        }
    });
});

// Get an event by ID
exports.getEvent = catchAsync(async (req, res, next) => {

    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
        console.log(`Event with ID ${id} not found`);
        return next(new AppError('Event not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            event
        }
    });
});

// Create a new event
exports.createEvent = catchAsync(async (req, res, next) => {
    
    const newEvent = await Event.create(req.body);

    res.status(201).json({
        status: 'success',
        data: newEvent
    });
});

// Update event by ID
exports.updateEvent = catchAsync(async (req, res, next) => {
    
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!event) {
        return next(new AppError('Event not found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: event
    });

});

// Delete an event
exports.deleteEvent = catchAsync(async (req, res, next) => {
    
    const event = await Event.findByIdAndDelete(req.params.id);
    
    if (!event) {
        return next(new AppError('Event not found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'Successfully deleted event by ID',
        data: {
            event
        }
    });

});
const mongoose = require('mongoose');

// Define the event schema
const eventSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: true, // eventName is required
    },
    eventDate: {
        type: Date,
        required: true, // eventDate is required
    },
    username: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the User model
        ref: 'User',
        required: true, // createdBy is required
    },
}, {
    timestamps: true, // Automatically handle createdAt and updatedAt
});

// Create and export the Event model
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;

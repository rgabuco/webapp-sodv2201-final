const mongoose = require('mongoose');
const courseSchema = require('./courseModel');

const programSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: [true, 'Program name is required'],
        trim: true,
        minlength: [3, 'Program name must be at least 3 characters long'],
        maxlength: [100, 'Program name must be less than 100 characters long']
    },
    code: {
        type: String,
        unique: true,
        required: [true, 'Program code is required'],
        trim: true,
        minlength: [3, 'Program code must be at least 3 characters long'],
        maxlength: [11, 'Program code must be less than 11 characters long']
    },
    description: {
        type: String,
        trim: true,
        minlength: [10, 'Program description must be at least 10 characters long'],
        maxlength: [1000, 'Program description must be less than 1000 characters long']
    },
    term: {
        type: String,
        enum: {
            values: ['Winter', 'Spring', 'Summer', 'Fall'],
            message: 'Term must be either Winter, Spring, Summer, or Fall'
        },
        required: [true, 'Term is required']
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    fees: {
        type: String,
        required: [true, 'Fees are required'],
        trim: true,
        maxlength: [100, 'Fees must be less than 100 characters long']
    },
    category: {
        type: String,
        enum: {
            values: ['Diploma', 'Post-Diploma', 'Certificate'],
            message: 'Category must be either Diploma, Post-Diploma, or Certificate'
        },
        required: [true, 'Category is required']
    },
    courses: [courseSchema]
});

const Program = mongoose.model('Program', programSchema);

module.exports = Program;
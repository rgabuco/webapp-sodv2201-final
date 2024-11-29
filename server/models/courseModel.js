const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    code: {
        type: String,
        unique: true,
        required: [true, 'Course code is required'],
        trim: true,
        minlength: [3, 'Course code must be at least 3 characters long'],
        maxlength: [11, 'Course code must be less than 11 characters long']
    },
    name: {
        type: String,
        required: [true, 'Course name is required'],
        trim: true,
        minlength: [3, 'Course name must be at least 3 characters long'],
        maxlength: [100, 'Course name must be less than 100 characters long']
    },
    description: {
        type: String,
        required: [true, 'Course description is required'],
        trim: true,
        minlength: [10, 'Course description must be at least 10 characters long'],
        maxlength: [1000, 'Course description must be less than 1000 characters long']
    },
    credits: {
        type: Number,
        required: [true, 'Course credits are required'],
        min: [1, 'Credits must be at least 1'],
        max: [10, 'Credits must be less than or equal to 10']
    },
    prerequisites: {
        type: String,
        trim: true,
        maxlength: [100, 'Prerequisites must be less than 100 characters long']
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
    time: {
        type: String,
        required: [true, 'Time is required'],
        trim: true
    },
    days: {
        type: String,
        required: [true, 'Days are required'],
        trim: true
    },
    campus: {
        type: String,
        required: [true, 'Campus is required'],
        trim: true
    },
    deliveryMode: {
        type: String,
        required: [true, 'Delivery mode is required'],
        enum: {
            values: ['Face to Face', 'Online Synchronous', 'Online Asynchronous'],
            message: 'Delivery mode must be either Face to Face, Online Synchronous, or Online Asynchronous'
        }
    },
    seatsAvailable: {
        type: Number,
        required: [true, 'Seats available are required'],
        validate: {
            validator: function (value) {
                return value <= this.classSize;
            },
            message: 'Seats available must be less than or equal to class size'
        }
    },
    classSize: {
        type: Number,
        required: [true, 'Class size is required'],
        min: [10, 'Class size must be at least 1'],
        max: [50, 'Class size must be less than or equal to 50']
    }
});

module.exports = courseSchema;
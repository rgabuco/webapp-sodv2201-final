const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const courseSchema = new mongoose.Schema({
    code: String,
    name: String,
    description: String,
    credits: Number,
    prerequisites: String,
    term: String,
    startDate: Date,
    endDate: Date,
    time: String,
    days: String,
    campus: String,
    deliveryMode: String
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true,
        trim: true,
        minlength: [4, 'Username must be at least 4 characters long'],
        maxlength: [50, 'Username must be at most 50 characters long']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    firstName: {
        type: String,
        required: [true, 'Please provide your first name']
    },
    lastName: {
        type: String,
        required: [true, 'Please provide your last name']
    },
    phone: {
        type: String,
        required: [true, 'Please provide your phone number']
    },
    department: {
        type: String,
        required: [true, 'Please provide your department']
    },
    program: {
        type: String,
        required: [true, 'Please provide your program']
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    courses: {
        type: [courseSchema],
        default: []
    },
    profilePhoto: {  // New field for storing profile photo path
        type: String,
        default: null  // Default value is null if no photo is uploaded
    },
    studentID: {
        type: Number,
        unique: true
    }
});

// Encrypt password before saving the user document
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare the password entered by the user with the password stored in the database
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

// Pre-save hook to set the studentID field
userSchema.pre('save', async function (next) {
    if (this.isNew) {
        const lastUser = await this.constructor.findOne().sort({ studentID: -1 });
        this.studentID = lastUser ? lastUser.studentID + 1 : 100000;
    }
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
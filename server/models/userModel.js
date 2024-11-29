const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

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

const User = mongoose.model('User', userSchema);

module.exports = User;
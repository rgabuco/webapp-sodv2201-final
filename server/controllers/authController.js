const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (user) => {
    return jwt.sign({ id: user._id, username: user.username, isAdmin: user.isAdmin }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

exports.login = catchAsync(async (req, res, next) => {
    const { username, password } = req.body;

    // Check if username and password exist
    if (!username || !password) {
        return next(new AppError('Please provide username and password!', 400));
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ username }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect username or password', 401));
    }

    // If everything is ok, send token to client
    const token = signToken(user);

    res.status(200).json({
        status: 'success',
        token,
        data: {
            user: {
                id: user._id,
                username: user.username,
                isAdmin: user.isAdmin,
            },
        },
    });
});

// logout and release the token
exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });

    res.status(200).json({
        status: 'success',
        message: 'logged out successfully'
    });
};

// Middleware to check if the user is an admin
exports.isAdmin = catchAsync(async (req, res, next) => {
    // Getting token and check if it's there
    let token;
    if ( req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    //console.log(decoded);

    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }

    // Check if the user is an admin
    if (!decoded.isAdmin) {
        return next(new AppError('You do not have permission to perform this action', 403));
    }

    // If the user is an admin, proceed to the next middleware
    req.user = currentUser;
    next();
});

// Middleware to check if the user is logged in
exports.protect = catchAsync(async (req, res, next) => {
    // Get token from request headers
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // Verify the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Check if the user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }

    // Attach user to the request object so that the next middleware has access to user info
    req.user = currentUser;
    next();
});

// authController.js

// Restrict user from updating other people's profile photo
exports.restrictToSelf = (req, res, next) => {
    if (req.user.id !== req.params.userId) {
      return next(new AppError('You can only update your own profile photo', 403));
    }
    next();
  };
  

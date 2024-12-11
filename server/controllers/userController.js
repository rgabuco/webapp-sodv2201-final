const User = require('../models/userModel');
const Program = require('../models/programModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const fs = require('fs'); // For working with file paths
const path = require('path');


// Get all users
exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    });
});

// Get a user by ID
exports.getUser = catchAsync(async (req, res, next) => {
    
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new AppError('User not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

// Get all courses of a user by ID
exports.getUserCourses = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id).populate('courses');
    if (!user) {
        return next(new AppError('User not found', 404));
    }
    res.status(200).json({
        status: 'success',
        count: user.courses.length,
        data: {
            courses: user.courses
        }
    });
});

// Add a course to a user by ID and course code
exports.addUserCourse = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new AppError('User not found', 404));
    }
    //console.log(`User: ${user}`);

    // Find the course in the database
    const { courseCode } = req.query;
    const program = await Program.findOne({ 'courses.code': courseCode });
    if (!program) {
        return next(new AppError('Course not found', 404));
    }

    const course = program.courses.find(course => course.code === courseCode);
    if (!course) {
        return next(new AppError('Course not found in the program', 404));
    }

    // Check if the course already exists in the user's courses
    if (user.courses.some(c => c.code === courseCode)) {
        return next(new AppError('Course already exists', 400));
    }

    // Do not allow to add if user.courses.length > 5
    if (user.courses.length >= 5) {
        return next(new AppError('User can have a maximum of 5 courses', 400));
    }

    // Add the course to the user's courses
    user.courses.push({
        code: course.code,
        name: course.name,
        description: course.description,
        credits: course.credits,
        prerequisites: course.prerequisites,
        term: course.term,
        startDate: course.startDate,
        endDate: course.endDate,
        time: course.time,
        days: course.days,
        campus: course.campus,
        deliveryMode: course.deliveryMode,
        //seatsAvailable: course.seatsAvailable,
        //classSize: course.classSize
    });
    await user.save();

    res.status(200).json({
        status: 'success',
        count: user.courses.length,
        data: {
            courses: user.courses
        }
    });
});

// Delete a course from a user by ID and course code
exports.deleteUserCourse = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    const { courseCode } = req.query;

    // Find the course in the user's courses
    const courseIndex = user.courses.findIndex(course => course.code === courseCode);
    if (courseIndex === -1) {
        return next(new AppError('Course does not exist', 400));
    }

    // Remove the course from the user's courses
    user.courses.splice(courseIndex, 1);
    await user.save();

    res.status(200).json({
        status: 'success',
        count: user.courses.length,
        data: {
            courses: user.courses
        }
    });
});


// Create a new user
exports.createUser = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            user: newUser
        }
    });
});

// Update a user by ID
exports.updateUser = catchAsync(async (req, res, next) => {
    const { profilePhoto, ...otherFields } = req.body;

    let updateData = { ...otherFields };  // Fields like name, email, etc.

    // Handle profile photo if provided
    if (profilePhoto) {
        updateData.profilePhoto = profilePhoto;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true
    });
    
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { user }
    });
});


// Delete a user by ID
exports.deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
        return next(new AppError('User not found', 404));
    }
    
    res.status(200).json({
        status: 'success',
        message: 'User deleted successfully',
        data: user
    });
});


// Handle the profile photo upload
exports.uploadProfilePhoto = async (req, res) => {
    try {
        // Check if file is uploaded
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }

        const file = req.files.profilePhoto;

        // Validate file type (JPG, PNG, or GIF)
        if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.mimetype)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid file type. Please upload a JPG, PNG, or GIF image.'
            });
        }

        // Generate a unique file name using timestamp
        const uniqueFileName = `${Date.now()}_${file.name}`;

        // Save file to the uploads folder with the unique file name
        const uploadPath = path.join(__dirname, '..', 'uploads', uniqueFileName);
        await file.mv(uploadPath);

        // Update user with the uploaded file path (overwrite the old photo path)
        await User.findByIdAndUpdate(req.params.userId, { profilePhoto: `/uploads/${uniqueFileName}` });

        // Send a success response
        res.status(200).json({
            status: 'success',
            message: 'Profile photo uploaded successfully!',
            data: { profilePhoto: `/uploads/${uniqueFileName}` }
        });
    } catch (error) {
        console.error('Error uploading photo:', error);
        res.status(500).send('Error uploading photo. Please try again.');
    }
};

  






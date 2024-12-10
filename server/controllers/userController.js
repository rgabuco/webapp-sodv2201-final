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
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
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

// Upload profile photo
exports.uploadProfilePhoto = catchAsync(async (req, res, next) => {
    console.log('Uploaded File:', req.files.profilePhoto);  // <-- Check if file is received

    // Find the user by ID from params
    const user = await User.findById(req.params.userId);
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    if (!req.files || !req.files.profilePhoto) {
        return next(new AppError('No file uploaded', 400));
    }

    const profilePhoto = req.files.profilePhoto;

    // Set the file path and upload location
    const uploadDir = path.join(__dirname, '..', 'uploads', 'profile_photos');
    const fileName = Date.now() + '-' + profilePhoto.name;
    const uploadPath = path.join(uploadDir, fileName);

    console.log('Upload Path:', uploadPath);  // Log the upload path

    // Ensure the upload directory exists
    try {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
            console.log('Upload directory created:', uploadDir);
        }
    } catch (err) {
        return next(new AppError('Error creating upload directory', 500));
    }

    // Move the uploaded file to the desired location
    profilePhoto.mv(uploadPath, async (err) => {
        if (err) {
            return next(new AppError('Error uploading the file', 500));
        }

        // Save the file path in the database
        user.profilePhoto = `/uploads/profile_photos/${fileName}`;
        await user.save();

        res.status(200).json({
            status: 'success',
            data: {
                profilePhoto: user.profilePhoto
            }
        });
    });
});




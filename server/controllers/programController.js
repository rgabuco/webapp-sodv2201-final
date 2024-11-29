const Program = require('../models/programModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// get all programs
exports.getAllPrograms = catchAsync(async (req, res) => {

        const programs = await Program.find();

        res.status(200).json({
            status: 'success',
            count: programs.length,
            data: programs
        });
});

// Get a program by id
exports.getProgram = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const program = await Program.findById(id);
    if (!program) {
        return next(new AppError('Program not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: program
    });
});

// Create a new program
exports.createProgram = catchAsync(async (req, res) => {

        const newProgram = await Program.create(req.body);

        res.status(201).json({
            status: 'success',
            data: newProgram
        });
});

// Update a program by id
exports.updateProgram = catchAsync(async (req, res, next) => {
    const program = await Program.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!program) {
        return next(new AppError('Program not found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: program
    });
});

// Delete a program by id
exports.deleteProgram = catchAsync(async (req, res, next) => {
    const program = await Program.findByIdAndDelete(req.params.id);
    
    if (!program) {
        return next(new AppError('Program not found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'Successfully deleted program by ID',
        data: {
            program
        }
    });
});


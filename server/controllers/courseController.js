const Program = require('../models/programModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Helper function to find a program by code or course ID
const findProgram = async (programCode, courseId) => {
    let program;
    if (programCode) {
        program = await Program.findOne({ code: programCode });
        if (!program) {
            throw new AppError(`Program with code ${programCode} is not found`, 404);
        }
    } else {
        program = await Program.findOne({ 'courses._id': courseId });
        if (!program) {
            throw new AppError(`Course with id ${courseId} is not found in any program`, 404);
        }
    }
    return program;
};

// Helper function to find a course in a program
const findCourse = (program, courseId) => {
    const course = program.courses.id(courseId);
    if (!course) {
        throw new AppError(`Course with id ${courseId} is not found in the ${program.name} program`, 404);
    }
    return course;
};

// Get all courses, optionally filtered by program codes
exports.getAllCourses = catchAsync(async (req, res, next) => {
    const { programCode } = req.query;

    let programs;
    if (programCode) {
        // Ensure programCode is an array
        const programCodes = Array.isArray(programCode) ? programCode : [programCode];

        programs = await Program.find({ code: { $in: programCodes } });

        if (programs.length === 0) {
            return next(new AppError(`No programs found with the specified codes`, 404));
        }
    } else {
        programs = await Program.find();
    }

    // Collect all courses from the found programs
    const allCourses = programs.reduce((acc, program) => {
        return acc.concat(program.courses);
    }, []);

    res.status(200).json({
        status: 'success',
        count: allCourses.length,
        data: {
            courses: allCourses
        }
    });
});

// Add a course to a program
exports.createCourse = catchAsync(async (req, res, next) => {
    const { programCode } = req.query;
    const newCourse = req.body;

    const program = await findProgram(programCode);

    program.courses.push(newCourse);
    await program.save();

    res.status(201).json({
        status: 'success',
        data: {
            newCourse
        }
    });
});

// Get a course in a program by id
exports.getCourse = catchAsync(async (req, res, next) => {
    const { programCode } = req.query;
    const { id } = req.params;

    const program = await findProgram(programCode, id);
    const course = findCourse(program, id);

    res.status(200).json({
        status: 'success',
        programName: program.name,
        programCode: program.code,
        data: {
            course
        }
    });
});

// Update a course in a program
exports.updateCourse = catchAsync(async (req, res, next) => {
    const { programCode } = req.query;
    const { id } = req.params;
    const updatedData = req.body;

    const program = await findProgram(programCode, id);
    const course = findCourse(program, id);

    Object.assign(course, updatedData);
    await program.save();

    res.status(200).json({
        status: 'success',
        data: {
            program
        }
    });
});

// Delete a course from a program
exports.deleteCourse = catchAsync(async (req, res, next) => {
    const { programCode } = req.query;
    const { id } = req.params;

    const program = await findProgram(programCode, id);
    const course = findCourse(program, id);

    // Remove the course using the pull method
    program.courses.pull(id);
    await program.save();

    res.status(200).json({
        status: 'success',
        message: 'Successfully deleted course',
        data: {
            program
        }
    });
});
const Form = require('../models/formModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get all messages from the forms
exports.getAllForms = catchAsync(async (req, res, next) => {
    
    const forms = await Form.find();
    
    res.json({
        status: 'success',
        results: forms.length,
        data:{
            forms
        }
    });
});

// Get a form by ID
exports.getForm = catchAsync(async (req, res, next) => {

    const { id } = req.params;
    const form = await Form.findById(id);
    if (!form) {
        console.log(`Form with ID ${id} not found`);
        return next(new AppError('Form not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            form
        }
    });
});

// Create a new Form
exports.createForm = catchAsync(async (req, res, next) => {
    
    const newForm = await Form.create(req.body);

    res.status(201).json({
        status: 'success',
        data: newForm
    });
});

// Update form by ID
exports.updateForm = catchAsync(async (req, res, next) => {
    
    const form = await Form.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!form) {
        return next(new AppError('Form not found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: form
    });

});

// Delete a message from forms
exports.deleteForm = catchAsync(async (req, res, next) => {
    
    const form = await Form.findByIdAndDelete(req.params.id);
    
    if (!form) {
        return next(new AppError('Form not found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'Successfully deleted form by ID',
        data: {
            form
        }
    });

});
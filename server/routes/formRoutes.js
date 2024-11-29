const express = require('express');
const formController = require('../controllers/formController');
const authController = require('../controllers/authController');

const router = express.Router();

// Route to get all forms and create a form
router
    .route('/')
    .get(authController.isAdmin, formController.getAllForms) // admin only
    .post(formController.createForm);

// Route to get, update and delete a form
router
    .route('/:id')
    .get(formController.getForm)
    .patch(authController.isAdmin, formController.updateForm) // admin only
    .delete(authController.isAdmin, formController.deleteForm); // admin only

module.exports = router;

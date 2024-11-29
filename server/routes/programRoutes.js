const express = require('express');
const programController = require('../controllers/programController');
const authController = require('../controllers/authController');

const router = express.Router();

// Route to get all programs and create a program
router
    .route('/').get(programController.getAllPrograms)
    .post(authController.isAdmin, programController.createProgram); //admin only

// Route to get, update, and delete a program
router
    .route('/:id')
    .get(programController.getProgram)
    .patch(authController.isAdmin, programController.updateProgram) //admin only
    .delete(authController.isAdmin, programController.deleteProgram); //admin only

module.exports = router;

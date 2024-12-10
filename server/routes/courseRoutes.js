const express = require('express');
const courseController = require('../controllers/courseController');
const authController = require('../controllers/authController');

const router = express.Router();

// Route to get all courses and create a course
router
    .route('/')
    .get(courseController.getAllCourses)
    .post(authController.isAdmin, courseController.createCourse); //admin only

// Route to get, update, and delete a course
router
    .route('/:id')
    .get(courseController.getCourse)
    .patch(courseController.updateCourse)
    .delete(authController.isAdmin, courseController.deleteCourse); //admin only

module.exports = router;
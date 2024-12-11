const express = require('express');
const path = require('path');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const fs = require('fs');

const router = express.Router();

//login and logout routes
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Route to get all users and create a new user
router
    .route('/')
    .get(authController.isAdmin, userController.getAllUsers) //admin only
    .post(userController.createUser);

// Route to get, update, and delete a user by ID
router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(authController.isAdmin, userController.deleteUser); //admin only

// Route to get all courses of a user by ID
router
    .route('/:id/courses')
    .get(userController.getUserCourses)
    .post(userController.addUserCourse)
    .delete(userController.deleteUserCourse);

// Route to upload profile photo for the user (auth required)
router.post('/:userId/profile-photo', (req, res, next) => {
    console.log('Request URL:', req.originalUrl); // Log the request URL
    console.log('Request Method:', req.method); // Log the method
    next();
  }, userController.uploadProfilePhoto);
  



module.exports = router;

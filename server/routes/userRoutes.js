const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

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
    .get(authController.isAdmin, userController.getUser) // admin only
    .patch(userController.updateUser)
    .delete(authController.isAdmin, userController.deleteUser); //admin only

// Route to get all courses of a user by ID
router
    .route('/:id/courses')
    .get(userController.getUserCourses)
    .post(userController.addUserCourse)
    .delete(userController.deleteUserCourse);

module.exports = router;
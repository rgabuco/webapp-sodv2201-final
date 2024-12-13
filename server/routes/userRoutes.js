const express = require('express');
const path = require('path');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const fs = require('fs');
const fallbackPhoto = path.join(__dirname, '../uploads/default-profile-photo.png'); //

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

// Route to check if a username already exists
router.get('/username/:username', userController.checkUsername);

// Route to check if an email already exists
router.get('/email/:email', userController.checkEmail);

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
  
// Serve profile photos as static files
router.get('/profile-photo/:userId', (req, res) => {
    const userId = req.params.userId;

    User.findById(userId, (err, user) => {
        if (err || !user) {
            return res.status(404).send('User not found');
        }

        // Check if the user has a profile photo stored in the DB
        if (user.profilePhoto) {
            const photoPath = path.join(__dirname, '../uploads', user.profilePhoto.split('/uploads/')[1]);

            // Check if the file exists
            if (fs.existsSync(photoPath)) {
                return res.sendFile(photoPath);  // Serve the profile photo if it exists
            }
        }

        // If no profile photo or file doesn't exist, send fallback photo
        return res.sendFile(fallbackPhoto);  // Return fallback profile photo
    });
});




module.exports = router;

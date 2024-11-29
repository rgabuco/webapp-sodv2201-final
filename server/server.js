const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./db');
const app = require('./app');

//connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});
//BASIC CRUD OPERATIONS
//Run below on POSTMAN

// AUTHENTICATION
// POST http://localhost:5000/api/v1/users/login - Login a user (use JSON body)
// GET http://localhost:5000/api/v1/users/logout - Logout a user

// PROGRAMS
// GET http://localhost:5000/api/v1/programs - Get all programs
// POST http://localhost:5000/api/v1/programs - Create a program (use JSON body)
// GET http://localhost:5000/api/v1/programs/:id - Get a program by ID (replace :id with the ID)
// PATCH http://localhost:5000/api/v1/programs/:id - Update a program by ID (replace :id with the ID, use JSON body)
// DELETE http://localhost:5000/api/v1/programs/:id - Delete a program by ID (replace :id with the ID)

// COURSES
// GET http://localhost:5000/api/v1/courses - Get all courses
// POST http://localhost:5000/api/v1/courses - Create a course (use JSON body)
// GET http://localhost:5000/api/v1/courses/:id - Get a course by ID (replace :id with the ID)
// PATCH http://localhost:5000/api/v1/courses/:id - Update a course by ID (replace :id with the ID, use JSON body)
// DELETE http://localhost:5000/api/v1/courses/:id - Delete a course by ID (replace :id with the ID)

// FORMS
// GET http://localhost:5000/api/v1/forms - Get all forms
// POST http://localhost:5000/api/v1/forms - Create a form (use JSON body)
// GET http://localhost:5000/api/v1/forms/:id - Get a form by ID (replace :id with the ID)
// PATCH http://localhost:5000/api/v1/forms/:id - Update a form by ID (replace :id with the ID, use JSON body)
// DELETE http://localhost:5000/api/v1/forms/:id - Delete a form by ID (replace :id with the ID)

// USERS
// GET http://localhost:5000/api/v1/users - Get all users
// POST http://localhost:5000/api/v1/users - Create a user (use JSON body)
// GET http://localhost:5000/api/v1/users/:id - Get a user by ID (replace :id with the ID)
// PATCH http://localhost:5000/api/v1/users/:id - Update a user by ID (replace :id with the ID, use JSON body)
// DELETE http://localhost:5000/api/v1/users/:id - Delete a user by ID (replace :id with the ID)


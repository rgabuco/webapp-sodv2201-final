const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const fileUpload = require('express-fileupload');  // <-- Add this import
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const programRoutes = require('./routes/programRoutes');
const courseRoutes = require('./routes/courseRoutes');
const formRoutes = require('./routes/formRoutes');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const path = require('path');

const app = express();

// Middleware to parse JSON
app.use(express.json());
// Enable CORS for all routes with improved handling for pre-flight
app.use(cors({
    origin: 'http://localhost:3000',  // Frontend URL
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'], // Allow PUT method along with other methods
    allowedHeaders: ['Content-Type', 'Authorization'],  // Allow required headers
    credentials: true  // Allow credentials like cookies or authorization headers
}));

// Optionally handle preflight (OPTIONS) requests globally
app.options('*', cors());  // Allow pre-flight (OPTIONS) requests to all routes


// Handle express-fileupload
app.use(fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 }, // Max file size (5MB)
    abortOnLimit: true, // Abort upload if file is too large
    responseOnLimit: 'File size exceeds the limit of 5MB', // Custom response for file size error
}));

// Serve uploaded files from the correct directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Route setup
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/programs', programRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/forms', formRoutes);
app.use('/api/v1/events', eventRoutes);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

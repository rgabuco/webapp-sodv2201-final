const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const programRoutes = require('./routes/programRoutes');
const courseRoutes = require('./routes/courseRoutes');
const formRoutes = require('./routes/formRoutes');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');

const app = express();

//middleware to parse json
app.use(express.json());
// Enable CORS for all routes
app.use(cors());

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

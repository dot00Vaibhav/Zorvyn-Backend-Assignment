const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const recordRoutes = require('./routes/recordRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const errorHandler = require('./middlewares/errorMiddleware');

const app = express();

// Parse incoming JSON requests
app.use(express.json());

// Allow requests from any origin. Adjust this in production if needed.
app.use(cors());

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Serve static frontend assets when a public build is available
app.use(express.static('public'));

// Centralized error handling for all routes
app.use(errorHandler);

module.exports = app;

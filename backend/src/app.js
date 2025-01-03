// src/app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db.config');
const auth = require('./middleware/auth');

const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const driverRoutes = require('./routes/driverRoutes');
const holidayRoutes = require('./routes/holidayRoutes');
const fineRoutes = require('./routes/fineRoutes');
const historyRoutes = require('./routes/historyRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', auth, vehicleRoutes);
app.use('/api/drivers', auth, driverRoutes);
app.use('/api/holidays', auth, holidayRoutes);
app.use('/api/fines', auth, fineRoutes);
app.use('/api/history', auth, historyRoutes);
app.use('/api/salaries', auth, salaryRoutes);
app.use('/api/dashboard', auth, dashboardRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'API is working' });
});

module.exports = app;
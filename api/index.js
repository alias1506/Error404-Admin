const express = require('express');
const cors = require('cors');
const connectDB = require('./_lib/db');

// Import models (registers them with Mongoose)
require('../server/src/models/User');
require('../server/src/models/Question');
require('../server/src/models/Round');
require('../server/src/models/Submission');

// Import routes
const userRoutes = require('../server/src/routes/userRoutes');
const dashboardRoutes = require('../server/src/routes/dashboardRoutes');
const roundRoutes = require('../server/src/routes/roundRoutes');
const questionRoutes = require('../server/src/routes/questionRoutes');
const submissionRoutes = require('../server/src/routes/submissionRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB before handling any request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection error:', err);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/rounds', roundRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/submissions', submissionRoutes);

app.get('/api', (req, res) => {
  res.json({ message: 'Error404 Admin Backend is running!' });
});

app.get('/api/env-check', (req, res) => {
  const uri = process.env.MONGO_URI || '';
  res.json({
    hasMongoUri: !!process.env.MONGO_URI,
    uriPrefix: uri.substring(0, 30) + '...',
    databaseName: uri.includes('error404') ? 'error404 found' : 'error404 missing'
  });
});

app.get('/api/db-test', async (req, res) => {
  try {
    await connectDB();
    const mongoose = require('mongoose');
    const state = mongoose.connection.readyState;
    const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    res.json({ status: 'success', connectionState: states[state] || state });
  } catch (error) {
    res.json({ status: 'error', message: error.message, stack: error.stack });
  }
});

module.exports = app;

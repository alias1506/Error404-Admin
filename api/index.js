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

module.exports = app;

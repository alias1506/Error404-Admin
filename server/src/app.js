const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/rounds', require('./routes/roundRoutes'));

app.get('/api', (req, res) => {
  res.json({ message: 'Error404 Admin Backend is running!' });
});

module.exports = app;

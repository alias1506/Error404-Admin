const express = require('express');
const router = express.Router();
const { getDashboardStatsHandler } = require('../controllers/dashboardController');

router.get('/stats', getDashboardStatsHandler);

module.exports = router;

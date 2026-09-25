const express = require('express');
const router = express.Router();
const { getDashboardStats, getPastEvents, generateReportCSV } = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/stats', getDashboardStats);
router.get('/past-events', getPastEvents);
router.get('/export/csv', generateReportCSV);

module.exports = router;

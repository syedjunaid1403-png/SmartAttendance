const express = require('express');
const router = express.Router();
const { getDashboardStats, getReportData } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Dashboards and reporting are for admins or authorized staff
router.get('/dashboard', authorize('admin'), getDashboardStats);
router.get('/report', authorize('admin'), getReportData);

module.exports = router;

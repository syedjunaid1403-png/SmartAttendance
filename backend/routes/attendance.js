const express = require('express');
const router = express.Router();
const { markAttendance, getAttendance, getStudentAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Admin only route for marking attendance
router.post('/mark', authorize('admin'), markAttendance);

// View attendance history (accessible to authenticated users)
router.get('/', getAttendance);
router.get('/student/:studentId', getStudentAttendance);

module.exports = router;

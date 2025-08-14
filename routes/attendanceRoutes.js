const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  markAttendance,
  updateTodayAttendance,
  getStudentHistory
} = require('../controllers/attendanceController');

router.post('/mark', protect, markAttendance);
router.put('/update', protect, updateTodayAttendance);
router.get('/student/:studentId', protect, getStudentHistory);
module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const {
  createAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceByStudentId,
  getAllAttendanceWithStudents
} = require('../controllers/attendanceController');

// Create new attendance
router.post('/mark', protect, createAttendance);

// Update attendance by ID
router.put('/update/:id', protect, updateAttendance);

// Delete attendance by ID
router.delete('/delete/:id', protect, deleteAttendance);

// Get attendance by student ID
router.get('/student/:studentId', protect, getAttendanceByStudentId);

// Get all attendance grouped by student
router.get('/all', protect, getAllAttendanceWithStudents);

module.exports = router;

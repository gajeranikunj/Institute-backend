const express = require('express');
const {
    registerFaculty,
  loginFaculty,
  getAllFaculties,
  getFacultyProfile,
  deleteFaculty,
  updateFaculty,
  getFacultyById
} = require('../controllers/facultyController');

const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Faculty login
router.post('/login', loginFaculty);

// Register new faculty (admin only)
router.post('/register', protect, adminOnly, registerFaculty);

// Get all faculties (admin only)
router.get('/', protect, adminOnly, getAllFaculties);

// Get own profile (faculty login)
router.get('/profile', protect, getFacultyProfile);

// Get a single faculty profile by ID (admin only)
router.get('/:id', protect, adminOnly, getFacultyById);


// Delete faculty (admin only)
router.delete('/:id', protect, adminOnly, deleteFaculty);

// ✏️ Update faculty profile (admin or faculty themself)
router.put('/:id', protect ,adminOnly, updateFaculty);


module.exports = router;

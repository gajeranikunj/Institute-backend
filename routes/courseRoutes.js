const express = require('express');
const router = express.Router();
const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse
} = require('../controllers/courseController');

// Routes
router.post('/', createCourse);      // Create a course
router.get('/', getCourses);         // Get all courses
router.get('/:id', getCourseById);   // Get single course
router.put('/:id', updateCourse);    // Update course
router.delete('/:id', deleteCourse); // Delete course

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  addStep,
  updateStep,
  deleteStep
} = require('../controllers/courseController');

// ----- Course Routes -----
router.post('/', createCourse);        // Create a course
router.get('/', getCourses);           // Get all courses
router.get('/:id', getCourseById);     // Get single course
router.put('/:id', updateCourse);      // Update course
router.delete('/:id', deleteCourse);   // Delete course

// ----- Steps Routes -----
router.post('/:id/steps', addStep);          // Add step to a course
router.put('/steps/:stepId', updateStep);    // Update a specific step
router.delete('/steps/:stepId', deleteStep); // Delete a specific step

module.exports = router;

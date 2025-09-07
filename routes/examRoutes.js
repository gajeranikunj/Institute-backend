const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');

// ----------------------------
// Exam Routes
// ----------------------------

// Add a new exam
router.post('/', examController.addExam);

// Get all exams (with optional query filters)
router.get('/', examController.getAllExams);
router.get('/getAllExamsandoter', examController.getAllExamsandoter);

// Get exams for a specific student
router.get('/student/:studentId', examController.getExamsByStudent);

// Update an exam by ID
router.put('/:id', examController.updateExam);

// Delete an exam by ID
router.delete('/:id', examController.deleteExam);

// Optional: Export router
module.exports = router;

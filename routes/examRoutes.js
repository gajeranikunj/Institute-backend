const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');

router.post('/', examController.addExam);
router.get('/', examController.getAllExams);
router.get('/student/:studentId', examController.getExamsByStudent);
router.put('/:id', examController.updateExam);
router.delete('/:id', examController.deleteExam);

module.exports = router;

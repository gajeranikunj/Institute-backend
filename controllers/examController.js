const Exam = require('../models/Exam');
const Student = require('../models/Student');

// Add Exam
exports.addExam = async (req, res) => {
  try {
    const exam = new Exam(req.body);
    await exam.save();
    res.status(201).json({ message: 'Exam added successfully', exam });
  } catch (error) {
    res.status(500).json({ message: 'Error adding exam', error });
  }
};

// Get All Exams (optional filters)
exports.getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find(req.query).populate('student');
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exams', error });
  }
};

// Get Exams by Student ID
exports.getExamsByStudent = async (req, res) => {
  try {
    const exams = await Exam.find({ student: req.params.studentId });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student exams', error });
  }
};

// Update Exam
exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ message: 'Exam updated', exam });
  } catch (error) {
    res.status(500).json({ message: 'Error updating exam', error });
  }
};

// Delete Exam
exports.deleteExam = async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting exam', error });
  }
};

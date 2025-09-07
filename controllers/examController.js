const Exam = require('../models/Exam');
const Student = require('../models/Student');

// =========================
// Add a new Exam
// =========================
exports.addExam = async (req, res) => {
  try {
    const { student: studentId, examName, subject, examDate, totalMarks, obtainedMarks } = req.body;

    // Validate student exists
    const studentExists = await Student.findById(studentId);
    if (!studentExists) {
      return res.status(404).json({ message: 'Student not found' });
    }
    if (obtainedMarks > totalMarks) {
      return res.status(400).json({ message: 'Obtained marks cannot exceed total marks' });
    }

    // Create new exam
    const exam = new Exam({
      student: studentId,
      examName,
      subject,
      examDate,
      totalMarks,
      obtainedMarks
    });

    await exam.save();

    res.status(201).json({ message: 'Exam added successfully', exam });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding exam', error });
  }
};

// =========================
// Get all Exams (with optional filters)
// =========================
exports.getAllExams = async (req, res) => {
  try {
    const filters = req.query || {};
    const exams = await Exam.find(filters)
      .populate('student', 'name surname email phone'); // populate selected student fields

    res.json(exams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching exams', error });
  }
};

exports.getAllExamsandoter = async (req, res) => {
  try {
    const filters = req.query || {};
    const exams = await Exam.find(filters)
      .populate('student', 'name surname email phone photo'); // populate selected student fields

    res.json(exams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching exams', error });
  }
};

// =========================
// Get Exams by Student ID
// =========================
exports.getExamsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Optional: check if student exists
    const studentExists = await Student.findById(studentId);
    if (!studentExists) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const exams = await Exam.find({ student: studentId }).populate('student', 'name surname');
    res.json(exams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching student exams', error });
  }
};

// =========================
// Update Exam
// =========================
exports.updateExam = async (req, res) => {
  try {
    const { id } = req.params;

    const { obtainedMarks, totalMarks } = req.body;
    if (obtainedMarks > totalMarks) {
      return res.status(400).json({ message: 'Obtained marks cannot exceed total marks' });
    }
    let updateData = { ...req.body };

    if (obtainedMarks !== undefined && totalMarks !== undefined) {
      updateData.percentage = (obtainedMarks / totalMarks) * 100;

      if (updateData.percentage >= 90) updateData.grade = 'A+';
      else if (updateData.percentage >= 75) updateData.grade = 'A';
      else if (updateData.percentage >= 60) updateData.grade = 'B';
      else if (updateData.percentage >= 40) updateData.grade = 'C';
      else updateData.grade = 'F';
    }

    const exam = await Exam.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    res.json({ message: 'Exam updated successfully', exam });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating exam', error });
  }
};


// =========================
// Delete Exam
// =========================
exports.deleteExam = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findByIdAndDelete(id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting exam', error });
  }
};

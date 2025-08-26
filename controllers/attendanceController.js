const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
// ✅ Create or Update Attendance Record
const createAttendance = async (req, res) => {
  try {
    const { faculty, student, status, date } = req.body;

    const attendanceDate = date ? new Date(date).setHours(0, 0, 0, 0) : new Date().setHours(0, 0, 0, 0);

    // ✅ Check if attendance already exists for this student & date
    let attendance = await Attendance.findOne({
      student,
      date: { $gte: attendanceDate, $lt: attendanceDate + 24 * 60 * 60 * 1000 }, // same day
    });

    if (attendance) {
      // ✅ Update existing attendance
      attendance.status = status || "Absent";
      await attendance.save();
      return res.status(200).json({ message: "Attendance updated", attendance });
    }

    // ✅ Create new attendance if none exists
    attendance = new Attendance({
      faculty,
      student,
      status: status || "Absent",
      date: attendanceDate,
    });

    await attendance.save();
    res.status(201).json({ message: "Attendance recorded", attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update attendance record by ID
const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const attendance = await Attendance.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.status(200).json({ message: 'Attendance updated', attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete attendance record by ID
const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findByIdAndDelete(id);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.status(200).json({ message: 'Attendance deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance by student ID
const getAttendanceByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId).select('_id name');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const attendanceRecords = await Attendance.find({ student: studentId })
      .populate('faculty', 'name')
      .populate('student', 'name');

    res.status(200).json({
      student,
      attendance: attendanceRecords
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all attendance grouped by student
const getAllAttendanceWithStudents = async (req, res) => {
  try {
    const students = await Student.find().select('_id name');
    const allAttendance = await Attendance.find()
      .populate('faculty', 'name')
      .populate('student', 'name');

    const result = students.map(student => {
      const studentAttendance = allAttendance.filter(
        att => att.student._id.toString() === student._id.toString()
      );

      return {
        student,
        attendance: studentAttendance
      };
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceByStudentId,
  getAllAttendanceWithStudents
};

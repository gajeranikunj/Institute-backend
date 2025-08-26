const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Attendance = require('../models/Attendance');
const generateReceipt = require('../utils/generateReceipt');
const path = require('path');

// Create Student manually (if needed outside inquiry)
const createStudent = async (req, res) => {
  try {
    const { name, email, phone, address, dob, course, faculty, inquiryId, feesPaid, status, slotTime } = req.body;



    const existing = await Student.findOne({ inquiryId });
    if (existing) return res.status(400).json({ message: 'Student already exists for this inquiry' });

    const newStudent = await Student.create({
      name, email, phone, address, dob, course,
      faculty, inquiryId, feesPaid, status, slotTime
    });


    res.status(201).json(newStudent);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create student', error: error.message });
  }
};

// Get all students
const getAllStudents = async (req, res) => {
  try {
    // Fetch all students
    const students = await Student.find().populate('faculty', 'name email');

    // Fetch all attendance
    const allAttendance = await Attendance.find()
      .populate('faculty', 'name')
      .populate('student', 'name');

    // Map attendance to each student
    const studentsWithAttendance = students.map(student => {
      const studentAttendance = allAttendance.filter(
        att => att?.student?._id?.toString() === student?._id?.toString()
      );
      return {
        ...student.toObject(),
        attendance: studentAttendance
      };
    });

    res.status(200).json(studentsWithAttendance);
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ message: 'Failed to fetch students', error: error.message });
  }
};

// Get student by ID
const getStudentById = async (req, res) => {
  try {
    // Fetch student by ID
    const student = await Student.findById(req.params.id).populate('faculty', 'name email');
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Fetch attendance for this student
    const attendanceRecords = await Attendance.find({ student: student._id })
      .populate('faculty', 'name')
      .populate('student', 'name');

    res.status(200).json({
      ...student.toObject(),
      attendance: attendanceRecords
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch student', error: error.message });
  }
};


// Update student
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const { name, email, phone, address, dob, course, feesPaid, status, slotTime } = req.body;
    console.log(req.body);
    


    if (name) student.name = name;
    if (email) student.email = email;
    if (phone) student.phone = phone;
    if (address) student.address = address;
    if (dob) student.dob = dob;
    if (course) student.course = course;
    if (feesPaid !== undefined) student.feesPaid = feesPaid;
    if (status) student.status = status;
    if (slotTime) student.slotTime = slotTime;

    const updated = await student.save();
    res.status(200).json(updated);
  } catch (error) {
    console.log(error.message);
    
    res.status(500).json({ message: 'Failed to update student', error: error.message });
  }
};

// Delete student
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    await student.deleteOne();
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete student', error: error.message });
  }
};

// Get students by faculty
const getStudentsByFaculty = async (req, res) => {
  try {
    const students = await Student.find({ faculty: req.params.facultyId }).populate('faculty', 'name');
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch students by faculty', error: error.message });
  }
};

const addFeeInstallment = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { amount, date, remark } = req.body;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Push to feesHistory
    student.feesHistory.push({
      amount,
      date: date || new Date(),
      remark
    });

    // Update paid & pending
    student.paidFees += amount;
    student.pendingFees = student.totalFees - student.paidFees;

    await student.save();
    const receiptPath = path.join(__dirname, '../receipts', `${student._id}_${Date.now()}.pdf`);
    await generateReceipt(student, { amount, date, remark }, receiptPath);

    return res.status(200).json({
      message: 'Installment added successfully',
      feesHistory: student.feesHistory,
      paidFees: student.paidFees,
      pendingFees: student.pendingFees,
      receiptUrl: `/receipts/${path.basename(receiptPath)}`

    });
  } catch (error) {
    console.error('Error adding installment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentsByFaculty,
  addFeeInstallment
};

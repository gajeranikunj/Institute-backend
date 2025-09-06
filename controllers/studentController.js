const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Attendance = require('../models/Attendance');
const generateReceipt = require('../utils/generateReceipt');
const path = require('path');

// ✅ Create Student
const createStudent = async (req, res) => {
  try {
    const {
      name,
      surname,
      fathername,
      fatherphone,
      email,
      phone,
      address,
      dob,
      aadharno,
      photo,
      Signature,
      grNumber,
      course,
      faculty,
      inquiryId,
      admissionDate,
      joindate,
      rafrence,
      totalFees,
      paidFees,
      pendingFees,
      status,
      slotTime,
      branch
    } = req.body;

    // Check for duplicate inquiry
    const existing = await Student.findOne({ inquiryId });
    if (existing)
      return res.status(400).json({ message: 'Student already exists for this inquiry' });

    const newStudent = await Student.create({
      name,
      surname,
      fathername,
      fatherphone,
      email,
      phone,
      address,
      dob,
      aadharno,
      photo,
      Signature,
      grNumber,
      course,
      faculty,
      inquiryId,
      admissionDate,
      joindate,
      rafrence,
      totalFees,
      paidFees,
      pendingFees,
      status,
      slotTime,
      branch
    });

    res.status(201).json(newStudent);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create student', error: error.message });
  }
};

// ✅ Get all students + attendance
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().populate('faculty', 'name email');
    const allAttendance = await Attendance.find()
      .populate('faculty', 'name')
      .populate('student', 'name');

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
    res.status(500).json({ message: 'Failed to fetch students', error: error.message });
  }
};

// ✅ Get student by ID
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('faculty', 'name email');
    if (!student) return res.status(404).json({ message: 'Student not found' });

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

// ✅ Update Student (all fields)
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const fields = [
      'name',
      'surname',
      'fathername',
      'fatherphone',
      'email',
      'phone',
      'address',
      'dob',
      'aadharno',
      'photo',
      'Signature',
      'grNumber',
      'course',
      'faculty',
      'inquiryId',
      'admissionDate',
      'joindate',
      'rafrence',
      'totalFees',
      'paidFees',
      'pendingFees',
      'status',
      'slotTime',
      'branch'
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        student[field] = req.body[field];
      }
    });

    const updated = await student.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update student', error: error.message });
  }
};

// ✅ Delete Student
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

// ✅ Get students by faculty
const getStudentsByFaculty = async (req, res) => {
  try {
    const students = await Student.find({ faculty: req.params.facultyId }).populate(
      'faculty',
      'name'
    );
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch students by faculty', error: error.message });
  }
};

// ✅ Add Fee Installment
const addFeeInstallment = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { amount, date, remark } = req.body;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    student.feesHistory.push({
      amount,
      date: date || new Date(),
      remark
    });

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
    res.status(500).json({ message: 'Server error', error: error.message });
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

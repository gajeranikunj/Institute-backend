const Inquiry = require('../models/Inquiry');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

const Course = require('../models/course'); // original course model
const UserCourse = require('../models/usercourse'); // course assigned to student

const fs = require('fs');
const path = require('path');
const generateReceipt = require('../utils/generateReceipt');
const generateGRNumber = require('../utils/generateGRNumber');



// Add new inquiry (defaults to Pending)
const addInquiry = async (req, res) => {
  try {
    const { name, surname, email, phone, address, dob, courseInterested, note } = req.body;

    const newInquiry = await Inquiry.create({
      name,
      surname,
      email,
      phone,
      address,
      dob,
      courseInterested,
      note
    });

    res.status(201).json(newInquiry);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create inquiry', error: error.message });
  }
};

// Get all inquiries
const getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().populate('assignedFaculty', 'name email phone');
    res.status(200).json(inquiries);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch inquiries', error: error.message });
  }
};

// Get single inquiry
const getInquiryById = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id).populate('assignedFaculty', 'name email phone');
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
    res.status(200).json(inquiry);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inquiry', error: error.message });
  }
};

// Update inquiry details
const updateInquiryDetails = async (req, res) => {
  try {
    const { name, surname, email, phone, address, dob, courseInterested, note } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });

    if (name) inquiry.name = name;
    if (surname) inquiry.surname = surname;
    if (email) inquiry.email = email;
    if (phone) inquiry.phone = phone;
    if (address) inquiry.address = address;
    if (dob) inquiry.dob = dob;
    if (courseInterested) inquiry.courseInterested = courseInterested;
    if (note) inquiry.note = note;

    const updated = await inquiry.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update inquiry details', error: error.message });
  }
};

// Update inquiry status (only Pending → Rejected allowed)
const updateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'Pending', 'Rejected' allowed
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });

    if (status === 'Confirmed') {
      return res.status(400).json({ message: 'Cannot confirm directly. Fill student data to confirm.' });
    }

    inquiry.status = status; // Pending → Rejected
    const updated = await inquiry.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
};

// Confirm inquiry and create student
const confirmInquiry = async (req, res) => {
  try {
    const {
      facultyId,
      // grNumber,
      photo,
      totalFees,
      paidFees,
      slotTime,
      branch,
      Signature,
      // surname,
      fathername,
      fatherphone,
      aadharno,
      joindate,
      rafrence,
      Note,
      pcNumber
    } = req.body;

    // ----- Fetch Inquiry -----
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });

    if (inquiry.status === 'Rejected') {
      return res.status(400).json({ message: 'Cannot confirm a rejected inquiry' });
    }

    // ----- Validate slotTime -----
    if (!slotTime || typeof slotTime !== 'string') {
      return res.status(400).json({ message: 'slotTime is required and must be a string' });
    }

    // ----- Assign faculty & update inquiry status -----
    inquiry.assignedFaculty = facultyId;
    inquiry.status = 'Confirmed';
    await inquiry.save();

    // ----- Validate fees -----
    const total = Number(totalFees);
    const paid = Number(paidFees);
    if (isNaN(total) || isNaN(paid)) {
      return res.status(400).json({ message: 'Invalid totalFees or paidFees' });
    }
    const pendingFees = total - paid;

    // ----- Check if student already exists for this inquiry -----
    const studentExists = await Student.findOne({ inquiryId: inquiry._id });
    if (studentExists) {
      return res.status(400).json({ message: 'Student already created for this inquiry' });
    }

    // ----- Check for duplicate GR number -----
    // const grExists = await Student.findOne({ grNumber });
    // if (grExists) {
    //   return res.status(400).json({ message: `GR Number "${grNumber}" already exists` });
    // }

    // ----- Create first payment entry -----
    const firstPayment = { amount: paid, date: new Date(), remark: 'Admission Installment' };

    // ----- Create new student -----
    const newStudent = await Student.create({
      // From Inquiry
      name: inquiry.name,
      surname: inquiry.surname,
      email: inquiry.email,
      phone: inquiry.phone,
      address: inquiry.address,
      dob: inquiry.dob,
      course: inquiry.courseInterested,

      // From request
      // surname,
      fathername,
      fatherphone,
      aadharno,
      joindate,
      rafrence,
      Note,
      Asianpc: pcNumber,
      faculty: facultyId,
      inquiryId: inquiry._id,
      photo,
      grNumber: await generateGRNumber(), // ✅ auto-generate
      totalFees: total,
      paidFees: paid,
      pendingFees,
      feesHistory: [firstPayment],
      slotTime,
      branch,
      Signature
    });

    const originalCourse = await Course.findOne({
      nameofcourse: { $regex: `^${newStudent.course}$`, $options: "i" }
    });

    if (!originalCourse)
      return res.status(404).json({ message: `Course "${newStudent.course}" not found` });


    // 2️⃣ Create UserCourse for this student using original course steps
    const userCourse = await UserCourse.create({
      nameofcourse: originalCourse.nameofcourse,
      user: newStudent._id,
      steps: originalCourse.steps.map(step => ({
        title: step.title,
        status: false, // all steps start as not done
      })),
    });

    // ----- Generate receipt PDF -----
    const receiptFolder = path.join(__dirname, '../receipts');
    if (!fs.existsSync(receiptFolder)) fs.mkdirSync(receiptFolder, { recursive: true });

    const receiptName = `${newStudent._id}_${Date.now()}.pdf`;
    const receiptPath = path.join(receiptFolder, receiptName);
    await generateReceipt(newStudent, firstPayment, receiptPath);

    // ----- Send response -----
    res.status(201).json({
      message: 'Inquiry confirmed and student created',
      student: newStudent,
      receiptUrl: `/receipts/${receiptName}`,
    });

  } catch (error) {
    console.error(error);

    // Handle duplicate key errors from MongoDB
    if (error.code === 11000 && error.keyPattern?.grNumber) {
      return res.status(400).json({ message: `GR Number "${error.keyValue.grNumber}" already exists` });
    }

    res.status(500).json({ message: 'Failed to confirm inquiry', error: error.message });
  }
};




// Delete inquiry (Pending or Rejected only)
const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });

    if (inquiry.status === 'Confirmed') {
      return res.status(400).json({ message: 'Cannot delete a confirmed inquiry' });
    }

    await inquiry.deleteOne();
    res.status(200).json({ message: 'Inquiry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete inquiry', error: error.message });
  }
};

// Get inquiries by faculty
const getInquiriesByFaculty = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ assignedFaculty: req.params.facultyId });
    res.status(200).json(inquiries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inquiries for faculty', error: error.message });
  }
};

// Get inquiries by status
const getInquiriesByStatus = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ status: req.params.status }).populate('assignedFaculty', 'name email');
    res.status(200).json(inquiries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inquiries by status', error: error.message });
  }
};

module.exports = {
  addInquiry,
  getAllInquiries,
  getInquiryById,
  updateInquiryDetails,
  updateInquiryStatus,
  confirmInquiry,
  deleteInquiry,
  getInquiriesByFaculty,
  getInquiriesByStatus,
};

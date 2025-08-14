const Inquiry = require('../models/Inquiry');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const fs = require('fs');
const path = require('path');
const generateReceipt = require('../utils/generateReceipt');
// Add new inquiry
const addInquiry = async (req, res) => {
    try {
        const {
            name, email, phone, address, dob,
            courseInterested, note
        } = req.body;

        const newInquiry = await Inquiry.create({
            name,
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

// Get single inquiry by ID
const getInquiryById = async (req, res) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id).populate('assignedFaculty', 'name email phone');
        if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
        res.status(200).json(inquiry);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching inquiry', error: error.message });
    }
};

// Update inquiry (including assign faculty or status)
const updateInquiryDetails = async (req, res) => {
    try {
      const {
        name, email, phone, address, dob,
        courseInterested, note
      } = req.body;
  
      const inquiry = await Inquiry.findById(req.params.id);
      if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
  
      if (name) inquiry.name = name;
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
  
  const updateInquiryStatus = async (req, res) => {
    try {
      const { status } = req.body; // 'Pending', 'Confirmed', 'Rejected'
  
      const inquiry = await Inquiry.findById(req.params.id);
      if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
  
      inquiry.status = status;
      const updated = await inquiry.save();
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update status', error: error.message });
    }
  };


  const assignFacultyToInquiry = async (req, res) => {
    try {
      const { facultyId, grNumber, photo, totalFees, paidFees, slotTime } = req.body;

  
      // 🟠 Fetch inquiry
      const inquiry = await Inquiry.findById(req.params.id);
      if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
  
      // 🟥 Inquiry must be confirmed before proceeding
      if (inquiry.status !== 'Confirmed') {
        return res.status(400).json({ message: 'Inquiry must be confirmed before assigning faculty' });
      }
      if (!slotTime || typeof slotTime !== 'string') {
        return res.status(400).json({ message: 'slotTime is required and must be a string' });
      }
      
      // 🟢 Assign faculty
      inquiry.faculty = facultyId;
      await inquiry.save();
  
      // 🔢 Validate and calculate fees
      const total = Number(totalFees);
      const paid = Number(paidFees);
  
      if (isNaN(total) || isNaN(paid)) {
        return res.status(400).json({ message: 'Invalid totalFees or paidFees. Must be numbers.' });
      }
  
      const pendingFees = total - paid;
  
      // 🔍 Prevent duplicate student creation
      const studentExists = await Student.findOne({ inquiryId: inquiry._id });
      if (studentExists) {
        return res.status(400).json({ message: 'Student already created for this inquiry' });
      }
  
      // 💸 Create first installment record
      const firstPayment = {
        amount: paid,
        date: new Date(),
        remark: 'Admission Installment'
      };
  
      // 🆕 Create new student
      const newStudent = new Student({
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        address: inquiry.address,
        dob: inquiry.dob,
        course: inquiry.course,
        faculty: facultyId,
        inquiryId: inquiry._id,
        photo,
        grNumber,
        totalFees: total,
        paidFees: paid,
        pendingFees,
        admissionDate: new Date(),
        feesHistory: [firstPayment],
        slotTime // ✅ Add this line
      });
      
  
      await newStudent.save();
  
      // 📁 Ensure /receipts folder exists
      const receiptFolder = path.join(__dirname, '../receipts');
      if (!fs.existsSync(receiptFolder)) {
        fs.mkdirSync(receiptFolder, { recursive: true });
      }
  
      // 📄 Generate receipt PDF
      const receiptName = `${newStudent._id}_${Date.now()}.pdf`;
      const receiptPath = path.join(receiptFolder, receiptName);
      await generateReceipt(newStudent, firstPayment, receiptPath);
  
      // ✅ Success Response
      return res.status(201).json({
        message: 'Faculty assigned and student created',
        student: newStudent,
        receiptUrl: `/receipts/${receiptName}`
      });
  
    } catch (error) {
      console.error('Error confirming inquiry and assigning faculty:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
  
  
  
  
  
// Delete inquiry
const deleteInquiry = async (req, res) => {
    try {
      const inquiry = await Inquiry.findById(req.params.id);
      if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
  
      // ❌ Prevent deletion if confirmed and assigned to faculty
      if (inquiry.status === 'Confirmed' && inquiry.assignedFaculty) {
        return res.status(400).json({ message: 'Cannot delete: Inquiry is already confirmed and assigned to a faculty' });
      }
  
      await inquiry.deleteOne();
      res.status(200).json({ message: 'Inquiry deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete inquiry', error: error.message });
    }
  };
  

// Get all inquiries assigned to a specific faculty
const getInquiriesByFaculty = async (req, res) => {
    try {
        const facultyId = req.params.facultyId;
        const inquiries = await Inquiry.find({ assignedFaculty: facultyId });
        res.status(200).json(inquiries);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching inquiries for faculty', error: error.message });
    }
};

// Get inquiries by status
const getInquiriesByStatus = async (req, res) => {
    try {
        const { status } = req.params; // 'Pending', 'Confirmed', or 'Rejected'
        const inquiries = await Inquiry.find({ status }).populate('assignedFaculty', 'name email');
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
    assignFacultyToInquiry,
    deleteInquiry,
    getInquiriesByFaculty,
    getInquiriesByStatus
  };
  
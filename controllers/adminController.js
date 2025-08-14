const Admin = require('../models/Admin.js');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken.js');
const Inquiry = require('../models/Inquiry');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

const registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  const adminExists = await Admin.findOne({ email });
  if (adminExists) return res.status(400).json({ message: 'Admin already exists' });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const admin = await Admin.create({ name, email, password: hashedPassword });

  res.status(201).json({
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    token: generateToken(admin._id)
  });
};

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(400).json({ message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  res.json({
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    token: generateToken(admin._id)
  });
};

const getAdminProfile = async (req, res) => {
  res.json(req.admin);
};

const updateAdmin = async (req, res) => {
  const admin = await Admin.findById(req.admin._id);

  if (!admin) return res.status(404).json({ message: 'Admin not found' });

  admin.name = req.body.name || admin.name;
  admin.email = req.body.email || admin.email;

  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(req.body.password, salt);
  }

  const updated = await admin.save();
  res.json({
    _id: updated._id,
    name: updated.name,
    email: updated.email,
    token: generateToken(updated._id)
  });
};

const deleteAdmin = async (req, res) => {
  await Admin.findByIdAndDelete(req.admin._id);
  res.json({ message: 'Admin deleted successfully' });
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Fetch the current admin from DB
  const admin = await Admin.findById(req.admin._id);
  if (!admin) return res.status(404).json({ message: 'Admin not found' });

  // Check if the current password is correct
  const isMatch = await bcrypt.compare(currentPassword, admin.password);
  if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

  // Hash and update the new password
  const salt = await bcrypt.genSalt(10);
  admin.password = await bcrypt.hash(newPassword, salt);
  await admin.save();

  res.json({ message: 'Password changed successfully' });
};
const getAdminDashboardSummary = async (req, res) => {
  try {
    const totalInquiries = await Inquiry.countDocuments();
    const confirmedInquiries = await Inquiry.countDocuments({ status: 'Confirmed' });
    const totalStudents = await Student.countDocuments();
    const totalFaculties = await Faculty.countDocuments();
    const pendingFeesStudents = await Student.countDocuments({ feesPaid: false });

    res.status(200).json({
      totalInquiries,
      confirmedInquiries,
      totalStudents,
      totalFaculties,
      pendingFeesStudents
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Dashboard summary failed', error });
  }
};


module.exports = {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdmin,
  deleteAdmin,
  changePassword,
  getAdminDashboardSummary 
};
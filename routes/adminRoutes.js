const express = require('express');
const {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdmin,
  deleteAdmin,
  changePassword,
  getAdminDashboardSummary
} = require('../controllers/adminController.js');

const {protect, adminOnly} = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/profile', protect, getAdminProfile);
router.put('/profile', protect, updateAdmin);
router.delete('/profile', protect, deleteAdmin);
router.put('/change-password', protect, changePassword);
router.get('/dashboard-summary', protect, adminOnly, getAdminDashboardSummary);


module.exports = router;

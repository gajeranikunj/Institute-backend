const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  addInquiry,
  getAllInquiries,
  getInquiryById,
  updateInquiryDetails,
  updateInquiryStatus,
  confirmInquiry,
  deleteInquiry,
  getInquiriesByFaculty,
  getInquiriesByStatus,
} = require('../controllers/inquiryController');

// CRUD routes
router.post('/', protect, addInquiry);
router.get('/', protect, getAllInquiries);
router.get('/:id', protect, getInquiryById);
router.put('/:id/details', protect, updateInquiryDetails);
router.put('/:id/status', protect, updateInquiryStatus);
router.put('/:id/confirm', protect, confirmInquiry); // Confirm and create student
router.delete('/:id', protect, deleteInquiry);

// Filter routes
router.get('/faculty/:facultyId', protect, getInquiriesByFaculty);
router.get('/status/:status', protect, getInquiriesByStatus);

module.exports = router;

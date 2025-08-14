const express = require('express');
const router = express.Router();
const {
  addInquiry,
  getAllInquiries,
  getInquiryById,
  deleteInquiry,
  getInquiriesByFaculty,
  getInquiriesByStatus,
  updateInquiryDetails,
  updateInquiryStatus,
  assignFacultyToInquiry
} = require('../controllers/inquiryController');
const { protect } = require('../middleware/auth');

// POST /api/inquiry - Add new inquiry
router.post('/' , protect, addInquiry);

// GET /api/inquiry - Get all inquiries
router.get('/', protect, getAllInquiries);

// GET /api/inquiry/:id - Get one inquiry
router.get('/:id', protect, getInquiryById);

// PUT /api/inquiry/:id - Update inquiry
router.put('/:id/details',protect, updateInquiryDetails);
router.put('/:id/status',protect, updateInquiryStatus);
router.put('/:id/assign-faculty',protect, assignFacultyToInquiry);

// DELETE /api/inquiry/:id - Delete inquiry
router.delete('/:id', protect, deleteInquiry);

// GET /api/inquiry/faculty/:facultyId - Get all inquiries assigned to faculty
router.get('/faculty/:facultyId', protect, getInquiriesByFaculty);

// GET /api/inquiry/status/:status - Get inquiries by status
router.get('/status/:status', protect, getInquiriesByStatus);

module.exports = router;

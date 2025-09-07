const express = require('express');
const router = express.Router();
const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentsByFaculty,
  addFeeInstallment,
  getStudentBasicInfo
} = require('../controllers/studentController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/',protect, adminOnly, createStudent);
router.get('/', getAllStudents);
router.get('/basic-info', getStudentBasicInfo);
router.get('/:id', getStudentById);
router.put('/:id',protect, adminOnly, updateStudent);
router.delete('/:id',protect, adminOnly, deleteStudent);
router.get('/faculty/:facultyId', getStudentsByFaculty);
router.post('/:studentId/add-installment',protect,adminOnly, addFeeInstallment);


module.exports = router;

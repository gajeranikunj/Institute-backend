const express = require('express');
const router = express.Router();
const {
  createbranch,
  getbranchs,
  getbranchById,
  updatebranch,
  deletebranch
} = require('../controllers/branchController');

// Routes
router.post('/', createbranch);      // Create a branch
router.get('/', getbranchs);         // Get all branchs
router.get('/:id', getbranchById);   // Get single branch
router.put('/:id', updatebranch);    // Update branch
router.delete('/:id', deletebranch); // Delete branch

module.exports = router;

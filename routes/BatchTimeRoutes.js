const express = require('express');
const router = express.Router();
const {
  createBatchTime,
  getBatchTimes,
  getBatchTimeById,
  updateBatchTime,
  deleteBatchTime
} = require('../controllers/BatchTimeController');

// Routes
router.post('/', createBatchTime);      // Create a BatchTime
router.get('/', getBatchTimes);         // Get all BatchTimes
router.get('/:id', getBatchTimeById);   // Get single BatchTime
router.put('/:id', updateBatchTime);    // Update BatchTime
router.delete('/:id', deleteBatchTime); // Delete BatchTime

module.exports = router;

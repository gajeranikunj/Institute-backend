const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getAvailablePCs, getSchedule } = require('../controllers/ScheduleController');

// Route to get available PCs for a specific branch and batch
// Example: GET /api/schedule/available?branchId=xxx&batchTime=6:00-8:00
router.get('/available', protect, getAvailablePCs);

// Route to get the full schedule with all branches and batch times
// Example: GET /api/schedule
router.get('/', protect, getSchedule);

module.exports = router;

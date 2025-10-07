const express = require("express");
const router = express.Router();
const { getUserCourse, updateStepStatus } = require("../controllers/userCourseController");

// Routes
router.get("/", getUserCourse);        // Get course by course ID or user ID
router.put("/step-status", updateStepStatus); // Update a step's status

module.exports = router;

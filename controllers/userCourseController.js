const UserCourse = require("../models/usercourse");

// Get course by ID or by user
const getUserCourse = async (req, res) => {
  try {
    const { id, userId } = req.query;
    console.log(userId);

    let course;
    if (userId) {
      course = await UserCourse.findOne({ user: userId }).populate("user");
    } else {
      return res.status(400).json({ message: "Provide user ID" });
    }

    if (!course) return res.status(404).json({ message: "Course not found" });

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: "Error fetching course", error: error.message });
  }
};

// Update a step status
const updateStepStatus = async (req, res) => {
  try {
    const { courseId, stepTitle, status } = req.body;

    console.log(courseId, stepTitle, status);


    if (!courseId || !stepTitle || typeof status !== "boolean") {
      return res.status(400).json({ message: "courseId, stepTitle, and status are required" });
    }

    const course = await UserCourse.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const step = course.steps.find((s) => s.title?.toLowerCase() === stepTitle?.toLowerCase());
    console.log(step);

    if (!step) return res.status(404).json({ message: "Step not found" });

    step.status = status;
    step.date = status ? new Date() : undefined;

    await course.save();
    res.status(200).json({ message: "Step status updated", course });
  } catch (error) {
    res.status(500).json({ message: "Error updating step", error: error.message });
  }
};

module.exports = {
  getUserCourse,
  updateStepStatus
};

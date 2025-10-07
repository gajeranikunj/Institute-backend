const Course = require('../models/course');

// Create a new course with optional steps
const createCourse = async (req, res) => {
  try {
    const { nameofcourse, steps } = req.body;

    if (!nameofcourse) {
      return res.status(400).json({ message: "Course name is required" });
    }

    // Validate steps if provided
    const formattedSteps = Array.isArray(steps)
      ? steps.map(step => ({ title: step.title }))
      : [];

    const newCourse = new Course({
      nameofcourse,
      steps: formattedSteps
    });

    await newCourse.save();

    res.status(201).json({ message: "Course created successfully", course: newCourse });
  } catch (error) {
    res.status(500).json({ message: "Error creating course", error: error.message });
  }
};

// Get all courses
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching courses", error: error.message });
  }
};

// Get course by ID
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: "Error fetching course", error: error.message });
  }
};

// Update course name or steps
const updateCourse = async (req, res) => {
  try {
    const { nameofcourse, steps } = req.body;

    const updateData = {};
    if (nameofcourse) updateData.nameofcourse = nameofcourse;
    if (Array.isArray(steps)) {
      updateData.steps = steps.map(step => ({ title: step.title }));
    }

    const course = await Course.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({ message: "Course updated successfully", course });
  } catch (error) {
    res.status(500).json({ message: "Error updating course", error: error.message });
  }
};

// Delete course
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting course", error: error.message });
  }
};

// Add a step to a course
const addStep = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: "Step title is required" });

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    course.steps.push({ title });
    await course.save();

    res.status(200).json({ message: "Step added successfully", course });
  } catch (error) {
    res.status(500).json({ message: "Error adding step", error: error.message });
  }
};

// Update a step in a course
const updateStep = async (req, res) => {
  try {
    const { stepId } = req.params;
    const { title } = req.body;

    if (!title) return res.status(400).json({ message: "Step title is required" });

    const course = await Course.findOne({ "steps._id": stepId });
    if (!course) return res.status(404).json({ message: "Step not found" });

    const step = course.steps.id(stepId);
    step.title = title;

    await course.save();

    res.status(200).json({ message: "Step updated successfully", course });
  } catch (error) {
    res.status(500).json({ message: "Error updating step", error: error.message });
  }
};

// Delete a step from a course
const deleteStep = async (req, res) => {
  try {
    const { stepId } = req.params;

    const course = await Course.findOne({ "steps._id": stepId });
    if (!course) return res.status(404).json({ message: "Step not found" });

    course.steps.id(stepId).remove();
    await course.save();

    res.status(200).json({ message: "Step deleted successfully", course });
  } catch (error) {
    res.status(500).json({ message: "Error deleting step", error: error.message });
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  addStep,
  updateStep,
  deleteStep
};

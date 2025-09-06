const BatchTimemodel = require('../models/BatchTime');

// Create a new BatchTime
const createBatchTime = async (req, res) => {
  try {
    const { BatchTime } = req.body;
    console.log("Request Body:", req.body);
    

    if (!BatchTime) {
      return res.status(400).json({ message: "BatchTime name is required" });
    }

    const newBatchTime = new BatchTimemodel({ BatchTime });
    await newBatchTime.save();

    res.status(201).json({ message: "BatchTime created successfully", BatchTime: newBatchTime });
  } catch (error) {
    res.status(500).json({ message: "Error creating BatchTime", error: error.message });
  }
};

// Get all BatchTimes
const getBatchTimes = async (req, res) => {
  try {
    const BatchTimes = await BatchTimemodel.find().sort({ createdAt: -1 });
    res.status(200).json(BatchTimes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching BatchTimes", error: error.message });
  }
};

// Get BatchTime by ID
const getBatchTimeById = async (req, res) => {
  try {
    const BatchTime = await BatchTimemodel.findById(req.params.id);
    if (!BatchTime) {
      return res.status(404).json({ message: "BatchTime not found" });
    }
    res.status(200).json(BatchTime);
  } catch (error) {
    res.status(500).json({ message: "Error fetching BatchTime", error: error.message });
  }
};

// Update BatchTime
const updateBatchTime = async (req, res) => {
  try {
    const { BatchTime } = req.body;
    const BatchTimes = await BatchTimemodel.findByIdAndUpdate(
      req.params.id,
      { BatchTime },
      { new: true, runValidators: true }
    );

    if (!BatchTimes) {
      return res.status(404).json({ message: "BatchTime not found" });
    }

    res.status(200).json({ message: "BatchTime updated successfully", BatchTimes });
  } catch (error) {
    res.status(500).json({ message: "Error updating BatchTime", error: error.message });
  }
};

// Delete BatchTime
const deleteBatchTime = async (req, res) => {
  try {
    const BatchTime = await BatchTimemodel.findByIdAndDelete(req.params.id);
    if (!BatchTime) {
      return res.status(404).json({ message: "BatchTime not found" });
    }
    res.status(200).json({ message: "BatchTime deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting BatchTime", error: error.message });
  }
};

module.exports = {
  createBatchTime,
  getBatchTimes,
  getBatchTimeById,
  updateBatchTime,
  deleteBatchTime
};

const branch = require('../models/branch');

// Create a new branch
const createbranch = async (req, res) => {
  try {
    const { nameofbranch ,TotalPc} = req.body;
    console.log("Request Body:", req.body);
    

    if (!nameofbranch) {
      return res.status(400).json({ message: "branch name is required" });
    }

    if (!TotalPc) {
      return res.status(400).json({ message: "Total Pc is required" });
    }

    const newbranch = new branch({ nameofbranch,TotalPc });
    await newbranch.save();

    res.status(201).json({ message: "branch created successfully", branch: newbranch });
  } catch (error) {
    res.status(500).json({ message: "Error creating branch", error: error.message });
  }
};

// Get all branchs
const getbranchs = async (req, res) => {
  try {
    const branchs = await branch.find().sort({ createdAt: -1 });
    res.status(200).json(branchs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching branchs", error: error.message });
  }
};

// Get branch by ID
const getbranchById = async (req, res) => {
  try {
    const branch = await branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ message: "branch not found" });
    }
    res.status(200).json(branch);
  } catch (error) {
    res.status(500).json({ message: "Error fetching branch", error: error.message });
  }
};
// Update branch
const updatebranch = async (req, res) => {
  try {
    const { nameofbranch, TotalPc } = req.body;
    console.log("Updating branch ID:", req.params.id);

    const updatedBranch = await branch.findByIdAndUpdate(
      req.params.id,
      { nameofbranch, TotalPc },
      { new: true, runValidators: true }
    );

    if (!updatedBranch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    res.status(200).json({ message: "Branch updated successfully", branch: updatedBranch });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating branch", error: error.message });
  }
};

// Delete branch
const deletebranch = async (req, res) => {
  try {
    const branch = await branch.findByIdAndDelete(req.params.id);
    if (!branch) {
      return res.status(404).json({ message: "branch not found" });
    }
    res.status(200).json({ message: "branch deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting branch", error: error.message });
  }
};

module.exports = {
  createbranch,
  getbranchs,
  getbranchById,
  updatebranch,
  deletebranch
};

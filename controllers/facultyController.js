const Faculty = require('../models/Faculty');
const student = require('../models/Student');
const generateToken = require('../utils/generateToken');

// Register faculty (admin only)
const registerFaculty = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      photo,
      salary,
      address,
      expertise,
      experienceYears,
      branch,
      accountNumber,
      ifscCode,
      aadhaarCard,
      panCard,
      signature
    } = req.body;

      // Check for missing fields
    const requiredFields = {
      name, email, password, phone, photo, salary, address, expertise,
      experienceYears, branch, accountNumber, ifscCode, aadhaarCard, panCard, signature
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => value === undefined || value === null || value === "")
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Missing required fields",
        missingFields
      });
    }


    const exists = await Faculty.findOne({ email });
    if (exists) return res.status(400).json({ message: "Faculty already exists" });

    const faculty = await Faculty.create({
      name,
      email,
      password,
      phone,
      photo,
      salary,
      address,
      expertise,
      experienceYears,
      branch,
      accountNumber,
      ifscCode,
      aadhaarCard,
      panCard,
      signature
    });

    res.status(201).json({
      message: 'Faculty registered successfully',
      faculty: {
        id: faculty._id,
        name: faculty.name,
        email: faculty.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Faculty login
const loginFaculty = async (req, res) => {
  try {
    const { email, password } = req.body;

    const faculty = await Faculty.findOne({ email });
    if (faculty && await faculty.matchPassword(password)) {
      res.status(200).json({
        _id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        token: generateToken(faculty._id),
        role: "faculty"
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all faculties (admin only)
const getAllFaculties = async (req, res) => {
  try {
    const faculties = await Faculty.aggregate([
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: 'faculty',
          as: 'students',
        },
      },
      {
        $addFields: {
          totalStudents: { $size: '$students' },
        },
      },
      {
        $project: { password: 0, students: 0 },
      },
    ]);

    res.status(200).json(faculties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get faculty profile
const getFacultyProfile = async (req, res) => {
  try {
    const facultyId = req.user._id;

    const faculty = await Faculty.aggregate([
      { $match: { _id: facultyId } },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: 'faculty',
          as: 'students',
        },
      },
      {
        $addFields: {
          totalStudents: { $size: '$students' },
        },
      },
      {
        $project: { password: 0, students: 0 },
      },
    ]);

    if (!faculty || faculty.length === 0) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    res.status(200).json(faculty[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete faculty
const deleteFaculty = async (req, res) => {
  try {
    await Faculty.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Faculty deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update faculty
const updateFaculty = async (req, res) => {
  try {
    const facultyId = req.params.id;

    if (req.user.role !== 'admin' && req.user._id.toString() !== facultyId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const updatedData = req.body;
    
    //   // Check for missing fields
    // const requiredFields = {
    //   name, email, phone, photo, salary, address, expertise,
    //   experienceYears, branch, accountNumber, ifscCode, aadhaarCard, panCard, signature
    // };

    // const missingFields = Object.entries(requiredFields)
    //   .filter(([key, value]) => value === undefined || value === null || value === "")
    //   .map(([key]) => key);

    // if (missingFields.length > 0) {
    //   return res.status(400).json({
    //     message: "Missing required fields",
    //     missingFields
    //   });
    // }

    if (updatedData.password) {
      const bcrypt = require('bcrypt');
      updatedData.password = await bcrypt.hash(updatedData.password, 10);
    }

    const updatedFaculty = await Faculty.findByIdAndUpdate(
      facultyId,
      updatedData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedFaculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    res.status(200).json({
      message: "Faculty updated successfully",
      faculty: updatedFaculty
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get faculty by ID
const getFacultyById = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id).select('-password');
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.status(200).json(faculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerFaculty,
  loginFaculty,
  getAllFaculties,
  getFacultyProfile,
  deleteFaculty,
  updateFaculty,
  getFacultyById
};

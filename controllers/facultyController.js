const Faculty = require('../models/Faculty');
const student = require('../models/Student');
const generateToken = require('../utils/generateToken');

// Register faculty (admin only)
const registerFaculty = async (req, res) => {
  try {
    const { name, email, password, phone, photo, salary, totalStudents, address, expertise, experienceYears, branch } = req.body;
    console.log(name, email, password, phone, photo, salary, totalStudents, address, expertise, experienceYears, branch);

    const exists = await Faculty.findOne({ email });
    if (exists) return res.status(400).json({ message: "Faculty already exists" });

    const faculty = await Faculty.create({
      name,
      email,
      password,
      phone,
      photo,
      salary,
      totalStudents,
      address,
      expertise,
      experienceYears,
      branch
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
    // Aggregate faculties with student count
    const faculties = await Faculty.aggregate([
      {
        $lookup: {
          from: 'students',           // collection name in MongoDB
          localField: '_id',          // Faculty _id
          foreignField: 'faculty',    // Student.faculty field
          as: 'students',
        },
      },
      {
        $addFields: {
          totalStudents: { $size: '$students' }, // count students
        },
      },
      {
        $project: { password: 0, students: 0 }, // hide password and student array
      },
    ]);

    res.status(200).json(faculties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get single faculty profile
// Get single faculty profile with student count
const getFacultyProfile = async (req, res) => {
  try {
    const facultyId = req.user._id;

    const faculty = await Faculty.aggregate([
      {
        $match: { _id: facultyId }, // match current faculty
      },
      {
        $lookup: {
          from: 'students',        // collection name in MongoDB
          localField: '_id',       // Faculty _id
          foreignField: 'faculty', // Student.faculty field
          as: 'students',
        },
      },
      {
        $addFields: {
          totalStudents: { $size: '$students' }, // count students
        },
      },
      {
        $project: { password: 0, students: 0 }, // hide password and student array
      },
    ]);

    if (!faculty || faculty.length === 0) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    res.status(200).json(faculty[0]); // aggregation returns array
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete faculty (admin only)
const deleteFaculty = async (req, res) => {
  try {
    await Faculty.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Faculty deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✏️ Update faculty (admin or self)
const updateFaculty = async (req, res) => {
  try {
    const facultyId = req.params.id;

    // Allow update only if: admin OR faculty updating own profile
    if (req.user.role !== 'admin' && req.user._id.toString() !== facultyId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const updatedData = req.body;

    // If password is present, hash it
    if (updatedData.password) {
      const bcrypt = require('bcrypt');
      updatedData.password = await bcrypt.hash(updatedData.password, 10);
    }

    const updatedFaculty = await Faculty.findByIdAndUpdate(facultyId, updatedData, {
      new: true,
      runValidators: true
    }).select('-password');

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

// Get single faculty by ID (admin only)
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

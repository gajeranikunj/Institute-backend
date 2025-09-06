const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const cron = require("node-cron");
// ✅ Create or Toggle Attendance Record
const createAttendance = async (req, res) => {
  try {
    const { faculty, student, status, date } = req.body;
    console.log(req.body);

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const attendanceDate = new Date(date); // Use exactly the date sent

    // Check if attendance already exists for this student & exact date
    let attendance = await Attendance.findOne({
      student,
      date: attendanceDate,
    });

    if (attendance) {
      // Toggle or update status
      attendance.status = status || (attendance.status === "Present" ? "Absent" : "Present");
      await attendance.save();
      return res.status(200).json({ message: "Attendance updated", attendance });
    }

    // Create new attendance
    attendance = new Attendance({
      faculty,
      student,
      status: status || "Absent",
      date: attendanceDate, // store exactly the date sent
    });

    await attendance.save();
    res.status(201).json({ message: "Attendance recorded", attendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};




// ✅ Auto-create absent attendance for all students (manual trigger)
const createDailyAttendance = async (req, res) => {
  try {
    const { faculty, date } = req.body;
    const attendanceDate = date
      ? new Date(date).setHours(0, 0, 0, 0)
      : new Date().setHours(0, 0, 0, 0);

    // ✅ Get all students
    const students = await Student.find();
    const records = [];

    for (const student of students) {
      let attendance = await Attendance.findOne({
        student: student._id,
        date: { $gte: attendanceDate, $lt: attendanceDate + 24 * 60 * 60 * 1000 },
      });

      if (!attendance) {
        // ✅ Create absent by default
        attendance = new Attendance({
          faculty,
          student: student._id,
          status: "Absent",
          date: attendanceDate,
        });
        await attendance.save();
      }
      records.push(attendance);
    }

    res.status(200).json({ message: "Daily attendance created", records });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update attendance record by ID
const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const attendance = await Attendance.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.status(200).json({ message: 'Attendance updated', attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete attendance record by ID
const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findByIdAndDelete(id);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.status(200).json({ message: 'Attendance deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get attendance by student ID
const getAttendanceByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId).select('_id name');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const attendanceRecords = await Attendance.find({ student: studentId })
      .populate('faculty', 'name')
      .populate('student', 'name');

    res.status(200).json({
      student,
      attendance: attendanceRecords
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all attendance grouped by student
const getAllAttendanceWithStudents = async (req, res) => {
  try {
    const students = await Student.find().select('_id name');
    const allAttendance = await Attendance.find()
      .populate('faculty', 'name')
      .populate('student', 'name');

    const result = students.map(student => {
      const studentAttendance = allAttendance.filter(
        att => att.student._id.toString() === student._id.toString()
      );

      return {
        student,
        attendance: studentAttendance
      };
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAttendance,
  createDailyAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceByStudentId,
  getAllAttendanceWithStudents
};

/* ========================
   ✅ Auto Absent with Cron
   ======================== */
cron.schedule("0 9 * * *", async () => {
  try {
    const today = new Date().setHours(0, 0, 0, 0);
    const students = await Student.find();

    for (const student of students) {
      const exists = await Attendance.findOne({
        student: student._id,
        date: { $gte: today, $lt: today + 24 * 60 * 60 * 1000 },
      });

      if (!exists) {
        await Attendance.create({
          student: student._id,
          status: "Absent",
          date: today,
        });
      }
    }

    console.log("✅ Auto attendance marked as Absent for all students");
  } catch (error) {
    console.error("❌ Cron Error (Attendance):", error.message);
  }
});

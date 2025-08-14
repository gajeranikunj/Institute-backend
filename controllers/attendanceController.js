const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

const markAttendance = async (req, res) => {
    try {
        const { records } = req.body; // array of { studentId, status }
        const facultyId = req.user._id;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let attendance = await Attendance.findOne({
            faculty: facultyId,
            date: { $gte: today }
        });

        const formattedRecords = records.map((r) => ({
            student: r.studentId,
            status: r.status
        }));

        if (attendance) {
            // Attendance already exists — update it with new records

            // Make a map of existing student IDs
            const existingStudentIds = new Set(
                attendance.records.map((r) => r.student.toString())
            );

            for (const record of formattedRecords) {
                const studentIdStr = record.student.toString();

                // If this student not yet marked, update attendance
                if (!existingStudentIds.has(studentIdStr)) {
                    attendance.records.push(record);

                    // If Absent, increment counter
                    if (record.status === 'Absent') {
                        await Student.findByIdAndUpdate(record.student, { $inc: { absentCount: 1 } });
                    }
                }
            }

            await attendance.save();

            return res.status(200).json({
                message: 'Attendance updated with remaining students.',
                data: attendance
            });
        }

        // First time creating attendance
        for (const record of formattedRecords) {
            if (record.status === 'Absent') {
                await Student.findByIdAndUpdate(record.student, { $inc: { absentCount: 1 } });
            }
        }

        const newAttendance = await Attendance.create({
            faculty: facultyId,
            records: formattedRecords
        });

        res.status(201).json({ message: 'Attendance marked successfully.', data: newAttendance });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};



const updateTodayAttendance = async (req, res) => {
    try {
      const { records } = req.body; // array of { studentId, status }
      const facultyId = req.user._id;
  
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
  
      const attendance = await Attendance.findOne({
        faculty: facultyId,
        date: { $gte: todayStart }
      });
  
      if (!attendance) {
        return res.status(404).json({ message: 'No attendance found for today.' });
      }
  
      const recordMap = new Map();
      records.forEach(r => recordMap.set(r.studentId, r.status));
  
      // Update records
      attendance.records = attendance.records.map(r => {
        const updatedStatus = recordMap.get(r.student.toString());
  
        if (updatedStatus) {
          // Adjust absentCount if changing status
          if (r.status !== updatedStatus) {
            if (r.status === 'Absent' && updatedStatus === 'Present') {
              Student.findByIdAndUpdate(r.student, { $inc: { absentCount: -1 } }).exec();
            } else if (r.status === 'Present' && updatedStatus === 'Absent') {
              Student.findByIdAndUpdate(r.student, { $inc: { absentCount: 1 } }).exec();
            }
            return { ...r.toObject(), status: updatedStatus };
          }
        }
  
        return r;
      });
  
      await attendance.save();
  
      return res.status(200).json({ message: 'Attendance updated successfully.', data: attendance });
  
    } catch (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  };
  

const getStudentHistory = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Start of current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const attendanceRecords = await Attendance.find({
            date: { $gte: startOfMonth },
            'records.student': studentId
        }).sort({ date: -1 });

        const history = attendanceRecords.map((entry) => {
            const record = entry.records.find(r => r.student.toString() === studentId);
            return {
                date: entry.date.toISOString().split("T")[0],
                status: record.status
            };
        });

        res.status(200).json({ studentId, count: history.length, history });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching student history', error: err.message });
    }
};



module.exports = {
    markAttendance,
    updateTodayAttendance,
    getStudentHistory
}
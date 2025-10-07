const Student = require('../models/Student');
const Branch = require('../models/branch');
const BatchTime = require('../models/BatchTime');

/**
 * 1️⃣ Get available PCs for a branch and batch
 * Example: GET /api/schedule/available?branchId=xxx&batchTime=6:00-8:00
 */
const getAvailablePCs = async (req, res) => {
  try {
    const { branchId, batchTime, userid } = req.query;

    if (!branchId || !batchTime) {
      return res.status(400).json({ message: "branchId and batchTime are required" });
    }

    // Get branch info
    const branch = await Branch.findById(branchId);
    if (!branch) return res.status(404).json({ message: "Branch not found" });

    // Get students already assigned for this branch and batch
    const assignedStudents = await Student.find({ branch: branchId, slotTime: batchTime }).select('Asianpc -_id');
    const assignedPCs = assignedStudents.map(s => s.Asianpc);

    // Calculate available PCs
    const allPCs = Array.from({ length: branch.TotalPc }, (_, i) => i + 1);
    let availablePCs = allPCs.filter(pc => !assignedPCs.includes(pc));

    // If userid is provided, add their Asianpc if branch and slotTime match
    if (userid) {
      const studentData = await Student.findById(userid).select('Asianpc slotTime branch');
      if (studentData) {
        if (studentData.branch.toString() === branchId && studentData.slotTime === batchTime) {
          if (!availablePCs.includes(studentData.Asianpc)) {
            availablePCs.push(studentData.Asianpc);
            availablePCs.sort((a, b) => a - b);
          }
        }
      }
    }

    res.json({ branch: branch.nameofbranch, batchTime, availablePCs });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching available PCs", error: error.message });
  }
};


/**
 * Get full schedule with total PCs per branch and batch
 * Example: GET /api/schedule
 */
const getSchedule = async (req, res) => {
  try {
    // Get all students with branch info
    const students = await Student.find()
      .populate('branch', 'nameofbranch TotalPc')
      .lean();

    // Get all batch times
    const batchTimes = await BatchTime.find().sort({ createdAt: 1 }).lean();
    const batchTimeStrings = batchTimes.map(bt => bt.BatchTime);

    // Group students by branch and batch time
    const scheduleByBranch = {};

    students.forEach((s) => {
      const branchId = s.branch?._id.toString() || "unknown";
      const branchName = s.branch?.nameofbranch || "Unknown";
      const totalPCs = s.branch?.TotalPc || 10;
      const studentData = { _id: s._id, name: s.surname + " " + s.name, pc: s.Asianpc };

      if (!scheduleByBranch[branchId]) {
        scheduleByBranch[branchId] = {
          _id: branchId,
          branch: branchName,
          totalPCs,
          batchTime: batchTimeStrings.map(bt => ({ time: bt, students: [] }))
        };
      }

      // Find batch time in array and push student
      const batchObj = scheduleByBranch[branchId].batchTime.find(bt => bt.time === s.slotTime);
      if (batchObj) {
        batchObj.students.push(studentData);
      }
    });

    // Convert object to array
    const result = Object.values(scheduleByBranch);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching schedule", error: error.message });
  }
};

module.exports = {
  getAvailablePCs,
  getSchedule,
};

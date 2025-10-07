const Student = require("../models/Student");

const generateGRNumber = async () => {
  // Find the student with the highest GR number
  const lastStudent = await Student.findOne({ grNumber: { $regex: /^DGJI\d{4}$/ } })
    .sort({ grNumber: -1 })
    .lean();

  let newNumber = 1;
  if (lastStudent && lastStudent.grNumber) {
    // Extract number part from format DGJI0001
    const lastNumber = parseInt(lastStudent.grNumber.replace("DGJI", ""), 10);
    newNumber = lastNumber + 1;
  }

  // Pad with leading zeros
  return "DGJI" + String(newNumber).padStart(4, "0");
};

module.exports = generateGRNumber;

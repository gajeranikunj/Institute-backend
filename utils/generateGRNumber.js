const Student = require("../models/Student");

const generateGRNumber = async () => {
  // Find latest student
  const lastStudent = await Student.findOne().sort({ createdAt: -1 }).lean();

  let newNumber = 1;
  if (lastStudent && lastStudent.grNumber) {
    // Extract number part (assuming format GR0001)
    const lastNumber = parseInt(lastStudent.grNumber.replace("GR", ""), 10);
    newNumber = lastNumber + 1;
  }

  // Pad with leading zeros
  return "GR" + String(newNumber).padStart(4, "0");
};

module.exports = generateGRNumber;

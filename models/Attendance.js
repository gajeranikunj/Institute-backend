const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: false
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  status: {
    type: String,
    enum: ['Present', 'Absent'],
    required: true,
    default: 'Absent'
  }
});

module.exports = mongoose.model('Attendance', attendanceSchema);

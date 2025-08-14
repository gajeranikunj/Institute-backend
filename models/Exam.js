const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  examName: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  examDate: {
    type: Date,
    required: true
  },
  totalMarks: {
    type: Number,
    required: true
  },
  obtainedMarks: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number
  },
  grade: {
    type: String
  }
}, { timestamps: true });

examSchema.pre('save', function (next) {
  this.percentage = (this.obtainedMarks / this.totalMarks) * 100;

  if (this.percentage >= 90) this.grade = 'A+';
  else if (this.percentage >= 75) this.grade = 'A';
  else if (this.percentage >= 60) this.grade = 'B';
  else if (this.percentage >= 40) this.grade = 'C';
  else this.grade = 'F';

  next();
});

module.exports = mongoose.model('Exam', examSchema);

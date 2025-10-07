const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  nameofcourse: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true }, // Reference to user
  steps: [
    {
      title: { type: String, required: true },
      date: { type: Date },                     // Optional date
      status: { type: Boolean, default: false } // true = done, false = not done
    }
  ]
}, { timestamps: true });

const course = mongoose.model('Usercourse', courseSchema);
module.exports = course;

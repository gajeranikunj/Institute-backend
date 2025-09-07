const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  nameofcourse: { type: String, required: true }
}, { timestamps: true });

const course = mongoose.model('course', courseSchema);
module.exports = course;

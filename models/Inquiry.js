const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  phone: { type: String, required: true },
  address: String,
  dob: Date,
  courseInterested: String,
  inquiryDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Rejected'],
    default: 'Pending'
  },
  note: String,
  assignedFaculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Inquiry', inquirySchema);

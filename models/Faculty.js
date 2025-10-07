const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const facultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  photo: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  salary: { type: Number, default: 0 },
  totalStudents: { type: Number, default: 0 },
  address: { type: String, required: true },
  expertise: [String],
  experienceYears: { type: Number, default: 0 },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  joiningDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },

  // 🏦 Banking Details
  accountNumber: { type: String, required: false },
  ifscCode: { type: String, required: false },

  // 🪪 Identity Documents
  aadhaarCard: { type: String, required: false }, // store number or file path
  panCard: { type: String, required: false },     // store number or file path
  signature: { type: String, required: false },     // store number or file path
}, {
  timestamps: true
});

// 🔐 Hash password before save
facultySchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

facultySchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Faculty', facultySchema);

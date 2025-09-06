const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  nameofbranch: { type: String, required: true }
}, { timestamps: true });

const branch = mongoose.model('Branch', branchSchema);
module.exports = branch;

const mongoose = require('mongoose');

const BatchTimeSchema = new mongoose.Schema({
  BatchTime: { type: String, required: true }
}, { timestamps: true });

const BatchTime = mongoose.model('BatchTime', BatchTimeSchema);
module.exports = BatchTime;

const mongoose = require('mongoose');

const WhatsApptextSchema = new mongoose.Schema({
  beforename: { type: String },
  aftername: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
}, { timestamps: true });

const WhatsApptext = mongoose.model('WhatsApptext', WhatsApptextSchema);
module.exports = WhatsApptext;

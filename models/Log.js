const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  actionType: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  ip: { type: String },
  meta: { type: mongoose.Schema.Types.Mixed }
});

logSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Log', logSchema);
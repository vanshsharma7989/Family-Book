const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String, default: '' },
    device: { type: String, default: 'Unknown device' },
    success: { type: Boolean, required: true },
  },
  { timestamps: false }
);

module.exports = mongoose.model('LoginHistory', loginHistorySchema);

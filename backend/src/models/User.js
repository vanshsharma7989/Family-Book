const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    passwordResetTokenHash: { type: String, select: false, default: null },
    passwordResetExpires: { type: Date, select: false, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);

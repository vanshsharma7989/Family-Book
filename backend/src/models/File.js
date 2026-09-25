const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    originalName: { type: String, required: true },
    safeName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    category: {
      type: String,
      enum: ['photo', 'document', 'pdf'],
      required: true,
      index: true,
    },
    gridFsFileId: { type: mongoose.Schema.Types.ObjectId, required: true },
    favorite: { type: Boolean, default: false, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

fileSchema.index({ owner: 1, isDeleted: 1, category: 1 });
fileSchema.index({ owner: 1, originalName: 'text' });

module.exports = mongoose.model('File', fileSchema);

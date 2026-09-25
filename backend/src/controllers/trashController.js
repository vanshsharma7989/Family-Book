const File = require('../models/File');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const gridfs = require('../services/gridfs');

const listTrash = asyncHandler(async (req, res) => {
  const files = await File.find({ owner: req.user.id, isDeleted: true }).sort({ deletedAt: -1 });
  res.json({ success: true, message: 'OK', data: { files } });
});

const restoreFile = asyncHandler(async (req, res) => {
  const file = await File.findOne({ _id: req.params.id, owner: req.user.id, isDeleted: true });
  if (!file) throw new ApiError(404, 'File not found in trash');
  file.isDeleted = false;
  file.deletedAt = null;
  await file.save();
  res.json({ success: true, message: 'File restored', data: file });
});

const permanentDelete = asyncHandler(async (req, res) => {
  const file = await File.findOne({ _id: req.params.id, owner: req.user.id, isDeleted: true });
  if (!file) throw new ApiError(404, 'File not found in trash');
  await gridfs.deleteFile(file.gridFsFileId).catch(() => {});
  await file.deleteOne();
  res.json({ success: true, message: 'File permanently deleted', data: {} });
});

const emptyTrash = asyncHandler(async (req, res) => {
  const files = await File.find({ owner: req.user.id, isDeleted: true });
  await Promise.all(files.map((f) => gridfs.deleteFile(f.gridFsFileId).catch(() => {})));
  await File.deleteMany({ owner: req.user.id, isDeleted: true });
  res.json({ success: true, message: 'Trash emptied', data: {} });
});

module.exports = { listTrash, restoreFile, permanentDelete, emptyTrash };

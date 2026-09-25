const multer = require('multer');
const path = require('path');
const config = require('../config/env');
const ApiError = require('../utils/ApiError');

// Never trust the original filename or the client-reported mimetype alone -
// we cross-check extension against an allow-list of safe types.
const ALLOWED_MIME_TO_EXT = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
};

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const allowedExts = ALLOWED_MIME_TO_EXT[file.mimetype];

  if (!allowedExts) {
    return cb(new ApiError(400, `Unsupported file type: ${file.mimetype}`), false);
  }
  if (!allowedExts.includes(ext)) {
    return cb(new ApiError(400, 'File extension does not match its content type'), false);
  }
  return cb(null, true);
}

const upload = multer({
  storage,
  limits: { fileSize: config.maxFileSize, files: 10 },
  fileFilter,
});

module.exports = { upload, ALLOWED_MIME_TO_EXT };

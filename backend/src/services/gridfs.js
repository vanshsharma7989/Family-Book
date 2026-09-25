const { Readable } = require('stream');
const mongoose = require('mongoose');
const { getBucket } = require('../config/db');

// Streams a buffer into GridFS. Returns the created file's ObjectId.
function uploadBuffer(buffer, filename, contentType) {
  return new Promise((resolve, reject) => {
    const bucket = getBucket();
    const readable = Readable.from(buffer);
    const uploadStream = bucket.openUploadStream(filename, { contentType });

    readable
      .pipe(uploadStream)
      .on('error', reject)
      .on('finish', () => resolve(uploadStream.id));
  });
}

// Pipes a GridFS file straight to an HTTP response (streaming, not buffered in RAM)
function streamToResponse(fileId, res) {
  const bucket = getBucket();
  const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
  downloadStream.on('error', () => {
    if (!res.headersSent) {
      res.status(404).json({ success: false, message: 'File content not found' });
    }
  });
  downloadStream.pipe(res);
}

async function deleteFile(fileId) {
  const bucket = getBucket();
  await bucket.delete(new mongoose.Types.ObjectId(fileId));
}

module.exports = { uploadBuffer, streamToResponse, deleteFile };

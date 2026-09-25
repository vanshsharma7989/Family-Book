// const mongoose = require('mongoose');

// const shareSchema = new mongoose.Schema(
//   {
//     // File being shared
//     file: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'File',
//       required: true,
//       index: true,
//     },

//     // Owner who created the share
//     owner: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//       index: true,
//     },

//     // Optional person/email the share is intended for
//     recipientEmail: {
//       type: String,
//       trim: true,
//       lowercase: true,
//       default: null,
//     },

//     // What the recipient is allowed to do
//     permission: {
//       type: String,
//       enum: ['view', 'download'],
//       default: 'view',
//       required: true,
//     },

//     // SHA-256 hash of the private share token
//     shareTokenHash: {
//       type: String,
//       required: true,
//       unique: true,
//       index: true,
//     },

//     // Optional expiry
//     expiresAt: {
//       type: Date,
//       default: null,
//       index: true,
//     },

//     // Owner can revoke the share
//     revoked: {
//       type: Boolean,
//       default: false,
//       index: true,
//     },

//     revokedAt: {
//       type: Date,
//       default: null,
//     },

//     // Basic usage tracking
//     accessCount: {
//       type: Number,
//       default: 0,
//     },

//     lastAccessedAt: {
//       type: Date,
//       default: null,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Useful queries
// shareSchema.index({ owner: 1, file: 1 });
// shareSchema.index({ file: 1, revoked: 1 });
// shareSchema.index({ expiresAt: 1 });

// module.exports = mongoose.model('Share', shareSchema);
const shareFile = async () => {
  setMenuOpen(false);

  try {
    setSharing(true);

    const response = await api.get(
      `/files/${file._id}/download`,
      {
        responseType: 'blob',
      }
    );

    const blob = response.data;

    const sharedFile = new File(
      [blob],
      file.originalName || 'Family-Book-file',
      {
        type:
          blob.type ||
          file.mimeType ||
          'application/octet-stream',
      }
    );

    // Mobile / supported browsers
    if (navigator.share) {
      if (
        navigator.canShare &&
        !navigator.canShare({
          files: [sharedFile],
        })
      ) {
        alert(
          'This device or browser does not support sharing this file.'
        );
        return;
      }

      await navigator.share({
        files: [sharedFile],
        title: file.originalName || 'Family Book file',
      });

      return;
    }

    // Desktop fallback
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download =
      file.originalName || 'Family-Book-file';

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(blobUrl);

    // Open WhatsApp Web
    window.open(
      'https://web.whatsapp.com/',
      '_blank'
    );

    alert(
      'File downloaded. WhatsApp Web has been opened. Attach the downloaded file to your chat.'
    );
  } catch (error) {
    if (error?.name !== 'AbortError') {
      console.error('Share failed:', error);
      alert('Could not share the file.');
    }
  } finally {
    setSharing(false);
  }
};
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');

const File = require('../models/File');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const gridfs = require('../services/gridfs');

function categoryFromMime(mime) {
  if (mime === 'application/pdf') return 'pdf';
  if (mime.startsWith('image/')) return 'photo';
  return 'document';
}

function safeFilename(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const random = crypto.randomBytes(16).toString('hex');
  return `${random}${ext}`;
}

// Finds an owned, non-deleted file.
// Prevents unauthorized access / IDOR.
async function findOwnedFile(id, userId, { includeDeleted = false } = {}) {
  const query = {
    _id: id,
    owner: userId,
  };

  if (!includeDeleted) {
    query.isDeleted = false;
  }

  const file = await File.findOne(query);

  if (!file) {
    throw new ApiError(404, 'File not found');
  }

  return file;
}

// Upload files
const uploadFiles = asyncHandler(async (req, res) => {
  const files = req.files || [];

  if (!files.length) {
    throw new ApiError(400, 'No files provided');
  }

  const requestedCategory = req.body.category;

  const results = [];
  const errors = [];

  for (const f of files) {
    try {
      const detectedCategory = categoryFromMime(f.mimetype);

      const category = ['photo', 'document', 'pdf'].includes(
        requestedCategory
      )
        ? requestedCategory
        : detectedCategory;

      const safeName = safeFilename(f.originalname);

      const gridFsFileId = await gridfs.uploadBuffer(
        f.buffer,
        safeName,
        f.mimetype
      );

      const doc = await File.create({
        owner: req.user.id,
        originalName: f.originalname.slice(0, 255),
        safeName,
        mimeType: f.mimetype,
        size: f.size,
        category,
        gridFsFileId,
      });

      results.push(doc);
    } catch (err) {
      console.error('Upload error:', err);

      errors.push({
        name: f.originalname,
        message: 'Upload failed',
      });
    }
  }

  res.status(errors.length && !results.length ? 400 : 201).json({
    success: results.length > 0,
    message:
      results.length === files.length
        ? 'Files uploaded successfully'
        : `${results.length} of ${files.length} files uploaded`,
    data: {
      uploaded: results,
      failed: errors,
    },
  });
});

// List files
const listFiles = asyncHandler(async (req, res) => {
  const {
    category,
    search,
    sort = 'newest',
    favorite,
    page = 1,
    limit = 60,
  } = req.query;

  const query = {
    owner: req.user.id,
    isDeleted: false,
  };

  if (category && ['photo', 'document', 'pdf'].includes(category)) {
    query.category = category;
  }

  if (favorite === 'true') {
    query.favorite = true;
  }

  if (search && search.trim()) {
    const escapedSearch = search
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    query.originalName = {
      $regex: escapedSearch,
      $options: 'i',
    };
  }

  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    name_asc: { originalName: 1 },
    name_desc: { originalName: -1 },
    size: { size: -1 },
  };

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(
    200,
    Math.max(1, parseInt(limit, 10) || 60)
  );

  const [files, total] = await Promise.all([
    File.find(query)
      .sort(sortMap[sort] || sortMap.newest)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),

    File.countDocuments(query),
  ]);

  res.json({
    success: true,
    message: 'OK',
    data: {
      files,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
    },
  });
});

// Dashboard statistics
const getStats = asyncHandler(async (req, res) => {
  const owner = new mongoose.Types.ObjectId(req.user.id);

  const [totals, storage, recent, favorites] = await Promise.all([
    File.aggregate([
      {
        $match: {
          owner,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: '$category',
          count: {
            $sum: 1,
          },
        },
      },
    ]),

    File.aggregate([
      {
        $match: {
          owner,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: null,
          totalSize: {
            $sum: '$size',
          },
          totalFiles: {
            $sum: 1,
          },
        },
      },
    ]),

    File.find({
      owner: req.user.id,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .limit(8),

    File.countDocuments({
      owner: req.user.id,
      isDeleted: false,
      favorite: true,
    }),
  ]);

  const byCategory = {
    photo: 0,
    document: 0,
    pdf: 0,
  };

  totals.forEach((t) => {
    byCategory[t._id] = t.count;
  });

  res.json({
    success: true,
    message: 'OK',
    data: {
      totalFiles: storage[0]?.totalFiles || 0,
      totalPhotos: byCategory.photo,
      totalDocuments: byCategory.document,
      totalPdfs: byCategory.pdf,
      storageUsed: storage[0]?.totalSize || 0,
      favoritesCount: favorites,
      recentUploads: recent,
    },
  });
});

// Get file metadata
const getFileMeta = asyncHandler(async (req, res) => {
  const file = await findOwnedFile(
    req.params.id,
    req.user.id
  );

  res.json({
    success: true,
    message: 'OK',
    data: file,
  });
});

// Preview file
const previewFile = asyncHandler(async (req, res) => {
  const file = await findOwnedFile(
    req.params.id,
    req.user.id
  );

  res.setHeader('Content-Type', file.mimeType);

  res.setHeader(
    'Content-Disposition',
    `inline; filename="${encodeURIComponent(file.originalName)}"`
  );

  res.setHeader(
    'Cache-Control',
    'private, max-age=0, no-cache'
  );

  res.setHeader(
    'X-Content-Type-Options',
    'nosniff'
  );

  gridfs.streamToResponse(
    file.gridFsFileId,
    res
  );
});

// Download file
const downloadFile = asyncHandler(async (req, res) => {
  const file = await findOwnedFile(
    req.params.id,
    req.user.id
  );

  res.setHeader('Content-Type', file.mimeType);

  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${encodeURIComponent(file.originalName)}"`
  );

  res.setHeader(
    'Content-Length',
    file.size
  );

  res.setHeader(
    'Cache-Control',
    'private, no-store'
  );

  gridfs.streamToResponse(
    file.gridFsFileId,
    res
  );
});

// Rename / update file
const updateFile = asyncHandler(async (req, res) => {
  const file = await findOwnedFile(
    req.params.id,
    req.user.id
  );

  const {
    originalName,
    category,
  } = req.body;

  if (originalName !== undefined) {
    if (!originalName.trim()) {
      throw new ApiError(
        400,
        'File name cannot be empty'
      );
    }

    file.originalName = originalName
      .trim()
      .slice(0, 255);
  }

  if (category !== undefined) {
    if (!['photo', 'document', 'pdf'].includes(category)) {
      throw new ApiError(
        400,
        'Invalid category'
      );
    }

    file.category = category;
  }

  await file.save();

  res.json({
    success: true,
    message: 'File updated',
    data: file,
  });
});

// Move file to Trash
const deleteFile = asyncHandler(async (req, res) => {
  const file = await findOwnedFile(
    req.params.id,
    req.user.id
  );

  file.isDeleted = true;
  file.deletedAt = new Date();

  await file.save();

  res.json({
    success: true,
    message: 'File moved to trash',
    data: {},
  });
});

// Toggle favorite
const toggleFavorite = asyncHandler(async (req, res) => {
  const file = await findOwnedFile(
    req.params.id,
    req.user.id
  );

  file.favorite = !file.favorite;

  await file.save();

  res.json({
    success: true,
    message: 'Favorite updated',
    data: file,
  });
});

// List favorites
const listFavorites = asyncHandler(async (req, res) => {
  const files = await File.find({
    owner: req.user.id,
    isDeleted: false,
    favorite: true,
  }).sort({
    createdAt: -1,
  });

  res.json({
    success: true,
    message: 'OK',
    data: {
      files,
    },
  });
});

module.exports = {
  uploadFiles,
  listFiles,
  getStats,
  getFileMeta,
  previewFile,
  downloadFile,
  updateFile,
  deleteFile,
  toggleFavorite,
  listFavorites,
  findOwnedFile,
};
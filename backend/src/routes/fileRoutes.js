const express = require('express');
const ctrl = require('../controllers/fileController');
const { requireAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.use(requireAuth);

router.get('/stats', ctrl.getStats);
router.post('/upload', upload.array('files', 10), ctrl.uploadFiles);
router.get('/', ctrl.listFiles);
router.get('/:id', ctrl.getFileMeta);
router.get('/:id/preview', ctrl.previewFile);
router.get('/:id/download', ctrl.downloadFile);
router.patch('/:id', ctrl.updateFile);
router.patch('/:id/favorite', ctrl.toggleFavorite);
router.delete('/:id', ctrl.deleteFile);

module.exports = router;

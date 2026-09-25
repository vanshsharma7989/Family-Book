const express = require('express');
const ctrl = require('../controllers/trashController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', ctrl.listTrash);
router.patch('/:id/restore', ctrl.restoreFile);
router.delete('/empty', ctrl.emptyTrash);
router.delete('/:id/permanent', ctrl.permanentDelete);

module.exports = router;

const express = require('express');
const ctrl = require('../controllers/fileController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);
router.get('/', ctrl.listFavorites);

module.exports = router;

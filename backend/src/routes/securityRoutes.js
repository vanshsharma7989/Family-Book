const express = require('express');
const ctrl = require('../controllers/securityController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/sessions', ctrl.listSessions);
router.post('/logout-all', ctrl.logoutAll);
router.get('/login-history', ctrl.loginHistory);
router.post('/change-password', ctrl.changePassword);

module.exports = router;

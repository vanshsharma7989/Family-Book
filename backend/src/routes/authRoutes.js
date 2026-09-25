const express = require('express');
const ctrl = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, ctrl.registerValidators, ctrl.register);
router.post('/login', authLimiter, ctrl.loginValidators, ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout', ctrl.logout);
router.post('/forgot-password', authLimiter, ctrl.forgotPassword);
router.post('/reset-password', authLimiter, ctrl.resetPassword);
router.get('/me', requireAuth, ctrl.me);

module.exports = router;

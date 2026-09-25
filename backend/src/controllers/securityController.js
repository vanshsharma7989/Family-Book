const bcrypt = require('bcryptjs');
const Session = require('../models/Session');
const LoginHistory = require('../models/LoginHistory');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const listSessions = asyncHandler(async (req, res) => {
  const sessions = await Session.find({
    userId: req.user.id,
    revoked: false,
    expiresAt: { $gt: new Date() },
  })
    .select('-refreshTokenHash')
    .sort({ createdAt: -1 });
  res.json({ success: true, message: 'OK', data: { sessions } });
});

const logoutAll = asyncHandler(async (req, res) => {
  await Session.updateMany({ userId: req.user.id }, { revoked: true });
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out from all devices', data: {} });
});

const loginHistory = asyncHandler(async (req, res) => {
  const history = await LoginHistory.find({ userId: req.user.id })
    .sort({ timestamp: -1 })
    .limit(50);
  res.json({ success: true, message: 'OK', data: { history } });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Current and new password are required');
  }
  if (newPassword.length < 8) {
    throw new ApiError(400, 'New password must be at least 8 characters');
  }

  const user = await User.findById(req.user.id).select('+passwordHash');
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new ApiError(401, 'Current password is incorrect');

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();

  // Revoke all other sessions on password change
  await Session.updateMany({ userId: req.user.id }, { revoked: true });

  res.json({ success: true, message: 'Password changed. Please log in again.', data: {} });
});

module.exports = { listSessions, logoutAll, loginHistory, changePassword };

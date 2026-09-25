const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/env');

function signAccessToken(userId) {
  return jwt.sign({ sub: userId }, config.jwtAccessSecret, {
    expiresIn: config.jwtAccessExpiresIn,
  });
}

function signRefreshToken(userId, sessionId) {
  return jwt.sign({ sub: userId, sid: sessionId }, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, config.jwtAccessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwtRefreshSecret);
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function refreshExpiryDate() {
  // Mirrors JWT_REFRESH_EXPIRES_IN roughly (defaults to 30 days) for the Session document TTL
  const raw = config.jwtRefreshExpiresIn;
  const match = /^(\d+)([smhd])$/.exec(raw);
  let ms = 30 * 24 * 60 * 60 * 1000;
  if (match) {
    const n = parseInt(match[1], 10);
    const unit = match[2];
    const unitMs = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[unit];
    ms = n * unitMs;
  }
  return new Date(Date.now() + ms);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  refreshExpiryDate,
};

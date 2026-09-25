const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyAccessToken } = require('../utils/tokens');
const User = require('../models/User');

// Requires a valid access token (cookie or Authorization header). Attaches req.user.
const requireAuth = asyncHandler(async (req, res, next) => {
  const tokenFromCookie = req.cookies?.accessToken;
  const authHeader = req.headers.authorization;
  const tokenFromHeader =
    authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  const token = tokenFromCookie || tokenFromHeader;

  if (!token) {
    throw new ApiError(401, 'Authentication required');
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired session. Please log in again.');
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    throw new ApiError(401, 'Account no longer exists');
  }

  req.user = { id: user._id.toString(), email: user.email, name: user.name };
  next();
});

module.exports = { requireAuth };

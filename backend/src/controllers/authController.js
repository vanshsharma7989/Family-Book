const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');

const User = require('../models/User');
const Session = require('../models/Session');
const LoginHistory = require('../models/LoginHistory');

const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  refreshExpiryDate,
} = require('../utils/tokens');

const config = require('../config/env');


// ==========================================
// AUTH COOKIE SETTINGS
// ==========================================

const COOKIE_BASE = {
  httpOnly: true,
  secure: config.cookieSecure,
  sameSite: 'lax',
  path: '/',
};


// ==========================================
// SET AUTH COOKIES
// ==========================================

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie('accessToken', accessToken, {
    ...COOKIE_BASE,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    ...COOKIE_BASE,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}


// ==========================================
// CLEAR AUTH COOKIES
// ==========================================

function clearAuthCookies(res) {
  res.clearCookie('accessToken', COOKIE_BASE);
  res.clearCookie('refreshToken', COOKIE_BASE);
}


// ==========================================
// DEVICE LABEL
// ==========================================

function deviceLabel(req) {
  const ua = req.headers['user-agent'] || 'Unknown device';

  return ua.length > 180
    ? ua.slice(0, 180)
    : ua;
}


// ==========================================
// REGISTER VALIDATION
// ==========================================

const registerValidators = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name is required'),

  body('email')
    .trim()
    .isEmail()
    .withMessage('A valid email is required')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[0-9]/)
    .withMessage('Password must contain a number'),
];


// ==========================================
// LOGIN VALIDATION
// ==========================================

const loginValidators = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('A valid email is required')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];


// ==========================================
// CHECK VALIDATION
// ==========================================

function checkValidation(req) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new ApiError(
      400,
      errors.array()[0].msg
    );
  }
}


// ==========================================
// REGISTER
// ==========================================

const register = asyncHandler(async (req, res) => {
  checkValidation(req);

  const {
    name,
    email,
    password,
  } = req.body;

  const existing = await User.findOne({ email });

  if (existing) {
    throw new ApiError(
      409,
      'An account with this email already exists'
    );
  }

  const passwordHash = await bcrypt.hash(
    password,
    12
  );

  const user = await User.create({
    name,
    email,
    passwordHash,
  });

  res.status(201).json({
    success: true,
    message: 'Account created. Please log in.',
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});


// ==========================================
// LOGIN
// ==========================================

const login = asyncHandler(async (req, res) => {
  checkValidation(req);

  const {
    email,
    password,
  } = req.body;

  const user = await User.findOne({
    email,
  }).select('+passwordHash');

  const ip = req.ip;
  const device = deviceLabel(req);

  const genericError = 'Invalid email or password';

  if (!user) {
    throw new ApiError(
      401,
      genericError
    );
  }

  const valid = await bcrypt.compare(
    password,
    user.passwordHash
  );

  await LoginHistory.create({
    userId: user._id,
    ipAddress: ip,
    device,
    success: !!valid,
  });

  if (!valid) {
    throw new ApiError(
      401,
      genericError
    );
  }

  const session = await Session.create({
    userId: user._id,
    refreshTokenHash: 'pending',
    device,
    ipAddress: ip,
    expiresAt: refreshExpiryDate(),
  });

  const accessToken = signAccessToken(
    user._id.toString()
  );

  const refreshToken = signRefreshToken(
    user._id.toString(),
    session._id.toString()
  );

  session.refreshTokenHash =
    hashToken(refreshToken);

  await session.save();

  setAuthCookies(
    res,
    accessToken,
    refreshToken
  );

  res.json({
    success: true,
    message: 'Logged in successfully',
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});


// ==========================================
// REFRESH TOKEN
// ==========================================

const refresh = asyncHandler(async (req, res) => {
  const token =
    req.cookies?.refreshToken;

  if (!token) {
    throw new ApiError(
      401,
      'No refresh token provided'
    );
  }

  let payload;

  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new ApiError(
      401,
      'Session expired. Please log in again.'
    );
  }

  const session =
    await Session.findById(payload.sid);

  if (
    !session ||
    session.revoked ||
    session.refreshTokenHash !==
      hashToken(token)
  ) {
    throw new ApiError(
      401,
      'Session expired. Please log in again.'
    );
  }

  const accessToken =
    signAccessToken(payload.sub);

  res.cookie(
    'accessToken',
    accessToken,
    {
      ...COOKIE_BASE,
      maxAge: 15 * 60 * 1000,
    }
  );

  res.json({
    success: true,
    message: 'Token refreshed',
    data: {},
  });
});


// ==========================================
// LOGOUT
// ==========================================

const logout = asyncHandler(async (req, res) => {
  const token =
    req.cookies?.refreshToken;

  if (token) {
    try {
      const payload =
        verifyRefreshToken(token);

      await Session.findByIdAndUpdate(
        payload.sid,
        {
          revoked: true,
        }
      );
    } catch {
      // Token already invalid
    }
  }

  clearAuthCookies(res);

  res.json({
    success: true,
    message: 'Logged out successfully',
    data: {},
  });
});


// ==========================================
// CURRENT USER
// ==========================================

const me = asyncHandler(async (req, res) => {
  const user =
    await User.findById(req.user.id);

  if (!user) {
    throw new ApiError(
      404,
      'User not found'
    );
  }

  res.json({
    success: true,
    message: 'OK',
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});


// ==========================================
// FORGOT PASSWORD
// ==========================================

const forgotPassword = asyncHandler(
  async (req, res) => {
    const { email } = req.body;

    const genericMessage =
      'If an account with that email exists, a password reset link has been sent.';

    if (!email) {
      throw new ApiError(
        400,
        'Email is required'
      );
    }

    const user =
      await User.findOne({
        email: email
          .toLowerCase()
          .trim(),
      });

    if (user) {
      const rawToken =
        crypto.randomBytes(32).toString('hex');

      user.passwordResetTokenHash =
        hashToken(rawToken);

      user.passwordResetExpires =
        new Date(
          Date.now() +
          60 * 60 * 1000
        );

      await user.save();

      // Development only.
      // In production this token should be
      // sent through an email service.
      if (
        config.nodeEnv !==
        'production'
      ) {
        console.log(
          `[DEV ONLY] Password reset token for ${email}: ${rawToken}`
        );
      }
    }

    res.json({
      success: true,
      message: genericMessage,
      data: {},
    });
  }
);


// ==========================================
// RESET PASSWORD
// ==========================================

const resetPassword = asyncHandler(
  async (req, res) => {
    const {
      token,
      password,
    } = req.body;

    if (!token || !password) {
      throw new ApiError(
        400,
        'Token and new password are required'
      );
    }

    if (password.length < 8) {
      throw new ApiError(
        400,
        'Password must be at least 8 characters'
      );
    }

    const tokenHash =
      hashToken(token);

    const user =
      await User.findOne({
        passwordResetTokenHash:
          tokenHash,

        passwordResetExpires: {
          $gt: new Date(),
        },
      }).select(
        '+passwordResetTokenHash +passwordResetExpires'
      );

    if (!user) {
      throw new ApiError(
        400,
        'Reset link is invalid or has expired'
      );
    }

    user.passwordHash =
      await bcrypt.hash(
        password,
        12
      );

    // Token can be used only once
    user.passwordResetTokenHash = null;
    user.passwordResetExpires = null;

    await user.save();

    // Log out from all devices
    await Session.updateMany(
      {
        userId: user._id,
      },
      {
        revoked: true,
      }
    );

    res.json({
      success: true,
      message:
        'Password has been reset. Please log in.',
      data: {},
    });
  }
);


// ==========================================
// EXPORT
// ==========================================

module.exports = {
  registerValidators,
  loginValidators,
  register,
  login,
  refresh,
  logout,
  me,
  forgotPassword,
  resetPassword,
};
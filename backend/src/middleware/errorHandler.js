const config = require('../config/env');

// Central error handler - never leaks stack traces, secrets, or internal details
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;

  if (config.nodeEnv !== 'test') {
    // Log full detail server-side only
    console.error(`[ERROR] ${req.method} ${req.originalUrl} ->`, err.message);
    if (config.nodeEnv === 'development' && !err.isOperational) {
      console.error(err.stack);
    }
  }

  const message =
    err.isOperational || statusCode < 500
      ? err.message
      : 'Something went wrong. Please try again later.';

  res.status(statusCode).json({
    success: false,
    message,
  });
}

function notFound(req, res) {
  res.status(404).json({ success: false, message: 'Route not found' });
}

module.exports = { errorHandler, notFound };

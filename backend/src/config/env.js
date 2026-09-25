require('dotenv').config();

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || '',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || '',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || '',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim()),
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '26214400', 10),
  cookieSecure: process.env.COOKIE_SECURE === 'true',
};

if (config.nodeEnv !== 'test') {
  if (!config.mongoUri) {
    console.warn('[WARN] MONGODB_URI is not set. Set it in backend/.env before starting the server.');
  }
  if (!config.jwtAccessSecret || !config.jwtRefreshSecret) {
    console.warn('[WARN] JWT secrets are not set. Set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in backend/.env.');
  }
}

module.exports = config;

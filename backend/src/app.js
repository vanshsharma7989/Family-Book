const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');

const config = require('./config/env');

const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const trashRoutes = require('./routes/trashRoutes');
const securityRoutes = require('./routes/securityRoutes');

const app = express();

app.set('trust proxy', 1);

// -----------------------------
// CORS
// -----------------------------

const allowedOrigins = [
  'http://localhost:5173',
  'https://family-book-eosin.vercel.app',
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without an Origin header
    // and requests from our allowed frontend origins.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },

  credentials: true,

  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
  ],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
  ],

  optionsSuccessStatus: 204,
};

// Handle CORS for all requests
app.use(cors(corsOptions));

// -----------------------------
// Security headers
// -----------------------------

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  })
);

app.use(compression());

// -----------------------------
// Body parsers
// -----------------------------

app.use(express.json({ limit: '1mb' }));

app.use(
  express.urlencoded({
    extended: true,
    limit: '1mb',
  })
);

app.use(cookieParser());

// -----------------------------
// Prevent NoSQL injection
// -----------------------------

app.use(mongoSanitize());

// -----------------------------
// API rate limiting
// -----------------------------

app.use('/api', apiLimiter);

// -----------------------------
// Health check
// -----------------------------

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Family Book API is running',
    data: {},
  });
});

// -----------------------------
// Routes
// -----------------------------

app.use('/api/auth', authRoutes);

app.use('/api/files', fileRoutes);

app.use('/api/favorites', favoriteRoutes);

app.use('/api/trash', trashRoutes);

app.use('/api/security', securityRoutes);

// -----------------------------
// 404 handler
// -----------------------------

app.use(notFound);

// -----------------------------
// Global error handler
// -----------------------------

app.use(errorHandler);

module.exports = app;
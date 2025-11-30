// =======================
// MyTutor Backend Server
// =======================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
require('dotenv').config();

 // Log environment status (for debugging)
console.log('Environment check - JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('Environment check - MONGO_URI:', process.env.MONGO_URI ? 'SET' : 'NOT SET');
console.log('Environment check - DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

// Import routes
const userRoutes = require('./routes/userRoutes');
const tutorRoutes = require('./routes/tutorRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
 
const app = express();
const PORT = process.env.PORT || 5000;

// =======================
// Environment Variables Check
// =======================
console.log('🔧 Checking environment variables...');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ SET' : '❌ NOT SET');
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ SET' : '❌ NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

// =======================
// Database Connection
// =======================
connectDB();

// =======================
// Security Middleware
// =======================
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// =======================
// CORS Configuration
// =======================
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URLS && process.env.FRONTEND_URLS.split(',').map(s => s.trim()),
  'https://mytutor-hub.onrender.com',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:8081',
  'http://127.0.0.1:8081'
].flat().filter(Boolean);

// Regex patterns for localhost origins
const localhostPatterns = [
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/
];

// More permissive CORS for development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // In development, allow ALL origins for easier testing
    if (process.env.NODE_ENV !== 'production') {
      console.log('Development mode: Allowing origin:', origin);
      return callback(null, true);
    }

    // In production, check against allowed origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Check regex patterns for localhost
    if (localhostPatterns.some(pattern => pattern.test(origin))) {
      return callback(null, true);
    }

    console.log('CORS blocked origin:', origin);
    console.log('Allowed origins:', allowedOrigins);
    return callback(new Error('CORS not allowed from origin: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors());

// =======================
// Request Logging Middleware
// =======================
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Body:`, JSON.stringify(req.body));
  next();
});

// =======================
// Body Parser
// =======================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =======================
// Health Check Route
// =======================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'MyTutor API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// =======================
// API Routes
// =======================
app.use('/api/users', userRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/payments', paymentRoutes);

// =======================
// 404 Handler
// =======================
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// =======================
// Global Error Handler
// =======================
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// =======================
// Run Locally (Only in Dev)
// =======================
// =======================
// Server Start (Required for Render)
// =======================


app.listen(PORT, () => {
  console.log(`🚀 MyTutor API server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});





}

// =======================
// Export App for Vercel
// =======================
module.exports = app;

// =======================
// Graceful Shutdown
// =======================
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// =======================
// MyTutor Backend Server
// =======================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
require('dotenv').config();

// Log environment status
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

// 🔧 FIX: Helmet must allow cross origin in production
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
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
  'https://mytutor-hub.vercel.app',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].flat().filter(Boolean);

const localhostPatterns = [
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (process.env.NODE_ENV !== 'production') {
      console.log('Dev CORS allowed:', origin);
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (localhostPatterns.some(pattern => pattern.test(origin))) {
      return callback(null, true);
    }

    console.log('❌ CORS Blocked:', origin);
    
    // 🔧 FIX: DO NOT THROW ERROR → instead block safely
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// 🔧 FIX: Allow preflight requests without crashing
app.options('*', cors());

// =======================
// Request Logging
// =======================
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
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
    timestamp: new Date().toISOString()
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

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// =======================
// Server Start (Render only needs this)
// =======================

app.listen(PORT, () => {
  console.log(`🚀 MyTutor API running on port ${PORT}`);
});

// =======================
// 🔧 FIX: REMOVE module.exports = app;
// =======================
// ❌ REMOVE THIS LINE COMPLETELY
// module.exports = app;

// =======================
// Graceful Shutdown
// =======================
process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));

// =======================
// MyTutor Backend Server
// =======================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
require('dotenv').config();

// Import routes
const userRoutes = require('./routes/userRoutes');
const tutorRoutes = require('./routes/tutorRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// =======================
// Database Connection
// =======================
connectDB();

// =======================
// Security Middleware
// =======================
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// Rate Limit
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
  })
);

// =======================
// CORS SETUP (FINAL)
// =======================

const allowedOrigins = [
  process.env.FRONTEND_URL, // Must be set in Render
  "https://frontend-ochre-two-71.vercel.app", // Your Vercel frontend
  "https://mytutor-hub.vercel.app",
  "https://mytutor-hub.onrender.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      console.log("CORS Allowed:", origin);
      return callback(null, true);
    }

    console.log("❌ CORS Blocked:", origin);
    return callback(null, false); // DO NOT THROW ERROR
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));

// ❗ VERY IMPORTANT: DO NOT override CORS with app.options('*', cors())
// REMOVE app.options('*', cors()) — it breaks POST /login

// =======================
// Body Parser
// =======================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// =======================
// Logging
// =======================
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// =======================
// Health Check
// =======================
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "MyTutor API is running",
    timestamp: new Date().toISOString()
  });
});

// =======================
// Routes
// =======================
app.use("/api/users", userRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/payments", paymentRoutes);

// =======================
// 404 Handler
// =======================
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found"
  });
});

// =======================
// Global Error Handler
// =======================
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

// =======================
// Start Server
// =======================
app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`);
});

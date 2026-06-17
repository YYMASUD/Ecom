var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var mongoose = require("mongoose");
require("dotenv").config();

var mainRouter = require("./routes/main");
var userRouter = require("./routes/user");
var adminRouter = require("./routes/admin");
var sellerRouter = require("./routes/seller");
var cartRouter = require("./routes/cart");
var orderRouter = require("./routes/order");

var app = express();

// NOTE: MongoDB connection is established in bin/www before this file loads.
// Set base dir
global.__basedir = __dirname;

// CORS — allow frontend origins (supports both desktop + mobile browsers)
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:8000',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:8000',
  'http://127.0.0.1:5173',
];

var corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Allow any Vercel deployment URL (*.vercel.app)
    if (origin && origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Serve uploaded static files
const publicDir = process.env.PUBLIC_DIR || path.join(__dirname, 'public');
app.use('/uploads', express.static(path.join(publicDir, 'uploads')));

// DB connection guard — only applies to API routes, not static files
const API_PREFIXES = ['/main', '/user', '/cart', '/order', '/seller', '/admin'];
app.use(function checkDB(req, res, next) {
  // Always allow health check, preflight, and non-API routes (static files, SPA)
  if (req.path === '/health' || req.method === 'OPTIONS') return next();
  if (!API_PREFIXES.some(p => req.path.startsWith(p))) return next();
  // readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database is not connected. Please try again shortly.',
    });
  }
  next();
});

app.use("/main", mainRouter);
app.use("/user", userRouter);
app.use("/cart", cartRouter);
app.use("/order", orderRouter);
app.use("/seller", sellerRouter);
app.use("/admin", adminRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.json({
    success: false,
    message: err.message,
    error: req.app.get("env") === "development" ? err : {},
  });
});

module.exports = app;

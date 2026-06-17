/**
 * api/index.js — Vercel Serverless Function
 *
 * Wraps the Express app for Vercel deployment.
 * Caches the MongoDB connection across warm invocations.
 *
 * Required environment variables in Vercel dashboard:
 *   MONGODB_URI  — MongoDB Atlas connection string
 *   JWT_SECRET   — Secret key for JWT signing
 *   NODE_ENV     — Set to "production"
 */

const mongoose = require("mongoose");

// Load env vars (Vercel injects them automatically; dotenv is a no-op fallback)
require("dotenv").config();

const app = require("../backend/app");

// Cache connection across warm Lambda invocations
let isConnected = false;

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Add it in the Vercel project environment variables."
    );
  }

  await mongoose.connect(uri, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000,
  });

  isConnected = true;
  console.log("✅ MongoDB connected (serverless)");
}

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error("DB connection error:", err.message);
    return res.status(503).json({
      success: false,
      message: "Database unavailable. Please try again shortly.",
      detail: process.env.NODE_ENV !== "production" ? err.message : undefined,
    });
  }

  return app(req, res);
};
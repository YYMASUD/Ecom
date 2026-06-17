/**
 * api/index.js — Vercel Serverless Function
 *
 * Wraps the Express app for Vercel deployment.
 * - Caches the MongoDB connection across warm invocations
 * - Auto-seeds 50 demo products on first deploy (when DB is empty)
 *
 * Required environment variables in Vercel dashboard:
 *   MONGODB_URI  — MongoDB Atlas connection string
 *   JWT_SECRET   — Secret key for JWT signing
 *   NODE_ENV     — Set to "production"
 */

const mongoose = require("mongoose");
require("dotenv").config();

const app = require("../backend/app");

// Cache state across warm Lambda invocations
let isConnected = false;
let isSeeded    = false;

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

async function seedIfEmpty() {
  if (isSeeded) return; // already checked this invocation cycle

  try {
    // Dynamically require the Product model (already registered by app.js imports)
    const { Product } = require("../backend/models/product");
    const count = await Product.countDocuments();

    if (count === 0) {
      console.log("🌱 Database empty — seeding demo data...");
      const { run } = require("../backend/scripts/seedDemo");
      // Pass the URI so the seed function reuses the existing connection
      await run(process.env.MONGODB_URI);
      console.log("✅ Demo data seeded (50 products, 10 categories, 5 shops, 3 users)");
    }

    isSeeded = true;
  } catch (err) {
    // Non-fatal — app still works, just without demo data
    console.warn("⚠️  Auto-seed skipped:", err.message);
  }
}

module.exports = async (req, res) => {
  // 1. Ensure DB connection
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

  // 2. Auto-seed demo data if DB is empty
  await seedIfEmpty();

  // 3. Handle the request
  return app(req, res);
};
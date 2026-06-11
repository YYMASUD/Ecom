/**
 * server.js — Application entry point
 *
 * 1. Load environment variables
 * 2. Connect to MongoDB (in-memory if MONGODB_URI is not set)
 * 3. Auto-seed demo data (in-memory mode only)
 * 4. Start the HTTP server
 *
 * Usage:
 *   node server.js
 *   npm start
 */

require("dotenv").config();

const http     = require("http");
const mongoose = require("mongoose");
const app      = require("./app");

const PORT = process.env.PORT || 3000;

(async () => {
  const MONGO_URI = process.env.MONGODB_URI;
  let mongoUri;

  if (!MONGO_URI) {
    // ── Demo mode: no external DB needed ─────────────────
    console.log("🧪 Starting in-memory MongoDB (demo mode)...");
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const mongod = await MongoMemoryServer.create();
    mongoUri = mongod.getUri();
    console.log("✅ In-memory MongoDB started →", mongoUri);
  } else {
    mongoUri = MONGO_URI;
    console.log("🔗 Connecting to external MongoDB...");
  }

  // ── Connect Mongoose ──────────────────────────────────
  await mongoose.connect(mongoUri);
  console.log("✅ MongoDB connected");

  // ── Auto-seed demo data (in-memory mode only) ─────────
  if (!MONGO_URI) {
    console.log("🌱 Seeding demo data...");
    try {
      const { run } = require("./scripts/seedDemo");
      await run(mongoUri);
    } catch (err) {
      console.warn("⚠️  Seed failed:", err.message);
    }
  }

  // ── Start HTTP server ─────────────────────────────────
  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}  [${process.env.NODE_ENV || "development"}]`);
    console.log(`   Frontend:  http://localhost:8000\n`);
  });

  server.on("error", (err) => {
    console.error("Server error:", err.message);
    process.exit(1);
  });
})();

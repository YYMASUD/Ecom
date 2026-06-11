/**
 * server.js — Application entry point
 *
 * Local dev:  No MONGODB_URI → uses in-memory MongoDB + auto-seeds 50 products
 * Production: Set MONGODB_URI env var (MongoDB Atlas) → connects directly
 *
 * Usage:
 *   node server.js
 *   npm start
 */

require("dotenv").config();

const http     = require("http");
const mongoose = require("mongoose");
const app      = require("./app");

const PORT       = process.env.PORT || 3000;
const MONGO_URI  = process.env.MONGODB_URI;
const IS_PROD    = process.env.NODE_ENV === "production";

(async () => {
  let mongoUri;

  if (!MONGO_URI) {
    if (IS_PROD) {
      console.error("❌ MONGODB_URI is required in production. Set it in Railway environment variables.");
      process.exit(1);
    }

    // ── Local dev: spin up in-memory MongoDB ─────────────
    console.log("🧪 Starting in-memory MongoDB (demo mode)...");
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const mongod = await MongoMemoryServer.create();
    mongoUri = mongod.getUri();
    console.log("✅ In-memory MongoDB started →", mongoUri);
  } else {
    mongoUri = MONGO_URI;
    console.log("🔗 Connecting to MongoDB Atlas...");
  }

  // ── Connect Mongoose ──────────────────────────────────
  await mongoose.connect(mongoUri);
  console.log("✅ MongoDB connected");

  // ── Auto-seed demo data (local/in-memory only) ────────
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
    if (!IS_PROD) console.log(`   Frontend:  http://localhost:8000\n`);
  });

  server.on("error", (err) => {
    console.error("Server error:", err.message);
    process.exit(1);
  });
})();

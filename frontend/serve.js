/**
 * serve.js — Production static server for the Vue 3 SPA
 * Serves the Vite build output (dist/) on Railway.
 *
 * Usage: node serve.js
 */
const express = require("express");
const path    = require("path");

const app  = express();
const PORT = process.env.PORT || 8000;
const DIST = path.join(__dirname, "dist");

// Serve built assets (JS bundles, CSS, images, fonts)
app.use(express.static(DIST, { maxAge: "1y", immutable: true }));

// SPA catch-all — let Vue Router handle every URL
app.get("*", (_req, res) => {
  res.sendFile(path.join(DIST, "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Frontend served on http://localhost:${PORT}`);
});

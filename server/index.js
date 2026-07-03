const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

const dataPath = path.join(__dirname, "data.json");

// Open, read-only reference data — no auth, no accounts, nothing to log in to.
app.get("/api/topics", (req, res) => {
  fs.readFile(dataPath, "utf8", (err, raw) => {
    if (err) {
      res.status(500).json({ error: "Could not load cheatsheet data" });
      return;
    }
    res.type("application/json").send(raw);
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Serve the React frontend
app.use(express.static(path.join(__dirname, "..", "public")));

// Any other route falls back to the single-page app
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`JS Cheatsheet running at http://localhost:${PORT}`);
});

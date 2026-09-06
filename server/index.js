const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

const sectionsPath = path.join(__dirname, "sections.json");
const jsDataPath = path.join(__dirname, "data.json");
const numpyDataPath = path.join(__dirname, "numpy.json");

function getSectionDataPath(sectionId) {
  if (sectionId === "numpy") return numpyDataPath;
  return jsDataPath;
}

// Get list of all available cheatsheet sections
app.get("/api/sections", (req, res) => {
  fs.readFile(sectionsPath, "utf8", (err, raw) => {
    if (err) {
      res.status(500).json({ error: "Could not load sections metadata" });
      return;
    }
    res.type("application/json").send(raw);
  });
});

// Open, read-only reference data — supports ?section=numpy or defaults to javascript
app.get("/api/topics", (req, res) => {
  const section = req.query.section || req.query.lang || "javascript";
  const targetPath = getSectionDataPath(section.toLowerCase());

  fs.readFile(targetPath, "utf8", (err, raw) => {
    if (err) {
      res.status(500).json({ error: `Could not load cheatsheet data for ${section}` });
      return;
    }
    res.type("application/json").send(raw);
  });
});

// Dynamic endpoint by section name (e.g. /api/topics/javascript or /api/topics/numpy)
app.get("/api/topics/:section", (req, res) => {
  const section = req.params.section;
  const targetPath = getSectionDataPath(section.toLowerCase());

  fs.readFile(targetPath, "utf8", (err, raw) => {
    if (err) {
      res.status(500).json({ error: `Could not load cheatsheet data for ${section}` });
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
  console.log(`Cheatsheet server running at http://localhost:${PORT}`);
});

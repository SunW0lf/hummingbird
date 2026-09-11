// Minimal, zero-dependency smoke test for the Phase 1 static site.
// Verifies every linked page exists and every internal link resolves to a real file.
// Intentionally avoids adding a test framework dependency for a project this size.

const fs = require("fs");
const path = require("path");

const APP_DIR = path.join(__dirname, "..", "app");
const REQUIRED_PAGES = [
  "index.html",
  "mission.html",
  "charter.html",
  "how-it-works.html",
  "transparency.html",
  "changelog.html",
  "security.html",
  "style.css",
];

let failures = 0;

function fail(message) {
  failures += 1;
  console.error(`FAIL: ${message}`);
}

function pass(message) {
  console.log(`PASS: ${message}`);
}

// 1. All required pages exist.
for (const page of REQUIRED_PAGES) {
  const fullPath = path.join(APP_DIR, page);
  if (fs.existsSync(fullPath)) {
    pass(`${page} exists`);
  } else {
    fail(`${page} is missing from app/`);
  }
}

// 2. Every internal href in every HTML page resolves to a file in app/.
const hrefPattern = /href="([^"]+\.html)"/g;

for (const page of REQUIRED_PAGES.filter((p) => p.endsWith(".html"))) {
  const fullPath = path.join(APP_DIR, page);
  if (!fs.existsSync(fullPath)) continue;
  const content = fs.readFileSync(fullPath, "utf8");
  let match;
  while ((match = hrefPattern.exec(content)) !== null) {
    const target = path.join(APP_DIR, match[1]);
    if (!fs.existsSync(target)) {
      fail(`${page} links to missing file ${match[1]}`);
    }
  }
}

if (failures > 0) {
  console.error(`\n${failures} test(s) failed.`);
  process.exit(1);
} else {
  console.log("\nAll site smoke tests passed.");
  process.exit(0);
}

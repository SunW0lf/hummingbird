// Minimal, zero-dependency smoke test for the built static site.
// Verifies every expected page/asset exists in dist/ (the actual deployable
// output - canonical document pages and the support page are generated at
// build time, so this checks dist/, not app/) and every internal link
// resolves to a real file.
// Intentionally avoids adding a test framework dependency for a project this size.

const fs = require("fs");
const path = require("path");

const APP_DIR = path.join(__dirname, "..", "dist");
const REQUIRED_PAGES = [
  "index.html",
  "mission.html",
  "charter.html",
  "governance.html",
  "roadmap.html",
  "how-it-works.html",
  "transparency.html",
  "changelog.html",
  "contributing.html",
  "open-questions.html",
  "security.html",
  "support.html",
  "style.css",
  "llms.txt",
];

const REQUIRED_RAW_DOCS = [
  "docs/raw/MISSION.md",
  "docs/raw/CHARTER.md",
  "docs/raw/GOVERNANCE.md",
  "docs/raw/ROADMAP.md",
  "docs/raw/TRANSPARENCY.md",
  "docs/raw/CHANGELOG.md",
  "docs/raw/CONTRIBUTING.md",
  "docs/raw/LICENSE",
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

// 2. Every raw canonical document was copied into dist/docs/raw/.
for (const doc of REQUIRED_RAW_DOCS) {
  const fullPath = path.join(APP_DIR, doc);
  if (fs.existsSync(fullPath)) {
    pass(`${doc} exists`);
  } else {
    fail(`${doc} is missing from dist/`);
  }
}

// 3. Every internal href in every HTML page resolves to a file in dist/.
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

// Lightweight, zero-dependency documentation consistency checks.
// Intentionally avoids a test framework dependency for a project this size,
// matching tests/site.test.js.
//
// Checks:
//  1. Every OQ-* reference in the repo resolves to an ID actually defined
//     in docs/governance/OPEN_QUESTIONS.md (catches typos/dangling IDs).
//  2. No inline "OPEN QUESTION:" markers remain outside the registry itself
//     (they should be cross-references to a registry ID instead).
//  3. No known stale deployment-status phrases remain (drift from a prior
//     "not yet cut over" state that has since become true).
//  4. Nothing except app/_redirects still links to the old charter-candidate
//     path now that /charter is canonical.
//  5. Phase 0 is not described as "in progress" or "planned" anywhere.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

let failures = 0;

function fail(message) {
  failures += 1;
  console.error(`FAIL: ${message}`);
}

function pass(message) {
  console.log(`PASS: ${message}`);
}

function walk(dir, matches, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", "node_modules", "dist"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, matches, out);
    } else if (matches(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const docFiles = walk(ROOT, (name) => name.endsWith(".md") || name === "LICENSE");
const DIST_DIR = path.join(ROOT, "dist");
if (!fs.existsSync(DIST_DIR)) {
  console.error("error: dist/ does not exist. Run ./scripts/build before this check.");
  process.exit(1);
}
const htmlFiles = walk(DIST_DIR, (name) => name.endsWith(".html"));

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, "/");
}

// 1. Every OQ-* reference must resolve to a defined registry ID.
const registryPath = path.join(ROOT, "docs", "governance", "OPEN_QUESTIONS.md");
const registryContent = fs.readFileSync(registryPath, "utf8");
const definedIds = new Set();
const headingPattern = /^### (OQ-[A-Z0-9-]+)$/gm;
let headingMatch;
while ((headingMatch = headingPattern.exec(registryContent)) !== null) {
  definedIds.add(headingMatch[1]);
}

if (definedIds.size === 0) {
  fail("No OQ-* headings found in docs/governance/OPEN_QUESTIONS.md");
} else {
  pass(`Registry defines ${definedIds.size} open question IDs`);
}

const refPattern = /OQ-[A-Z0-9-]+/g;
let danglingRefs = 0;
for (const file of docFiles) {
  const content = fs.readFileSync(file, "utf8");
  const refs = content.match(refPattern) || [];
  for (const ref of refs) {
    if (!definedIds.has(ref)) {
      fail(`${rel(file)} references ${ref}, which is not defined in docs/governance/OPEN_QUESTIONS.md`);
      danglingRefs += 1;
    }
  }
}
if (danglingRefs === 0) {
  pass("All OQ-* references resolve to a defined registry ID");
}

// 2. No inline "OPEN QUESTION:" markers should remain (they should be
// cross-references to a registry ID).
for (const file of docFiles) {
  const content = fs.readFileSync(file, "utf8");
  if (/OPEN QUESTION:/.test(content)) {
    fail(`${rel(file)} contains an inline "OPEN QUESTION:" marker instead of a registry cross-reference`);
  }
}
pass("No inline OPEN QUESTION: markers remain outside the registry");

// 3. No known stale deployment-status phrases.
const STALE_PHRASES = [
  "still serves its prior placeholder",
  "once cutover happens",
  "production cutover to Hummingbird has not yet occurred",
];
for (const file of [...docFiles, ...htmlFiles]) {
  const content = fs.readFileSync(file, "utf8");
  for (const phrase of STALE_PHRASES) {
    if (content.includes(phrase)) {
      fail(`${rel(file)} contains a stale deployment-status phrase: "${phrase}"`);
    }
  }
}
pass("No known stale deployment-status phrases found");

// 4. Nothing but app/_redirects should still reference the old charter-candidate path.
for (const file of htmlFiles) {
  const content = fs.readFileSync(file, "utf8");
  if (content.includes("charter-candidate")) {
    fail(`${rel(file)} still references the old charter-candidate path; use charter.html`);
  }
}
pass("No page links to the old charter-candidate path");

// 5. Phase 0 must not be described as in progress/planned anywhere.
const PHASE0_STALE = /Phase 0[^\n]{0,40}\b(in progress|planned)\b/i;
for (const file of [...docFiles, ...htmlFiles]) {
  const content = fs.readFileSync(file, "utf8");
  if (PHASE0_STALE.test(content)) {
    fail(`${rel(file)} still describes Phase 0 as in progress/planned instead of complete`);
  }
}
pass("Phase 0 is not described as in progress/planned anywhere");

if (failures > 0) {
  console.error(`\n${failures} consistency check(s) failed.`);
  process.exit(1);
} else {
  console.log("\nAll documentation consistency checks passed.");
  process.exit(0);
}

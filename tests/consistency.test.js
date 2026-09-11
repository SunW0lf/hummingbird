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
//  6. Current operations/deploy copy does not claim main has branch protection.
//  7. The public Security page reflects the Phase 1 private-reporting gate.
//  8. External GitHub Actions are pinned to immutable 40-character SHAs.
//  9. Production CI does not silently skip deployment as a Phase 0 bootstrap case.

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

// 6. Current operational sources must not claim main is protected while the
// authoritative repository-protection section says branch protection is unavailable.
for (const relativePath of ["OPERATIONS.md", "scripts/deploy"]) {
  const file = path.join(ROOT, relativePath);
  const content = fs.readFileSync(file, "utf8");
  if (/protected\s+`?main`?\s+branch/i.test(content) || /protected\s+main\s+branch/i.test(content)) {
    fail(`${relativePath} incorrectly claims main is a protected branch`);
  }
}
pass("Operational sources do not overstate main-branch protection");

// 7. The public Security page must reflect the current Phase 1 gate rather
// than implying private vulnerability reporting can wait until Phase 3.
const securityPagePath = path.join(DIST_DIR, "security.html");
const securityPage = fs.readFileSync(securityPagePath, "utf8");
if (securityPage.includes("before Hummingbird accepts public contributions in Phase 3")) {
  fail("dist/security.html contains the stale Phase 3 vulnerability-reporting deadline");
}
if (!securityPage.includes("blocker for completing Phase 1 or publishing the repository")) {
  fail("dist/security.html does not state the Phase 1/repository-publication security-contact gate");
} else {
  pass("Public Security page states the current private-reporting gate");
}

// 8. External Actions in the workflow must use immutable full commit SHAs.
const workflowPath = path.join(ROOT, ".github", "workflows", "ci.yml");
const workflow = fs.readFileSync(workflowPath, "utf8");
const usesPattern = /uses:\s+([^\s@]+)@([^\s#]+)/g;
let actionMatch;
let unpinnedActions = 0;
while ((actionMatch = usesPattern.exec(workflow)) !== null) {
  const action = actionMatch[1];
  const ref = actionMatch[2];
  if (action.startsWith("./")) continue;
  if (!/^[0-9a-f]{40}$/i.test(ref)) {
    fail(`.github/workflows/ci.yml uses ${action}@${ref} instead of an immutable commit SHA`);
    unpinnedActions += 1;
  }
}
if (unpinnedActions === 0) {
  pass("External GitHub Actions are pinned to immutable commit SHAs");
}

// 9. A missing production deploy credential is no longer an expected bootstrap
// condition. scripts/deploy owns fail-closed validation of required values.
if (/expected during Phase 0 bootstrap|skipping deploy/i.test(workflow)) {
  fail(".github/workflows/ci.yml can still silently skip production deployment as a Phase 0/bootstrap case");
} else {
  pass("Production CI no longer silently skips deployment for missing bootstrap configuration");
}

const deployScript = fs.readFileSync(path.join(ROOT, "scripts", "deploy"), "utf8");
if (/Pages:Edit,\s*DNS:Edit/i.test(deployScript)) {
  fail("scripts/deploy still claims the deployment token requires DNS:Edit");
} else {
  pass("Deploy script no longer overstates Cloudflare token scope");
}

if (failures > 0) {
  console.error(`\n${failures} consistency check(s) failed.`);
  process.exit(1);
} else {
  console.log("\nAll documentation consistency checks passed.");
  process.exit(0);
}

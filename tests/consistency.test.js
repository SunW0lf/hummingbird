// Lightweight, zero-dependency documentation consistency checks.
// Intentionally avoids a test framework dependency for a project this size.
//
// Checks:
//  1. Every OQ-* reference resolves to either the active open-question registry
//     or the resolved-question archive; IDs may not appear in both.
//  2. No inline "OPEN QUESTION:" markers remain outside the registry pattern.
//  3. No known stale deployment-status phrases remain.
//  4. No generated page links to the old charter-candidate path.
//  5. Phase 0 is not described as in progress/planned anywhere.
//  6. Current operational sources reflect that main is protected.
//  7. The public Security page reflects the current Phase 1 reporting gate.
//  8. External GitHub Actions are pinned to immutable 40-character SHAs.
//  9. Production CI does not silently skip deployment as a bootstrap case.

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
    if (entry.isDirectory()) walk(full, matches, out);
    else if (matches(entry.name)) out.push(full);
  }
  return out;
}

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, "/");
}

const docFiles = walk(ROOT, (name) => name.endsWith(".md") || name === "LICENSE");
const DIST_DIR = path.join(ROOT, "dist");
if (!fs.existsSync(DIST_DIR)) {
  console.error("error: dist/ does not exist. Run ./scripts/build before this check.");
  process.exit(1);
}
const htmlFiles = walk(DIST_DIR, (name) => name.endsWith(".html"));

function registryIds(relativePath) {
  const content = fs.readFileSync(path.join(ROOT, relativePath), "utf8");
  const ids = new Set();
  const pattern = /^### (OQ-[A-Z0-9-]+)$/gm;
  let match;
  while ((match = pattern.exec(content)) !== null) ids.add(match[1]);
  return ids;
}

// 1. References may resolve to an active question or a resolved historical ID.
const openIds = registryIds("docs/governance/OPEN_QUESTIONS.md");
const resolvedIds = registryIds("docs/governance/RESOLVED_QUESTIONS.md");

if (openIds.size === 0) fail("No OQ-* headings found in docs/governance/OPEN_QUESTIONS.md");
else pass(`Open registry defines ${openIds.size} unresolved question IDs`);

if (resolvedIds.size === 0) fail("No OQ-* headings found in docs/governance/RESOLVED_QUESTIONS.md");
else pass(`Resolved archive defines ${resolvedIds.size} historical question IDs`);

for (const id of openIds) {
  if (resolvedIds.has(id)) fail(`${id} appears in both open and resolved registries`);
}

const definedIds = new Set([...openIds, ...resolvedIds]);
const refPattern = /OQ-[A-Z0-9-]+/g;
let danglingRefs = 0;
for (const file of docFiles) {
  const content = fs.readFileSync(file, "utf8");
  for (const ref of content.match(refPattern) || []) {
    if (!definedIds.has(ref)) {
      fail(`${rel(file)} references ${ref}, which is in neither governance registry`);
      danglingRefs += 1;
    }
  }
}
if (danglingRefs === 0) pass("All OQ-* references resolve to an active or resolved stable ID");

// 2. No inline legacy markers.
let inlineMarkers = 0;
for (const file of docFiles) {
  const content = fs.readFileSync(file, "utf8");
  if (/OPEN QUESTION:/.test(content)) {
    fail(`${rel(file)} contains an inline "OPEN QUESTION:" marker instead of a registry cross-reference`);
    inlineMarkers += 1;
  }
}
if (inlineMarkers === 0) pass("No inline OPEN QUESTION: markers remain outside the registry pattern");

// 3. No known stale deployment-status phrases.
const STALE_PHRASES = [
  "still serves its prior placeholder",
  "once cutover happens",
  "production cutover to Hummingbird has not yet occurred",
  "The repository is currently private",
  "branch protection on `main` is currently unavailable",
];
let staleCount = 0;
for (const file of [...docFiles, ...htmlFiles]) {
  const content = fs.readFileSync(file, "utf8");
  for (const phrase of STALE_PHRASES) {
    if (content.toLowerCase().includes(phrase.toLowerCase())) {
      fail(`${rel(file)} contains stale state text: "${phrase}"`);
      staleCount += 1;
    }
  }
}
if (staleCount === 0) pass("No known stale deployment/repository-status phrases found");

// 4. Nothing generated should link to the old charter-candidate path.
let oldCharterLinks = 0;
for (const file of htmlFiles) {
  const content = fs.readFileSync(file, "utf8");
  if (content.includes("charter-candidate")) {
    fail(`${rel(file)} still references the old charter-candidate path; use charter.html`);
    oldCharterLinks += 1;
  }
}
if (oldCharterLinks === 0) pass("No page links to the old charter-candidate path");

// 5. Phase 0 must not be described as in progress/planned anywhere.
const PHASE0_STALE = /Phase 0[^\n]{0,40}\b(in progress|planned)\b/i;
let phase0Stale = 0;
for (const file of [...docFiles, ...htmlFiles]) {
  const content = fs.readFileSync(file, "utf8");
  if (PHASE0_STALE.test(content)) {
    fail(`${rel(file)} still describes Phase 0 as in progress/planned instead of complete`);
    phase0Stale += 1;
  }
}
if (phase0Stale === 0) pass("Phase 0 is not described as in progress/planned anywhere");

// 6. Current operational documentation should reflect the verified protected-main state.
const operations = fs.readFileSync(path.join(ROOT, "OPERATIONS.md"), "utf8");
if (!operations.includes("`main` is protected")) {
  fail("OPERATIONS.md does not state the current protected-main condition");
} else if (/repository is private|branch protection[^\n]{0,50}unavailable/i.test(operations)) {
  fail("OPERATIONS.md still contains private-mode branch-protection language");
} else {
  pass("Operational sources reflect active main-branch protection");
}

// 7. Public Security page must reflect the current public-repo Phase 1 gate.
const securityPage = fs.readFileSync(path.join(DIST_DIR, "security.html"), "utf8");
if (!securityPage.includes("repository is public")) {
  fail("dist/security.html does not state that the repository is public");
}
if (!securityPage.includes("blocker for completing Phase 1")) {
  fail("dist/security.html does not state the current private-reporting Phase 1 gate");
} else {
  pass("Public Security page states the public-repo/private-reporting Phase 1 gate");
}

// 8. External Actions must use immutable full commit SHAs.
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
if (unpinnedActions === 0) pass("External GitHub Actions are pinned to immutable commit SHAs");

// 9. Missing production credentials must fail closed rather than silently skip.
if (/expected during Phase 0 bootstrap|skipping deploy/i.test(workflow)) {
  fail(".github/workflows/ci.yml can still silently skip production deployment as a bootstrap case");
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
}

console.log("\nAll documentation consistency checks passed.");
process.exit(0);

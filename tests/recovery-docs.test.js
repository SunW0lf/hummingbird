// Guards the Phase 2D recovery truth sweep, publication-buffer exercise, and changelog record.
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");
let failures = 0;

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function fail(message) {
  failures += 1;
  console.error(`FAIL: ${message}`);
}

const operations = read("OPERATIONS.md");
const transparency = read("TRANSPARENCY.md");
const roadmap = read("ROADMAP.md");
const changelog = read("CHANGELOG.md");
const security = read("SECURITY.md");
const protocol = read("docs/protocols/PHASE_2D_RECOVERY.md");
const publicationBufferAdr = read("docs/decisions/0017-phase2-publication-buffer-policy.md");
const backup = read("scripts/backup");
const restore = read("scripts/restore");

for (const [name, content, markers] of [
  ["Operations", operations, [
    "Cloudflare D1 is now the production persistence engine",
    "portable canonical exporter",
    "Remote restore through the general-purpose command remains deliberately disabled",
    "Phase 2D production-state recovery drill",
    "ADR 0017",
  ]],
  ["Security", security, [
    "CLOUDFLARE_D1_RECOVERY_TOKEN",
    "D1 Read + D1 Write",
    "expires on 2026-10-11",
    "must not silently become a permanent general automation token",
  ]],
  ["Transparency", transparency, [
    "Cloudflare D1 now holds deliberately admitted canonical application state",
    "Phase 2D production-state recovery exercise",
    "Outcome: succeeded",
    "Publication-buffer handling",
    "No production canonical row was modified by the recovery exercise",
  ]],
  ["Roadmap", roadmap, [
    "### Phase 2D — Publication buffer, backup, and recovery",
    "Status: **complete**",
    "### Phase 2E — Phase review and Phase 3 gate",
    "review/gate only; Phase 3 remains blocked",
    "publication-buffer behavior is tested — **satisfied**",
  ]],
  ["Recovery protocol", protocol, [
    "Hummingbird must be able to lose its live database without losing institutional meaning",
    "Phase 2D recovery exit satisfied",
    "Execution observations",
    "PHASE2D_REMOTE_RECOVERY_DRILL: SUCCESS",
    "PUBLIC_PROJECTION_EQUALITY",
    "No recovery test wrote to production canonical state",
  ]],
  ["ADR 0017", publicationBufferAdr, [
    "curated, Git-reviewed release process",
    "Minimum useful public content",
    "Detail normally omitted",
    "First exercise",
    "No new D1 table, Worker, queue, or raw-log store",
  ]],
  ["Changelog", changelog, [
    "Completed Phase 2D and entered the Phase 2E review/gate",
    "Accepted [ADR 0017]",
    "Accepted [ADR 0016]",
    "Accepted [ADR 0015]",
  ]],
]) {
  for (const marker of markers) {
    if (!content.includes(marker)) fail(`${name} is missing required recovery marker: ${marker}`);
  }
}

for (const [name, content, stale] of [
  ["OPERATIONS.md", operations, "Current Phase 2D-1 restoration"],
  ["OPERATIONS.md", operations, "The production recovery drill must use"],
  ["TRANSPARENCY.md", transparency, "publication buffer is designed but has not yet completed its real operational-event exercise"],
  ["ROADMAP.md", roadmap, "Status: **in progress**\n\nPhase 2D now focuses"],
  ["scripts/backup", backup, "No database exists yet"],
  ["scripts/restore", restore, "No database exists yet"],
]) {
  if (content.includes(stale)) fail(`${name} still contains stale Phase 2D/database-state text: ${stale}`);
}

if (!backup.includes("export-canonical-backup.js")) fail("scripts/backup does not invoke the portable canonical exporter");
if (!restore.includes("restore-canonical-backup.js")) fail("scripts/restore does not invoke the guarded recovery tool");

const adrHtml = path.join(DIST, "decisions", "0017-phase2-publication-buffer-policy.html");
const adrRaw = path.join(DIST, "docs", "raw", "decisions", "0017-phase2-publication-buffer-policy.md");
if (!fs.existsSync(adrHtml)) fail("ADR 0017 rendered HTML is missing from public build");
if (!fs.existsSync(adrRaw)) fail("ADR 0017 raw Markdown is missing from public build");

const llmsPath = path.join(DIST, "llms.txt");
if (fs.existsSync(llmsPath)) {
  const llms = fs.readFileSync(llmsPath, "utf8");
  if (!llms.includes("0017-phase2-publication-buffer-policy")) fail("llms.txt does not expose ADR 0017");
  if (!llms.includes("Phase 2D has exercised a real production-state recovery path and the publication buffer")) {
    fail("llms.txt does not expose Phase 2D recovery/publication-buffer completion");
  }
} else {
  fail("dist/llms.txt is missing");
}

const sitemapPath = path.join(DIST, "sitemap.xml");
if (fs.existsSync(sitemapPath)) {
  const sitemap = fs.readFileSync(sitemapPath, "utf8");
  if (!sitemap.includes("https://datum.quest/decisions/0017-phase2-publication-buffer-policy")) {
    fail("sitemap does not expose ADR 0017 clean route");
  }
} else {
  fail("dist/sitemap.xml is missing");
}

if (failures > 0) {
  console.error(`\n${failures} recovery documentation check(s) failed.`);
  process.exit(1);
}

console.log("PASS: Phase 2D recovery and publication-buffer evidence are recorded consistently");
console.log("PASS: Phase 2D is closed only after successful remote recovery and minimized public transparency evidence");
console.log("PASS: ADR 0017 is publicly rendered, discoverable, and provenance-bearing");
console.log("PASS: Phase 2E is active while Phase 3 remains blocked");

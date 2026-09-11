// Guards the Phase 2D recovery truth sweep, publication-buffer exercise, and changelog record.
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
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
const protocol = read("docs/protocols/PHASE_2D_RECOVERY.md");
const publicationBufferAdr = read("docs/decisions/0017-phase2-publication-buffer-policy.md");
const backup = read("scripts/backup");
const restore = read("scripts/restore");

for (const [name, content, markers] of [
  ["Operations", operations, [
    "Cloudflare D1 is now the production persistence engine",
    "portable canonical exporter",
    "Remote restore is deliberately disabled",
    "PHASE_2D_RECOVERY.md",
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
    "SEMANTIC_EQUALITY",
    "### Phase 2E — Phase review and Phase 3 gate",
    "review/gate only; Phase 3 remains blocked",
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
  ["OPERATIONS.md", operations, "No production application database exists yet"],
  ["TRANSPARENCY.md", transparency, "publication buffer is designed but has not yet completed its real operational-event exercise"],
  ["ROADMAP.md", roadmap, "Status: **in progress**\n\nPhase 2D now focuses"],
  ["scripts/backup", backup, "No database exists yet"],
  ["scripts/restore", restore, "No database exists yet"],
]) {
  if (content.includes(stale)) fail(`${name} still contains stale Phase 2D/database-state text: ${stale}`);
}

if (!backup.includes("export-canonical-backup.js")) fail("scripts/backup does not invoke the portable canonical exporter");
if (!restore.includes("restore-canonical-backup.js")) fail("scripts/restore does not invoke the guarded recovery tool");

if (failures > 0) {
  console.error(`\n${failures} recovery documentation check(s) failed.`);
  process.exit(1);
}

console.log("PASS: Phase 2D recovery and publication-buffer evidence are recorded consistently");
console.log("PASS: Phase 2D is closed only after successful remote recovery and minimized public transparency evidence");
console.log("PASS: Phase 2E is active while Phase 3 remains blocked");

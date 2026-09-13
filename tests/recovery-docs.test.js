// Guards the Phase 2D recovery truth sweep and closeout record.
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
const backup = read("scripts/backup");
const restore = read("scripts/restore");

for (const [name, content, markers] of [
  ["Operations", operations, [
    "Cloudflare D1 is now the production persistence engine",
    "portable canonical exporter",
    "`./scripts/restore --remote` remains deliberately disabled",
    "the guarded remote drill completed successfully",
    "PHASE_2D_RECOVERY.md",
  ]],
  ["Transparency", transparency, [
    "Cloudflare D1 now holds deliberately admitted canonical application state",
    "Phase 2D is complete.",
    "Hummingbird exercised the portable production backup/recovery path end-to-end",
    "Public operational record — 2026-09 production-state recovery exercise",
    "Public operational record — 2026-09 ordinary private-backup closeout",
    "independently retrieved",
    "Publication-buffer handling",
    "The live production store was not used as a restore target or modified by the exercise",
    "Canonical backup transparency",
    "That exception does not authorize public artifact storage for future backups containing drafts or other non-public canonical state",
  ]],
  ["Roadmap", roadmap, [
    "### Phase 2D — Publication buffer, backup, and recovery",
    "Status: **complete**",
    "independently retrieved a retained encrypted bundle",
    "moved the same validated private-backup path to a daily repository-controlled schedule",
    "This completes Phase 2D without authorizing Phase 3",
    "disposable replacement D1 database",
  ]],
  ["Recovery protocol", protocol, [
    "Status: **complete",
    "Hummingbird must be able to lose its live database without losing institutional meaning",
    "Storage boundary",
    "Recovery point rule",
    "Execution observations and successful exercise",
    "The guarded REST-based retry completed successfully on 2026-09-11",
    "ordinary private-retention checkpoint also succeeded",
    "Phase 2D is closed",
    "D1 REST API",
  ]],
  ["Changelog", changelog, [
    "Closed Phase 2D after the ordinary independent private-backup checkpoint was completed",
    "independently retrieved from the private backup repository",
    "Added the first automation layer between temporary evidence and canonical admission",
    "Completed the first guarded remote production-state recovery drill for Phase 2D",
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
  ["TRANSPARENCY.md", transparency, "There is not yet a production application database"],
  ["TRANSPARENCY.md", transparency, "Phase 2D remains open only for confirmation"],
  ["ROADMAP.md", roadmap, "recovery and publication-buffer proof complete; ordinary independent-backup checkpoint remains"],
  ["ROADMAP.md", roadmap, "Phase 2D remains open only until the normal independent-backup rule is operationally clear"],
  ["docs/protocols/PHASE_2D_RECOVERY.md", protocol, "ordinary independent private-backup confirmation remains"],
  ["docs/protocols/PHASE_2D_RECOVERY.md", protocol, "Phase 2D remains open until the ordinary path is confirmed"],
  ["CHANGELOG.md", changelog, "This entry records preparation only — remote success is not claimed until the post-merge drill actually runs"],
  ["scripts/backup", backup, "No database exists yet"],
  ["scripts/restore", restore, "No database exists yet"],
]) {
  if (content.includes(stale)) fail(`${name} still contains stale recovery/database-state text: ${stale}`);
}

if (!backup.includes("export-canonical-backup.js")) fail("scripts/backup does not invoke the portable canonical exporter");
if (!restore.includes("restore-canonical-backup.js")) fail("scripts/restore does not invoke the guarded recovery tool");

if (failures > 0) {
  console.error(`\n${failures} recovery documentation check(s) failed.`);
  process.exit(1);
}

console.log("PASS: Phase 2D recovery, publication-buffer, and independent-backup closeout evidence are recorded");
console.log("PASS: ordinary retained backups remain encrypted and separate from the bounded public-equivalent artifact exception");
console.log("PASS: Phase 2D is complete without implying Phase 3 authorization");

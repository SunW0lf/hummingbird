// Guards the Phase 2D recovery truth sweep and changelog record.
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
    "Phase 2D has now exercised the portable production backup/recovery path end-to-end",
    "Public operational record — 2026-09 production-state recovery exercise",
    "Publication-buffer handling",
    "The live production store was not used as a restore target or modified by the exercise",
    "Canonical backup transparency",
    "That exception does not authorize public artifact storage for future backups containing drafts or other non-public canonical state",
  ]],
  ["Roadmap", roadmap, [
    "replaced the original Phase 0 backup/restore no-ops",
    "recovery and publication-buffer proof complete; ordinary independent-backup checkpoint remains",
    "Remaining work:",
    "released the compact material operational record of the recovery exercise",
    "ordinary independent-backup checkpoint is steward-confirmed",
    "disposable replacement D1 database",
  ]],
  ["Recovery protocol", protocol, [
    "Hummingbird must be able to lose its live database without losing institutional meaning",
    "Storage boundary",
    "Recovery point rule",
    "remote production-state recovery and minimized public record complete; ordinary independent private-backup confirmation remains",
    "Execution observations and successful exercise",
    "The guarded REST-based retry completed successfully on 2026-09-11",
    "D1 REST API",
    "Phase 2D remains open until the ordinary path is confirmed; recovery success does not authorize Phase 3",
  ]],
  ["Changelog", changelog, [
    "Published the smallest material public operational record of the successful Phase 2D recovery exercise",
    "Completed the first guarded remote production-state recovery drill for Phase 2D",
    "the public release while preserving the ordinary-backup checkpoint",
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
  ["ROADMAP.md", roadmap, "run the read-only portable backup exporter against current production D1"],
  ["ROADMAP.md", roadmap, "the compact material operational record of the successful recovery exercise has been prepared for release"],
  ["docs/protocols/PHASE_2D_RECOVERY.md", protocol, "guarded remote recovery drill in progress, not yet complete"],
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

console.log("PASS: Phase 2D recovery proof and remaining transparency boundary are internally consistent");
console.log("PASS: the minimized public record does not turn the public-equivalent artifact into a general backup policy");
console.log("PASS: Phase 2D remains open only for ordinary independent private-backup confirmation");

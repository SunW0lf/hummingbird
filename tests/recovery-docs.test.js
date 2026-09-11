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
    "Remote restore is deliberately disabled",
    "PHASE_2D_RECOVERY.md",
  ]],
  ["Transparency", transparency, [
    "Cloudflare D1 now holds deliberately admitted canonical application state",
    "Canonical backup transparency",
    "publication buffer is designed but has not yet completed its real operational-event exercise",
  ]],
  ["Roadmap", roadmap, [
    "replaced the original Phase 0 backup/restore no-ops",
    "Remaining work:",
    "disposable replacement D1 database",
  ]],
  ["Recovery protocol", protocol, [
    "Hummingbird must be able to lose its live database without losing institutional meaning",
    "Storage boundary",
    "Recovery point rule",
    "guarded remote recovery drill in progress, not yet complete",
    "Execution observations so far",
    "D1 REST API",
  ]],
  ["Changelog", changelog, [
    "Began the substantive Phase 2D recovery slice",
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
  ["scripts/backup", backup, "No database exists yet"],
  ["scripts/restore", restore, "No database exists yet"],
]) {
  if (content.includes(stale)) fail(`${name} still contains stale database-state text: ${stale}`);
}

if (!backup.includes("export-canonical-backup.js")) fail("scripts/backup does not invoke the portable canonical exporter");
if (!restore.includes("restore-canonical-backup.js")) fail("scripts/restore does not invoke the guarded recovery tool");

if (failures > 0) {
  console.error(`\n${failures} recovery documentation check(s) failed.`);
  process.exit(1);
}

console.log("PASS: Phase 2D recovery state, protocol, and changelog are internally consistent");
console.log("PASS: original no-database/no-op operational claims are gone from current-state sources");

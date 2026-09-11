// Static safety contract for the one-shot Phase 2D remote recovery drill.
// This test never contacts Cloudflare and never reads repository secrets.
"use strict";

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

function read(rel) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) {
    fail(`${rel} is missing`);
    return "";
  }
  return fs.readFileSync(full, "utf8");
}

const workflow = read(".github/workflows/phase2d-remote-recovery-drill.yml");
const drill = read("scripts/phase2d-remote-recovery-drill.js");
const renderer = read("scripts/render-public-records.js");
const protocol = read("docs/protocols/PHASE_2D_RECOVERY.md");
const changelog = read("CHANGELOG.md");

for (const marker of [
  "branches: [main]",
  "startsWith(github.event.head_commit.message, 'Phase 2D: run remote recovery drill')",
  "secrets.CLOUDFLARE_D1_RECOVERY_TOKEN",
  "permissions:\n  contents: read",
  "actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02",
  "retention-days: 30",
]) {
  if (!workflow.includes(marker)) fail(`remote recovery workflow is missing guard: ${marker}`);
}

if (workflow.includes("pull_request:")) fail("remote recovery workflow must not run on pull_request");
if (workflow.includes("secrets.CLOUDFLARE_API_TOKEN")) fail("remote recovery workflow must not use the Pages deployment token");
if (workflow.includes("write-all")) fail("remote recovery workflow requests broad GitHub write permissions");

for (const marker of [
  "scripts\", \"backup\"), [\"--remote\"",
  "assertPublicArtifactSafe(records)",
  "recoveryId === productionDatabaseId",
  "recovery target canonical_objects is not empty",
  "SEMANTIC_EQUALITY",
  "PUBLIC_PROJECTION_EQUALITY",
  "cloudflareApi(\"DELETE\"",
  "PHASE2D_REMOTE_RECOVERY_DRILL: SUCCESS",
]) {
  if (!drill.includes(marker)) fail(`remote recovery runner is missing safety/evidence marker: ${marker}`);
}

if (/d1["',\s]+execute["',\s]+hummingbird[\s\S]{0,100}--remote/.test(drill)) {
  fail("remote recovery runner appears to execute SQL directly against the production database name");
}

for (const marker of ["HUMMINGBIRD_PUBLICATION_SOURCE", "HUMMINGBIRD_DIST_DIR", "An offer is not admission"]) {
  if (!renderer.includes(marker)) fail(`public renderer is missing recovery/terminology marker: ${marker}`);
}

for (const marker of [
  "one-shot remote recovery workflow",
  "public-repository artifact",
  "CLOUDFLARE_D1_RECOVERY_TOKEN",
]) {
  if (!protocol.includes(marker)) fail(`Phase 2D recovery protocol is missing workflow boundary: ${marker}`);
}

if (!changelog.includes("guarded one-shot remote recovery drill")) {
  fail("CHANGELOG.md does not record preparation of the guarded remote recovery drill");
}

if (failures > 0) {
  console.error(`\n${failures} remote recovery drill guard(s) failed.`);
  process.exit(1);
}

pass("Remote recovery drill is main-only, one-shot gated, and uses the separate D1 recovery credential");
pass("Production access remains backup/read-only while restore writes are bound to a disposable non-production UUID");
pass("Independent artifact retention is allowed only for canonical state already proven public-equivalent");
console.log("\nAll remote recovery drill safety checks passed.");

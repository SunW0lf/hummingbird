// Guards the evidence-only Phase 2 review and its open-question inventory.
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const review = fs.readFileSync(path.join(ROOT, "docs/reviews/PHASE_2_EVIDENCE_AND_GATE_REVIEW.md"), "utf8");
const registry = fs.readFileSync(path.join(ROOT, "docs/governance/OPEN_QUESTIONS.md"), "utf8");
let failures = 0;

function fail(message) {
  failures += 1;
  console.error(`FAIL: ${message}`);
}

const registryIds = [...registry.matchAll(/^### (OQ-[A-Z0-9-]+)$/gm)].map((match) => match[1]);
const rows = [...review.matchAll(/^\| `(OQ-[A-Z0-9-]+)` \| (Blocks Phase 3|Phase 2 review gate|Later phase) \|/gm)]
  .map((match) => ({ id: match[1], classification: match[2] }));

// The evidence review is a dated Phase 2E snapshot. Resolved questions remain in that
// historical table even after they are removed from the live open-question registry.
if (registryIds.length !== 23) fail(`expected 23 currently open questions in registry, found ${registryIds.length}`);
if (rows.length !== 25) fail(`expected the dated evidence review to preserve its 25-question snapshot, found ${rows.length}`);

const rowIds = new Set(rows.map((row) => row.id));
for (const id of registryIds) {
  if (!rowIds.has(id)) fail(`review snapshot is missing currently open question ${id}`);
}

for (const resolvedId of [
  "OQ-GOVERNANCE-STEWARD-SCOPE",
  "OQ-GOVERNANCE-DECISION-PROCESS",
]) {
  if (registryIds.includes(resolvedId)) fail(`${resolvedId} should have been removed from the live registry after resolution`);
  if (!rowIds.has(resolvedId)) fail(`dated review snapshot should preserve resolved question ${resolvedId}`);
}

for (const [classification, expected] of [
  ["Blocks Phase 3", 8],
  ["Phase 2 review gate", 6],
  ["Later phase", 11],
]) {
  const actual = rows.filter((row) => row.classification === classification).length;
  if (actual !== expected) fail(`historical ${classification} count is ${actual}; expected ${expected}`);
}

for (const marker of [
  "no Phase 3 authorization",
  "one substantive comment",
  "No participant-created Seed, Feedback, or Question issue was observed",
  "This is a very small experiment",
  "Special public-equivalent recovery artifact",
  "Ordinary canonical backup",
  "Offer Buffer assumption audit",
  "No live route, API, account, credential issuer, Offer Buffer table",
]) {
  if (!review.includes(marker)) fail(`review is missing evidence/gate marker: ${marker}`);
}

if (failures > 0) {
  console.error(`\n${failures} Phase 2 review check(s) failed.`);
  process.exit(1);
}

console.log("PASS: all currently open questions remain represented in the dated Phase 2 review snapshot");
console.log("PASS: resolved C0 steward-scope and decision-process questions are absent from the live registry but preserved historically");
console.log("PASS: Seed Bank and Phase 2D findings state evidence limits and preserve Phase 3 authorization boundaries");

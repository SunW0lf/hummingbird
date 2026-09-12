"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");
let failures = 0;

function fail(message) {
  failures += 1;
  console.error(`FAIL: ${message}`);
}

function pass(message) {
  console.log(`PASS: ${message}`);
}

function read(relative) {
  const full = path.join(ROOT, relative);
  if (!fs.existsSync(full)) {
    fail(`${relative} is missing`);
    return "";
  }
  return fs.readFileSync(full, "utf8");
}

const adr = read("docs/decisions/0019-phase2e-offer-triage-and-review.md");
const protocol = read("docs/protocols/PHASE_2E_EXPERIMENTAL_INGRESS.md");
const page = read("app/offer.html");
const changelog = read("CHANGELOG.md");
const llms = read("app/llms.txt");

for (const phrase of [
  "compress repetition",
  "preserve meaningful difference",
  "escalate consequence, not volume",
  "current evidence questions",
  "corrections and challenges",
  "new or unclassified themes",
  "singletons and outliers",
  "oldest waiting material after duplicate compression",
  "Frequency alone is not a surfacing criterion",
  "Low volume is a valid result",
  "Overload uses backpressure before silent loss",
  "does not promise that every accepted offer will receive a bespoke response",
]) {
  if (!adr.includes(phrase)) fail(`ADR 0019 is missing triage boundary: ${phrase}`);
}

for (const phrase of [
  "Triage and review at zero, ordinary, and flood volume",
  "Every non-empty category should receive representation",
  "largest cluster size",
  "If almost nothing arrives",
  "If the pilot is flooded",
  "An accepted offer may expire after the ordinary 30-day retention period without further institutional consequence",
]) {
  if (!protocol.includes(phrase)) fail(`experimental ingress protocol is missing review behavior: ${phrase}`);
}

for (const phrase of [
  "How sorting and review work",
  "Exact duplicates are compressed first",
  "Review keeps multiple lanes visible",
  "Outliers do not disappear just because they are rare",
  "If almost nothing arrives",
  "If Hummingbird is flooded",
  "Frequency alone is not a surfacing criterion",
]) {
  if (!page.includes(phrase)) fail(`public offer page is missing review explanation: ${phrase}`);
}

for (const phrase of [
  "ADR 0019",
  "scale-aware review pipeline",
  "Low or zero participation is reported truthfully",
  "overload uses synthesis, deferral, backpressure, or a temporary intake pause",
]) {
  if (!changelog.includes(phrase)) fail(`changelog is missing triage/review release note: ${phrase}`);
}

for (const phrase of [
  "ADR 0019 — Phase 2E Offer Triage and Review",
  "surface material because of institutional consequence rather than popularity",
  "Offer volume is not governance weight",
]) {
  if (!llms.includes(phrase)) fail(`llms.txt is missing machine-readable triage guidance: ${phrase}`);
}

const renderedAdr = path.join(DIST, "decisions", "0019-phase2e-offer-triage-and-review.html");
const rawAdr = path.join(DIST, "docs", "raw", "decisions", "0019-phase2e-offer-triage-and-review.md");
if (!fs.existsSync(renderedAdr)) fail("ADR 0019 is not published on the Decisions surface");
if (!fs.existsSync(rawAdr)) fail("ADR 0019 raw Markdown is not published");

if (failures > 0) {
  console.error(`\n${failures} offer-triage contract check(s) failed.`);
  process.exit(1);
}

pass("Phase 2E offer triage preserves difference, resists popularity ranking, and defines low/flood behavior");
console.log("\nAll offer-triage contract checks passed.");

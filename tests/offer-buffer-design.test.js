// Guards the accepted Phase 3 Offer Buffer design without creating a Phase 3
// runtime during the current Phase 2 gate.
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

function read(rel) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) {
    fail(`${rel} is missing`);
    return "";
  }
  return fs.readFileSync(full, "utf8");
}

const adr = read("docs/decisions/0016-offers-and-the-offer-buffer.md");
const design = read("docs/protocols/PHASE_3_OFFER_BUFFER_DESIGN.md");
const roadmap = read("ROADMAP.md");
const architecture = read("ARCHITECTURE.md");
const governance = read("GOVERNANCE.md");
const agents = read("AGENTS.md");

for (const [name, content, markers] of [
  ["ADR 0016", adr, [
    "An **offer** is material a participant intentionally places before Hummingbird for consideration",
    "possible consequence of an offer may be broad",
    "Offer Buffer",
    "delivery friction may regulate resource use",
    "This ADR defines terminology and architecture only",
    "proof of thought",
    "proof of cognition",
  ]],
  ["Offer Buffer working design", design, [
    "design only — not deployed; Phase 3 remains gated",
    "Offer delivery options",
    "Uncredentialed bounded delivery",
    "Delivery is not priority",
    "Broad scope is not itself an abuse signal",
    "no hidden proof-of-thought, proof-of-cognition",
  ]],
  ["Roadmap", roadmap, [
    "offer architecture documented, gate not yet open",
    "make an offer",
    "Offer Buffer (bounded, operational, non-canonical)",
    "offer delivery options",
  ]],
  ["Architecture", architecture, [
    "Future Phase 3 offer boundary — designed, not deployed",
    "Offer Buffer (bounded operational state, non-canonical)",
    "Scope is not itself an abuse signal",
  ]],
  ["Governance", governance, ["who may **offer** a proposal"]],
  ["Agent instructions", agents, [
    "prefer **offer**, **make an offer**, **offer delivery options**, **Offer Buffer**, and **consideration**",
    "Broad scope is not an abuse signal and does not grant authority",
  ]],
]) {
  for (const marker of markers) {
    if (!content.includes(marker)) fail(`${name} is missing required marker: ${marker}`);
  }
}

const forbiddenDesignPhrases = [
  "Humans & LLMs",
  "Scripts & Agents",
  "low-priority automated review sinkhole",
  "determines how your offer is prioritized",
];
for (const phrase of forbiddenDesignPhrases) {
  if (design.toLowerCase().includes(phrase.toLowerCase())) {
    fail(`Offer Buffer working design contains rejected origin/priority language: ${phrase}`);
  }
}

if (fs.existsSync(path.join(DIST, "offer.html")) || fs.existsSync(path.join(DIST, "offer"))) {
  fail("Phase 2 build unexpectedly exposes a live /offer surface");
}

function htmlFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...htmlFiles(full));
    else if (entry.isFile() && entry.name.endsWith(".html")) results.push(full);
  }
  return results;
}

for (const file of htmlFiles(DIST)) {
  const html = fs.readFileSync(file, "utf8");
  if (/action=["']\/api\/offer/i.test(html)) {
    fail(`${path.relative(DIST, file)} advertises a live /api/offer action before Phase 3`);
  }
}

const publicAdr = path.join(DIST, "decisions", "0016-offers-and-the-offer-buffer.html");
const rawAdr = path.join(DIST, "docs", "raw", "decisions", "0016-offers-and-the-offer-buffer.md");
if (!fs.existsSync(publicAdr)) fail("ADR 0016 is not rendered on the public Decisions surface");
if (!fs.existsSync(rawAdr)) fail("ADR 0016 raw Markdown is not published");

const llms = read("app/llms.txt");
for (const marker of [
  "0016-offers-and-the-offer-buffer",
  "An offer is not canonical admission",
  "does not mean that `/offer`",
]) {
  if (!llms.includes(marker)) fail(`llms.txt is missing Offer Buffer marker: ${marker}`);
}

if (failures > 0) {
  console.error(`\n${failures} Offer Buffer design check(s) failed.`);
  process.exit(1);
}

pass("Offer terminology, broad-scope principle, non-canonical buffer, and delivery/authority separation are documented");
pass("Phase 3 runtime remains undeployed while ADR 0016 is publicly inspectable");
console.log("\nAll Offer Buffer design checks passed.");

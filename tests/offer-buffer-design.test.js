// Guards the accepted offer architecture and the bounded Phase 2E experimental
// ingress exception without creating a durable Phase 3 runtime.
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
const experimentalAdr = read("docs/decisions/0017-phase2e-experimental-ingress.md");
const experimentalProtocol = read("docs/protocols/PHASE_2E_EXPERIMENTAL_INGRESS.md");
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
    "ADR 0017",
    "Phase 3 remains gated",
    "proof of thought",
    "proof of cognition",
  ]],
  ["ADR 0017", experimentalAdr, [
    "experimental ingress pilot",
    "temporary, non-canonical experimental state only",
    "no account requirement",
    "open by design — evidence seeking",
    "exists now",
    "open for testing",
    "planned",
    "Phase 3 still requires its own explicit authorization",
  ]],
  ["Phase 2E experimental ingress protocol", experimentalProtocol, [
    "authorized design; not yet deployed",
    "Published handling contract",
    "Pre-deployment decisions still required",
    "Volume is not a vote",
    "Exit / expansion rule",
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
    "Phase 2E.P — Experimental ingress pilot",
    "authorized design — not yet deployed",
    "offer architecture documented, gate not yet open",
    "make an offer",
    "Offer Buffer (bounded, operational, non-canonical)",
    "offer delivery options",
  ]],
  ["Architecture", architecture, [
    "Phase 2E experimental ingress — authorized, not deployed",
    "Future Phase 3 offer boundary — durable participation designed, not deployed",
    "Offer Buffer (bounded operational state, non-canonical)",
    "Scope is not itself an abuse signal",
  ]],
  ["Governance", governance, [
    "Evidence-seeking experiments",
    "open by design — evidence seeking",
    "Published handling contracts",
  ]],
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

// ADR 0017 authorizes a future Phase 2E write experiment, but this decision PR
// intentionally does not deploy it yet. A live route belongs in a later build PR
// with the pilot-specific handling contract and safety decisions implemented.
if (fs.existsSync(path.join(DIST, "offer.html")) || fs.existsSync(path.join(DIST, "offer"))) {
  fail("decision-only Phase 2E build unexpectedly exposes a live /offer surface");
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
    fail(`${path.relative(DIST, file)} advertises a live /api/offer action before the pilot implementation exists`);
  }
}

for (const slug of [
  "0016-offers-and-the-offer-buffer",
  "0017-phase2e-experimental-ingress",
]) {
  const publicAdr = path.join(DIST, "decisions", `${slug}.html`);
  const rawAdr = path.join(DIST, "docs", "raw", "decisions", `${slug}.md`);
  if (!fs.existsSync(publicAdr)) fail(`${slug} is not rendered on the public Decisions surface`);
  if (!fs.existsSync(rawAdr)) fail(`${slug} raw Markdown is not published`);
}

const llms = read("app/llms.txt");
for (const marker of [
  "0016-offers-and-the-offer-buffer",
  "0017-phase2e-experimental-ingress",
  "An offer is not canonical admission",
  "The endpoint is not live",
]) {
  if (!llms.includes(marker)) fail(`llms.txt is missing Offer/experimental-ingress marker: ${marker}`);
}

if (failures > 0) {
  console.error(`\n${failures} Offer Buffer / experimental-ingress check(s) failed.`);
  process.exit(1);
}

pass("Offer terminology, broad-scope principle, non-canonical buffer, and delivery/authority separation are documented");
pass("Phase 2E evidence-only ingress is authorized with a published authority ceiling and pre-deployment gate");
pass("Durable Phase 3 participation remains undeployed and separately gated");
console.log("\nAll Offer Buffer / experimental-ingress checks passed.");

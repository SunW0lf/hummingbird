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
const runtimeAdr = read("docs/decisions/0018-phase2e-offer-pilot-runtime-and-data-boundary.md");
const triageAdr = read("docs/decisions/0019-phase2e-offer-triage-and-review.md");
const launchAdr = read("docs/decisions/0020-phase2e-offer-pilot-launch-profile.md");
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
  ["ADR 0018", runtimeAdr, [
    "dedicated D1 database bound as `OFFER_DB`",
    "30-day ordinary retention period",
    "256-bit receipt secret",
    "The offer row is never converted in place into a canonical record",
  ]],
  ["ADR 0019", triageAdr, [
    "compress repetition",
    "preserve meaningful difference",
    "escalate consequence, not volume",
  ]],
  ["ADR 0020", launchAdr, [
    "250 active offers",
    "exact duplicate offer text only",
    "does **not** create application-level raw-IP storage",
    "Provisioning the database or merging runtime code is not by itself public launch",
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

// ADRs 0017-0020 now authorize implementation of the bounded Phase 2E pilot,
// but public launch remains a separate deployment event. Until that event the
// static contract page and machine guidance must still truthfully say non-live.
const offerPage = path.join(DIST, "offer.html");
if (fs.existsSync(offerPage)) {
  const html = fs.readFileSync(offerPage, "utf8");
  if (!html.includes("The write path is not live yet.")) {
    fail("static /offer contract page does not clearly say the write path is not live");
  }
  if (/<form\b/i.test(html) || /method=["']post["']/i.test(html) || /action=["'][^"']*offer/i.test(html)) {
    fail("static /offer contract page unexpectedly exposes a live mutation form before launch");
  }
}

// Source for the explicitly authorized Phase 2E route may now exist, but the
// one-shot provisioning merge must not deploy it. The binding is centralized
// in the shared runtime helper, while the handler carries the bounded outcome
// semantics. This preserves implementation != deployment.
const phase2eHandlerPath = path.join(ROOT, "functions", "offer", "index.js");
const phase2eRuntimePath = path.join(ROOT, "lib", "offer-runtime.mjs");
if (!fs.existsSync(phase2eHandlerPath) || !fs.existsSync(phase2eRuntimePath)) {
  fail("authorized Phase 2E offer handler/runtime source is missing");
} else {
  const handler = fs.readFileSync(phase2eHandlerPath, "utf8");
  const runtime = fs.readFileSync(phase2eRuntimePath, "utf8");
  for (const marker of ["pilot_capacity_reached", "write_unconfirmed"]) {
    if (!handler.includes(marker)) fail(`Phase 2E offer handler is missing bounded-launch marker: ${marker}`);
  }
  for (const marker of ["OFFER_DB", "MAX_ACTIVE_OFFERS = 250", "MAX_REQUEST_BYTES = 16 * 1024"]) {
    if (!runtime.includes(marker)) fail(`Phase 2E shared runtime is missing bounded-launch marker: ${marker}`);
  }
}

const ci = read(".github/workflows/ci.yml");
const provisionWorkflow = read(".github/workflows/phase2e-offer-provision.yml");
if (!ci.includes("!startsWith(github.event.head_commit.message, 'Phase 2E: provision offer pilot')")) {
  fail("normal Pages deployment is not explicitly skipped for the storage-provisioning merge");
}
if (!provisionWorkflow.includes("Phase 2E: provision offer pilot") || /pages deploy/i.test(provisionWorkflow)) {
  fail("offer provisioning workflow does not remain a storage-only, explicitly gated operation");
}

// Durable Phase 3 ingress remains undeployed. In particular there is still no
// generic /api/offer route, capability issuance, participant-account runtime,
// or formal proposal endpoint hiding behind the Phase 2E exception.
for (const candidate of [
  "functions/api/offer.js",
  "functions/api/offer/index.js",
  "functions/api/propose.js",
  "functions/api/propose/index.js",
  "functions/account.js",
  "functions/capability.js",
]) {
  if (fs.existsSync(path.join(ROOT, candidate))) {
    fail(`${candidate} exists even though durable Phase 3 participation remains gated`);
  }
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
    fail(`${path.relative(DIST, file)} advertises a durable /api/offer action while Phase 3 remains gated`);
  }
}

for (const slug of [
  "0016-offers-and-the-offer-buffer",
  "0017-phase2e-experimental-ingress",
  "0018-phase2e-offer-pilot-runtime-and-data-boundary",
  "0019-phase2e-offer-triage-and-review",
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
  "0019-phase2e-offer-triage-and-review",
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
pass("Authorized Phase 2E implementation source remains separated from public launch and durable Phase 3 participation");
pass("Durable Phase 3 participation remains undeployed and separately gated");
console.log("\nAll Offer Buffer / experimental-ingress checks passed.");

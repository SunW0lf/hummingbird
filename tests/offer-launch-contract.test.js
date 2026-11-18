"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
let failures = 0;
const fail = (message) => { failures += 1; console.error(`FAIL: ${message}`); };
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), "utf8");

const accept = read("functions/offer/index.js");
const status = read("functions/offer/status.js");
const withdraw = read("functions/offer/withdraw.js");
const runtime = read("lib/offer-runtime.mjs");
const routes = JSON.parse(read("app/_routes.json"));
const provision = read("scripts/provision-offer-pilot.mjs");
const cleanup = read("scripts/cleanup-offer-buffer.mjs");
const provisionWorkflow = read(".github/workflows/phase2e-offer-provision.yml");
const cleanupWorkflow = read(".github/workflows/phase2e-offer-cleanup.yml");
const publicOffer = read("app/offer.html");
const machineIndex = read("app/llms.txt");

for (const marker of [
  "MAX_ACTIVE_OFFERS = 250",
  "MAX_REQUEST_BYTES = 16 * 1024",
  "RETENTION_DAYS = 30",
  "OFFER_DB binding unavailable",
]) {
  if (!runtime.includes(marker)) fail(`offer runtime missing boundary: ${marker}`);
}

for (const marker of [
  "pilot_capacity_reached",
  "write_unconfirmed",
  "content_sha256",
  "exact:${contentHash}",
  "201",
]) {
  if (!accept.includes(marker)) fail(`acceptance function missing behavior: ${marker}`);
}

if (!status.includes("lookupByReceipt") || !withdraw.includes("state = 'withdrawn'")) {
  fail("receipt status/withdrawal functions are incomplete");
}

const combinedRuntime = `${accept}\n${status}\n${withdraw}\n${runtime}`;
for (const forbidden of ["CF-Connecting-IP", "ip_address", "user_agent", "participant_id", "reputation_score", "origin_category"]) {
  if (combinedRuntime.includes(forbidden)) fail(`write runtime contains forbidden participant/source tracking marker: ${forbidden}`);
}

if (JSON.stringify(routes.include) !== JSON.stringify(["/offer", "/offer/*"])) {
  fail("Pages Functions routes are not restricted to /offer and /offer/*");
}

for (const marker of [
  "CLOUDFLARE_D1_RECOVERY_TOKEN",
  "OFFER_DB",
  "deployment_configs",
  "experimental_offers",
  "without printing provider identifiers",
]) {
  if (!provision.includes(marker)) fail(`provisioning script missing safety marker: ${marker}`);
}

if (!provisionWorkflow.includes("Phase 2E: provision offer pilot")) fail("provision workflow lacks explicit one-shot commit gate");
if (!cleanupWorkflow.includes('cron: "17 10 * * *"')) fail("offer cleanup is not scheduled daily");
if (!cleanup.includes("retention-ended") || !cleanup.includes("7 * 24 * 60 * 60 * 1000")) fail("cleanup does not implement expiry redaction plus seven-day tombstone purge");

for (const marker of ["POST /offer", "application/x-www-form-urlencoded", "Accept: application/json", "POST /offer/status", "POST /offer/withdraw", "accepted: true", "receipt"]) {
  if (!publicOffer.includes(marker)) fail(`public offer page lacks the existing plain-HTTP contract: ${marker}`);
}
for (const marker of ["POST https://datum.quest/offer", "application/x-www-form-urlencoded", "Accept: application/json", "201 response with accepted: true", "offer/status", "offer/withdraw"]) {
  if (!machineIndex.includes(marker)) fail(`machine index lacks the existing plain-HTTP contract: ${marker}`);
}
if (!runtime.includes('type !== "application/x-www-form-urlencoded"') || !runtime.includes('includes("application/json")')) {
  fail("documented request/response negotiation does not match the runtime");
}

if (failures > 0) {
  console.error(`\n${failures} Phase 2E launch contract check(s) failed.`);
  process.exit(1);
}

console.log("PASS: Phase 2E launch code preserves bounded, non-canonical, receipt-controlled offer ingress");

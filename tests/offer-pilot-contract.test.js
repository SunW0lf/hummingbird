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

function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8");
}

const adr = read("docs/decisions/0018-phase2e-offer-pilot-runtime-and-data-boundary.md");
const launchAdr = read("docs/decisions/0020-phase2e-offer-pilot-launch-profile.md");
const schema = read("experimental/offer-buffer/migrations/0001_offer_buffer.sql");
const page = read("app/offer.html");
const canonicalMigration = read("migrations/0001_canonical_v1.sql");

for (const phrase of [
  "dedicated D1 database bound as `OFFER_DB`",
  "30-day ordinary retention period",
  "256-bit receipt secret",
  "does **not** include participant name, email, account, handle, origin category, reputation, browser fingerprint, user-agent history, raw IP address, bot score, or cross-offer identity profile",
  "The offer row is never converted in place into a canonical record",
]) {
  if (!adr.includes(phrase)) fail(`ADR 0018 is missing required boundary: ${phrase}`);
}

for (const phrase of [
  "250 active offers",
  "exact duplicate offer text only",
  "does **not** create application-level raw-IP storage",
]) {
  if (!launchAdr.includes(phrase)) fail(`ADR 0020 is missing launch boundary: ${phrase}`);
}

for (const phrase of [
  "CREATE TABLE experimental_offers",
  "length(body) BETWEEN 1 AND 4000",
  "length(receipt_hash) = 64",
  "'withdrawn'",
  "expires_at TEXT NOT NULL",
]) {
  if (!schema.includes(phrase)) fail(`experimental schema is missing: ${phrase}`);
}

for (const forbidden of [
  /\bemail\b/i,
  /\buser_agent\b/i,
  /\bip_address\b/i,
  /\breputation\b/i,
  /\borigin_category\b/i,
  /\bparticipant_id\b/i,
]) {
  if (forbidden.test(schema)) fail(`experimental schema contains forbidden participant-profile field matching ${forbidden}`);
}

if (/experimental_offers|offer_clusters|receipt_hash/i.test(canonicalMigration)) {
  fail("canonical migration contains experimental offer-buffer state");
}

for (const phrase of [
  "open for testing",
  '<form method="post" action="/offer">',
  '<form method="post" action="/offer/status">',
  '<form method="post" action="/offer/withdraw">',
  "No account, handle, origin declaration, CAPTCHA, or JavaScript is required",
  "250 active offers",
  "The temporary offer row is never converted in place into institutional memory",
]) {
  if (!page.includes(phrase)) fail(`participant-facing live offer contract is missing: ${phrase}`);
}

for (const forbidden of ["name=\"email\"", "name=\"handle\"", "name=\"origin\"", "name=\"participant_type\""]) {
  if (page.includes(forbidden)) fail(`live offer form contains forbidden identity/origin field: ${forbidden}`);
}

for (const adrSlug of [
  "0017-phase2e-experimental-ingress",
  "0018-phase2e-offer-pilot-runtime-and-data-boundary",
  "0019-phase2e-offer-triage-and-review",
  "0020-phase2e-offer-pilot-launch-profile",
]) {
  if (!page.includes(adrSlug)) fail(`offer page does not link governing ADR ${adrSlug}`);
}

if (failures > 0) {
  console.error(`\n${failures} offer-pilot contract check(s) failed.`);
  process.exit(1);
}

pass("Live Phase 2E offer pilot remains temporary, non-canonical, minimal, receipt-controlled, and publicly described");

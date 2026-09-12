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
  "The write path is not live yet.",
  "ordinary retention of 30 days",
  "No account, required handle, origin declaration, CAPTCHA, or JavaScript",
  "does not need your name, email address, account, handle, participant category",
  "The temporary offer row is never converted in place into institutional memory",
]) {
  if (!page.includes(phrase)) fail(`participant-facing offer contract is missing: ${phrase}`);
}

if (!page.includes("0017-phase2e-experimental-ingress") || !page.includes("0018-phase2e-offer-pilot-runtime-and-data-boundary")) {
  fail("offer page does not link both governing ADRs");
}

if (failures > 0) {
  console.error(`\n${failures} offer-pilot contract check(s) failed.`);
  process.exit(1);
}

pass("Phase 2E offer pilot remains temporary, non-canonical, minimal, and publicly described");

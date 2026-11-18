#!/usr/bin/env node
"use strict";

// Validate a non-canonical candidate envelope without remote access.
// This tool deliberately cannot admit, publish, or mutate canonical state.

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const ADMISSION_VALIDATOR = path.join(ROOT, "scripts", "admit-draft-d1.js");
const METHODS = new Set([
  "direct", "manual_synthesis", "machine_assisted_synthesis", "deterministic_transform",
]);
const SOURCE_KINDS = new Set(["offer", "seed_bank", "canonical", "public_reference", "other"]);
const TOP_LEVEL = new Set([
  "candidate_version", "candidate_id", "generated_at", "record", "sources", "derivation", "admission",
]);
const FORBIDDEN_KEYS = new Set([
  "receipt", "receipt_secret", "receipt_hash", "participant_id", "origin", "origin_category",
  "human_or_ai", "device_id", "wallet", "wallet_address", "account_id", "github_user_id",
  "source_ip", "ip_address", "browser_fingerprint", "user_agent", "rowid", "database_id", "d1_id",
]);

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function scanForbidden(value, pointer = "") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanForbidden(item, `${pointer}/${index}`));
    return;
  }
  if (!isObject(value)) return;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(key)) throw new Error(`candidate envelope contains forbidden field ${pointer}/${key}`);
    scanForbidden(child, `${pointer}/${key}`);
  }
}

function assertKeys(object, allowed, label) {
  for (const key of Object.keys(object)) {
    if (!allowed.has(key)) throw new Error(`${label} contains unsupported field ${key}`);
  }
}

function validateEnvelope(envelope) {
  if (!isObject(envelope)) throw new Error("candidate envelope must be one JSON object");
  assertKeys(envelope, TOP_LEVEL, "candidate envelope");
  for (const field of TOP_LEVEL) {
    if (!Object.prototype.hasOwnProperty.call(envelope, field)) throw new Error(`candidate envelope is missing ${field}`);
  }
  if (envelope.candidate_version !== 1) throw new Error("candidate_version must be 1");
  if (typeof envelope.candidate_id !== "string" || envelope.candidate_id.trim() === "" || envelope.candidate_id.length > 160) {
    throw new Error("candidate_id must be a non-empty string no longer than 160 characters");
  }
  if (typeof envelope.generated_at !== "string" || Number.isNaN(Date.parse(envelope.generated_at))) {
    throw new Error("generated_at must be a parseable date-time");
  }
  if (!isObject(envelope.record)) throw new Error("record must be an object");

  if (!Array.isArray(envelope.sources) || envelope.sources.length < 1 || envelope.sources.length > 250) {
    throw new Error("sources must contain between 1 and 250 entries");
  }
  envelope.sources.forEach((source, index) => {
    if (!isObject(source)) throw new Error(`source ${index} must be an object`);
    assertKeys(source, new Set(["source_ref", "kind", "note"]), `source ${index}`);
    if (typeof source.source_ref !== "string" || source.source_ref.trim() === "" || source.source_ref.length > 2048) {
      throw new Error(`source ${index} source_ref is invalid`);
    }
    if (!SOURCE_KINDS.has(source.kind)) throw new Error(`source ${index} kind is unsupported`);
    if (source.note !== undefined && (typeof source.note !== "string" || source.note.length > 1000)) {
      throw new Error(`source ${index} note is invalid`);
    }
  });

  if (!isObject(envelope.derivation)) throw new Error("derivation must be an object");
  assertKeys(envelope.derivation, new Set(["method", "source_count", "machine_assisted", "note"]), "derivation");
  if (!METHODS.has(envelope.derivation.method)) throw new Error("derivation method is unsupported");
  if (!Number.isInteger(envelope.derivation.source_count) || envelope.derivation.source_count !== envelope.sources.length) {
    throw new Error("derivation source_count must equal sources.length");
  }
  if (typeof envelope.derivation.machine_assisted !== "boolean") throw new Error("derivation machine_assisted must be boolean");
  if (envelope.derivation.note !== undefined && (typeof envelope.derivation.note !== "string" || envelope.derivation.note.length > 2000)) {
    throw new Error("derivation note is invalid");
  }

  if (!isObject(envelope.admission)) throw new Error("admission must be an object");
  assertKeys(envelope.admission, new Set(["status", "requires_explicit_admission"]), "admission");
  if (envelope.admission.status !== "candidate_only" || envelope.admission.requires_explicit_admission !== true) {
    throw new Error("candidate envelope must remain candidate_only and require explicit admission");
  }

  scanForbidden(envelope);
}

function validateRecordWithExistingAdmissionContract(record) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hummingbird-candidate-"));
  try {
    const recordPath = path.join(tempRoot, "record.json");
    fs.writeFileSync(recordPath, JSON.stringify(record, null, 2) + "\n", { mode: 0o600 });
    execFileSync(process.execPath, [ADMISSION_VALIDATOR, recordPath, "--validate-only"], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

const envelopeArg = process.argv[2];
const emitIndex = process.argv.indexOf("--emit-record");
if (!envelopeArg || envelopeArg.startsWith("--") || (emitIndex !== -1 && !process.argv[emitIndex + 1])) {
  console.error("usage: node scripts/validate-canonical-candidate.js <candidate-envelope.json> [--emit-record <path>]");
  process.exit(2);
}

try {
  const envelopePath = path.resolve(envelopeArg);
  const envelope = JSON.parse(fs.readFileSync(envelopePath, "utf8"));
  validateEnvelope(envelope);
  validateRecordWithExistingAdmissionContract(envelope.record);

  if (emitIndex !== -1) {
    const output = path.resolve(process.argv[emitIndex + 1]);
    fs.writeFileSync(output, JSON.stringify(envelope.record, null, 2) + "\n", { flag: "wx", mode: 0o600 });
    console.log(`EMITTED NON-CANONICAL DRAFT RECORD: ${output}`);
  }

  console.log(`VALID CANDIDATE: ${envelope.candidate_id}`);
  console.log("NO AUTHORITY GRANTED: candidate validation performed no remote access, admission, publication, or governance action");
} catch (error) {
  console.error(`error: ${error.message}`);
  process.exit(1);
}

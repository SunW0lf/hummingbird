// Zero-dependency contract tests for Hummingbird's Phase 2 canonical reference corpus.
// This is intentionally not a general JSON Schema implementation. It validates
// the v1 invariants Hummingbird depends on and checks those invariants against
// the machine-readable schema committed beside the fixtures.
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SCHEMA_PATH = path.join(ROOT, "schemas", "canonical-object-v1.schema.json");
const FIXTURE_DIR = path.join(ROOT, "fixtures", "canonical");

let failures = 0;
function fail(message) {
  failures += 1;
  console.error(`FAIL: ${message}`);
}
function pass(message) {
  console.log(`PASS: ${message}`);
}
function assert(condition, message) {
  if (!condition) fail(message);
}
function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8"));
const allowedTypes = new Set(schema.properties.type.enum);
const allowedStates = new Set(schema.properties.state.enum);
const relationshipTypes = new Set(schema.properties.relationships.items.properties.type.enum);
const requiredTopLevel = new Set(schema.required);
const allowedTopLevel = new Set(Object.keys(schema.properties));

assert(schema.$schema === "https://json-schema.org/draft/2020-12/schema", "canonical schema uses JSON Schema 2020-12");
assert(schema.properties.schema_version.const === 1, "canonical schema_version is fixed at v1");

const fixtureFiles = fs.readdirSync(FIXTURE_DIR)
  .filter((name) => name.endsWith(".json"))
  .sort();

assert(fixtureFiles.length >= 4, "reference corpus contains at least four JSON fixtures");

const records = fixtureFiles.map((name) => {
  const file = path.join(FIXTURE_DIR, name);
  try {
    return { name, record: JSON.parse(fs.readFileSync(file, "utf8")) };
  } catch (error) {
    fail(`${name} is valid JSON: ${error.message}`);
    return { name, record: null };
  }
}).filter(({ record }) => record !== null);

const ids = new Set();
const seenTypes = new Set();
const forbiddenKeys = new Set([
  "participant_id",
  "origin",
  "origin_category",
  "human_or_ai",
  "device_id",
  "wallet",
  "wallet_address",
  "account_id",
  "github_user_id",
  "source_ip",
  "ip_address",
  "rowid",
  "database_id",
  "d1_id"
]);

function scanForbidden(value, pointer, fileName) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanForbidden(item, `${pointer}/${index}`, fileName));
    return;
  }
  if (!isObject(value)) return;
  for (const [key, child] of Object.entries(value)) {
    if (forbiddenKeys.has(key)) fail(`${fileName} contains forbidden persistence/identity field ${pointer}/${key}`);
    scanForbidden(child, `${pointer}/${key}`, fileName);
  }
}

for (const { name, record } of records) {
  if (!isObject(record)) {
    fail(`${name} must contain one JSON object`);
    continue;
  }

  for (const required of requiredTopLevel) {
    assert(Object.prototype.hasOwnProperty.call(record, required), `${name} includes required field ${required}`);
  }
  for (const key of Object.keys(record)) {
    assert(allowedTopLevel.has(key), `${name} top-level field ${key} is declared by the canonical schema`);
  }

  assert(typeof record.id === "string" && record.id.length > 0, `${name} has a non-empty id`);
  if (ids.has(record.id)) fail(`${name} duplicates canonical id ${record.id}`);
  ids.add(record.id);

  assert(allowedTypes.has(record.type), `${name} uses an allowed record type`);
  seenTypes.add(record.type);
  assert(record.schema_version === 1, `${name} uses schema_version 1`);
  assert(typeof record.created_at === "string" && !Number.isNaN(Date.parse(record.created_at)), `${name} has a parseable created_at timestamp`);
  assert(allowedStates.has(record.state), `${name} uses an allowed lifecycle state`);
  assert(isObject(record.content), `${name} content is an object`);
  assert(Array.isArray(record.relationships), `${name} relationships is an array`);

  scanForbidden(record, "", name);

  if (Array.isArray(record.relationships)) {
    record.relationships.forEach((rel, index) => {
      assert(isObject(rel), `${name} relationship ${index} is an object`);
      if (!isObject(rel)) return;
      assert(Object.keys(rel).every((key) => ["type", "target_ref"].includes(key)), `${name} relationship ${index} contains only portable fields`);
      assert(relationshipTypes.has(rel.type), `${name} relationship ${index} uses an allowed type`);
      assert(typeof rel.target_ref === "string" && rel.target_ref.length > 0, `${name} relationship ${index} has a target_ref`);
    });
  }

  if (record.type === "contribution") {
    assert(typeof record.content.body === "string" && record.content.body.length > 0, `${name} contribution has body`);
    assert(typeof record.content.format === "string" && record.content.format.length > 0, `${name} contribution has format`);
  } else if (record.type === "proposal") {
    for (const field of ["title", "summary", "body"]) {
      assert(typeof record.content[field] === "string" && record.content[field].length > 0, `${name} proposal has ${field}`);
    }
  } else if (record.type === "need") {
    for (const field of ["title", "description"]) {
      assert(typeof record.content[field] === "string" && record.content[field].length > 0, `${name} need has ${field}`);
    }
  } else if (record.type === "event") {
    assert(typeof record.event_type === "string" && record.event_type.length > 0, `${name} event has event_type`);
    assert(typeof record.subject_ref === "string" && record.subject_ref.length > 0, `${name} event has subject_ref`);
    assert(isObject(record.publication), `${name} event has publication metadata`);
  }
}

for (const type of allowedTypes) {
  assert(seenTypes.has(type), `reference corpus exercises ${type} records`);
}

for (const { name, record } of records) {
  if (!Array.isArray(record.relationships)) continue;
  for (const rel of record.relationships) {
    if (typeof rel.target_ref !== "string") continue;
    if (rel.target_ref.startsWith("ref-")) {
      assert(ids.has(rel.target_ref), `${name} relationship resolves local fixture ${rel.target_ref}`);
    }
  }
}

if (failures > 0) {
  console.error(`\n${failures} canonical corpus check(s) failed.`);
  process.exit(1);
}

pass(`${records.length} canonical reference fixtures satisfy the Phase 2 v1 contract`);
console.log("\nAll canonical corpus checks passed.");

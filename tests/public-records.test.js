// Phase 2C public read-model checks. The publication projection is derived
// deployment input; CI never needs remote D1 access to verify it.
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const SOURCE = path.join(ROOT, "publication", "canonical");
const indexPath = path.join(DIST, "records", "index.json");
const pagePath = path.join(DIST, "records.html");

let failures = 0;
function assert(condition, message) {
  if (condition) console.log(`PASS: ${message}`);
  else {
    failures += 1;
    console.error(`FAIL: ${message}`);
  }
}

assert(fs.existsSync(pagePath), "records.html public index exists");
assert(fs.existsSync(indexPath), "records/index.json machine index exists");

let index = null;
try {
  index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  assert(index.schema_version === 1, "record index declares schema_version 1");
  assert(Array.isArray(index.records), "record index contains records array");
} catch (error) {
  failures += 1;
  console.error(`FAIL: record index is valid JSON: ${error.message}`);
}

const sourceById = new Map();
if (fs.existsSync(SOURCE)) {
  for (const name of fs.readdirSync(SOURCE).filter((entry) => entry.endsWith(".json"))) {
    try {
      const record = JSON.parse(fs.readFileSync(path.join(SOURCE, name), "utf8"));
      assert(record.state !== "draft", `${name} is not a draft record`);
      if (sourceById.has(record.id)) {
        assert(false, `${name} does not duplicate canonical id ${record.id}`);
      } else {
        sourceById.set(record.id, record);
      }
    } catch (error) {
      failures += 1;
      console.error(`FAIL: ${name} is valid publication JSON: ${error.message}`);
    }
  }
}

if (index && Array.isArray(index.records)) {
  assert(index.records.length === sourceById.size, "machine index matches projected-record count");
  for (const item of index.records) {
    const slug = encodeURIComponent(item.id);
    assert(item.state !== "draft", `${item.id} is not exposed as draft`);
    assert(sourceById.has(item.id), `${item.id} came from the deliberate publication projection`);
    assert(fs.existsSync(path.join(DIST, "records", `${slug}.html`)), `${item.id} has static HTML detail`);
    assert(fs.existsSync(path.join(DIST, "records", `${slug}.json`)), `${item.id} has machine-readable JSON detail`);
  }
}

const page = fs.readFileSync(pagePath, "utf8");
assert(page.includes("An offer is not admission; admission is not governance approval."), "public index states the authority boundary");
assert(page.includes("static at request time"), "public index states that reads do not query D1");

if (failures) {
  console.error(`\n${failures} public-record projection check(s) failed.`);
  process.exit(1);
}

console.log("\nAll Phase 2C public-record projection checks passed.");

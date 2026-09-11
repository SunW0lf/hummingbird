#!/usr/bin/env node
"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const CONFIG = path.join(ROOT, "wrangler.d1.jsonc");
const CORPUS_DIR = path.join(ROOT, "fixtures", "canonical");
const WRANGLER_BIN = path.join(ROOT, "node_modules", "wrangler", "bin", "wrangler.js");
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hummingbird-d1-remote-"));
const seedFile = path.join(tempRoot, "seed.sql");

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    env: { ...process.env, NO_D1_WARNING: "true" },
    stdio: ["ignore", "pipe", "pipe"],
    ...options
  });
}

function wrangler(args, options = {}) {
  assert.ok(fs.existsSync(WRANGLER_BIN),
    "Wrangler is not installed; run npm ci before remote D1 verification");
  return run(process.execPath, [WRANGLER_BIN, ...args], options);
}

function query(sql) {
  const stdout = wrangler([
    "d1", "execute", "hummingbird",
    "--remote",
    "--config", CONFIG,
    "--json",
    "--command", sql
  ]);
  const parsed = JSON.parse(stdout);
  assert(Array.isArray(parsed) && parsed.length === 1, "D1 query should return one result set");
  assert.strictEqual(parsed[0].success, true, "D1 query should succeed");
  return parsed[0].results || [];
}

function execute(sql) {
  wrangler([
    "d1", "execute", "hummingbird",
    "--remote",
    "--config", CONFIG,
    "--yes",
    "--command", sql
  ]);
}

function loadCorpus() {
  return fs.readdirSync(CORPUS_DIR)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => JSON.parse(fs.readFileSync(path.join(CORPUS_DIR, name), "utf8")))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function reconstruct() {
  const objectRows = query(
    "SELECT id, type, schema_version, created_at, state, content_json, " +
    "attribution_json, provenance_json, publication_json, event_type, subject_ref " +
    "FROM canonical_objects ORDER BY id"
  );
  const relationshipRows = query(
    "SELECT source_id, ordinal, type, target_ref " +
    "FROM canonical_relationships ORDER BY source_id, ordinal"
  );

  const relationshipsBySource = new Map();
  for (const row of relationshipRows) {
    if (!relationshipsBySource.has(row.source_id)) relationshipsBySource.set(row.source_id, []);
    relationshipsBySource.get(row.source_id).push({
      type: row.type,
      target_ref: row.target_ref
    });
  }

  return objectRows.map((row) => {
    const record = {
      id: row.id,
      type: row.type,
      schema_version: Number(row.schema_version),
      created_at: row.created_at,
      state: row.state,
      content: JSON.parse(row.content_json),
      relationships: relationshipsBySource.get(row.id) || []
    };

    if (row.attribution_json !== null) record.attribution = JSON.parse(row.attribution_json);
    if (row.provenance_json !== null) record.provenance = JSON.parse(row.provenance_json);
    if (row.publication_json !== null) record.publication = JSON.parse(row.publication_json);
    if (row.event_type !== null) record.event_type = row.event_type;
    if (row.subject_ref !== null) record.subject_ref = row.subject_ref;

    return record;
  });
}

let seeded = false;

try {
  const counts = query(
    "SELECT (SELECT COUNT(*) FROM canonical_objects) AS object_count, " +
    "(SELECT COUNT(*) FROM canonical_relationships) AS relationship_count"
  );
  assert.strictEqual(counts.length, 1, "Expected one preflight count row");
  assert.strictEqual(Number(counts[0].object_count), 0,
    "Refusing remote verification because canonical_objects is not empty");
  assert.strictEqual(Number(counts[0].relationship_count), 0,
    "Refusing remote verification because canonical_relationships is not empty");

  const seedSql = run(process.execPath, [path.join(ROOT, "scripts", "generate-d1-seed.js")]);
  fs.writeFileSync(seedFile, seedSql, "utf8");

  wrangler([
    "d1", "execute", "hummingbird",
    "--remote",
    "--config", CONFIG,
    "--yes",
    "--file", seedFile
  ]);
  seeded = true;

  const exported = reconstruct();
  const expected = loadCorpus();
  assert.deepStrictEqual(exported, expected);

  console.log(`PASS: ${exported.length} canonical records round-trip through remote D1 without semantic loss`);
} finally {
  if (seeded) {
    execute("PRAGMA foreign_keys = ON; DELETE FROM canonical_relationships; DELETE FROM canonical_objects;");
    const remaining = query(
      "SELECT (SELECT COUNT(*) FROM canonical_objects) AS object_count, " +
      "(SELECT COUNT(*) FROM canonical_relationships) AS relationship_count"
    );
    if (remaining.length === 1 && Number(remaining[0].object_count) === 0 && Number(remaining[0].relationship_count) === 0) {
      console.log("PASS: remote verification records cleaned up; canonical tables are empty");
    } else {
      throw new Error("Remote verification cleanup did not return canonical tables to empty state");
    }
  }
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

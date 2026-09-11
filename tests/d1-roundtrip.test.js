// Phase 2B local D1 round-trip test.
// Applies real Wrangler D1 migrations to an isolated local database, imports
// the storage-independent reference corpus, reads it back through D1, and
// proves an equivalent canonical representation can be reconstructed.
"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const CONFIG = path.join(ROOT, "wrangler.d1.jsonc");
const CORPUS_DIR = path.join(ROOT, "fixtures", "canonical");
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hummingbird-d1-"));
const persistDir = path.join(tempRoot, "state");
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

function wrangler(args) {
  return run("npx", ["--no-install", "wrangler", ...args]);
}

function loadCorpus() {
  return fs.readdirSync(CORPUS_DIR)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => JSON.parse(fs.readFileSync(path.join(CORPUS_DIR, name), "utf8")))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function query(sql) {
  const stdout = wrangler([
    "d1", "execute", "hummingbird",
    "--local",
    "--persist-to", persistDir,
    "--config", CONFIG,
    "--json",
    "--command", sql
  ]);
  const parsed = JSON.parse(stdout);
  assert(Array.isArray(parsed) && parsed.length === 1, "D1 query should return one result set");
  assert.strictEqual(parsed[0].success, true, "D1 query should succeed");
  return parsed[0].results || [];
}

try {
  wrangler([
    "d1", "migrations", "apply", "hummingbird",
    "--local",
    "--persist-to", persistDir,
    "--config", CONFIG
  ]);

  const seedSql = run(process.execPath, [path.join(ROOT, "scripts", "generate-d1-seed.js")]);
  fs.writeFileSync(seedFile, seedSql);

  wrangler([
    "d1", "execute", "hummingbird",
    "--local",
    "--persist-to", persistDir,
    "--config", CONFIG,
    "--file", seedFile
  ]);

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

  const exported = objectRows.map((row) => {
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

  const expected = loadCorpus();
  assert.deepStrictEqual(exported, expected);
  console.log(`PASS: ${exported.length} canonical records round-trip through local D1 without semantic loss`);
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

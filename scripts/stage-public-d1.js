#!/usr/bin/env node
"use strict";

// Read-only Phase 2C steward tool. Reconstructs all non-draft canonical records
// from remote D1 into an ignored local staging directory for inspection. It
// does not mutate D1 and does not modify the deployable publication projection.

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const CONFIG = path.join(ROOT, "wrangler.d1.jsonc");
const WRANGLER = path.join(ROOT, "node_modules", "wrangler", "bin", "wrangler.js");
const STAGE_ROOT = path.join(ROOT, ".hummingbird-stage");
const STAGE = path.join(STAGE_ROOT, "canonical");

if (!fs.existsSync(WRANGLER)) {
  console.error("error: Wrangler is not installed. Run npm ci first.");
  process.exit(1);
}

function runWrangler(args) {
  return execFileSync(process.execPath, [WRANGLER, ...args], {
    cwd: ROOT,
    encoding: "utf8",
    env: { ...process.env, NO_D1_WARNING: "true" },
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function query(sql) {
  const stdout = runWrangler([
    "d1", "execute", "hummingbird",
    "--remote",
    "--config", CONFIG,
    "--json",
    "--command", sql,
  ]);
  const parsed = JSON.parse(stdout);
  assert(Array.isArray(parsed) && parsed.length === 1, "D1 query should return one result set");
  assert.strictEqual(parsed[0].success, true, "D1 query should succeed");
  return parsed[0].results || [];
}

function reconstruct() {
  const objectRows = query(
    "SELECT id, type, schema_version, created_at, state, content_json, " +
    "attribution_json, provenance_json, publication_json, event_type, subject_ref " +
    "FROM canonical_objects WHERE state != 'draft' ORDER BY created_at, id"
  );
  const relationshipRows = query(
    "SELECT r.source_id, r.ordinal, r.type, r.target_ref " +
    "FROM canonical_relationships r " +
    "JOIN canonical_objects o ON o.id = r.source_id " +
    "WHERE o.state != 'draft' ORDER BY r.source_id, r.ordinal"
  );

  const relationshipsBySource = new Map();
  for (const row of relationshipRows) {
    if (!relationshipsBySource.has(row.source_id)) relationshipsBySource.set(row.source_id, []);
    relationshipsBySource.get(row.source_id).push({ type: row.type, target_ref: row.target_ref });
  }

  return objectRows.map((row) => {
    const record = {
      id: row.id,
      type: row.type,
      schema_version: Number(row.schema_version),
      created_at: row.created_at,
      state: row.state,
      content: JSON.parse(row.content_json),
      relationships: relationshipsBySource.get(row.id) || [],
    };
    if (row.attribution_json !== null) record.attribution = JSON.parse(row.attribution_json);
    if (row.provenance_json !== null) record.provenance = JSON.parse(row.provenance_json);
    if (row.publication_json !== null) record.publication = JSON.parse(row.publication_json);
    if (row.event_type !== null) record.event_type = row.event_type;
    if (row.subject_ref !== null) record.subject_ref = row.subject_ref;
    return record;
  });
}

try {
  const records = reconstruct();
  fs.rmSync(STAGE_ROOT, { recursive: true, force: true });
  fs.mkdirSync(STAGE, { recursive: true });

  for (const record of records) {
    if (record.state === "draft") throw new Error(`refusing to stage draft record ${record.id}`);
    const file = `${encodeURIComponent(record.id)}.json`;
    fs.writeFileSync(path.join(STAGE, file), JSON.stringify(record, null, 2) + "\n", "utf8");
  }

  fs.writeFileSync(path.join(STAGE_ROOT, "manifest.json"), JSON.stringify({
    generated_at: new Date().toISOString(),
    source: "remote D1 canonical_objects/canonical_relationships",
    record_count: records.length,
    ids: records.map((record) => record.id),
  }, null, 2) + "\n", "utf8");

  console.log(`STAGED: ${records.length} non-draft canonical record(s) from remote D1`);
  console.log(`Review: ${path.relative(ROOT, STAGE_ROOT)}`);
  console.log("Nothing has been published or added to the deployable projection.");
} catch (error) {
  console.error(`error: ${error.message}`);
  process.exit(1);
}

"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const FORMAT = "hummingbird-canonical-backup";
const FORMAT_VERSION = 1;

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function reconstructCanonical(objectRows, relationshipRows) {
  const relationshipsBySource = new Map();
  for (const row of relationshipRows) {
    if (!relationshipsBySource.has(row.source_id)) relationshipsBySource.set(row.source_id, []);
    relationshipsBySource.get(row.source_id).push({
      type: row.type,
      target_ref: row.target_ref,
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
      relationships: relationshipsBySource.get(row.id) || [],
    };
    if (row.attribution_json !== null) record.attribution = JSON.parse(row.attribution_json);
    if (row.provenance_json !== null) record.provenance = JSON.parse(row.provenance_json);
    if (row.publication_json !== null) record.publication = JSON.parse(row.publication_json);
    if (row.event_type !== null) record.event_type = row.event_type;
    if (row.subject_ref !== null) record.subject_ref = row.subject_ref;
    return record;
  }).sort((a, b) => a.id.localeCompare(b.id));
}

function writeBundle(root, records, metadata = {}) {
  const canonicalDir = path.join(root, "canonical");
  fs.rmSync(root, { recursive: true, force: true });
  fs.mkdirSync(canonicalDir, { recursive: true });

  const entries = [];
  for (const record of records) {
    const file = `${encodeURIComponent(record.id)}.json`;
    const relativePath = `canonical/${file}`;
    const bytes = Buffer.from(`${JSON.stringify(record, null, 2)}\n`, "utf8");
    fs.writeFileSync(path.join(root, relativePath), bytes);
    entries.push({ id: record.id, path: relativePath, sha256: sha256(bytes) });
  }

  const manifest = {
    format: FORMAT,
    format_version: FORMAT_VERSION,
    created_at: new Date().toISOString(),
    canonical_schema_versions: [...new Set(records.map((record) => record.schema_version))].sort(),
    record_count: records.length,
    records: entries,
    ...metadata,
  };
  const digestInput = entries.map((entry) => `${entry.id}\n${entry.sha256}\n`).join("");
  manifest.bundle_sha256 = sha256(Buffer.from(digestInput, "utf8"));
  fs.writeFileSync(path.join(root, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return manifest;
}

function loadAndVerifyBundle(root) {
  const manifestPath = path.join(root, "manifest.json");
  if (!fs.existsSync(manifestPath)) throw new Error("backup manifest.json is missing");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (manifest.format !== FORMAT || manifest.format_version !== FORMAT_VERSION) {
    throw new Error(`unsupported backup format: ${manifest.format || "unknown"} v${manifest.format_version || "unknown"}`);
  }
  if (!Array.isArray(manifest.records) || manifest.record_count !== manifest.records.length) {
    throw new Error("backup manifest record count is inconsistent");
  }

  const seen = new Set();
  const records = [];
  for (const entry of manifest.records) {
    if (!entry || typeof entry.id !== "string" || typeof entry.path !== "string" || typeof entry.sha256 !== "string") {
      throw new Error("backup manifest contains an invalid record entry");
    }
    if (seen.has(entry.id)) throw new Error(`duplicate backup record id: ${entry.id}`);
    seen.add(entry.id);
    const full = path.resolve(root, entry.path);
    const safeRoot = path.resolve(root) + path.sep;
    if (!full.startsWith(safeRoot)) throw new Error(`backup record path escapes bundle: ${entry.path}`);
    if (!fs.existsSync(full)) throw new Error(`backup record file missing: ${entry.path}`);
    const bytes = fs.readFileSync(full);
    if (sha256(bytes) !== entry.sha256) throw new Error(`backup record hash mismatch: ${entry.id}`);
    const record = JSON.parse(bytes.toString("utf8"));
    if (record.id !== entry.id) throw new Error(`backup record id mismatch: ${entry.id}`);
    if (record.schema_version !== 1) throw new Error(`unsupported canonical schema version for ${entry.id}`);
    records.push(record);
  }

  records.sort((a, b) => a.id.localeCompare(b.id));
  const digestInput = manifest.records.map((entry) => `${entry.id}\n${entry.sha256}\n`).join("");
  if (sha256(Buffer.from(digestInput, "utf8")) !== manifest.bundle_sha256) {
    throw new Error("backup bundle digest mismatch");
  }
  return { manifest, records };
}

function sqlLiteral(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function recordsToSql(records) {
  const lines = ["PRAGMA foreign_keys = ON;", "BEGIN TRANSACTION;"];
  for (const record of records) {
    lines.push(
      "INSERT INTO canonical_objects " +
      "(id, type, schema_version, created_at, state, content_json, attribution_json, provenance_json, publication_json, event_type, subject_ref) VALUES (" +
      [
        record.id,
        record.type,
        record.schema_version,
        record.created_at,
        record.state,
        JSON.stringify(record.content),
        record.attribution === undefined ? null : JSON.stringify(record.attribution),
        record.provenance === undefined ? null : JSON.stringify(record.provenance),
        record.publication === undefined ? null : JSON.stringify(record.publication),
        record.event_type === undefined ? null : record.event_type,
        record.subject_ref === undefined ? null : record.subject_ref,
      ].map(sqlLiteral).join(", ") + ");"
    );
    (record.relationships || []).forEach((relationship, ordinal) => {
      lines.push(
        "INSERT INTO canonical_relationships (source_id, ordinal, type, target_ref) VALUES (" +
        [record.id, ordinal, relationship.type, relationship.target_ref].map(sqlLiteral).join(", ") + ");"
      );
    });
  }
  lines.push("COMMIT;");
  return `${lines.join("\n")}\n`;
}

module.exports = {
  FORMAT,
  FORMAT_VERSION,
  loadAndVerifyBundle,
  reconstructCanonical,
  recordsToSql,
  sha256,
  writeBundle,
};

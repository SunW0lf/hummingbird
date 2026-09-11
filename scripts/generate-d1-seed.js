#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CORPUS_DIR = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(ROOT, "fixtures", "canonical");

function sqlString(value) {
  if (value === undefined || value === null) return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function jsonSql(value) {
  if (value === undefined || value === null) return "NULL";
  return sqlString(JSON.stringify(value));
}

const files = fs.readdirSync(CORPUS_DIR)
  .filter((name) => name.endsWith(".json"))
  .sort();

const records = files.map((name) => {
  const file = path.join(CORPUS_DIR, name);
  return JSON.parse(fs.readFileSync(file, "utf8"));
}).sort((a, b) => a.id.localeCompare(b.id));

// Do not emit explicit BEGIN/COMMIT statements. Wrangler's D1 file-import path
// handles the import transaction, and Cloudflare's remote D1 import guidance
// requires SQLite dump transaction wrappers to be removed.
const lines = [
  "PRAGMA foreign_keys = ON;",
  "DELETE FROM canonical_relationships;",
  "DELETE FROM canonical_objects;"
];

for (const record of records) {
  lines.push(
    "INSERT INTO canonical_objects " +
    "(id, type, schema_version, created_at, state, content_json, attribution_json, provenance_json, publication_json, event_type, subject_ref) VALUES (" +
    [
      sqlString(record.id),
      sqlString(record.type),
      Number(record.schema_version),
      sqlString(record.created_at),
      sqlString(record.state),
      jsonSql(record.content),
      jsonSql(record.attribution),
      jsonSql(record.provenance),
      jsonSql(record.publication),
      sqlString(record.event_type),
      sqlString(record.subject_ref)
    ].join(", ") +
    ");"
  );
}

for (const record of records) {
  (record.relationships || []).forEach((relationship, ordinal) => {
    lines.push(
      "INSERT INTO canonical_relationships (source_id, ordinal, type, target_ref) VALUES (" +
      [
        sqlString(record.id),
        ordinal,
        sqlString(relationship.type),
        sqlString(relationship.target_ref)
      ].join(", ") +
      ");"
    );
  });
}

process.stdout.write(lines.join("\n") + "\n");

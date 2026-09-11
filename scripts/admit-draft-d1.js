#!/usr/bin/env node
"use strict";

// Steward-only Phase 2C admission tool. It admits exactly one reviewed v1
// contribution/proposal/need into remote D1 as DRAFT canonical memory.
// It deliberately cannot publish a record and never touches publication/.

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const CONFIG = path.join(ROOT, "wrangler.d1.jsonc");
const WRANGLER = path.join(ROOT, "node_modules", "wrangler", "bin", "wrangler.js");
const ALLOWED_TYPES = new Set(["contribution", "proposal", "need"]);
const RELATIONSHIP_TYPES = new Set([
  "responds_to", "references", "supports", "challenges", "supersedes",
  "duplicates", "derives_from", "summarizes", "implements",
]);
const ALLOWED_TOP_LEVEL = new Set([
  "id", "type", "schema_version", "created_at", "state", "content",
  "relationships", "attribution", "provenance",
]);
const FORBIDDEN_KEYS = new Set([
  "participant_id", "origin", "origin_category", "human_or_ai", "device_id",
  "wallet", "wallet_address", "account_id", "github_user_id", "source_ip",
  "ip_address", "rowid", "database_id", "d1_id",
]);

function usage() {
  console.error("usage: node scripts/admit-draft-d1.js <candidate.json> (--validate-only | --confirm-admission)");
}

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
    if (FORBIDDEN_KEYS.has(key)) throw new Error(`candidate contains forbidden field ${pointer}/${key}`);
    scanForbidden(child, `${pointer}/${key}`);
  }
}

function validate(record) {
  if (!isObject(record)) throw new Error("candidate must contain one JSON object");
  for (const field of ["id", "type", "schema_version", "created_at", "state", "content", "relationships"]) {
    if (!Object.prototype.hasOwnProperty.call(record, field)) throw new Error(`candidate is missing required field ${field}`);
  }
  for (const key of Object.keys(record)) {
    if (!ALLOWED_TOP_LEVEL.has(key)) throw new Error(`draft admission does not permit top-level field ${key}`);
  }
  if (typeof record.id !== "string" || record.id.trim() === "") throw new Error("id must be non-empty");
  if (!ALLOWED_TYPES.has(record.type)) throw new Error("first admission tool permits only contribution, proposal, or need");
  if (record.schema_version !== 1) throw new Error("schema_version must be 1");
  if (record.state !== "draft") throw new Error("admission tool only accepts state: draft");
  if (Number.isNaN(Date.parse(record.created_at))) throw new Error("created_at must be a parseable date-time");
  if (!isObject(record.content)) throw new Error("content must be an object");
  if (!Array.isArray(record.relationships)) throw new Error("relationships must be an array");
  record.relationships.forEach((relationship, index) => {
    if (!isObject(relationship)) throw new Error(`relationship ${index} must be an object`);
    if (Object.keys(relationship).some((key) => !["type", "target_ref"].includes(key))) {
      throw new Error(`relationship ${index} contains non-portable fields`);
    }
    if (!RELATIONSHIP_TYPES.has(relationship.type)) throw new Error(`relationship ${index} uses unsupported type`);
    if (typeof relationship.target_ref !== "string" || relationship.target_ref === "") {
      throw new Error(`relationship ${index} target_ref must be non-empty`);
    }
  });

  if (record.type === "contribution") {
    if (typeof record.content.body !== "string" || record.content.body === "") throw new Error("contribution body is required");
    if (typeof record.content.format !== "string" || record.content.format === "") throw new Error("contribution format is required");
  } else if (record.type === "proposal") {
    for (const field of ["title", "summary", "body"]) {
      if (typeof record.content[field] !== "string" || record.content[field] === "") throw new Error(`proposal ${field} is required`);
    }
  } else if (record.type === "need") {
    for (const field of ["title", "description"]) {
      if (typeof record.content[field] !== "string" || record.content[field] === "") throw new Error(`need ${field} is required`);
    }
  }
  scanForbidden(record);
}

function sqlString(value) {
  if (value === undefined || value === null) return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function jsonSql(value) {
  if (value === undefined || value === null) return "NULL";
  return sqlString(JSON.stringify(value));
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
  const parsed = JSON.parse(runWrangler([
    "d1", "execute", "hummingbird", "--remote", "--config", CONFIG,
    "--json", "--command", sql,
  ]));
  if (!Array.isArray(parsed) || parsed.length !== 1 || parsed[0].success !== true) {
    throw new Error("remote D1 query did not return a successful result set");
  }
  return parsed[0].results || [];
}

function seedSql(record) {
  const lines = ["PRAGMA foreign_keys = ON;"];
  lines.push(
    "INSERT INTO canonical_objects " +
    "(id, type, schema_version, created_at, state, content_json, attribution_json, provenance_json, publication_json, event_type, subject_ref) VALUES (" +
    [
      sqlString(record.id), sqlString(record.type), 1, sqlString(record.created_at), "'draft'",
      jsonSql(record.content), jsonSql(record.attribution), jsonSql(record.provenance),
      "NULL", "NULL", "NULL",
    ].join(", ") + ");"
  );
  record.relationships.forEach((relationship, ordinal) => {
    lines.push(
      "INSERT INTO canonical_relationships (source_id, ordinal, type, target_ref) VALUES (" +
      [sqlString(record.id), ordinal, sqlString(relationship.type), sqlString(relationship.target_ref)].join(", ") + ");"
    );
  });
  return lines.join("\n") + "\n";
}

const candidateArg = process.argv[2];
const validateOnly = process.argv.includes("--validate-only");
const confirmed = process.argv.includes("--confirm-admission");
if (!candidateArg || candidateArg.startsWith("--")) {
  usage();
  process.exit(2);
}
if (validateOnly === confirmed) {
  usage();
  console.error("error: choose exactly one of --validate-only or --confirm-admission");
  process.exit(2);
}
if (confirmed && !fs.existsSync(WRANGLER)) {
  console.error("error: Wrangler is not installed. Run npm ci first.");
  process.exit(1);
}

let tempRoot = null;
try {
  const candidatePath = path.resolve(candidateArg);
  const record = JSON.parse(fs.readFileSync(candidatePath, "utf8"));
  validate(record);

  console.log(`ADMISSION CANDIDATE: ${record.id}`);
  console.log(`type=${record.type} state=draft created_at=${record.created_at}`);
  if (record.provenance && record.provenance.source_ref) console.log(`source_ref=${record.provenance.source_ref}`);

  if (validateOnly) {
    console.log("VALID: candidate satisfies the guarded draft-admission contract; no remote access performed");
    process.exit(0);
  }

  const existing = query(`SELECT id, state FROM canonical_objects WHERE id = ${sqlString(record.id)} LIMIT 1`);
  if (existing.length) throw new Error(`canonical id ${record.id} already exists; admission is append/transition oriented, not overwrite`);

  tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hummingbird-admit-"));
  const sqlFile = path.join(tempRoot, "admit.sql");
  fs.writeFileSync(sqlFile, seedSql(record), "utf8");

  runWrangler([
    "d1", "execute", "hummingbird", "--remote", "--config", CONFIG,
    "--yes", "--file", sqlFile,
  ]);

  const verified = query(
    `SELECT id, type, state FROM canonical_objects WHERE id = ${sqlString(record.id)} LIMIT 1`
  );
  if (verified.length !== 1 || verified[0].state !== "draft" || verified[0].type !== record.type) {
    throw new Error("post-admission verification did not find the expected draft record");
  }

  console.log(`ADMITTED: ${record.id} is durable canonical D1 state in draft`);
  console.log("NOT PUBLISHED: no publication projection was changed and no governance status was granted");
} catch (error) {
  console.error(`error: ${error.message}`);
  process.exitCode = 1;
} finally {
  if (tempRoot) fs.rmSync(tempRoot, { recursive: true, force: true });
}

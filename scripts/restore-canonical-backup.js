#!/usr/bin/env node
"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { loadAndVerifyBundle, reconstructCanonical, recordsToSql } = require("./lib/canonical-backup");

const ROOT = path.join(__dirname, "..");
const CONFIG = path.join(ROOT, "wrangler.d1.jsonc");
const WRANGLER = path.join(ROOT, "node_modules", "wrangler", "bin", "wrangler.js");

function usage() {
  console.error("usage: ./scripts/restore BACKUP_DIR --validate-only");
  console.error("   or: ./scripts/restore BACKUP_DIR --local --persist-to DIR --confirm-restore");
}

function optionValue(args, name) {
  const index = args.indexOf(name);
  if (index === -1) return null;
  if (!args[index + 1]) throw new Error(`${name} requires a value`);
  return args[index + 1];
}

function runWrangler(args) {
  return execFileSync(process.execPath, [WRANGLER, ...args], {
    cwd: ROOT,
    encoding: "utf8",
    env: { ...process.env, NO_D1_WARNING: "true" },
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function main() {
  if (!fs.existsSync(WRANGLER)) throw new Error("Wrangler is not installed. Run npm ci first.");
  const args = process.argv.slice(2);
  const backupDir = args.find((arg) => !arg.startsWith("--"));
  if (!backupDir) {
    usage();
    throw new Error("backup directory is required");
  }

  if (args.includes("--remote")) {
    throw new Error("remote restore is deliberately disabled in Phase 2D-1; restore first to an isolated recovery database under the documented Phase 2D protocol");
  }

  const { manifest, records } = loadAndVerifyBundle(path.resolve(backupDir));
  if (args.includes("--validate-only")) {
    console.log(`VALID BACKUP: ${manifest.record_count} canonical record(s)`);
    console.log(`SHA-256: ${manifest.bundle_sha256}`);
    console.log("No database was modified.");
    return;
  }

  if (!args.includes("--local") || !args.includes("--confirm-restore")) {
    usage();
    throw new Error("local restore requires --local --persist-to DIR --confirm-restore");
  }
  const persistTo = optionValue(args, "--persist-to");
  if (!persistTo) throw new Error("local restore requires an explicit --persist-to directory");
  const persistDir = path.resolve(persistTo);

  function query(sql) {
    const stdout = runWrangler([
      "d1", "execute", "hummingbird",
      "--local", "--persist-to", persistDir,
      "--config", CONFIG,
      "--json", "--command", sql,
    ]);
    const parsed = JSON.parse(stdout);
    assert(Array.isArray(parsed) && parsed.length === 1, "D1 query should return one result set");
    assert.strictEqual(parsed[0].success, true, "D1 query should succeed");
    return parsed[0].results || [];
  }

  const objectCount = query("SELECT COUNT(*) AS count FROM canonical_objects");
  const relationshipCount = query("SELECT COUNT(*) AS count FROM canonical_relationships");
  if (Number(objectCount[0].count) !== 0 || Number(relationshipCount[0].count) !== 0) {
    throw new Error("restore target is not empty; refusing to overwrite canonical state");
  }

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hummingbird-restore-"));
  const sqlFile = path.join(tempRoot, "restore.sql");
  try {
    fs.writeFileSync(sqlFile, recordsToSql(records), "utf8");
    runWrangler([
      "d1", "execute", "hummingbird",
      "--local", "--persist-to", persistDir,
      "--config", CONFIG,
      "--file", sqlFile,
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
    const restored = reconstructCanonical(objectRows, relationshipRows);
    assert.deepStrictEqual(restored, records, "restored canonical records differ from backup bundle");
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }

  console.log(`RESTORED: ${records.length} canonical record(s) into isolated local D1`);
  console.log(`VERIFIED: restored canonical meaning matches backup bundle ${manifest.bundle_sha256}`);
  console.log("No remote database was modified.");
}

try {
  main();
} catch (error) {
  console.error(`error: ${error.message}`);
  process.exit(1);
}

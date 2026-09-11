#!/usr/bin/env node
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { reconstructCanonical, writeBundle } = require("./lib/canonical-backup");

const ROOT = path.join(__dirname, "..");
const CONFIG = path.join(ROOT, "wrangler.d1.jsonc");
const WRANGLER = path.join(ROOT, "node_modules", "wrangler", "bin", "wrangler.js");

function usage() {
  console.error("usage: ./scripts/backup (--local | --remote) [--persist-to DIR] [--output DIR]");
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
  const local = args.includes("--local");
  const remote = args.includes("--remote");
  if (local === remote) {
    usage();
    throw new Error("choose exactly one backup source: --local or --remote");
  }

  const persistTo = optionValue(args, "--persist-to");
  if (remote && persistTo) throw new Error("--persist-to is valid only with --local");
  const output = optionValue(args, "--output") || path.join(
    ROOT,
    ".hummingbird-backups",
    new Date().toISOString().replace(/[:.]/g, "-")
  );

  const modeArgs = local ? ["--local"] : ["--remote"];
  if (local && persistTo) modeArgs.push("--persist-to", path.resolve(persistTo));

  function query(sql) {
    const stdout = runWrangler([
      "d1", "execute", "hummingbird",
      ...modeArgs,
      "--config", CONFIG,
      "--json",
      "--command", sql,
    ]);
    const parsed = JSON.parse(stdout);
    assert(Array.isArray(parsed) && parsed.length === 1, "D1 query should return one result set");
    assert.strictEqual(parsed[0].success, true, "D1 query should succeed");
    return parsed[0].results || [];
  }

  const objectRows = query(
    "SELECT id, type, schema_version, created_at, state, content_json, " +
    "attribution_json, provenance_json, publication_json, event_type, subject_ref " +
    "FROM canonical_objects ORDER BY id"
  );
  const relationshipRows = query(
    "SELECT source_id, ordinal, type, target_ref " +
    "FROM canonical_relationships ORDER BY source_id, ordinal"
  );

  const records = reconstructCanonical(objectRows, relationshipRows);
  const manifest = writeBundle(path.resolve(output), records, {
    source_kind: "canonical-d1-export",
    source_mode: local ? "local" : "remote",
    authority_note: "This portable bundle preserves canonical Hummingbird meaning; provider database IDs and row IDs are not required for restoration.",
  });

  console.log(`BACKUP: ${manifest.record_count} canonical record(s)`);
  console.log(`BUNDLE: ${path.resolve(output)}`);
  console.log(`SHA-256: ${manifest.bundle_sha256}`);
  if (remote) {
    console.log("REMOTE READ ONLY: no D1 rows were modified.");
    console.log("Store this bundle outside the public repository and outside the live D1 service.");
  }
}

try {
  main();
} catch (error) {
  console.error(`error: ${error.message}`);
  process.exit(1);
}

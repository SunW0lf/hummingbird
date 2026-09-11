#!/usr/bin/env node
"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const {
  loadAndVerifyBundle,
  reconstructCanonical,
  recordsToSql,
  writeBundle,
} = require("./lib/canonical-backup");

const ROOT = path.join(__dirname, "..");
const PRODUCTION_CONFIG = path.join(ROOT, "wrangler.d1.jsonc");
const MIGRATIONS_DIR = path.join(ROOT, "migrations");
const PUBLICATION_DIR = path.join(ROOT, "publication", "canonical");
const BASELINE_DIST = path.join(ROOT, "dist");
const PUBLIC_STATES = new Set(["published", "corrected", "superseded", "withdrawn", "archived"]);

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    env: { ...process.env, ...options.env },
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function loadJsonRecords(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => JSON.parse(fs.readFileSync(path.join(dir, name), "utf8")))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function assertPublicArtifactSafe(records) {
  const publication = loadJsonRecords(PUBLICATION_DIR);
  for (const record of records) {
    if (!PUBLIC_STATES.has(record.state)) {
      throw new Error(`canonical backup contains non-public state ${record.state} for ${record.id}; refusing public-repository artifact retention`);
    }
  }
  assert.deepStrictEqual(
    records,
    publication,
    "production canonical state is not exactly equivalent to the already-public publication/canonical projection; refusing artifact retention"
  );
}

function jsonFileInventory(dir) {
  if (!fs.existsSync(dir)) throw new Error(`projection directory missing: ${dir}`);
  const out = new Map();
  for (const name of fs.readdirSync(dir).filter((entry) => entry.endsWith(".json")).sort()) {
    out.set(name, fs.readFileSync(path.join(dir, name)));
  }
  return out;
}

function assertJsonProjectionEqual(expectedDir, actualDir) {
  const expected = jsonFileInventory(expectedDir);
  const actual = jsonFileInventory(actualDir);
  assert.deepStrictEqual([...actual.keys()], [...expected.keys()], "recovered public JSON projection has different files");
  for (const [name, expectedBytes] of expected) {
    assert(actual.get(name).equals(expectedBytes), `recovered public JSON projection differs: ${name}`);
  }
}

async function cloudflareApi(method, pathname, body) {
  const token = requiredEnv("CLOUDFLARE_API_TOKEN");
  const response = await fetch(`https://api.cloudflare.com/client/v4${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`Cloudflare API ${method} ${pathname} returned non-JSON status ${response.status}`);
  }
  if (!response.ok || payload.success !== true) {
    const messages = [...(payload.errors || []), ...(payload.messages || [])]
      .map((item) => item && item.message)
      .filter(Boolean)
      .join("; ");
    throw new Error(`Cloudflare API ${method} ${pathname} failed (${response.status})${messages ? `: ${messages}` : ""}`);
  }
  return payload.result;
}

async function d1Query(accountId, databaseId, sql) {
  const result = await cloudflareApi(
    "POST",
    `/accounts/${accountId}/d1/database/${databaseId}/query`,
    { sql }
  );
  if (!Array.isArray(result) || result.length === 0) {
    throw new Error("D1 query returned no result sets");
  }
  for (const [index, item] of result.entries()) {
    if (!item || item.success !== true) throw new Error(`D1 query result set ${index} did not succeed`);
  }
  return result;
}

async function d1Rows(accountId, databaseId, sql) {
  const result = await d1Query(accountId, databaseId, sql);
  if (result.length !== 1) throw new Error(`expected one D1 result set, received ${result.length}`);
  return result[0].results || [];
}

function safeRecoveryName() {
  const runId = String(process.env.GITHUB_RUN_ID || "manual").replace(/[^0-9A-Za-z-]/g, "").slice(-18);
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).slice(2, 8);
  return `hummingbird-recovery-${stamp}-${runId}-${random}`.slice(0, 63);
}

function migrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) throw new Error("migrations directory is missing");
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter((name) => /^\d+.*\.sql$/.test(name))
    .sort();
  if (files.length === 0) throw new Error("no repository-controlled D1 migrations found");
  return files;
}

function restoreBatchSql(records) {
  // Cloudflare's D1 /query endpoint executes semicolon-separated statements as
  // a batch. Remove the explicit BEGIN/COMMIT wrapper generated for file-based
  // local restores so the remote API owns the batch transaction boundary.
  return recordsToSql(records)
    .split("\n")
    .filter((line) => line !== "BEGIN TRANSACTION;" && line !== "COMMIT;")
    .join("\n");
}

async function main() {
  if (!fs.existsSync(path.join(BASELINE_DIST, "records", "index.json"))) {
    throw new Error("baseline dist/ public record projection is missing; run ./scripts/build before the drill");
  }

  requiredEnv("CLOUDFLARE_API_TOKEN");
  const accountId = requiredEnv("CLOUDFLARE_ACCOUNT_ID");
  const artifactDir = process.env.HUMMINGBIRD_RECOVERY_ARTIFACT_DIR
    ? path.resolve(process.env.HUMMINGBIRD_RECOVERY_ARTIFACT_DIR)
    : path.join(ROOT, ".hummingbird-backups", `phase2d-remote-drill-${Date.now()}`);

  const productionConfig = JSON.parse(fs.readFileSync(PRODUCTION_CONFIG, "utf8"));
  const productionDatabaseId = productionConfig.d1_databases?.[0]?.database_id;
  if (!productionDatabaseId) throw new Error("production D1 database_id is missing from wrangler.d1.jsonc");

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hummingbird-remote-recovery-"));
  const recoveredPublication = path.join(tempRoot, "publication", "canonical");
  const recoveredDist = path.join(tempRoot, "dist");
  let recoveryId = null;
  let recoveryName = null;
  let primaryError = null;

  try {
    // Account-owned API tokens are service-principal credentials. Use the D1
    // REST API directly for the remote drill rather than depending on Wrangler's
    // user-token authentication path. Production receives SELECT statements only.
    const productionObjects = await d1Rows(
      accountId,
      productionDatabaseId,
      "SELECT id, type, schema_version, created_at, state, content_json, attribution_json, provenance_json, publication_json, event_type, subject_ref FROM canonical_objects ORDER BY id"
    );
    const productionRelationships = await d1Rows(
      accountId,
      productionDatabaseId,
      "SELECT source_id, ordinal, type, target_ref FROM canonical_relationships ORDER BY source_id, ordinal"
    );
    const productionRecords = reconstructCanonical(productionObjects, productionRelationships);
    const manifest = writeBundle(artifactDir, productionRecords, {
      source: "remote production D1 canonical_objects/canonical_relationships via read-only REST query",
    });
    const { records } = loadAndVerifyBundle(artifactDir);
    assertPublicArtifactSafe(records);
    console.log(`BACKUP_VERIFIED: ${records.length} canonical record(s); bundle ${manifest.bundle_sha256}`);
    console.log("ARTIFACT_SAFETY: canonical backup exactly matches already-public publication/canonical state");

    recoveryName = safeRecoveryName();
    const created = await cloudflareApi(
      "POST",
      `/accounts/${accountId}/d1/database`,
      { name: recoveryName, read_replication: { mode: "disabled" } }
    );
    recoveryId = created?.uuid;
    if (!recoveryId) throw new Error("Cloudflare D1 create response did not contain a recovery database UUID");
    if (recoveryId === productionDatabaseId) throw new Error("recovery database unexpectedly equals production database; refusing all writes");
    console.log(`RECOVERY_DATABASE: created disposable database ${recoveryName}`);

    for (const file of migrationFiles()) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
      await d1Query(accountId, recoveryId, sql);
      console.log(`RECOVERY_MIGRATION: applied ${file}`);
    }

    const beforeObjects = await d1Rows(accountId, recoveryId, "SELECT COUNT(*) AS count FROM canonical_objects");
    const beforeRelationships = await d1Rows(accountId, recoveryId, "SELECT COUNT(*) AS count FROM canonical_relationships");
    assert.strictEqual(Number(beforeObjects[0]?.count), 0, "recovery target canonical_objects is not empty after migrations");
    assert.strictEqual(Number(beforeRelationships[0]?.count), 0, "recovery target canonical_relationships is not empty after migrations");
    console.log("RECOVERY_MIGRATIONS: repository migration SQL reproduced an empty compatible schema");

    await d1Query(accountId, recoveryId, restoreBatchSql(records));

    const objectRows = await d1Rows(
      accountId,
      recoveryId,
      "SELECT id, type, schema_version, created_at, state, content_json, attribution_json, provenance_json, publication_json, event_type, subject_ref FROM canonical_objects ORDER BY id"
    );
    const relationshipRows = await d1Rows(
      accountId,
      recoveryId,
      "SELECT source_id, ordinal, type, target_ref FROM canonical_relationships ORDER BY source_id, ordinal"
    );
    const restored = reconstructCanonical(objectRows, relationshipRows);
    assert.deepStrictEqual(restored, records, "remote restored canonical meaning differs from production backup");
    console.log("SEMANTIC_EQUALITY: restored canonical state deep-equals production backup");

    fs.mkdirSync(recoveredPublication, { recursive: true });
    for (const record of restored.filter((record) => PUBLIC_STATES.has(record.state))) {
      fs.writeFileSync(
        path.join(recoveredPublication, `${encodeURIComponent(record.id)}.json`),
        `${JSON.stringify(record, null, 2)}\n`,
        "utf8"
      );
    }
    fs.mkdirSync(recoveredDist, { recursive: true });
    run(process.execPath, [path.join(ROOT, "scripts", "render-public-records.js")], {
      env: {
        HUMMINGBIRD_PUBLICATION_SOURCE: recoveredPublication,
        HUMMINGBIRD_DIST_DIR: recoveredDist,
      },
    });
    assertJsonProjectionEqual(
      path.join(BASELINE_DIST, "records"),
      path.join(recoveredDist, "records")
    );
    console.log("PUBLIC_PROJECTION_EQUALITY: recovered canonical state rebuilds the expected public JSON projection");
    console.log("PHASE2D_REMOTE_RECOVERY_DRILL: SUCCESS");
  } catch (error) {
    primaryError = error;
  } finally {
    if (recoveryId) {
      try {
        await cloudflareApi("DELETE", `/accounts/${accountId}/d1/database/${recoveryId}`);
        console.log(`RECOVERY_DATABASE: deleted disposable database ${recoveryName}`);
      } catch (cleanupError) {
        console.error(`RECOVERY_DATABASE_CLEANUP_FAILED: ${recoveryName}: ${cleanupError.message}`);
        if (!primaryError) primaryError = cleanupError;
      }
    }
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }

  if (primaryError) throw primaryError;
}

main().catch((error) => {
  console.error(`error: ${error.message}`);
  process.exit(1);
});

// Phase 2D recovery contract test.
// Proves a portable canonical bundle can be exported from one isolated local D1,
// hash-verified, restored into a separately migrated empty D1, and reconstructed
// with identical institutional meaning. No remote provider state is touched.
"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { reconstructCanonical } = require("../scripts/lib/canonical-backup");

const ROOT = path.join(__dirname, "..");
const CONFIG = path.join(ROOT, "wrangler.d1.jsonc");
const CORPUS_DIR = path.join(ROOT, "fixtures", "canonical");
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hummingbird-recovery-"));
const sourcePersist = path.join(tempRoot, "source");
const targetPersist = path.join(tempRoot, "target");
const backupDir = path.join(tempRoot, "backup");
const seedFile = path.join(tempRoot, "seed.sql");

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    env: { ...process.env, NO_D1_WARNING: "true" },
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
}

function wrangler(args) {
  return run("npx", ["--no-install", "wrangler", ...args]);
}

function query(persistDir, sql) {
  const stdout = wrangler([
    "d1", "execute", "hummingbird",
    "--local", "--persist-to", persistDir,
    "--config", CONFIG,
    "--json", "--command", sql,
  ]);
  const parsed = JSON.parse(stdout);
  assert(Array.isArray(parsed) && parsed.length === 1);
  assert.strictEqual(parsed[0].success, true);
  return parsed[0].results || [];
}

function loadCorpus() {
  return fs.readdirSync(CORPUS_DIR)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => JSON.parse(fs.readFileSync(path.join(CORPUS_DIR, name), "utf8")))
    .sort((a, b) => a.id.localeCompare(b.id));
}

try {
  for (const persistDir of [sourcePersist, targetPersist]) {
    wrangler([
      "d1", "migrations", "apply", "hummingbird",
      "--local", "--persist-to", persistDir,
      "--config", CONFIG,
    ]);
  }

  const seedSql = run(process.execPath, [path.join(ROOT, "scripts", "generate-d1-seed.js")]);
  fs.writeFileSync(seedFile, seedSql);
  wrangler([
    "d1", "execute", "hummingbird",
    "--local", "--persist-to", sourcePersist,
    "--config", CONFIG,
    "--file", seedFile,
  ]);

  const backupOutput = run(process.execPath, [
    path.join(ROOT, "scripts", "export-canonical-backup.js"),
    "--local", "--persist-to", sourcePersist,
    "--output", backupDir,
  ]);
  assert(backupOutput.includes("BACKUP: 4 canonical record(s)"));
  assert(fs.existsSync(path.join(backupDir, "manifest.json")));

  const validationOutput = run(process.execPath, [
    path.join(ROOT, "scripts", "restore-canonical-backup.js"),
    backupDir, "--validate-only",
  ]);
  assert(validationOutput.includes("VALID BACKUP: 4 canonical record(s)"));

  const restoreOutput = run(process.execPath, [
    path.join(ROOT, "scripts", "restore-canonical-backup.js"),
    backupDir,
    "--local", "--persist-to", targetPersist,
    "--confirm-restore",
  ]);
  assert(restoreOutput.includes("RESTORED: 4 canonical record(s)"));
  assert(restoreOutput.includes("No remote database was modified."));

  const objectRows = query(targetPersist,
    "SELECT id, type, schema_version, created_at, state, content_json, " +
    "attribution_json, provenance_json, publication_json, event_type, subject_ref " +
    "FROM canonical_objects ORDER BY id"
  );
  const relationshipRows = query(targetPersist,
    "SELECT source_id, ordinal, type, target_ref FROM canonical_relationships ORDER BY source_id, ordinal"
  );
  assert.deepStrictEqual(reconstructCanonical(objectRows, relationshipRows), loadCorpus());

  assert.throws(() => run(process.execPath, [
    path.join(ROOT, "scripts", "restore-canonical-backup.js"),
    backupDir,
    "--local", "--persist-to", targetPersist,
    "--confirm-restore",
  ]), /restore target is not empty/);

  assert.throws(() => run(process.execPath, [
    path.join(ROOT, "scripts", "restore-canonical-backup.js"),
    backupDir, "--remote", "--confirm-restore",
  ]), /remote restore is deliberately disabled/);

  console.log("PASS: portable canonical backup validates and restores into an isolated empty D1 with semantic equality");
  console.log("PASS: recovery tooling refuses non-empty targets and remote restore during Phase 2D-1");
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

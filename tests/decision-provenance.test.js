// Verifies that the public Decisions surface exposes truthful, static source
// provenance and proposal-shape documentation without inventing a write API.
"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");
let failures = 0;

function fail(message) {
  failures += 1;
  console.error(`FAIL: ${message}`);
}

function pass(message) {
  console.log(`PASS: ${message}`);
}

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function git(args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim().toLowerCase();
}

const manifestPath = path.join(DIST, "decisions", "index.json");
const proposalSchemaPath = path.join(DIST, "decisions", "proposal-schema.json");
const decisionsPagePath = path.join(DIST, "decisions.html");

for (const required of [manifestPath, proposalSchemaPath, decisionsPagePath]) {
  if (!fs.existsSync(required)) fail(`${path.relative(DIST, required)} is missing from dist/`);
}

if (failures === 0) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const decisionsPage = fs.readFileSync(decisionsPagePath, "utf8");

  if (manifest.schema_version !== 1) fail("decision provenance index schema_version is not 1");
  if (!/^[0-9a-f]{40}$/.test(manifest.generated_from_build_commit || "")) {
    fail("decision provenance index lacks a full build commit");
  }
  if (!Array.isArray(manifest.decisions) || manifest.decisions.length < 15) {
    fail("decision provenance index does not contain the public ADR set");
  }

  for (const decision of manifest.decisions || []) {
    const sourcePath = path.join(ROOT, decision.source_path || "");
    const rawPath = path.join(DIST, String(decision.markdown || "").replace(/^\/+/, ""));
    const detailPath = path.join(DIST, `${String(decision.html || "").replace(/^\/+/, "")}.html`);

    if (!/^[0-9]{4}$/.test(decision.adr_id || "")) fail(`${decision.slug}: invalid adr_id`);
    if (!/^[0-9a-f]{40}$/.test(decision.source_commit || "")) fail(`${decision.slug}: invalid source_commit`);
    if (!/^[0-9a-f]{64}$/.test(decision.source_sha256 || "")) fail(`${decision.slug}: invalid source_sha256`);
    if (!fs.existsSync(sourcePath)) fail(`${decision.slug}: source path missing from repository`);
    if (!fs.existsSync(rawPath)) fail(`${decision.slug}: raw Markdown missing from public build`);
    if (!fs.existsSync(detailPath)) fail(`${decision.slug}: HTML detail missing from public build`);
    if (!String(decision.immutable_source_url || "").includes(`/blob/${decision.source_commit}/${decision.source_path}`)) {
      fail(`${decision.slug}: immutable source URL is not bound to source commit/path`);
    }

    if (fs.existsSync(sourcePath) && fs.existsSync(rawPath)) {
      const sourceBytes = fs.readFileSync(sourcePath);
      const rawBytes = fs.readFileSync(rawPath);
      if (!sourceBytes.equals(rawBytes)) fail(`${decision.slug}: public raw Markdown differs from canonical source bytes`);
      if (sha256(sourceBytes) !== decision.source_sha256) fail(`${decision.slug}: SHA-256 does not match canonical source bytes`);

      const expectedSourceCommit = git(["log", "-1", "--format=%H", "--", decision.source_path]);
      if (expectedSourceCommit !== decision.source_commit) {
        fail(`${decision.slug}: source_commit is not the last commit that changed the canonical source`);
      }
    }

    if (fs.existsSync(detailPath)) {
      const detail = fs.readFileSync(detailPath, "utf8");
      const rawHref = decision.markdown;
      if (!detail.includes(`rel="alternate" type="text/markdown" href="${rawHref}"`)) {
        fail(`${decision.slug}: detail page does not advertise raw Markdown as an alternate representation`);
      }
      if (!detail.includes(`name="hummingbird-source-commit" content="${decision.source_commit}"`)) {
        fail(`${decision.slug}: detail page lacks full source commit metadata`);
      }
      if (!detail.includes(`name="hummingbird-source-sha256" content="${decision.source_sha256}"`)) {
        fail(`${decision.slug}: detail page lacks source SHA-256 metadata`);
      }
    }

    for (const attribute of [
      `data-adr-id="${decision.adr_id}"`,
      `data-source-commit="${decision.source_commit}"`,
      `data-source-sha256="${decision.source_sha256}"`,
      `data-source-path="${decision.source_path}"`,
    ]) {
      if (!decisionsPage.includes(attribute)) fail(`${decision.slug}: Decisions index lacks ${attribute}`);
    }
  }

  pass("Public ADR provenance binds source path, source commit, source bytes, and alternate Markdown representation");

  const schema = JSON.parse(fs.readFileSync(proposalSchemaPath, "utf8"));
  const requiredFields = [
    "title",
    "context",
    "decision",
    "consequences",
    "alternatives_considered",
    "affected_principles",
  ];
  if (JSON.stringify(schema.required) !== JSON.stringify(requiredFields)) {
    fail("ADR proposal schema required fields changed unexpectedly");
  }
  for (const forbidden of ["proof-of-thought", "proof_of_thought", "origin", "participant_type"]) {
    if (JSON.stringify(schema).includes(forbidden)) fail(`ADR proposal schema contains forbidden field/concept: ${forbidden}`);
  }
  if (!decisionsPage.includes('id="propose-adr"')) fail("Decisions page lacks proposal-contract section");
  if (!decisionsPage.includes("decisions/proposal-schema.json")) fail("Decisions page does not expose proposal schema");
  if (!decisionsPage.includes("Seed Bank")) fail("Decisions page does not route proposal-shaped material through Seed Bank");
  if (/<form\b/i.test(decisionsPage)) fail("Decisions page exposes a form even though no ADR submission backend exists");
  if (/action=["']\/api\/propose/i.test(decisionsPage)) fail("Decisions page advertises nonexistent /api/propose endpoint");

  pass("ADR proposal contract is static documentation, origin-neutral, and does not invent a write API");

  const headers = fs.readFileSync(path.join(DIST, "_headers"), "utf8");
  if (!headers.includes("/decisions/index.json") || !headers.includes("Content-Type: application/json; charset=utf-8")) {
    fail("decision provenance manifest lacks explicit JSON MIME policy");
  }
  if (!headers.includes("/decisions/proposal-schema.json") || !headers.includes("Content-Type: application/schema+json; charset=utf-8")) {
    fail("ADR proposal schema lacks explicit schema+json MIME policy");
  }

  const llms = fs.readFileSync(path.join(DIST, "llms.txt"), "utf8");
  for (const marker of [
    "https://datum.quest/decisions/index.json",
    "https://datum.quest/decisions/proposal-schema.json",
    "0015-standards-based-representation-discovery-and-provenance",
  ]) {
    if (!llms.includes(marker)) fail(`llms.txt is missing decision-discovery marker: ${marker}`);
  }
  pass("Machine discovery exposes static provenance and proposal-contract representations");
}

if (failures > 0) {
  console.error(`\n${failures} decision-provenance check(s) failed.`);
  process.exit(1);
}

console.log("\nAll decision provenance/representation checks passed.");

"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const PREPARE = path.join(ROOT, "scripts", "prepare-offer-candidates.mjs");
const VALIDATOR = path.join(ROOT, "scripts", "validate-canonical-candidate.js");
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hummingbird-offer-candidates-"));

try {
  const packet = {
    version: 2,
    observed_at: "2026-09-12T12:00:00Z",
    unresolved_count: 3,
    groups: [
      {
        body: "Make the commons easier to revisit without turning it into an engagement feed.",
        count: 2,
        members: [
          { id: "offer-a", state: "grouped", reference_url: null, question_id: null, received_at: "2026-09-12T10:00:00Z", expires_at: "2026-10-12T10:00:00Z" },
          { id: "offer-b", state: "grouped", reference_url: null, question_id: null, received_at: "2026-09-12T10:05:00Z", expires_at: "2026-10-12T10:05:00Z" }
        ]
      },
      {
        body: "Keep quiet observation first-class.",
        count: 1,
        members: [
          { id: "offer-c", state: "received", reference_url: null, question_id: null, received_at: "2026-09-12T11:00:00Z", expires_at: "2026-10-12T11:00:00Z" }
        ]
      }
    ]
  };

  const packetPath = path.join(tempRoot, "review.json");
  const outputDir = path.join(tempRoot, "candidates");
  fs.writeFileSync(packetPath, JSON.stringify(packet), "utf8");

  const prepared = spawnSync(process.execPath, [PREPARE, packetPath, "--output-dir", outputDir], {
    cwd: ROOT,
    encoding: "utf8",
  });
  assert.strictEqual(prepared.status, 0, prepared.stderr || prepared.stdout);
  assert.match(prepared.stdout, /Prepared 2 validated non-canonical candidate envelope/);
  assert.match(prepared.stdout, /NO CANONICAL MUTATION/);

  const manifest = JSON.parse(fs.readFileSync(path.join(outputDir, "manifest.json"), "utf8"));
  assert.strictEqual(manifest.unresolved_count, 3);
  assert.strictEqual(manifest.candidate_count, 2);
  assert.strictEqual(manifest.authority, "candidate_only");
  assert.strictEqual(manifest.candidates.length, 2);

  const candidates = manifest.candidates.map((name) => JSON.parse(fs.readFileSync(path.join(outputDir, name), "utf8")));
  const grouped = candidates.find((candidate) => candidate.sources.length === 2);
  assert(grouped, "exact duplicate group should become one candidate with two source references");
  assert.strictEqual(grouped.derivation.method, "deterministic_transform");
  assert.strictEqual(grouped.derivation.machine_assisted, false);
  assert.strictEqual(grouped.derivation.source_count, 2);
  assert.strictEqual(grouped.admission.status, "candidate_only");
  assert.strictEqual(grouped.admission.requires_explicit_admission, true);
  assert(!JSON.stringify(grouped).includes("vote"), "duplicate count must not become voting weight");

  for (const filename of manifest.candidates) {
    const validated = spawnSync(process.execPath, [VALIDATOR, path.join(outputDir, filename)], {
      cwd: ROOT,
      encoding: "utf8",
    });
    assert.strictEqual(validated.status, 0, validated.stderr || validated.stdout);
  }
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

console.log("PASS: private review packets can deterministically produce validated candidate envelopes without canonical mutation");

"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const VALIDATOR = path.join(ROOT, "scripts", "validate-canonical-candidate.js");
const FIXTURE = path.join(ROOT, "fixtures", "candidates", "example-visible-consequence.json");

function run(file) {
  return spawnSync(process.execPath, [VALIDATOR, file], {
    cwd: ROOT,
    encoding: "utf8",
  });
}

const good = run(FIXTURE);
assert.strictEqual(good.status, 0, good.stderr || good.stdout);
assert.match(good.stdout, /VALID CANDIDATE:/);
assert.match(good.stdout, /NO AUTHORITY GRANTED:/);

const original = JSON.parse(fs.readFileSync(FIXTURE, "utf8"));
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hummingbird-candidate-test-"));
try {
  const selfAdmitting = structuredClone(original);
  selfAdmitting.admission.requires_explicit_admission = false;
  const selfAdmittingPath = path.join(tempRoot, "self-admitting.json");
  fs.writeFileSync(selfAdmittingPath, JSON.stringify(selfAdmitting), "utf8");
  const rejectedAuthority = run(selfAdmittingPath);
  assert.notStrictEqual(rejectedAuthority.status, 0, "candidate must not be able to authorize its own admission");

  const leaking = structuredClone(original);
  leaking.sources[0].receipt_secret = "must-never-cross-this-boundary";
  const leakingPath = path.join(tempRoot, "leaking.json");
  fs.writeFileSync(leakingPath, JSON.stringify(leaking), "utf8");
  const rejectedLeak = run(leakingPath);
  assert.notStrictEqual(rejectedLeak.status, 0, "candidate must reject receipt secrets and unsupported source metadata");
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

console.log("PASS: candidate envelopes are machine-validatable but cannot self-admit or carry receipt secrets");

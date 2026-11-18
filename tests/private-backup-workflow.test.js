// Static safety contract for ordinary private canonical-backup retention.
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const workflow = fs.readFileSync(path.join(
  __dirname, "..", ".github", "workflows", "phase2d-private-backup.yml"
), "utf8");

assert.match(workflow, /workflow_dispatch:/, "private backup must retain a manual trigger");
assert.match(workflow, /inputs\.confirmation == 'retain private canonical backup'/,
  "manual private backup must retain the explicit confirmation phrase");
assert.match(workflow, /schedule:/,
  "ordinary private backup should run on a repository-controlled schedule");
assert.match(workflow, /cron:\s*["']17 11 \* \* \*["']/,
  "scheduled backup cadence must remain explicit and reviewable");
assert.match(workflow, /github\.event_name == 'schedule'/,
  "scheduled runs must be explicitly admitted by the job guard");
assert.match(workflow, /https:\/\/github\.com\/SunW0lf\/hummingbird-backups\.git/,
  "ciphertext must go only to the dedicated private destination");
assert.match(workflow, /HUMMINGBIRD_BACKUP_REPOSITORY_TOKEN/,
  "destination access must use its dedicated credential");
assert.match(workflow, /HUMMINGBIRD_BACKUP_AGE_RECIPIENT/,
  "encryption must use a separately configured public recipient");
assert.match(workflow, /\.\/scripts\/backup --remote/,
  "workflow must use the portable read-only exporter");
assert.match(workflow, /\.\/scripts\/restore .* --validate-only/,
  "plaintext bundle must be validated before retention");
assert.match(workflow, /age --recipient/,
  "bundle must be public-key encrypted before transfer");
assert.match(workflow, /sha256sum .*\.sha256/,
  "retained ciphertext must have a transport checksum");
assert.match(workflow, /rm -rf "\$plain_dir"/,
  "plaintext must be removed from the runner before commit");
assert.doesNotMatch(workflow, /upload-artifact/,
  "ordinary private backups must not use public-repository Actions artifacts");
assert.doesNotMatch(workflow, /pull_request:|push:/,
  "backup retention must not run merely because source code changed");

console.log("PASS: private backup retention is scheduled, encrypted, minimal, and independently scoped");

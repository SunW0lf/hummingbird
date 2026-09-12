#!/usr/bin/env node
import fs from "node:fs";
import assert from "node:assert/strict";

const script = fs.readFileSync("scripts/observe-offer-buffer.mjs", "utf8");
const workflow = fs.readFileSync(".github/workflows/phase2e-offer-observer.yml", "utf8");

for (const forbidden of ["body", "reference_url", "receipt_hash", "content_sha256", "offer_id"]) {
  assert(!script.includes(forbidden), `observer must not read or emit ${forbidden}`);
}

assert(script.includes("state IN ('received','grouped')"), "observer should only flag unreviewed active offer states");
assert(script.includes("GITHUB_OUTPUT"), "observer should communicate only a boolean workflow output");
assert(workflow.includes('cron: "23 * * * *"'), "observer should run hourly");
assert(workflow.includes("permissions:\n  contents: read"), "observer workflow should remain read-only in GitHub");
assert(workflow.includes("Offer review needed"), "observer workflow should expose a clear beacon state");
assert(!workflow.includes("issues: write"), "observer must not create public GitHub issues");
assert(!workflow.includes("upload-artifact"), "observer must not persist offer-related artifacts");

console.log("offer observer contract checks passed");

#!/usr/bin/env node
import fs from "node:fs";
import assert from "node:assert/strict";

const script = fs.readFileSync("scripts/observe-offer-buffer.mjs", "utf8");
const workflow = fs.readFileSync(".github/workflows/phase2e-offer-observer.yml", "utf8");
const publicKey = fs.readFileSync("ops/offer-signal-public.pem", "utf8");

for (const forbidden of ["reference_url", "receipt_hash", "content_sha256", "offer_id"]) {
  assert(!script.includes(forbidden), `observer must not read or emit ${forbidden}`);
}
assert(!/SELECT[\s\S]{0,120}\bbody\b/i.test(script), "observer query must not select offer body content");

assert(script.includes("state IN ('received','grouped')"), "observer should only inspect unreviewed active offer states");
assert(script.includes("publicEncrypt"), "observer should encrypt the private review-needed signal");
assert(script.includes("RSA_PKCS1_OAEP_PADDING"), "observer should use OAEP padding for the private signal");
assert(!script.includes("GITHUB_OUTPUT"), "observer must not expose review-needed state as a workflow output");
assert(publicKey.startsWith("-----BEGIN PUBLIC KEY-----"), "observer public key should be a committed public verification/encryption key");

assert(workflow.includes('cron: "23 * * * *"'), "observer should run hourly");
assert(workflow.includes("permissions:\n  contents: read"), "observer workflow should remain read-only in GitHub");
assert(workflow.includes("name: Offer observer healthy"), "public workflow should expose health only");
assert(!workflow.includes("Offer review needed"), "public workflow must not reveal pending-review state through a step name");
assert(!workflow.includes("steps.observer.outputs.review_needed"), "public workflow must not branch visibly on pending-review state");
assert(!workflow.includes("issues: write"), "observer must not create public GitHub issues");
assert(!workflow.includes("upload-artifact"), "observer must not persist offer-related artifacts");

console.log("offer observer contract checks passed");

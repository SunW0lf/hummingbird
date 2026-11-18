#!/usr/bin/env node
import fs from "node:fs";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const script = fs.readFileSync("scripts/observe-offer-buffer.mjs", "utf8");
const workflow = fs.readFileSync(".github/workflows/phase2e-offer-observer.yml", "utf8");

for (const forbidden of ["reference_url", "receipt_hash", "content_sha256", "offer_id"]) {
  assert(!script.includes(forbidden), `observer must not read or emit ${forbidden}`);
}
assert(!/SELECT[\s\S]{0,120}\bbody\b/i.test(script), "observer query must not select offer body content");

assert(script.includes("state IN ('received','grouped','synthesized','deferred')"), "observer should count unresolved active offers");
assert(script.includes("COUNT(*) AS pending_count"), "observer should count pending offers");
assert(script.includes("Number.isSafeInteger(count)"), "observer must reject invalid provider results");
assert(script.includes("HB_PENDING_COUNT="), "observer should emit a public count");
assert(script.includes("HB_OFFERS_PENDING="), "observer should emit a public pending flag");
assert(!script.includes("GITHUB_OUTPUT"), "observer must not expose review-needed state as a workflow output");

assert(workflow.includes('cron: "23 * * * *"'), "observer should run hourly");
assert(workflow.includes("permissions:\n  contents: read"), "observer workflow should remain read-only in GitHub");
assert(workflow.includes("name: Offer observer healthy"), "observer job should use a stable name");
assert(!workflow.includes("steps.observer.outputs.review_needed"), "public workflow must not branch visibly on pending-review state");
assert(!workflow.includes("issues: write"), "observer must not create public GitHub issues");
assert(!workflow.includes("upload-artifact"), "observer must not persist offer-related artifacts");

function observe(pendingCount) {
  const setup = `globalThis.fetch = async (url) => ({
    ok: true,
    json: async () => url.includes('/query')
      ? {success:true,result:[{success:true,results:[{pending_count:${JSON.stringify(pendingCount)}}]}]}
      : {success:true,result:[{name:'hummingbird-offer-buffer',uuid:'test-db'}]}
  });`;
  return spawnSync(process.execPath, ["--import", `data:text/javascript,${encodeURIComponent(setup)}`, "scripts/observe-offer-buffer.mjs"], {
    encoding: "utf8",
    env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: "test-account", CLOUDFLARE_D1_RECOVERY_TOKEN: "test-token" },
  });
}

const clear = observe(0);
assert.equal(clear.status, 0);
assert.match(clear.stdout, /HB_PENDING_COUNT=0\nHB_OFFERS_PENDING=false/);
const pending = observe(3);
assert.equal(pending.status, 0);
assert.match(pending.stdout, /HB_PENDING_COUNT=3\nHB_OFFERS_PENDING=true/);
const invalid = observe(null);
assert.equal(invalid.status, 1, "invalid provider data must fail closed");
assert.doesNotMatch(invalid.stdout, /HB_PENDING_COUNT|HB_OFFERS_PENDING/);

console.log("offer observer contract checks passed");

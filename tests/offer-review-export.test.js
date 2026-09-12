#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const workflow = fs.readFileSync("ops/offer-review-companion/review.yml", "utf8");
assert(!fs.existsSync(".github/workflows/review.yml"), "private review workflow must not run in the public repository");
assert.match(workflow, /retention-days: 1/);
assert.match(workflow, /permissions:\n  contents: read/);

const directory = fs.mkdtempSync(path.join(os.tmpdir(), "hb-review-test-"));
try {
  const output = path.join(directory, "packet.json");
  const mock = `globalThis.fetch = async (url, options) => {
    if (url.includes('/query')) {
      const query = JSON.parse(options.body);
      if (/receipt_hash|content_sha256|OFFSET/i.test(query.sql)) throw Error('sensitive columns or pagination queried');
      return {ok:true,json:async()=>({success:true,result:[{success:true,results:[{
        id:'opaque-1',body:'A private idea',reference_url:null,question_id:null,
        state:'received',received_at:'2026-09-12T00:00:00Z',expires_at:'2026-10-12T00:00:00Z'
      },{
        id:'opaque-2',body:'A private idea',reference_url:'https://example.org/context',question_id:'evidence-1',
        state:'deferred',received_at:'2026-09-12T01:00:00Z',expires_at:'2026-10-12T01:00:00Z'
      }]}]})};
    }
    return {ok:true,json:async()=>({success:true,result:[{name:'hummingbird-offer-buffer',uuid:'test-db'}]})};
  };`;
  const run = spawnSync(process.execPath, ["--import", `data:text/javascript,${encodeURIComponent(mock)}`, "scripts/export-offer-review.mjs", output], {
    encoding: "utf8",
    env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: "test-account", CLOUDFLARE_D1_RECOVERY_TOKEN: "test-token" },
  });
  assert.equal(run.status, 0, run.stderr);
  assert.doesNotMatch(run.stdout + run.stderr, /private idea|opaque-1/i);
  const packet = JSON.parse(fs.readFileSync(output, "utf8"));
  assert.equal(packet.version, 2);
  assert.equal(packet.unresolved_count, 2);
  assert.equal(packet.groups.length, 1);
  assert.equal(packet.groups[0].body, "A private idea");
  assert.equal(packet.groups[0].count, 2);
  assert.deepEqual(packet.groups[0].members.map((member) => member.state), ["received", "deferred"]);
  assert.equal(packet.groups[0].members[1].reference_url, "https://example.org/context");
  assert(!JSON.stringify(packet).includes("receipt_hash"));
  assert.equal(fs.statSync(output).mode & 0o777, 0o600);
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}

console.log("offer review export checks passed");

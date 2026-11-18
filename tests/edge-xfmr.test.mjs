// Offline checks for the xfmr.link Worker in ops/edge/xfmr. No network,
// no Cloudflare account, no deployment.
import test from "node:test";
import assert from "node:assert/strict";
import worker from "../ops/edge/xfmr/worker.mjs";

const call = (path, method = "GET") => worker.fetch(new Request(`https://xfmr.link${path}`, { method }));

test("front door keeps the XFMR sign and points to Hummingbird", async () => {
  const res = await call("/");
  assert.equal(res.status, 200);
  const text = await res.text();
  assert.match(text, /^XFMR\n\na transduction commons\n\nSignals only\./);
  assert.match(text, /https:\/\/datum\.quest\//);
  assert.match(res.headers.get("link"), /\/\.well-known\/xfmr/);
});

test("manifest stays experimental and read-only, with Hummingbird nearby", async () => {
  const manifest = await (await call("/.well-known/xfmr")).json();
  assert.equal(manifest.status, "experimental");
  assert.deepEqual(manifest.capabilities.write, []);
  assert.equal(manifest.nearby.hummingbird.url, "https://datum.quest/");
});

test("orientation packet and robots are served as plain text", async () => {
  const llms = await call("/llms.txt");
  assert.equal(llms.status, 200);
  assert.match(await llms.text(), /https:\/\/datum\.quest\/llms\.txt/);
  assert.match(await (await call("/robots.txt")).text(), /Allow: \//);
});

test("IndexNow key file matches its name", async () => {
  const source = await import("node:fs").then((fs) => fs.readFileSync(new URL("../ops/edge/xfmr/worker.mjs", import.meta.url), "utf8"));
  const key = source.match(/const INDEXNOW_KEY = "([0-9a-f]{32})";/)[1];
  assert.equal((await (await call(`/${key}.txt`)).text()).trim(), key);
});

test("only GET and HEAD; unknown paths 404; HEAD has no body", async () => {
  assert.equal((await call("/", "POST")).status, 405);
  assert.equal((await call("/nope")).status, 404);
  const head = await call("/", "HEAD");
  assert.equal(head.status, 200);
  assert.equal(await head.text(), "");
});

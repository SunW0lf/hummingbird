// Offline checks for the xfmr.link Worker in ops/edge/xfmr. No network,
// no Cloudflare account, no deployment.
import test from "node:test";
import assert from "node:assert/strict";
import worker from "../ops/edge/xfmr/worker.mjs";
import { canonicalJson, digest } from "../ops/edge/xfmr/digest.mjs";
import { MANIFEST_0_1 } from "../ops/edge/xfmr/manifests.mjs";

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

// ---- Packet maker (GET /packet) ----


const getJson = async (path, init) => {
  const res = await worker.fetch(new Request(`https://xfmr.link${path}`, init));
  return { res, body: await res.json() };
};

test("flavored digests match vectors computed independently with node:crypto", async () => {
  // From hummingbird-lab labs/transformers/vectors.json.
  assert.equal(await digest("doc", ""), "hb1:doc:sha256:6b71a1d3a98977f66303f5dc712a7dadf6f108c3269131f12f9a160e11f781e5");
  assert.equal(await digest("packet", "hello"), "hb1:packet:sha256:a156d8653b9daa661d6f0aae07da0bcf3a68083cb7c348622eb9752179b4c696");
  assert.equal(canonicalJson({ b: 1, a: [2, { d: 3, c: 4 }] }), '{"a":[2,{"c":4,"d":3}],"b":1}');
});

test("published manifest versions never change", async () => {
  const manifest = await (await call("/.well-known/xfmr")).json();
  assert.equal(manifest.version, "0.2-lab");
  assert.deepEqual(manifest.capabilities.write, []);
  assert.ok(manifest.capabilities.read.includes("/packet"));
  assert.deepEqual(manifest.earlier, [
    { version: "0.1-lab", digest: await digest("manifest", canonicalJson(MANIFEST_0_1)) },
  ]);
  assert.equal(MANIFEST_0_1.version, "0.1-lab");
  assert.ok(Object.isFrozen(MANIFEST_0_1.capabilities.read));
});

test("the manifest's ETag is its own digest, and packets report the same one", async () => {
  const res = await call("/.well-known/xfmr");
  const manifest = await res.json();
  const own = await digest("manifest", canonicalJson(manifest));
  assert.equal(res.headers.get("etag"), `"${own}"`);
  assert.equal((await getJson("/packet")).body.manifest, own);
});

test("the default packet is the orientation packet, the same every time", async () => {
  const one = await getJson("/packet");
  const two = await getJson("/packet");
  assert.equal(one.res.status, 200);
  assert.match(one.res.headers.get("content-type"), /^application\/json/);
  assert.deepEqual(one.body, two.body);
  const { recipe, output, trace } = one.body;
  assert.equal(output.packet, "orientation");
  assert.deepEqual(output.order, ["what", "status", "nearby", "principles", "not_yet"]);
  assert.equal(output.parts.nearby.hummingbird.url, "https://datum.quest/");
  assert.equal(trace.transformer, "assemble@1");
  assert.equal(trace.kind, "derived");
  assert.equal(trace.ratio, "step-down");
  // Anyone holding the recipe and output can check the trace.
  assert.equal(trace.recipe, await digest("recipe", canonicalJson(recipe)));
  assert.equal(trace.output, await digest("packet", canonicalJson(output)));
  assert.equal(trace.inputs.what, await digest("artifact", output.parts.what));
});

test("a recipe picks parts in order and a budget drops parts from the end", async () => {
  const { body } = await getJson("/packet?parts=what,nearby,cast,not_yet&max_bytes=600");
  assert.equal(body.output.packet, "custom");
  assert.deepEqual(body.output.order, ["what", "nearby"]);
  assert.deepEqual(body.output.omitted, ["cast", "not_yet"]);
  assert.ok(body.trace.budget.used <= 600);
  assert.equal(body.trace.budget.asked, 600);
});

test("a returning visitor gets only what changed since the manifest it saw", async () => {
  const earlier = await digest("manifest", canonicalJson(MANIFEST_0_1));
  const { res, body } = await getJson(`/packet?since=${earlier}`);
  assert.equal(res.status, 200);
  assert.equal(body.trace.transformer, "delta@1");
  assert.deepEqual(body.output.changed.version, { from: "0.1-lab", to: "0.2-lab" });
  assert.equal(body.output.added["packets.endpoint"], "/packet");
  assert.deepEqual(body.output.removed, []);

  const current = (await getJson("/packet")).body.manifest;
  const same = await getJson(`/packet?since=${current}`);
  assert.deepEqual(same.body.output, { added: {}, removed: [], changed: {} });

  const unknown = await getJson(`/packet?since=hb1:manifest:sha256:${"0".repeat(64)}`);
  assert.equal(unknown.res.status, 404);
  assert.deepEqual(unknown.body.known, [earlier, current]);
});

test("bad recipes get a fixed message that never echoes what was sent", async () => {
  const marker = "zz-visitor-text-zz";
  for (const path of [
    `/packet?parts=${marker}`,
    `/packet?${marker}=1`,
    `/packet?max_bytes=${marker}`,
    "/packet?max_bytes=0",
    "/packet?max_bytes=65537",
    "/packet?parts=what,what",
    "/packet?parts=what&parts=nearby",
    `/packet?since=${marker}`,
    `/packet?parts=what&since=hb1:manifest:sha256:${"0".repeat(64)}`,
  ]) {
    const res = await call(path);
    const text = await res.text();
    assert.equal(res.status, 400, path);
    assert.ok(!text.includes(marker), path);
    assert.ok(JSON.parse(text).error, path);
  }
  assert.equal((await call("/packet?max_bytes=10")).status, 400);
});

test("packets are read-only and carry nothing about the visitor", async () => {
  assert.equal((await call("/packet", "POST")).status, 405);
  const head = await call("/packet", "HEAD");
  assert.equal(head.status, 200);
  assert.equal(await head.text(), "");

  const res = await worker.fetch(
    new Request("https://xfmr.link/packet?parts=what,status", {
      headers: { "user-agent": "zz-agent-zz", "cf-connecting-ip": "203.0.113.77", cookie: "zz=cookie" },
    }),
  );
  const text = await res.text();
  for (const leak of ["zz-agent-zz", "203.0.113.77", "zz=cookie"]) assert.ok(!text.includes(leak));
  assert.equal(res.headers.get("set-cookie"), null);
  assert.equal(res.headers.get("access-control-allow-origin"), "*");
});

test("the orientation packet and manifest both point to the packet maker", async () => {
  assert.match(await (await call("/llms.txt")).text(), /https:\/\/xfmr\.link\/packet/);
  const manifest = await (await call("/.well-known/xfmr")).json();
  assert.equal(manifest.packets.endpoint, "/packet");
  assert.deepEqual(manifest.packets.transformers, ["assemble@1", "delta@1"]);
});

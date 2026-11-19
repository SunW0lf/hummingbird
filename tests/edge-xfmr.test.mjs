// Offline checks for the xfmr.link Worker in ops/edge/xfmr. No network,
// no Cloudflare account, no deployment.
import test from "node:test";
import assert from "node:assert/strict";
import worker from "../ops/edge/xfmr/worker.mjs";
import { canonicalJson, digest } from "../ops/edge/xfmr/digest.mjs";
import { MANIFEST_0_1, MANIFEST_0_2 } from "../ops/edge/xfmr/manifests.mjs";
import { b64url, checkPulse, expectedQuicknetRound, readDrandPulse, visitorCloseOnce } from "../ops/edge/xfmr/meeting.mjs";

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
  assert.equal(manifest.version, "0.3-lab");
  assert.deepEqual(manifest.capabilities.write, []);
  assert.ok(manifest.capabilities.read.includes("/packet"));
  assert.deepEqual(manifest.earlier, [
    { version: "0.1-lab", digest: await digest("manifest", canonicalJson(MANIFEST_0_1)) },
    { version: "0.2-lab", digest: await digest("manifest", canonicalJson(MANIFEST_0_2)) },
  ]);
  assert.equal(MANIFEST_0_1.version, "0.1-lab");
  assert.ok(Object.isFrozen(MANIFEST_0_1.capabilities.read));
  // Pinned: 0.2-lab was served from public PR #129 and must keep this digest.
  assert.equal(await digest("manifest", canonicalJson(MANIFEST_0_2)), "hb1:manifest:sha256:97dd95055ac96cc819e460e331c8d4012c325cd85b7ec8621cfc0b1982d358cd");
  assert.ok(Object.isFrozen(MANIFEST_0_2.packets));
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
  assert.deepEqual(body.output.changed.version, { from: "0.1-lab", to: "0.3-lab" });
  assert.equal(body.output.added["packets.endpoint"], "/packet");
  assert.deepEqual(body.output.removed, []);

  const current = (await getJson("/packet")).body.manifest;
  const same = await getJson(`/packet?since=${current}`);
  assert.deepEqual(same.body.output, { added: {}, removed: [], changed: {} });

  const unknown = await getJson(`/packet?since=hb1:manifest:sha256:${"0".repeat(64)}`);
  assert.equal(unknown.res.status, 404);
  assert.deepEqual(unknown.body.known, [earlier, await digest("manifest", canonicalJson(MANIFEST_0_2)), current]);

  const fromPackets = await getJson(`/packet?since=${await digest("manifest", canonicalJson(MANIFEST_0_2))}`);
  assert.deepEqual(fromPackets.body.output.changed.version, { from: "0.2-lab", to: "0.3-lab" });
  assert.equal(fromPackets.body.output.added["meeting.endpoint"], "/meet");
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

// ---- Meeting (GET /meet) ----

const PULSE_ROUND = 34089794; // read live from api.drand.sh around 2026-11-19T07:20Z
const NOW = Date.UTC(2026, 10, 19, 7, 20, 0);

async function withFetch(fake, fn) {
  const saved = globalThis.fetch;
  const savedNow = Date.now;
  globalThis.fetch = fake;
  Date.now = () => NOW;
  try {
    return await fn();
  } finally {
    globalThis.fetch = saved;
    Date.now = savedNow;
  }
}

const beacon = (round = expectedQuicknetRound(NOW)) => {
  const seen = [];
  const fake = async (url, init) => {
    seen.push({ url, init });
    return new Response(JSON.stringify({ round, randomness: "9c".repeat(32), signature: "x" }));
  };
  return { fake, seen };
};

async function visitorHalf() {
  const half = crypto.getRandomValues(new Uint8Array(32));
  return { half, commit: await digest("meeting-visitor", half) };
}

test("the quicknet clock matches the live chain", () => {
  assert.ok(Math.abs(expectedQuicknetRound(NOW) - PULSE_ROUND) < 40);
});

test("a meeting: the visitor commits, the space answers with its half and a pulse, both can check it", async () => {
  const { fake, seen } = beacon();
  const visitor = await visitorHalf();
  const res = await withFetch(fake, () => call(`/meet?commit=${visitor.commit}`));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("cache-control"), "no-store");
  const reply = await res.json();
  assert.deepEqual(Object.keys(reply).sort(), ["pulse", "space_commit", "space_half", "trace", "visitor_commit"]);
  assert.deepEqual(reply.pulse, { source: "drand-quicknet", round: expectedQuicknetRound(NOW), randomness: "9c".repeat(32) });
  assert.deepEqual(reply.trace, { carrier: { kind: "meeting", grain: "2x32B", pulse: `drand-quicknet:${expectedQuicknetRound(NOW)}` } });
  assert.ok(!JSON.stringify(reply).includes(b64url(visitor.half)));
  assert.equal((await visitorCloseOnce(visitor.half, reply)).length, 32);

  // The beacon read carries nothing about the visitor.
  assert.equal(seen.length, 1);
  assert.match(seen[0].url, /^https:\/\/api\.drand\.sh\/52db9ba7[0-9a-f]+\/public\/latest$/);
  assert.ok(!seen[0].url.includes(visitor.commit));
});

test("two meetings with the same commitment give two different space halves", async () => {
  const { fake } = beacon();
  const visitor = await visitorHalf();
  const [a, b] = await withFetch(fake, async () => [
    await (await call(`/meet?commit=${visitor.commit}`)).json(),
    await (await call(`/meet?commit=${visitor.commit}`)).json(),
  ]);
  assert.notEqual(a.space_half, b.space_half);
  assert.notDeepEqual(await visitorCloseOnce(visitor.half, a), await visitorCloseOnce(visitor.half, b));
});

test("no beacon, or a stale one, still meets, with pulse null and the trace saying none", async () => {
  const visitor = await visitorHalf();
  for (const fake of [async () => { throw new Error("offline"); }, beacon(PULSE_ROUND - 1_000_000).fake]) {
    const reply = await withFetch(fake, async () => (await call(`/meet?commit=${visitor.commit}`)).json());
    assert.equal(reply.pulse, null);
    assert.equal(reply.trace.carrier.pulse, "none");
    assert.equal((await visitorCloseOnce(visitor.half, reply)).length, 32);
  }
  assert.equal(await readDrandPulse(async () => new Response("{}"), { now: NOW }), null);
  assert.throws(() => checkPulse({ source: "drand-quicknet", round: 1, randomness: "x" }));
});

test("/meet with no query explains how, and bad requests get fixed messages that echo nothing", async () => {
  const how = await call("/meet");
  assert.equal(how.status, 200);
  const body = await how.json();
  assert.equal(body.endpoint, "/meet");
  assert.match(body.keeps, /nothing/);

  const marker = "zz-visitor-text-zz";
  for (const path of [
    `/meet?commit=${marker}`,
    `/meet?${marker}=1`,
    `/meet?commit=hb1:meeting-space:sha256:${"0".repeat(64)}`,
    `/meet?commit=hb1:meeting-visitor:sha256:${"0".repeat(64)}&commit=hb1:meeting-visitor:sha256:${"1".repeat(64)}`,
  ]) {
    const res = await withFetch(beacon().fake, () => call(path));
    assert.equal(res.status, 400, path);
    assert.ok(!(await res.text()).includes(marker));
  }
  assert.equal((await call("/meet", "POST")).status, 405);
});

test("the meeting reply carries nothing about the visitor, and the doors point to it", async () => {
  const visitor = await visitorHalf();
  const text = await withFetch(beacon().fake, async () => (await worker.fetch(
    new Request(`https://xfmr.link/meet?commit=${visitor.commit}`, {
      headers: { "user-agent": "zz-agent-zz", "cf-connecting-ip": "203.0.113.77", cookie: "zz=cookie" },
    }),
  )).text());
  for (const leak of ["zz-agent-zz", "203.0.113.77", "zz=cookie"]) assert.ok(!text.includes(leak));

  assert.match(await (await call("/llms.txt")).text(), /https:\/\/xfmr\.link\/meet/);
  const manifest = await (await call("/.well-known/xfmr")).json();
  assert.ok(manifest.capabilities.read.includes("/meet"));
  assert.deepEqual(manifest.capabilities.write, []);
  assert.equal(manifest.meeting.endpoint, "/meet");
});

test("the carrier recipe in llms.txt rebuilds the same carrier with node:crypto alone", async () => {
  const { createHash, hkdfSync } = await import("node:crypto");
  const label = (purpose, bytes) => createHash("sha256").update(Buffer.concat([Buffer.from(`hummingbird/v1/${purpose}`), Buffer.from([0]), bytes])).digest("hex");
  const half = crypto.getRandomValues(new Uint8Array(32));
  const commit = `hb1:meeting-visitor:sha256:${label("meeting-visitor", half)}`;
  const reply = await withFetch(beacon().fake, async () => (await call(`/meet?commit=${commit}`)).json());

  const spaceHalf = Buffer.from(reply.space_half, "base64url");
  assert.equal(reply.space_commit, `hb1:meeting-space:sha256:${label("meeting-space", spaceHalf)}`);
  const info = JSON.stringify({ pulse: reply.pulse, space_commit: reply.space_commit, visitor_commit: commit }, ["pulse", "randomness", "round", "source", "space_commit", "visitor_commit"]);
  const plain = Buffer.from(hkdfSync("sha256", Buffer.concat([half, spaceHalf]), "hummingbird/v1/meeting", info, 32));
  assert.deepEqual(new Uint8Array(plain), await visitorCloseOnce(half, reply));
});

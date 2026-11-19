// ADR 0027: the stored hash of offer text is keyed, never plain, and is
// re-keyed whenever the key rotates.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";

import { keyedContentHex, offerContentHash, offerContentKeyBytes } from "../lib/offer-runtime.mjs";
import { rekeyOfferContent } from "../scripts/rekey-offer-content.mjs";
import { onRequestPost as accept } from "../functions/offer/index.js";

const schema = readFileSync(new URL("../experimental/offer-buffer/migrations/0001_offer_buffer.sql", import.meta.url), "utf8");
const plain = (text) => createHash("sha256").update(text).digest("hex");
const KEY_A = "11".repeat(32);
const KEY_B = "22".repeat(32);

test("matches the lab's independent keyed test vector", async () => {
  const key = offerContentKeyBytes({ OFFER_CONTENT_KEY: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f" });
  assert.equal(await keyedContentHex(key, "yes"), "44c846d5c8c54de142cb41202d8bcb5c7d357156c54e1aed5f64ced7e221f8c4");
});

test("no valid key means no hash, never a plain one", async () => {
  for (const env of [{}, { OFFER_CONTENT_KEY: "" }, { OFFER_CONTENT_KEY: "ab" }, { OFFER_CONTENT_KEY: "zz".repeat(32) }, undefined]) {
    assert.equal(offerContentKeyBytes(env), null);
    assert.equal(await offerContentHash(env, "yes"), null);
  }
});

test("the keyed hash is not a plain hash, and changes with the key", async () => {
  const a = await offerContentHash({ OFFER_CONTENT_KEY: KEY_A }, "yes");
  const a2 = await offerContentHash({ OFFER_CONTENT_KEY: KEY_A }, "yes");
  const b = await offerContentHash({ OFFER_CONTENT_KEY: KEY_B }, "yes");
  assert.match(a, /^[0-9a-f]{64}$/);
  assert.equal(a, a2);
  assert.notEqual(a, b);
  assert.notEqual(a, plain("yes"));
});

function binding(sqlite) {
  const st = (sql, v = []) => ({
    bind: (...n) => st(sql, n),
    first: async () => sqlite.prepare(sql).get(...v) ?? null,
    run: async () => ({ success: true, meta: { changes: Number(sqlite.prepare(sql).run(...v).changes) } }),
  });
  return { prepare: (s) => st(s), batch: async (list) => { for (const s of list) await s.run(); } };
}

async function offer(env, text) {
  const request = new Request("https://datum.quest/offer", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({ offer: text }).toString(),
  });
  return (await accept({ request, env })).json();
}

test("acceptance stores a keyed hash and groups repeats under a random cluster id", async () => {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(schema);
  const env = { OFFER_DB: binding(sqlite), OFFER_CONTENT_KEY: KEY_A };
  const first = await offer(env, "same words");
  const second = await offer(env, "same words");
  assert.equal(second.state, "grouped");
  const rows = sqlite.prepare("SELECT content_sha256, cluster_id FROM experimental_offers ORDER BY received_at").all();
  const expected = await offerContentHash(env, "same words");
  for (const row of rows) {
    assert.equal(row.content_sha256, expected);
    assert.ok(row.cluster_id && !row.cluster_id.includes(expected) && !row.cluster_id.includes(plain("same words")));
  }
  assert.equal(rows[0].cluster_id, rows[1].cluster_id);
  assert.ok(first.accepted);
});

test("without a key, offers are still accepted but get no hash and no grouping", async () => {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(schema);
  const env = { OFFER_DB: binding(sqlite) };
  assert.equal((await offer(env, "same words")).accepted, true);
  assert.equal((await offer(env, "same words")).state, "received");
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM experimental_offers WHERE content_sha256 IS NOT NULL").get().n, 0);
});

test("re-keying replaces old plain or retired-key hashes and keeps grouping intact", async () => {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(schema);
  const insert = sqlite.prepare(
    `INSERT INTO experimental_offers (id, body, receipt_hash, state, content_sha256, cluster_id, received_at, expires_at, withdrawn_at)
     VALUES (?, ?, ?, ?, ?, ?, '2026-11-19T00:00:00.000Z', '2026-12-19T00:00:00.000Z', ?)`
  );
  insert.run("old-plain", "hello", "a".repeat(64), "received", plain("hello"), null, null);
  insert.run("old-key-1", "same", "b".repeat(64), "grouped", await keyedContentHex(offerContentKeyBytes({ OFFER_CONTENT_KEY: KEY_A }), "same"), "exact:x", null);
  insert.run("old-key-2", "same", "c".repeat(64), "grouped", await keyedContentHex(offerContentKeyBytes({ OFFER_CONTENT_KEY: KEY_A }), "same"), "exact:x", null);
  insert.run("gone", null, "d".repeat(64), "withdrawn", null, null, "2026-11-19T01:00:00.000Z");
  const d1 = async (sql, params) => sqlite.prepare(sql).all(...params);
  const { rekeyed } = await rekeyOfferContent({ d1, keyBytes: offerContentKeyBytes({ OFFER_CONTENT_KEY: KEY_B }) });
  assert.equal(rekeyed, 3);
  const get = (id) => sqlite.prepare("SELECT content_sha256 h FROM experimental_offers WHERE id = ?").get(id).h;
  assert.equal(get("old-plain"), await offerContentHash({ OFFER_CONTENT_KEY: KEY_B }, "hello"));
  assert.notEqual(get("old-plain"), plain("hello"));
  assert.equal(get("old-key-1"), get("old-key-2"));
  assert.equal(get("old-key-1"), await offerContentHash({ OFFER_CONTENT_KEY: KEY_B }, "same"));
  assert.equal(get("gone"), null);
  await assert.rejects(rekeyOfferContent({ d1, keyBytes: null }), /missing or invalid/);
});

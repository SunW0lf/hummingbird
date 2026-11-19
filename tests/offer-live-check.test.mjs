// Runs the live offer check offline, against the real offer functions and the
// real offer-buffer schema in an in-memory SQLite database, so the check is
// proven before it ever touches production.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";

import { runLiveCheck } from "../scripts/offer-live-check.mjs";
import { onRequestPost as accept } from "../functions/offer/index.js";
import { onRequestPost as status } from "../functions/offer/status.js";
import { onRequestPost as withdraw } from "../functions/offer/withdraw.js";
import { onRequestPost as mcp } from "../functions/offer/mcp.js";

const schema = readFileSync(new URL("../experimental/offer-buffer/migrations/0001_offer_buffer.sql", import.meta.url), "utf8");

function d1Binding(sqlite) {
  const statement = (sql, values = []) => ({
    bind: (...next) => statement(sql, next),
    async first() { return sqlite.prepare(sql).get(...values) ?? null; },
    async all() { return { results: sqlite.prepare(sql).all(...values), success: true }; },
    async run() { const info = sqlite.prepare(sql).run(...values); return { success: true, meta: { changes: Number(info.changes) } }; },
  });
  return {
    prepare: (sql) => statement(sql),
    async batch(list) {
      sqlite.exec("BEGIN");
      try { const out = []; for (const s of list) out.push(await s.run()); sqlite.exec("COMMIT"); return out; }
      catch (error) { sqlite.exec("ROLLBACK"); throw error; }
    },
  };
}

function harness({ breakWithdraw = false, key = "ab".repeat(32) } = {}) {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(schema);
  const env = { OFFER_DB: d1Binding(sqlite), ...(key ? { OFFER_CONTENT_KEY: key } : {}) };
  const routes = {
    "/offer": accept,
    "/offer/status": status,
    "/offer/withdraw": breakWithdraw ? async () => Response.json({ ok: true, state: "withdrawn" }) : withdraw,
    "/offer/mcp": mcp,
  };
  const fetchImpl = async (url, init) => {
    const path = new URL(url).pathname;
    const request = new Request(url, init);
    return routes[path]({ request, env, next: () => new Response(null, { status: 404 }) });
  };
  const d1 = async (sql, params) => sqlite.prepare(sql).all(...params);
  return { sqlite, fetchImpl, d1 };
}

test("every check passes against the real offer functions, and no test row is left", async () => {
  const { sqlite, fetchImpl, d1 } = harness();
  const lines = [];
  const { results, failed } = await runLiveCheck({ base: "https://datum.quest", fetchImpl, d1, log: (l) => lines.push(l) });
  assert.equal(failed, 0, lines.filter((l) => l.startsWith("FAIL")).join("\n"));
  assert.ok(results.length >= 40, "the check should cover all doors");
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM experimental_offers").get().n, 0);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM offer_clusters").get().n, 0);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM offer_cluster_members").get().n, 0);
});

test("a withdrawal that keeps the text is caught", async () => {
  const { fetchImpl, d1 } = harness({ breakWithdraw: true });
  const { results, failed } = await runLiveCheck({ base: "https://datum.quest", fetchImpl, d1, log: () => {} });
  assert.ok(failed > 0);
  assert.ok(results.some((r) => !r.ok && r.name.includes("withdrawal cleared text")));
});

test("content kept past the cleanup window is caught, and real offers are never deleted", async () => {
  const { sqlite, fetchImpl, d1 } = harness();
  sqlite.prepare(
    `INSERT INTO experimental_offers (id, body, receipt_hash, state, content_sha256, received_at, expires_at)
     VALUES ('real-old', 'someone else''s offer', ?, 'received', ?, '2026-01-01T00:00:00.000Z', '2026-01-31T00:00:00.000Z')`
  ).run("a".repeat(64), "b".repeat(64));
  const { results } = await runLiveCheck({ base: "https://datum.quest", fetchImpl, d1, log: () => {} });
  assert.ok(results.some((r) => !r.ok && r.name.includes("past the cleanup window")));
  assert.equal(sqlite.prepare("SELECT body FROM experimental_offers WHERE id = 'real-old'").get().body, "someone else's offer");
});

test("the check never prints offer text or receipts", async () => {
  const { fetchImpl, d1 } = harness();
  const lines = [];
  await runLiveCheck({ base: "https://datum.quest", fetchImpl, d1, log: (l) => lines.push(l) });
  const out = lines.join("\n");
  assert.doesNotMatch(out, /Live check [0-9a-f-]{36}/);
  assert.doesNotMatch(out, /[A-Za-z0-9_-]{43}/);
});

test("a missing content key is caught: offers are kept but get no hash and no grouping", async () => {
  const { sqlite, fetchImpl, d1 } = harness({ key: null });
  const { results } = await runLiveCheck({ base: "https://datum.quest", fetchImpl, d1, log: () => {} });
  assert.ok(results.some((r) => !r.ok && r.name.includes("content hash is keyed")));
  assert.ok(results.some((r) => r.ok && r.name === "JSON form: offer text is kept exactly"));
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM experimental_offers").get().n, 0);
});

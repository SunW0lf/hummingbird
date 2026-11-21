// ADR 0030 amendment (2026-11-21): an answer to a scoped ask is kept 22 days,
// any other offer 30. These checks hold the runtime, the receipt response and
// every public statement of it to the same numbers.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { onRequestPost as offer } from "../functions/offer/index.js";
import { HANDLING } from "../functions/offer/mcp.js";
import { ASK_ANSWER_RETENTION_DAYS, RETENTION_DAYS, expiryIso, isAskAnswer, retentionDaysFor } from "../lib/offer-runtime.mjs";

const DAY_MS = 24 * 60 * 60 * 1000;

function memoryDb() {
  const rows = [];
  return {
    rows,
    prepare(sql) {
      return {
        bind(...args) {
          return {
            async run() {
              if (sql.includes("INSERT INTO experimental_offers")) {
                rows.push({ id: args[0], question_id: args[3], received_at: args[6], expires_at: args[7] });
              }
              return { success: true, meta: { changes: 1 } };
            },
            async first() {
              return null;
            },
          };
        },
      };
    },
    async batch(statements) {
      for (const s of statements) await s.run();
      return statements.map(() => ({ success: true, meta: { changes: 1 } }));
    },
  };
}

const post = (body) =>
  new Request("https://datum.quest/offer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

test("the numbers are 22 for an answer to an ask and 30 otherwise", () => {
  assert.equal(RETENTION_DAYS, 30);
  assert.equal(ASK_ANSWER_RETENTION_DAYS, 22);
  for (const id of ["ask-carry-missing", "ask-retired-long-ago", "ask-x"]) assert.equal(retentionDaysFor(id), 22, id);
  for (const id of [null, "", "q-1", "live-check", "ASK-upper", "ask-", "task-x", "ask_x", "ask-a b"]) assert.equal(retentionDaysFor(id), 30, String(id));
  assert.equal(isAskAnswer("ask-carry-missing"), true);
  const base = new Date("2026-11-21T02:00:00.000Z");
  assert.equal(expiryIso(base), "2026-12-21T02:00:00.000Z");
  assert.equal(expiryIso(base, 22), "2026-12-13T02:00:00.000Z");
});

test("an answer to an ask is stored and told 22 days; another offer 30", async () => {
  for (const [questionId, days] of [["ask-origin-neutral", 22], ["project-critique", 30], [undefined, 30]]) {
    const db = memoryDb();
    const res = await offer({ request: post({ offer: "A truer sentence.", ...(questionId ? { question_id: questionId } : {}) }), env: { OFFER_DB: db } });
    assert.equal(res.status, 201);
    const made = await res.json();
    const [row] = db.rows;
    assert.equal(Date.parse(row.expires_at) - Date.parse(row.received_at), days * DAY_MS, String(questionId));
    assert.equal(made.expires_at, row.expires_at, "the offerer is told the stored expiry");
  }
});

test("every public statement of retention names both numbers", () => {
  const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
  assert.ok(HANDLING.includes(`Kept for ${RETENTION_DAYS} days (${ASK_ANSWER_RETENTION_DAYS} for an answer to a listed ask)`));
  assert.ok(read("app/llms.txt").includes(`is kept ${ASK_ANSWER_RETENTION_DAYS} days`));
  const offerPage = read("app/offer.html");
  assert.ok(offerPage.includes(`kept ${ASK_ANSWER_RETENTION_DAYS} days instead of ${RETENTION_DAYS}`));
  assert.ok(offerPage.includes(`or ${ASK_ANSWER_RETENTION_DAYS} days for an answer to one of the asks above`));
  assert.ok(read("app/openapi.json").includes(`(${ASK_ANSWER_RETENTION_DAYS} days for an answer to a listed ask`));
  assert.ok(read("scripts/render-asks.js").includes(`An answer is kept ${ASK_ANSWER_RETENTION_DAYS} days`));
  assert.ok(read("docs/decisions/0030-scoped-asks-on-the-offer-on-ramp.md").includes("## Amendment 2026-11-21"));
});

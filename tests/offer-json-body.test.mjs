// The offer routes take a JSON object of strings as well as a form. Both reach
// the same checks and the same stored row; JSON callers always get JSON back.
import { test } from "node:test";
import assert from "node:assert/strict";
import { onRequestPost as offer } from "../functions/offer/index.js";
import { onRequestPost as status } from "../functions/offer/status.js";
import { onRequestPost as withdraw } from "../functions/offer/withdraw.js";
import { GUIDE_URL, MAX_OFFER_CHARS } from "../lib/offer-runtime.mjs";

function memoryDb() {
  const rows = [];
  const db = {
    rows,
    prepare(sql) {
      return {
        bind(...args) {
          return {
            async run() {
              if (sql.includes("INSERT INTO experimental_offers")) {
                rows.push({ id: args[0], body: args[1], reference_url: args[2], question_id: args[3], receipt_hash: args[4], state: "received", expires_at: args[7], resulting_record_id: null });
              }
              if (sql.includes("UPDATE experimental_offers") && sql.includes("'withdrawn'")) {
                for (const row of rows) if (args.includes(row.receipt_hash)) Object.assign(row, { state: "withdrawn", body: null, reference_url: null });
              }
              return { success: true, meta: { changes: 1 } };
            },
            async first() {
              if (sql.includes("WHERE receipt_hash = ?")) return rows.find((r) => r.receipt_hash === args[0]) || null;
              return null;
            },
          };
        },
      };
    },
    async batch(statements) {
      for (const statement of statements) await statement.run();
      return statements.map(() => ({ success: true, meta: { changes: 1 } }));
    },
  };
  return db;
}

function jsonPost(path, body, headers = {}) {
  return new Request(`https://datum.quest${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

test("a JSON offer is accepted, answered in JSON without asking, and stored like a form offer", async () => {
  const db = memoryDb();
  const res = await offer({ request: jsonPost("/offer", { offer: "  Keep reading open.  ", reference: "https://example.com/a", question_id: "q-1" }), env: { OFFER_DB: db } });
  assert.equal(res.status, 201);
  assert.match(res.headers.get("content-type"), /application\/json/);
  const made = await res.json();
  assert.equal(made.accepted, true);
  assert.match(made.receipt, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(db.rows.length, 1);
  assert.equal(db.rows[0].body, "Keep reading open.");
  assert.equal(db.rows[0].reference_url, "https://example.com/a");
  assert.equal(db.rows[0].question_id, "q-1");

  const checked = await (await status({ request: jsonPost("/offer/status", { receipt: made.receipt }), env: { OFFER_DB: db } })).json();
  assert.equal(checked.ok, true);
  assert.equal(checked.offer_id, made.offer_id);

  const gone = await withdraw({ request: jsonPost("/offer/withdraw", { receipt: made.receipt }), env: { OFFER_DB: db } });
  assert.equal(gone.status, 200);
  assert.equal((await gone.json()).ok, true);
});

test("JSON offers get the same limits as forms", async () => {
  const db = memoryDb();
  for (const body of [{ offer: "" }, { offer: "x".repeat(MAX_OFFER_CHARS + 1) }, { text: "wrong field" }, { offer: "x", reference: "javascript:alert(1)" }]) {
    const res = await offer({ request: jsonPost("/offer", body), env: { OFFER_DB: db } });
    assert.equal(res.status, 400, JSON.stringify(body).slice(0, 40));
    assert.equal((await res.json()).accepted, false);
  }
  assert.equal(db.rows.length, 0);
});

test("a JSON body must be one object of strings", async () => {
  const db = memoryDb();
  for (const body of ["{not json", "[]", "\"just text\"", "null", JSON.stringify({ offer: 42 }), JSON.stringify({ offer: ["a"] }), JSON.stringify({ offer: { text: "a" } })]) {
    const res = await offer({ request: jsonPost("/offer", body), env: { OFFER_DB: db } });
    assert.equal(res.status, 400, body);
    const json = await res.json();
    assert.equal(json.code, "invalid_json", body);
    assert.ok(json.message.split(GUIDE_URL).length > 1, body);
  }
  const receipt = await status({ request: jsonPost("/offer/status", { receipt: 7 }), env: { OFFER_DB: db } });
  assert.equal(receipt.status, 400);
  assert.equal((await receipt.json()).code, "invalid_json");
  assert.equal(db.rows.length, 0);
});

test("fields beyond the documented ones are ignored, not stored", async () => {
  const db = memoryDb();
  const res = await offer({ request: jsonPost("/offer", { offer: "Hello", name: "someone", email: "a@example.com" }), env: { OFFER_DB: db } });
  assert.equal(res.status, 201);
  assert.equal(db.rows.length, 1);
  assert.deepEqual(Object.values(db.rows[0]).filter((v) => typeof v === "string" && /someone|example\.com/.test(v)), []);
});

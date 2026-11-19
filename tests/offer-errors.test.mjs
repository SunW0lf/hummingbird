// A refused request should tell the client how to succeed. Agents most often
// try a JSON body first, or a wrong field name; both get the fix spelled out.
import { test } from "node:test";
import assert from "node:assert/strict";
import { onRequestPost as offer } from "../functions/offer/index.js";
import { onRequestPost as status } from "../functions/offer/status.js";
import { onRequestPost as withdraw } from "../functions/offer/withdraw.js";
import { GUIDE_URL, MAX_OFFER_CHARS } from "../lib/offer-runtime.mjs";

// Writes must never be reached on these paths; any query is a test failure.
const OFFER_DB = {
  prepare() {
    return {
      bind() { return this; },
      first: async () => null,
      run: async () => { throw new Error("no write expected"); },
    };
  },
  batch: async () => { throw new Error("no write expected"); },
};
const env = { OFFER_DB };

function post(path, body, type) {
  return new Request(`https://datum.quest${path}`, {
    method: "POST",
    headers: { "Content-Type": type, Accept: "application/json" },
    body,
  });
}

async function call(handler, path, body, type = "application/x-www-form-urlencoded") {
  const res = await handler({ request: post(path, body, type), env });
  return { status: res.status, json: await res.json() };
}

test("a JSON body is refused with the exact fix and a pointer to the guide", async () => {
  for (const [handler, path] of [[offer, "/offer"], [status, "/offer/status"], [withdraw, "/offer/withdraw"]]) {
    const { status: code, json } = await call(handler, path, JSON.stringify({ offer: "hi" }), "application/json");
    assert.equal(code, 415, path);
    assert.equal(json.code, "unsupported_media_type", path);
    assert.match(json.message, /application\/x-www-form-urlencoded/, path);
    assert.match(json.message, /JSON request bodies are not accepted/, path);
    assert.match(json.message, /Accept: application\/json/, path);
    assert.ok(json.message.split(GUIDE_URL).length > 1, path);
  }
});

test("an offer under the wrong field name is told the right one", async () => {
  const { status: code, json } = await call(offer, "/offer", "text=hello");
  assert.equal(code, 400);
  assert.equal(json.accepted, false);
  assert.equal(json.code, "invalid_offer");
  assert.match(json.message, /field named offer/);
  assert.ok(json.message.split(GUIDE_URL).length > 1);
});

test("an offer that is too long says how long it is", async () => {
  const { json } = await call(offer, "/offer", `offer=${"x".repeat(MAX_OFFER_CHARS + 5)}`);
  assert.equal(json.code, "invalid_offer");
  assert.match(json.message, new RegExp(`this one has ${MAX_OFFER_CHARS + 5}`));
});

test("a missing receipt is told where it goes; a wrong one learns nothing more", async () => {
  for (const [handler, path] of [[status, "/offer/status"], [withdraw, "/offer/withdraw"]]) {
    const missing = await call(handler, path, "");
    assert.equal(missing.status, 404, path);
    assert.match(missing.json.message, /field named receipt, never in the URL/, path);

    const wrong = await call(handler, path, `receipt=${"A".repeat(43)}`);
    assert.equal(wrong.status, 404, path);
    assert.equal(wrong.json.code, "receipt_not_found", path);
    assert.equal(wrong.json.message, "No temporary offer is available for that receipt.", path);
  }
});

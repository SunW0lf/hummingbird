import assert from "node:assert/strict";
import {
  MAX_ACTIVE_OFFERS,
  MAX_OFFER_CHARS,
  expiryIso,
  newReceiptSecret,
  normalizeOffer,
  sha256Hex,
  validReceiptSecret,
} from "../lib/offer-runtime.mjs";

assert.equal(MAX_ACTIVE_OFFERS, 250, "v0.1 active-offer capacity changed unexpectedly");
assert.equal(MAX_OFFER_CHARS, 4000, "v0.1 offer length changed unexpectedly");

const valid = normalizeOffer(new URLSearchParams({
  offer: "  A useful correction.  ",
  reference: "https://example.com/reference",
  question_id: "project-critique",
}));
assert.equal(valid.ok, true);
assert.equal(valid.value.body, "A useful correction.");
assert.equal(valid.value.referenceUrl, "https://example.com/reference");
assert.equal(valid.value.questionId, "project-critique");

for (const params of [
  new URLSearchParams({ offer: "   " }),
  new URLSearchParams({ offer: "x", reference: "javascript:alert(1)" }),
  new URLSearchParams({ offer: "x", question_id: "not valid with spaces" }),
]) {
  assert.equal(normalizeOffer(params).ok, false);
}

const tooLong = normalizeOffer(new URLSearchParams({ offer: "x".repeat(4001) }));
assert.equal(tooLong.ok, false);

const receiptA = newReceiptSecret();
const receiptB = newReceiptSecret();
assert.equal(validReceiptSecret(receiptA), true);
assert.equal(validReceiptSecret(receiptB), true);
assert.notEqual(receiptA, receiptB);
assert.equal(receiptA.length, 43);
assert.match(await sha256Hex(receiptA), /^[0-9a-f]{64}$/);

const base = new Date("2026-09-12T00:00:00.000Z");
assert.equal(expiryIso(base), "2026-10-12T00:00:00.000Z");

console.log("PASS: Phase 2E offer runtime validates bounded payloads, private receipts, and pilot capacity");

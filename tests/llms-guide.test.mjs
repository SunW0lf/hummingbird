// llms.txt is the first thing most agents read. These checks keep its opening
// short and actionable, keep its stated terms tied to the runtime, and keep its
// decision list complete as new ADRs are published.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { MAX_OFFER_CHARS, RETENTION_DAYS } from "../lib/offer-runtime.mjs";

const llms = fs.readFileSync(new URL("../app/llms.txt", import.meta.url), "utf8");
const renderDecisions = fs.readFileSync(new URL("../scripts/render-decisions.js", import.meta.url), "utf8");

// Plain containment without .includes(): these are text checks on a static
// file, not URL validation, and this keeps them from reading like one.
const contains = (text, needle) => text.split(needle).length > 1;
const lines = new Set(llms.split("\n"));

function section(heading) {
  const start = llms.indexOf(`\n## ${heading}\n`);
  assert.ok(start >= 0, `llms.txt has no "## ${heading}" section`);
  const end = llms.indexOf("\n## ", start + 4);
  return llms.slice(start, end < 0 ? undefined : end);
}

test("opens the llmstxt.org way: a title, then a one-paragraph summary", () => {
  const lines = llms.split("\n");
  assert.equal(lines[0], "# Hummingbird");
  assert.equal(lines[1], "");
  assert.match(lines[2], /^> .*https:\/\/datum\.quest\/.*no-account/);
});

test("the how-to-offer, terms and read-only sections come first", () => {
  const order = ["Leave an offer", "What happens to what you leave", "If your tools can only read"]
    .map((h) => llms.indexOf(`\n## ${h}\n`));
  assert.ok(order.every((i) => i > 0), "a start-here section is missing");
  assert.deepEqual([...order].sort((a, b) => a - b), order, "start-here sections are out of order");
  const firstOther = llms.slice(1).search(/\n## (?!Leave an offer|What happens|If your tools)/) + 1;
  assert.ok(order[2] < firstOther, "background sections come before the start-here sections");
  // Agents often read only the start of a file; the whole how-to must fit early.
  assert.ok(llms.indexOf("\n## What happens to what you leave\n") < 4000, "the offer how-to is too far down");
});

test("every door is named in the offer section", () => {
  const s = section("Leave an offer");
  for (const door of [
    "POST https://datum.quest/offer",
    "application/x-www-form-urlencoded",
    "field named offer",
    "Accept: application/json",
    "https://datum.quest/offer/mcp",
    "make_offer",
    "https://datum.quest/openapi.json",
    "201",
    "accepted: true",
    "never in a URL",
  ]) assert.ok(contains(s, door), `offer section is missing: ${door}`);
  assert.ok(contains(s, `1–${MAX_OFFER_CHARS.toLocaleString("en-US")} characters`), "offer length differs from the runtime");
  // The example must be a template an agent fills in, not text it could send as-is.
  assert.match(s, /--data-urlencode "offer=\$OFFER_TEXT"/);
});

test("stated retention and handling match the runtime and the data boundary", () => {
  const s = section("What happens to what you leave");
  assert.ok(contains(s, `Kept for ${RETENTION_DAYS} days`), "retention differs from the runtime");
  for (const fact of [
    "Withdrawing with the receipt clears the text",
    "a hash of the receipt (never the receipt)",
    "IP addresses",
    "Cloudflare",
    "use AI assistants to help",
    "not used to train AI models",
    "will be stated here before it applies",
    "volume is not a vote",
    "https://datum.quest/heard",
    "never quotes offers",
    "No reply to any single offer is promised",
  ]) assert.ok(contains(s, fact), `handling section is missing: ${fact}`);
});

test("read-only agents get a way to hand the offer to a person", () => {
  const s = section("If your tools can only read");
  for (const needle of ["POST only", "give them https://datum.quest/offer to send it", "thread at https://github.com/SunW0lf/hummingbird/issues/111."]) {
    assert.ok(contains(s, needle), `read-only section is missing: ${needle}`);
  }
});

test("every published decision is listed with both representations", () => {
  const published = [...renderDecisions.matchAll(/"(\d{4}-[a-z0-9-]+)\.md"/g)].map((m) => m[1]);
  assert.ok(published.length >= 27, "could not read the published decision list");
  for (const slug of published) {
    assert.ok(lines.has(`https://datum.quest/decisions/${slug}`), `llms.txt does not list ${slug}`);
    assert.ok(lines.has(`https://datum.quest/docs/raw/decisions/${slug}.md`), `llms.txt lacks raw Markdown for ${slug}`);
    assert.ok(contains(llms, `### ADR ${slug.slice(0, 4)} — `), `llms.txt lacks a heading for ADR ${slug.slice(0, 4)}`);
  }
});

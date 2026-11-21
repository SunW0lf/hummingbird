// Scoped asks (ADR 0030). These checks keep each ask tied to a sentence that is
// really on its page, keep the cards on /offer using the existing offer route
// and field, and keep the same list in front of agents (asks.json, MCP, guide).
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";
import { normalizeOffer, MAX_QUESTION_ID_CHARS } from "../lib/offer-runtime.mjs";
import { TOOLS, onRequestPost as mcp } from "../functions/offer/mcp.js";

const require = createRequire(import.meta.url);
const { renderAsks, validateSource, MARKER } = require("../scripts/render-asks.js");

const root = new URL("../", import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), "utf8");
const source = JSON.parse(read("asks.json"));
const dist = (p) => read(`dist/${p}`);
const published = JSON.parse(dist("asks.json"));
const contains = (text, needle) => text.split(needle).length > 1;

test("the source is valid and small", () => {
  assert.deepEqual(validateSource(source), []);
  assert.ok(source.asks.length >= 1 && source.asks.length <= 6);
  for (const ask of source.asks) {
    // An ask id is sent as question_id, so the runtime must take it unchanged.
    const result = normalizeOffer(new URLSearchParams({ offer: "x", question_id: ask.id }));
    assert.equal(result.ok, true, `${ask.id} is not a valid question_id`);
    assert.equal(result.value.questionId, ask.id);
    assert.ok(ask.id.length <= MAX_QUESTION_ID_CHARS);
  }
});

test("asks never ask for personal details or for spreading the word", () => {
  for (const ask of source.asks) {
    assert.doesNotMatch(ask.ask, /\b(share|repost|retweet|forward|invite|recruit|tell (your|a) friend|spread)\b/i, ask.id);
    assert.doesNotMatch(ask.ask, /\b(your (name|email|age|location|address|phone)|who you are)\b/i, ask.id);
  }
});

test("asks.json publishes every ask with the exact sentence and its SHA-256", () => {
  assert.equal(published.asks.length, source.asks.length);
  for (const [i, ask] of source.asks.entries()) {
    const out = published.asks[i];
    assert.equal(out.id, ask.id);
    assert.equal(out.kind, ask.kind);
    assert.equal(out.target.text, ask.target);
    assert.equal(out.target.sha256, crypto.createHash("sha256").update(ask.target, "utf8").digest("hex"));
    assert.match(out.target.page, /^https:\/\/datum\.quest\//);
    assert.equal(out.answer_at, `https://datum.quest/offer#${ask.id}`);
  }
  for (const door of ["POST https://datum.quest/offer", "question_id", "make_offer"]) {
    assert.ok(contains(published.about + JSON.stringify(published.how_to_answer), door), door);
  }
});

test("each sentence carries a link in place to its card", () => {
  for (const ask of source.asks) {
    const html = dist(ask.page);
    assert.ok(contains(html, `<a class="ask-link" href="/offer#${ask.id}">`), `${ask.id} has no in-place link on ${ask.page}`);
  }
});

test("each card is a plain form posting to /offer with the ask id as question_id", () => {
  const offer = dist("offer.html");
  assert.ok(!contains(offer, MARKER), "the asks marker was left unfilled");
  for (const ask of source.asks) {
    const start = offer.indexOf(`<article class="seed-card ask-card" id="${ask.id}">`);
    assert.ok(start > 0, `${ask.id} has no card`);
    const card = offer.slice(start, offer.indexOf("</article>", start));
    assert.ok(contains(card, '<form method="post" action="/offer">'));
    assert.ok(contains(card, `<input type="hidden" name="question_id" value="${ask.id}">`));
    assert.ok(contains(card, 'name="offer"'));
    assert.ok(!contains(card, "<script"), "cards need no JavaScript");
  }
  // The asks come before the open box, which still takes anything.
  assert.ok(offer.indexOf('id="asks"') < offer.indexOf('id="anything"'));
});

function tempDist(pages) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "asks-"));
  for (const [name, html] of Object.entries(pages)) fs.writeFileSync(path.join(dir, name), html);
  return dir;
}

const ASK = { id: "ask-test", kind: "correct", page: "page.html", target: "The sky is green.", ask: "Is it?", opened: "2026-11-21" };
const OFFER_PAGE = `<html><main><h2 id="asks">Asks</h2>\n${MARKER}\n</main></html>`;

test("the build refuses an ask whose sentence changed or repeats", () => {
  const edited = tempDist({ "offer.html": OFFER_PAGE, "page.html": "<main><p>The sky is blue.</p></main>" });
  const problems = renderAsks(edited, { asks: [ASK] });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /not on the page word for word/);
  assert.ok(!fs.existsSync(path.join(edited, "asks.json")), "nothing is written when an ask is stale");

  const twice = tempDist({ "offer.html": OFFER_PAGE, "page.html": "<main><p>The sky is green.</p><p>The sky is green.</p></main>" });
  assert.match(renderAsks(twice, { asks: [ASK] })[0], /more than once/);

  // Text outside <main> (titles, metadata) never counts.
  const outside = tempDist({ "offer.html": OFFER_PAGE, "page.html": "<title>The sky is green.</title><main><p>Hi.</p></main>" });
  assert.match(renderAsks(outside, { asks: [ASK] })[0], /not on the page/);
});

test("the build refuses a malformed source", () => {
  assert.ok(validateSource({ asks: [{ ...ASK, kind: "vote" }] }).some((p) => /kind/.test(p)));
  assert.ok(validateSource({ asks: [{ ...ASK, id: "Bad Id" }] }).some((p) => /id/.test(p)));
  assert.ok(validateSource({ asks: [{ ...ASK, ask: "<script>" }] }).some((p) => /plain text/.test(p)));
  assert.ok(validateSource({ asks: [ASK, ASK] }).some((p) => /twice/.test(p)));
  assert.ok(validateSource({ asks: Array.from({ length: 7 }, (_, i) => ({ ...ASK, id: `ask-${i}` })) }).some((p) => /at most/.test(p)));
});

test("a fresh render marks the sentence and fills the cards", () => {
  const dir = tempDist({ "offer.html": OFFER_PAGE, "page.html": "<main><p>Intro. The sky is green. More.</p></main>" });
  assert.deepEqual(renderAsks(dir, { asks: [ASK] }), []);
  const page = fs.readFileSync(path.join(dir, "page.html"), "utf8");
  assert.ok(contains(page, '<span class="ask-target">The sky is green.</span> <a class="ask-link" href="/offer#ask-test">Correct this</a> More.'));
  const list = JSON.parse(fs.readFileSync(path.join(dir, "asks.json"), "utf8"));
  assert.equal(list.asks[0].target.page, "https://datum.quest/page");
});

test("MCP lists the asks and points make_offer's question_id at them", async () => {
  const listAsks = TOOLS.find((t) => t.name === "list_asks");
  assert.ok(listAsks, "no list_asks tool");
  assert.equal(listAsks.annotations.readOnlyHint, true);
  const makeOffer = TOOLS.find((t) => t.name === "make_offer");
  assert.match(makeOffer.inputSchema.properties.question_id.description, /list_asks/);

  const env = {
    ASSETS: {
      fetch: async (req) => new URL(req.url).pathname === "/asks.json"
        ? new Response(dist("asks.json"), { headers: { "Content-Type": "application/json" } })
        : new Response("", { status: 404 }),
    },
  };
  const request = new Request("https://datum.quest/offer/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "list_asks", arguments: {} } }),
  });
  const body = await (await mcp({ request, env })).json();
  assert.equal(body.result.isError, false);
  assert.deepEqual(body.result.structuredContent.asks.map((a) => a.id), source.asks.map((a) => a.id));
});

test("the guide, OpenAPI and headers point to the asks", () => {
  const llms = read("app/llms.txt");
  const howTo = llms.slice(0, llms.indexOf("\n## What happens to what you leave\n"));
  assert.ok(contains(howTo, "https://datum.quest/asks.json"), "the offer how-to does not mention the asks");
  assert.ok(contains(howTo, "question_id"));
  assert.ok(contains(llms, "read_guide, list_asks,"));
  assert.match(read("app/openapi.json"), /asks\.json/);
  assert.match(read("app/_headers"), /\/asks\.json\n {2}Content-Type: application\/json/);
});

# ADR 0030 — Scoped asks on the offer on-ramp

Status: accepted for the C0 / Phase 2 working institution (merged 2026-11-21)

Date: 2026-11-21

## Context

The offer pilot has been open since Phase 2E and has received no outside offers. Its on-ramp is one open text box and a short list of broad questions ("What are we getting wrong?").

Research gathered for the steward on 2026-11-20 (unverified summaries of other projects, kept outside the repository) points the same way: commons that removed accounts still stayed quiet when the ask was blank, and the ones that got used put a specific ask on a specific thing the reader was already looking at, such as one sentence, one map point or one claim. The hummingbird-lab idea list ranks the same pattern first ("One Bad Sentence", then challenging one stated assumption, then sending one counterexample).

The steward's dated check (2026-12-18) asks whether offers arrive after the on-ramp is fixed. A scoped ask is the smallest fix that tests that.

## Decision

1. **A few published asks.** Hummingbird publishes up to six asks at a time. Each points at one sentence that is already on a public page and says, in one line, what would help: **correct** it, **clarify** it, **challenge** it, or say what is **missing**.
2. **In place, and on /offer.** The sentence gets a small link beside it on its own page. The offer page shows each ask as a card with its own plain HTML form, above the open box. No JavaScript.
3. **Answering is an ordinary offer.** A card posts to the existing `/offer` route with the ask's id in the existing `question_id` field. No new route, field, table, limit or retention rule; an answer is kept, read and cleared exactly like any other offer. An unknown or retired id is not refused: making an offer never needs a pass.
4. **The same list for agents.** `/asks.json` and the MCP tool `list_asks` give each ask's id, kind, exact sentence, a SHA-256 of that sentence and its page. The digest is of public text, not of anything a participant sent, so ADR 0027's keyed-hash rule does not apply to it.
5. **One source, checked at build.** `asks.json` in the repository is the only source. The build fails if an ask's sentence is no longer on its page word for word, exactly once, so an ask cannot point at text that changed.
6. **What an ask may be.** An ask is about Hummingbird's own text. It never asks for personal information, never asks anyone to share, recruit or act elsewhere (Charter §3), and answering one earns no standing.

## Consequences

- The first-offer path becomes "answer one sentence" instead of "write anything", for people and agents alike.
- The steward changes asks by pull request, like any other public text. Retiring an ask is deleting it from `asks.json`.
- Review can group answers by `question_id`, which the review export already carries.
- The 2026-12-18 check can judge this on-ramp: if four weeks of specific asks bring no outside offers, that is stronger evidence for winding down than silence on a blank box.

## Not changed

The offer runtime, its schema, limits, retention, receipt and handling terms, the OpenAPI paths, and the Phase 3 gate. The MCP door (ADR 0026) gains one read-only tool, `list_asks`, and nothing else.

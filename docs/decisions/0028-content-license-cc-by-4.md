# ADR 0028 — Hummingbird's own text is licensed CC BY 4.0

Status: accepted for the C0 / Phase 2 working institution (merged 2026-11-19)

Date: 2026-11-19

## Context

The Charter's Carry right says public artifacts "may be used elsewhere under the published license" ([CHARTER.md](../../CHARTER.md) §2). Until now the only published license was MIT, which covers software. The Charter, Governance, decisions and site pages had no stated reuse terms, tracked as `OQ-LEGAL-CONTENT-LICENSE`. [ADR 0009](0009-public-repository-security-transition.md) recorded that making the repository public did not settle this, and [ADR 0013](0013-public-read-accessibility.md) recorded that crawl access is not a content-use license.

Without stated terms, a careful person or AI agent that wants to quote, translate, fork or build on Hummingbird's text has to assume it may not. That works against Carry and against a commons meant to be read and reused by any kind of participant.

The steward chose Creative Commons Attribution 4.0 International (CC BY 4.0) on 2026-11-19.

## Decision

1. **Hummingbird's own text is licensed CC BY 4.0.** This covers text Hummingbird writes and publishes: the Markdown documents in the repository (Mission, Charter, Governance, decisions, roadmap and the rest), the prose of datum.quest's pages, `llms.txt`, and records Hummingbird writes in its own words, including syntheses. Legal code: https://creativecommons.org/licenses/by/4.0/legalcode.
2. **Software stays MIT.** Code, scripts, workflows, tests and configuration remain under the MIT license in `LICENSE`. Where a file is both (for example a page's markup and its prose), the code is MIT and the prose is CC BY 4.0.
3. **Attribution.** Reuse credits "Hummingbird (datum.quest)", names the license, links to it, and says if the text was changed. A link to the source page or document satisfies the credit.
4. **Any use, any user.** CC BY 4.0 allows any use with attribution, commercial or not, by people or by automated systems, including reading, quoting, translating, summarizing, indexing and training. Hummingbird adds no separate restriction for AI use. The license does not grant trademark rights in the Hummingbird name.
5. **Contributed material is not relicensed by this decision.** Offers, Seed Bank issues and comments, and anything else a participant writes stay under whatever terms their author has. Offers are never published by being accepted. A Hummingbird record that synthesizes a contribution is covered only as far as it is Hummingbird's own wording; the contributor's own words, at the source the record links, keep their author's terms.
6. **Inbound matches outbound.** Text contributed to the repository through a pull request is offered under the same license as the file it changes: CC BY 4.0 for text, MIT for code.

## Consequences

- `OQ-LEGAL-CONTENT-LICENSE` is resolved and moves to the resolved archive.
- `LICENSE`, `README.md`, `CONTRIBUTING.md`, `llms.txt` and `robots.txt` state the split.
- Reuse terms for contributed material that is admitted verbatim, rather than synthesized, are not decided here. No such material exists yet; admitting any will need its author's terms recorded.
- A license grant cannot be withdrawn for copies already made under it. A later change of license applies only to text published after the change.

## Amends

[ADR 0009](0009-public-repository-security-transition.md) and [ADR 0013](0013-public-read-accessibility.md): the content-use question each left open is answered here for Hummingbird's own text.

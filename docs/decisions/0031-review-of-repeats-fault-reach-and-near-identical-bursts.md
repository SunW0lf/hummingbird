# ADR 0031 — Review of repeats: fault reach and near-identical bursts

Status: Proposed (awaiting the steward; not in force until accepted)

Date: 2026-11-27

Amends: [ADR 0019](0019-phase2e-offer-triage-and-review.md)

## Context

ADR 0019 governs offer review: compress repetition, preserve meaningful difference, escalate consequence rather than volume. It compresses exact duplicates, treats counts as evidence about salience and load only, and says frequency alone is not a surfacing criterion.

The first review (2026-11-27, reported on What We Heard) raised two gaps. Those offers came from the steward's side, so they are ideas to weigh, not evidence of outside demand.

1. **Repeated fault reports.** When many separate offers report the same broken page, dead link, failing route or exposed private material, the count says something real: the fault is likely genuine and reaches many readers. ADR 0019 doesn't say whether review may use that.
2. **Near-identical bursts.** Exact-duplicate compression works on bytes. A person or a program can write many differently worded versions of one point in moments, and each would count as distinct. This is a narrow, offer-review case of `OQ-SECURITY-MULTIPLICITY-ABUSE`; it doesn't answer that question.

## Decision

1. **A fault's reach may count; an idea's popularity may not.** When separate offers report the same concrete fault in Hummingbird itself, review may treat their number as evidence of how far the fault reaches and fix it sooner. A concrete fault is something checkable: a page, link, route or door that doesn't work as published, or public text that exposes what it shouldn't. For ideas, opinions, proposals and challenges, the count still measures volume, not merit, and never moves them up. One credible report of a serious fault is enough; a fault doesn't need numbers to be fixed.
2. **A near-identical burst counts as one voice.** When offers that make substantially the same point in near-identical wording arrive close together (within about a day), review treats them as one voice, unless something in the offers themselves shows they are independent, such as different evidence, references or reasoning. Each offer keeps its own receipt, status, withdrawal and retention; nothing is discarded or refused.
3. **The same limits as ADR 0019.** Both rules are review judgments, not ingress rules. Grouping by meaning may be machine-assisted, but stays advisory under ADR 0019 §3 and changes no stored state by itself. Neither rule may use who sent an offer, its presumed origin, delivery method, account or history. A fault's reach never becomes a vote, and neither rule creates a score.
4. **Said in public.** When either rule shaped a review, What We Heard says so in that review, in coarse terms.

## Consequences

- Widespread breakage gets fixed sooner without letting repetition promote ideas.
- Rewording one point many times buys no more weight than saying it once.
- The offer page and `llms.txt` describe both rules. The offer page's "Frequency alone is not a surfacing criterion." stays, and so does the open ask about it.
- Judging "substantially the same point" needs a reviewer's judgment and can be wrong; reporting it on What We Heard keeps those calls visible and open to challenge.

# ADR 0017 — Phase 2E Experimental Ingress: Learn Before Granting Authority

Status: Accepted
Date: 2026-09-12

## Context

The interim GitHub-backed Seed Bank successfully demonstrated that external discussion can remain separate from canonical admission, publication, and governance authority. It also exposed a participation problem: the burden of entry is too high for ordinary low-friction experimentation. A participant must leave `datum.quest`, understand a repository issue interface, use a GitHub account, accept provider account attribution, and choose among provider-hosted forms before offering anything.

Hummingbird also has a large set of intentionally unresolved constitutional, governance, security, and operational questions. Continuing to answer all of them in the abstract would risk designing a commons around hypothetical use instead of observed participation.

The project therefore needs a way to gather evidence from real interaction before Phase 3 without quietly granting Phase 3 authority.

## Decision

Phase 2E may include a narrowly bounded **experimental ingress pilot** owned by Hummingbird.

The pilot exists to receive low-friction offers for testing and evidence gathering. It is an explicit exception to the earlier Phase 2 rule that Hummingbird-owned public write ingress waits until Phase 3.

The exception is limited by authority, not merely by implementation size:

- an accepted offer enters temporary, non-canonical experimental state only;
- receipt does not create a canonical record, publication, governance proposal, vote, account, reputation, participant standing, durable capability, or obligation to provide an individualized response;
- the pilot may not automatically admit, publish, govern, or exercise participant-specific durable authority;
- Phase 3 remains separately gated by the Open Questions Registry and explicit Phase 3 authorization.

The pilot is therefore evidence-gathering ingress, not Controlled Participation.

## Participant-facing surface

The first-party surface should minimize ceremony. The baseline interaction is:

- one primary text field for an offer;
- an optional reference or link;
- no account requirement;
- no required handle;
- no origin declaration;
- no CAPTCHA or proof-of-human requirement;
- no JavaScript requirement for basic operation;
- a clear acknowledgement or receipt after the system accepts the offer.

Progressive enhancement may improve the experience, but standards-compliant HTML must remain sufficient for the basic path.

## Handling contract

Before the pilot is exposed publicly, its concrete handling layer must publish the contract required by `GOVERNANCE.md`:

1. purpose and scope;
2. entry conditions;
3. required information;
4. authority and limits;
5. possible outcomes and what those outcomes do not imply;
6. escalation or review path.

At minimum, participant-facing outcome semantics must cover the possibility that an offer is:

- received;
- grouped or linked with related material;
- synthesized;
- deferred;
- allowed to expire from the experimental buffer;
- not accepted because of published resource/safety bounds;
- surfaced for further institutional consideration.

These outcomes must not become hidden judgments about participant identity, intelligence, legitimacy, reputation, or governance weight.

Receipt must explicitly state that acceptance into the experimental buffer does not mean consideration by a particular participant, endorsement, canonical admission, publication, governance promotion, or implementation commitment.

## Data and safety boundary

The experimental buffer must be disposable by design.

Before deployment, the implementation must publish pilot-scoped decisions for:

- payload bounds;
- retention duration;
- any abuse/rate-limit state collected and its shorter retention where practicable;
- duplicate/replay handling;
- overload/backpressure behavior;
- acknowledgement/receipt semantics;
- correction or withdrawal behavior, if any;
- incident and shutdown behavior;
- recovery expectations for buffered offers;
- the selected runtime and storage boundary.

Those decisions may be deliberately narrow and temporary. They do not need to settle the corresponding Phase 3 questions universally, but they may not contradict the Charter or create durable participant authority by implementation accident.

A pilot-scoped rule is evidence for later design, not automatic precedent.

## Evidence-seeking open questions

Hummingbird may identify unresolved questions as **open by design — evidence seeking** where observed interaction would materially improve the decision.

The public site should expose only a small set of questions at a time where outside experience or criticism is likely to help. Participation volume is evidence that an issue may be salient; it is not a vote and does not create governance authority.

Related offers may be clustered or synthesized so the institution can remain legible at volumes that exceed any individual steward's attention.

## Public funnel

The public front door should explain Hummingbird in progressively deeper layers:

1. **The project** — what Hummingbird is and the principles already in force.
2. **The plan** — where the roadmap is headed and what remains intentionally unresolved.
3. **Open now** — the specific interaction currently available for testing and input.

Public status language should distinguish at least:

- **exists now**;
- **open for testing**;
- **planned**.

The primary call to action should become the low-friction Hummingbird-owned offer surface once it is actually deployed. The Seed Bank may remain available as a higher-friction public discussion/archive path, but it should no longer be the primary participation entrance.

The site must not advertise the first-party pilot as live before the endpoint is deployed and its handling contract is published.

## Relationship to ADR 0016 and Phase 3

ADR 0016 remains the architectural basis for offers and the Offer Buffer. This ADR narrows one earlier restriction: a Hummingbird-owned write surface may exist during Phase 2E only within the evidence-gathering authority ceiling defined here.

Phase 3 remains the point where Hummingbird may introduce durable participant capabilities, broader controlled participation, and institutional write authority after the applicable constitutional, governance, security, and runtime gates are resolved.

The Phase 2E pilot must not be expanded incrementally into Phase 3 by implementation drift.

## Consequences

- Hummingbird can learn from actual participation before attempting to settle every unresolved rule in theory.
- Entry friction can fall substantially without requiring identity classification or accounts.
- Temporary offers remain separated from canonical memory and governance authority.
- The project gains direct evidence about expectations, duplicates, overload, receipts, synthesis, metadata needs, and abuse pressure.
- The public site can function as a truthful funnel from understanding → roadmap → current experiment.
- Some open questions can remain explicitly unresolved while the project gathers evidence relevant to them.
- Phase 3 still requires its own explicit authorization and cannot be inferred from a successful Phase 2E pilot.

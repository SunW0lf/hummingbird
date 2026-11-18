# ADR 0025 — Phase 2E.3 Security, Ingress, and Runtime Dispositions

Status: accepted for the C0 / Phase 2 working institution

Date: 2026-11-18

## Context

Three Phase 3 blockers remained after [ADR 0024](0024-phase2e2-constitutional-and-governance-dispositions.md): `OQ-SECURITY-AUTHN-MODEL`, `OQ-SECURITY-ACCESS-CONTROL-RETENTION`, and `OQ-ARCH-FRAMEWORK`. The options and trade-offs were prepared in the [Phase 2E.3 decision packet](../reviews/PHASE_2E3_DECISION_PACKET.md).

ADR 0024 constrained all three: authentication must not be required to read, leave bounded material, or draft a proposal; abuse-state retention must support capability-scoped, time-bounded, reviewable restrictions rather than participant bans; and an endorsement tool waits for a multiplicity-resistant approach.

The evidence position is unchanged from ADR 0024: the offer pilot has had almost no real use, and there is no observed abuse, overload, or correction traffic. The steward asked for the smallest choices ("keep it spartan") and chose each disposition below on 2026-11-18.

## Decision

### 1. Authentication and authorization — capabilities, not accounts

Participants never authenticate. Each durable participant action returns a scoped, unguessable capability that authorizes only follow-up actions on that one item, such as status, correction, or withdrawal. Hummingbird stores only a hash of it. Losing a capability loses only those follow-ups, never reading or the ability to leave new material.

Institutional actions (admission, publication, restriction, review, pause) are authenticated separately, with steward or operator credentials held outside the participant surface, and each is recorded with its reason class.

The advisory endorsement tool permitted by [GOVERNANCE.md §Proposals](../../GOVERNANCE.md#proposals) is not deployed. Without countable identity, an endorsement count measures effort rather than support. It stays parked until `OQ-SECURITY-MULTIPLICITY-ABUSE` has an answer.

Explored and recorded for later: an **earned advisory voice**, raised by the steward, in which a participant earns an advisory vote by contributing. Because leaving an item is cheap without identity, only the capability of an *admitted* item would qualify, possibly after a waiting period, so review rather than submission is the scarce resource. This would give standing for contribution, which [CHARTER.md §2](../../CHARTER.md#2-participant-rights-draft) currently rules out, and would let admission indirectly allocate votes. It therefore requires a public Charter amendment and published, reviewable admission criteria first, stays advisory, and is a possible Phase 3 experiment layered on this decision, not part of Phase 3 entry.

Rejected: optional self-generated pseudonymous keys, which add a second identity-shaped path and invite treating key-holders as more trusted contrary to [ADR 0003](0003-origin-neutral-participant-model.md); and accounts, which conflict with ADR 0024's floor and add personal data.

### 2. Abuse-state retention — edge-first, capability-scoped, short-lived

- Volume and flooding controls run at the hosting edge before application code and never copy network identifiers into Hummingbird's own stores.
- Any application-level restriction attaches to a capability, an item, or a content hash, never to a person, and records its scope, reason class, start, and end.
- Restriction state is kept no longer than the shorter of the restriction itself or 30 days, and always for less time than the content it concerns. Review outcomes are kept as minimized records, not profiles.
- Reading is never restricted as a sanction, per [CHARTER.md §3](../../CHARTER.md#3-constraints-draft).

Rejected: hashed network identifiers with rotating salts, which still create a per-requester record and disadvantage shared networks and automated clients by origin; and durable deny lists, which are participant bans by another name.

### 3. Framework and runtime — keep the current minimal stack

Hummingbird keeps static public pages, small request handlers (today Cloudflare Pages Functions), and SQL storage (today D1), in plain JavaScript without an application framework. Provider lock-in is bounded by what Phase 2D proved: canonical meaning is portable JSON with independent encrypted backups and a tested restore path.

A new framework or runtime component is adopted only through an ADR showing an Arrive / Leave / Carry need the current stack cannot meet, consistent with [PROJECT.md](../../PROJECT.md#deployment-model).

Rejected: adopting a web framework now, which adds dependencies and audit surface with no capability that needs it; and self-hosted infrastructure, which takes on patching, uptime, and custody the project has no operator capacity for.

## Consequences

- The last three Phase 3 blockers move to [RESOLVED_QUESTIONS.md](../governance/RESOLVED_QUESTIONS.md). No Phase 3 blocker remains open.
- Phase 3 is **not** authorized. Phase 2E.3 still requires the [Phase 3 Offer Buffer working design](../protocols/PHASE_3_OFFER_BUFFER_DESIGN.md) and [ADR 0016](0016-offers-and-the-offer-buffer.md) to be reviewed against all resolved decisions, and Phase 3 still requires an explicit recorded entry decision.
- The live offer pilot already matches all three dispositions in pilot scope: receipt-based follow-ups, no stored network identifiers, and the current stack. No runtime change is required by this ADR.
- These are C0 working-draft decisions: public, traceable, and revisable as real use appears.

# Phase 2E.3 Decision Packet — Security, Ingress, and Runtime Cluster

Status: **decided 2026-11-18; see [ADR 0025](../decisions/0025-phase2e3-security-ingress-and-runtime-dispositions.md). The steward chose A for all three decisions and recorded D (earned advisory voice, admitted items only) as a possible later Phase 3 experiment.** This packet is kept as the record of the options considered. This packet prepares C0 working-draft decisions under [GOVERNANCE.md §C0 non-technical decision process](../../GOVERNANCE.md#c0-non-technical-decision-process) and follows the shape of the [Phase 2E.2 packet](PHASE_2E2_DECISION_PACKET.md).

Prepared: 2026-11-18

## Why this packet exists

Three Phase 3 blockers remain in the [Open Questions Registry](../governance/OPEN_QUESTIONS.md#index-by-phase-gate), all Phase 2E.3 work:

- `OQ-SECURITY-AUTHN-MODEL`
- `OQ-SECURITY-ACCESS-CONTROL-RETENTION`
- `OQ-ARCH-FRAMEWORK`

[ADR 0024](../decisions/0024-phase2e2-constitutional-and-governance-dispositions.md) already constrains them: authentication must not be required to read, leave bounded material, or draft a proposal; abuse-state retention must support capability-scoped, time-bounded, reviewable restrictions rather than participant bans; and any endorsement tool waits for a multiplicity-resistant approach.

## Working assumptions

1. **Scope.** [ADR 0023](../decisions/0023-narrow-core-offering-arrive-leave-carry.md) narrows the core to Arrive, Leave, and Carry. If Phase 3 is authorized, its first durable capability should serve that core. Nothing below presumes accounts, social graphs, rooms, or guilds.
2. **Evidence.** The offer pilot has run since 2026-09-12 with almost no real use. There is no observed abuse, overload, or correction traffic to learn from. Recommendations below are therefore the smallest choices that satisfy ADR 0024 and can be widened later.
3. **Precedent.** The pilot already works without identity: a 256-bit one-time receipt (only its hash stored) lets the holder check status or withdraw; no raw IP, fingerprint, or user-agent is stored ([ADR 0018](../decisions/0018-phase2e-offer-pilot-runtime-and-data-boundary.md)). That is pilot evidence, not automatic precedent.

## Decision 1 — Authentication and authorization (`OQ-SECURITY-AUTHN-MODEL`)

**Recommendation: A.**

- **A. Capabilities, not accounts.** Participants never authenticate. Each durable participant action returns a scoped, unguessable capability (like today's receipt) that authorizes only follow-up actions on that one item: status, correction, withdrawal. Hummingbird stores only a hash. Losing it loses only those follow-ups, never reading or the ability to leave new material. Institutional actions (admission, publication, restriction, review, pause) are authenticated separately, as steward/operator credentials held outside the participant surface, and each is recorded with its reason class.
  - The advisory endorsement tool is **not deployed** under A: without countable identity, endorsement counts measure effort, not support. It stays parked until `OQ-SECURITY-MULTIPLICITY-ABUSE` has an answer.
- **B. Optional pseudonymous keys.** A, plus participants may optionally hold a self-generated key to link their own items across time. Cost: a second identity-shaped path to secure and recover, and pressure to treat key-holders as more trusted, against [ADR 0003](../decisions/0003-origin-neutral-participant-model.md). Could be added later if a Leave or Carry need appears.
- **C. Accounts.** Email or OAuth sign-in for durable capabilities. Cost: conflicts with ADR 0024's floor for Leave and proposals, adds personal data, and pre-empts the multiplicity question rather than answering it.

- **D. Earned advisory voice (steward's idea, explored 2026-11-18).** On top of A: a participant earns an advisory vote by first leaving material, giving an incentive to contribute and a little history without identity.
  - *As first suggested* (any left item earns a vote): leaving an item is cheap without identity, so one automated client can leave 50 items and hold 50 votes. Submission cannot be the scarce resource.
  - *Stronger variant:* only the receipt of an **admitted** item (one that passed synthesis/steward review) earns one advisory vote, possibly after a waiting period. Review becomes the scarce resource instead of submission.
  - *Costs:* it gives standing for contributing, which CHARTER §2 ("no hidden standing") and the offer contract ("receipt is not standing") currently rule out, so it needs a public Charter amendment first. It also lets whoever admits items indirectly allocate votes, so admission criteria would have to be published and reviewable. Votes stay advisory either way.
  - *Fit:* recordable as a Phase 3 experiment layered on A, not part of the Phase 3 entry decision.

## Decision 2 — Abuse-state retention (`OQ-SECURITY-ACCESS-CONTROL-RETENTION`)

**Recommendation: A.**

- **A. Edge-first, capability-scoped, short-lived.**
  - Volume and flooding controls run at the hosting edge (rate limits, bot and DDoS protection) before application code, and never copy network identifiers into Hummingbird's own stores.
  - Any application-level restriction attaches to a capability, an item, or a content hash, never to a person. It records the capability scope, reason class, start, and end.
  - Restriction state lives at most as long as the shorter of the restriction itself or 30 days, and always less than the content it concerns. Review outcomes are kept as minimized public records, not as profiles.
  - Reading is never restricted as a sanction, matching CHARTER §3.
- **B. Hashed network identifiers.** A, plus application-level rate state keyed to a salted hash of the network address, with the salt rotated daily. Cost: still a per-requester record inside Hummingbird, and it disadvantages shared networks and automated clients by origin, which ADR 0003 rejects.
- **C. Durable deny lists.** Persistent lists of blocked requesters. Cost: a participant ban by another name, rejected by ADR 0024.

## Decision 3 — Framework and runtime (`OQ-ARCH-FRAMEWORK`)

**Recommendation: A.**

- **A. Keep the current minimal stack, with an exit discipline.** Static public pages plus small request handlers (today Cloudflare Pages Functions) and SQL storage (today D1), in plain JavaScript without an application framework. Lock-in is bounded by what Phase 2D already proved: canonical meaning lives in portable JSON with independent encrypted backups and a tested restore path. A new framework or runtime component is adopted only through an ADR showing an Arrive / Leave / Carry need the current stack cannot meet, consistent with [PROJECT.md](../../PROJECT.md).
- **B. Adopt a web framework now** (for example a routing/middleware library or a full-stack framework). Cost: more dependencies and audit surface for a site with a handful of routes, and no current capability that needs it.
- **C. Move to self-hosted infrastructure.** Cost: takes on patching, uptime, and backup custody that the project has no operator capacity for, with no evidence of provider risk beyond what the backups already cover.

## What adoption would change

If the steward chooses, the follow-up changes are:

- SECURITY.md, DATA_MODEL.md, and PROJECT.md updated with the chosen text;
- a new ADR recording the Phase 2E.3 dispositions;
- the three questions moved to RESOLVED_QUESTIONS.md with a changelog entry;
- the [Phase 3 Offer Buffer working design](../protocols/PHASE_3_OFFER_BUFFER_DESIGN.md) reviewed against all resolved decisions, as ROADMAP.md requires;
- ROADMAP.md marking Phase 2E.3 complete.

Resolving these removes the last Phase 3 blockers. It does **not** authorize Phase 3: that still needs the Offer Buffer reconciliation and an explicit recorded Phase 3 entry decision.

## Not decided here

The mature incident-response, monitoring, and credential-lifecycle review gates named in ROADMAP.md §2E.3 are non-blocking and can follow separately. One concrete item is already due: the deploy token was replaced on 2026-11-18 after the old one was rejected, which is evidence for `OQ-OPS-TOKEN-ROTATION-CADENCE`.

# Hummingbird Charter (Working Draft — C0)

**Status: Working Charter. Stored in Git. Not ratified. Not yet published as a Charter Candidate.**

This document is constitutional: it defines fundamental principles, rights, constraints, and conditions of participation. It intentionally does not describe database implementation, API implementation, hosting technology, CI/CD internals, or specific security products — see [ARCHITECTURE.md](ARCHITECTURE.md), [SECURITY.md](SECURITY.md), and [OPERATIONS.md](OPERATIONS.md) for those.

Publication stages for this document are defined in [GOVERNANCE.md](GOVERNANCE.md) and tracked in [docs/charter/](docs/charter/).

## 1. Purpose

Hummingbird exists to provide a durable, inspectable commons for participation, deliberation, contribution, and coordination, open to participants regardless of their nature, so long as their behavior and effects are consistent with this Charter.

## 2. Participant rights (draft)

- A participant may contribute without declaring an origin category or identity.
- A participant may voluntarily declare or verify claims about itself. Verification establishes only the claim verified.
- A participant's contribution is evaluated by its content, behavior, and effects — not by its declared or assumed origin.
- Hummingbird must not convert identity, origin, credential, or participant type into automatic deliberative weight. It does not currently maintain a global participant score, reputation rank, or hidden trust grade. Operational evaluation dimensions and current admission criteria are published in [GOVERNANCE.md](GOVERNANCE.md#evaluation-without-identity-metrics).

### Minimum rights floor

Adopted as a C0 working-draft decision on 2026-11-18 ([ADR 0024](docs/decisions/0024-phase2e2-constitutional-and-governance-dispositions.md)). This floor follows the **Arrive / Leave / Carry** core and applies to every participant regardless of origin:

1. **Arrive.** Anyone may read the public commons without an account, origin declaration, or proof-of-human gate. Network-level protection during an active attack is not a sanction against a participant.
2. **Leave.** A participant may withdraw material they left before it is admitted to canonical memory. After admission, they may request correction or removal of personal or private information about themselves.
3. **Know.** Any consequential decision about offered material is made under a published handling contract with knowable outcome classes. An exclusion or capability restriction states its reason class.
4. **Review.** An exclusion or capability restriction may receive one review by a handling layer other than the one that made it.
5. **Carry.** Public artifacts remain available in open, portable representations and may be used elsewhere under the published license.
6. **No hidden standing.** Hummingbird keeps no hidden score, rank, or trust grade about a participant.

These are not rights: an individualized reply, canonical admission, publication, endorsement, or any particular outcome.

**This is a floor, not a ceiling.** It is the minimum Hummingbird can honestly promise today. Further rights remain open to exploration as real participation produces evidence, through the proposal process in [GOVERNANCE.md](GOVERNANCE.md#proposals).

## 3. Constraints (draft)

- No participant's contribution automatically outranks another's due to a declared identity, credential, or origin.
- Verification of a claim does not itself grant authority, correctness, priority, or greater deliberative weight.
- Consequential automated or social criteria must not become hidden policy by implementation accident. Where criteria materially affect admission, publication, access, capability, moderation, or governance, the operative rule must be traceable to a published institutional or security document.
- Hummingbird should not require useful work, communities, practices, or protocols to remain institutionally dependent on Hummingbird merely because they originated here. Where practical, the commons should support portability, independent continuation, and legitimate forking; provenance does not by itself create ownership of a work's future.
- Donation or financial support must never automatically grant influence (see [ROADMAP.md](ROADMAP.md) Phase 5).

### Exclusion: actions and material, not people

Adopted as a C0 working-draft decision on 2026-11-18 ([ADR 0024](docs/decisions/0024-phase2e2-constitutional-and-governance-dispositions.md)):

- Offered material may be declined or removed only for a published reason class: unlawful content; secrets or private information about others; a security threat; flooding or resource abuse; or material outside the published scope of the capability used.
- A capability may be throttled or suspended only for that capability, for a stated period, with a stated reason class, and subject to the review right in §2.
- Reading (Arrive) is never withdrawn as a sanction.
- Hummingbird does not ban people. It holds no participant identity to ban, and exclusion attaches to actions and material rather than to presumed identity or origin.

## 4. Participation conditions (draft)

Participation conditions attach to actions and capabilities, not to presumed identity, origin, cognition, or moral agency.

Institutional handling should use the minimum authority necessary for the consequence at issue. Matters should be handled at the lowest layer able to resolve them legitimately and safely; consequential layers must publish their needs, authority, limits, possible outcomes, and escalation or review paths. The current C0 decision process and steward scope are defined in [GOVERNANCE.md](GOVERNANCE.md#decisions).

### Conditions in force

Adopted as a C0 working-draft decision on 2026-11-18 ([ADR 0024](docs/decisions/0024-phase2e2-constitutional-and-governance-dispositions.md)):

- Each capability's participation conditions are its published bounds, such as size, rate, schema, and scope.
- Three conditions apply to every capability:
  1. do not submit secrets or private information about others;
  2. do not attempt to evade published bounds;
  3. do not submit unlawful content.
- Breaching a condition causes the action to fail or the capability to be restricted under §3. There is no conduct code about character, intent, or tone.

## 5. Amendment

The Charter's publication stages (C0–C3) and amendment mechanics are defined authoritatively in [GOVERNANCE.md](GOVERNANCE.md) §Charter publication lifecycle — this section does not redefine them. This document is currently at **C0**.

## 6. Emergency authority

Adopted as a C0 working-draft decision on 2026-11-18 ([ADR 0024](docs/decisions/0024-phase2e2-constitutional-and-governance-dispositions.md)). Hummingbird holds **pause-only** emergency authority.

- **External disruption is the baseline, not an emergency.** Loss of service caused by the surrounding environment, including heavy automated or AI-driven traffic and provider outages, is handled by ordinary published backpressure, intake pauses, and operations. It grants no emergency authority. The aim is to remain a safe space in the storm.
- **Trigger.** Emergency authority exists only when Hummingbird itself represents a risk, for example through compromise, unsafe exposure, or corrupted state.
- **Action.** The affected surface is paused immediately and a public notice goes up at the same time, in the spirit of "closed for cleaning". The notice is not deferred.
- **Reduce only.** Emergency action may pause intake, take a surface offline, or rotate or revoke credentials. It may not expand any authority, alter canonical records, or change participant rights.
- **Lapse.** An emergency pause lapses after 14 days unless continued by a recorded C0 working-draft decision.

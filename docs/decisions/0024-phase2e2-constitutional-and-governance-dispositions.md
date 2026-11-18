# ADR 0024 — Phase 2E.2 Constitutional and Governance Dispositions

Status: accepted for the C0 / Phase 2 working institution

Date: 2026-11-18

## Context

Phase 2E.2 requires Hummingbird to resolve the constitutional and governance questions that block Phase 3, before the security and runtime work of Phase 2E.3 begins. The [Phase 2E.1 closeout](../reviews/PHASE_2E1_CLOSEOUT.md) set the order. The options and trade-offs were prepared in the [Phase 2E.2 decision packet](../reviews/PHASE_2E2_DECISION_PACKET.md).

Five Phase 3 blockers are in scope:

- `OQ-CHARTER-RIGHTS`
- `OQ-CHARTER-EXCLUSION`
- `OQ-CHARTER-PARTICIPANT-RESPONSIBILITIES`
- `OQ-GOVERNANCE-EMERGENCY-AUTHORITY`
- `OQ-GOVERNANCE-PROPOSALS`

Two facts shaped the choices:

1. **Scope.** [ADR 0023](0023-narrow-core-offering-arrive-leave-carry.md) narrows the core to Arrive, Leave, and Carry. The rules below are sized to that core and do not presume accounts, social graphs, rooms, or guilds.
2. **Evidence.** Between the pilot's launch on 2026-09-12 and 2026-11-18, the Phase 2E offer store received two submissions in total, one of them the steward's withdrawn launch test. There is no meaningful participation evidence yet. The decisions are therefore deliberately small, grounded in existing published principles and pilot-scoped rules, and expected to be revised as real use appears.

The steward chose each disposition below on 2026-11-18.

## Decision

### 1. Minimum participant rights — a small floor, open to growth

[CHARTER.md §2](../../CHARTER.md#2-participant-rights-draft) adopts a six-part floor that applies regardless of origin: Arrive (open reading), Leave (withdrawal before admission; correction or removal of one's own private information after), Know (published handling contracts and a stated reason class for any restriction), Review (one review of a restriction by a different layer), Carry (portable public artifacts), and No hidden standing.

The floor explicitly excludes any right to an individualized reply, admission, publication, endorsement, or particular outcome.

At the steward's direction, the Charter records that this is the minimum Hummingbird can honestly promise today, not a ceiling. Further rights remain open to exploration through the proposal process as evidence accumulates.

### 2. Exclusion — actions and material, not people

[CHARTER.md §3](../../CHARTER.md#3-constraints-draft) allows material to be declined or removed only for published reason classes: unlawful content, secrets or private information about others, security threat, flooding or resource abuse, or out of scope for the capability used. A capability restriction is limited to that capability, time-bounded, reasoned, and reviewable. Reading is never withdrawn as a sanction. Hummingbird does not ban people.

Rejected: participant-level bans, which require durable identity and conflict with [ADR 0003](0003-origin-neutral-participant-model.md); and no exclusion at all, which fails once any contribution is retained.

### 3. Participation conditions — published bounds plus three universal conditions

[CHARTER.md §4](../../CHARTER.md#4-participation-conditions-draft) makes each capability's published bounds its participation conditions, plus three universal conditions:

1. no secrets or private information about others;
2. no evasion of published bounds;
3. no unlawful content.

Breach fails the action or restricts the capability under §3.

Rejected: a general code of conduct about civility or intent. That would need moderation judgment about intent, which falls outside the narrowed core and invites hidden criteria contrary to [GOVERNANCE.md §No hidden institutional criteria](../../GOVERNANCE.md#no-hidden-institutional-criteria).

### 4. Emergency authority — pause-only, triggered only by Hummingbird's own risk

[CHARTER.md §6](../../CHARTER.md#6-emergency-authority) adopts the steward's narrowed variant of pause-only authority:

- External loss of service, including heavy automated or AI-driven traffic and provider outages, is the environment's baseline and not an emergency. It is handled by ordinary published backpressure, intake pauses, and operations. The stated intent is for Hummingbird to remain a safe space in the storm.
- Emergency authority exists only when Hummingbird itself represents a risk.
- When triggered, the affected surface is paused immediately and a public notice ("closed for cleaning") is posted at the same time, not after a delay.
- The authority is reduce-only: pause, take offline, rotate or revoke. It never expands authority, alters canonical records, or changes rights.
- A pause lapses after 14 days unless continued by a recorded C0 working-draft decision.

Rejected: no defined emergency authority, which would leave pause powers implicit; and broad emergency powers, which risk the self-perpetuating authority the Charter is built to prevent.

### 5. Proposals — public pull requests anyone may draft

[GOVERNANCE.md §Proposals](../../GOVERNANCE.md#proposals) defines a formal proposal as a public, versioned pull request against the Charter, Governance, or an ADR. Anyone may draft one without an account, identity, or endorsement. Offers never become proposals automatically.

During C0, the steward decides proposals with written reasons until a later authorized process replaces this one.

At the steward's direction, the steward may use advisory tools such as an endorsement threshold for some or all proposals, where safe to deploy. Such a tool never decides a proposal and grants endorsers no standing. Endorsement counts cannot be relied on until a multiplicity- and Sybil-resistant approach is settled under `OQ-SECURITY-AUTHN-MODEL` and `OQ-SECURITY-MULTIPLICITY-ABUSE`. That evaluation is carried into Phase 2E.3.

Rejected: a binding endorsement threshold, which requires countable identity; and steward-only initiation, which makes the steward the gatekeeper of change contrary to the minimum-necessary-authority rule.

### 6. Steward succession — still deferred, with one concrete follow-on

Long-term succession (`OQ-GOVERNANCE-STEWARD-SUCCESSION`) is a non-blocking review gate and remains open. The decisions above give a future steward a smaller, more legible authority to inherit: pause-only emergency power, reasoned proposal decisions, and no participant-level sanctions.

The next concrete step is a custody plan, so that credentials, domains, and backup decryption are not recoverable only through one person. Producing that plan creates no governance authority.

## Consequences

- Five of the eight Phase 3 blockers move to [RESOLVED_QUESTIONS.md](../governance/RESOLVED_QUESTIONS.md). Three remain: `OQ-ARCH-FRAMEWORK`, `OQ-SECURITY-ACCESS-CONTROL-RETENTION`, and `OQ-SECURITY-AUTHN-MODEL`, all Phase 2E.3 work.
- Phase 2E.3 now has concrete constraints. Authentication must not be needed to read, leave material, or draft a proposal. Abuse-state retention must support capability-scoped, time-bounded, reviewable restrictions rather than participant bans. Any endorsement tool must wait for a multiplicity-resistant approach.
- These are C0 working-draft decisions. They are public, traceable, and revisable, and they do not ratify the Charter, move it to C1, or authorize Phase 3.
- The live Phase 2E pilot already satisfies the floor in pilot scope: no account, receipt-based withdrawal, a published handling contract, and no hidden scoring. No runtime change is required by this ADR.

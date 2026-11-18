# Phase 2E.2 Decision Packet — Constitutional and Governance Cluster

Status: **draft for steward decision. Nothing here is adopted.** This packet prepares C0 working-draft decisions under [GOVERNANCE.md §C0 non-technical decision process](../../GOVERNANCE.md#c0-non-technical-decision-process). It does not ratify the Charter, open Phase 3, or resolve any open question until the steward records a choice and the authoritative documents are updated.

Prepared: 2026-11-18

## Why this packet exists

[Phase 2E.1 closeout](PHASE_2E1_CLOSEOUT.md) names the order for Phase 2E.2: rights, exclusion, participation conditions, emergency authority, proposal initiation, then succession reconciliation. Five of the eight Phase 3 blockers in the [Open Questions Registry](../governance/OPEN_QUESTIONS.md#index-by-phase-gate) sit in that cluster:

- `OQ-CHARTER-RIGHTS`
- `OQ-CHARTER-EXCLUSION`
- `OQ-CHARTER-PARTICIPANT-RESPONSIBILITIES` (participation conditions)
- `OQ-GOVERNANCE-EMERGENCY-AUTHORITY`
- `OQ-GOVERNANCE-PROPOSALS`

The other three blockers (`OQ-ARCH-FRAMEWORK`, `OQ-SECURITY-ACCESS-CONTROL-RETENTION`, `OQ-SECURITY-AUTHN-MODEL`) are Phase 2E.3 work and are constrained by the choices below.

## Working assumptions

1. **Scope.** The options assume the narrowed core proposed in ADR 0023 (PR #85): **Arrive** (open reading), **Leave** (bounded contribution), **Carry** (portable public artifacts). If that scope is not adopted, recommendation A in each section still holds but would need widening before any social, room, or guild capability.
2. **Evidence.** The Phase 2E offer pilot has run since 2026-09-12. As of 2026-11-18 the offer store holds two rows in total, one of which is the steward's withdrawn launch test. There is therefore no participation evidence to lean on. These decisions are made from principle and existing pilot-scoped rules, and should be kept small so real use can revise them.
3. **Existing precedent.** The pilot already provides, in pilot scope only: no account or origin declaration, a one-time receipt, status checks, withdrawal, 30-day expiry with content clearing, bounded capacity with explicit backpressure, and no individualized response. ADR 0022 already says incidents create no new exclusion or emergency authority.

## Decision 1 — Minimum participant rights (`OQ-CHARTER-RIGHTS`)

**Recommendation: A.**

- **A. A small floor that matches Arrive / Leave / Carry.** For every participant, regardless of origin:
  1. *Arrive:* read the public commons without an account, origin declaration, or proof-of-human gate, except for network-level protection during an active attack.
  2. *Leave:* withdraw your own material before admission; after admission, request correction or removal of personal or private information about you.
  3. *Know:* any consequential decision about your material uses a published handling contract and outcome classes; an exclusion or restriction comes with a stated reason class.
  4. *Review:* one review of an exclusion or capability restriction by a layer other than the one that decided.
  5. *Carry:* public artifacts remain available in open, portable formats and may be used elsewhere under the published license.
  6. *No hidden standing:* no hidden score, rank, or trust grade is kept about you.

  Explicitly **not** rights: an individualized reply, admission, publication, endorsement, or a particular outcome.
- **B. A broader floor.** A plus a right to an individualized response and an appeal of declined offers. Cost: makes the steward the default queue, which GOVERNANCE.md rejects, and does not scale.
- **C. Defer.** Leave rights unwritten until there are participants. Cost: Phase 3 stays blocked indefinitely.

## Decision 2 — Exclusion (`OQ-CHARTER-EXCLUSION`)

**Recommendation: A.**

- **A. Exclude actions and material, not participants.**
  - Material may be declined or removed only for a published reason class: unlawful content; secrets or private information about others; security threat; flooding or resource abuse; outside the published scope of the capability used.
  - A capability may be throttled or suspended only for that capability, for a stated period, with a stated reason class, and subject to the review right in Decision 1.
  - Reading (Arrive) is never removed as a sanction.
  - There are no permanent bans of a person, since Hummingbird holds no identity to ban.
- **B. Allow participant-level bans** tied to a credential or account. Cost: requires durable identity, which conflicts with the origin-neutral model (ADR 0003) and pre-empts `OQ-SECURITY-AUTHN-MODEL`.
- **C. No exclusion at all.** Not workable once any write capability is durable.

## Decision 3 — Participation conditions (`OQ-CHARTER-PARTICIPANT-RESPONSIBILITIES`)

**Recommendation: A.**

- **A. Conditions are the published bounds of each capability.** These are size, rate, schema, and scope limits, plus three universal conditions:
  1. do not submit secrets or private information about others;
  2. do not try to evade published bounds;
  3. do not submit unlawful content.

  Breach means the action fails or the capability is restricted under Decision 2. There is no conduct code about character, intent, or tone.
- **B. A full code of conduct** (civility, good faith, and similar). Cost: requires a moderation layer and judgment about intent, which falls outside the narrowed scope and would invite hidden criteria.

## Decision 4 — Emergency authority (`OQ-GOVERNANCE-EMERGENCY-AUTHORITY`)

**Recommendation: B.**

- **A. No emergency authority** beyond ordinary published operations.
- **B. Pause-only authority.** In an incident, the steward may pause intake, take a surface offline, or rotate or revoke credentials. That is, the steward may **reduce** capability, never expand authority, alter canonical records, or change rights. Each use is disclosed publicly within 7 days and lapses after 14 days unless continued by a recorded C0 decision.
- **C. Broad emergency powers.** Cost: the kind of self-perpetuating authority the Charter is built to avoid.

B differs from A mainly by making pause and takedown explicit, time-limited, and disclosed rather than implied by operations.

## Decision 5 — Proposals and offer handling (`OQ-GOVERNANCE-PROPOSALS`)

**Recommendation: A.**

- **A. Offers never become proposals automatically.**
  - A formal governance proposal is a public, versioned document in the repository: a pull request against the Charter, Governance, or an ADR that states the question, the change, the evidence, and the consequence.
  - Anyone may draft one, whether from an offer, a synthesis, or directly.
  - During C0 the steward decides proposals under the existing C0 working-decision process, with written reasons, until a later authorized process replaces it.
  - For offers, the synthesis/review and steward layers may consider, decline (no individual reply owed), admit, or publish under the existing published criteria.
- **B. Threshold support.** A proposal advances after N endorsements. Cost: needs Sybil-resistant identity, which conflicts with origin neutrality.
- **C. Steward-only initiation.** Cost: makes the steward the gatekeeper of change and conflicts with the minimum-necessary-authority rule.

## Follow-on — Steward succession reconciliation

This is non-blocking. Once 1–5 are chosen, the existing ADR 0022 constraints should be checked against them, with one concrete next step: document a custody plan so credentials, domains, and backup decryption are not recoverable only through one person. No new authority is proposed.

## What adoption would change

If the steward chooses, the follow-up changes are:

- CHARTER.md §2, §3, §4, §6 and GOVERNANCE.md §Proposals and §Emergency authority, each with the chosen text;
- a new ADR recording the Phase 2E.2 dispositions;
- moving the five questions to RESOLVED_QUESTIONS.md with a changelog entry;
- a ROADMAP.md update marking Phase 2E.2 complete and Phase 2E.3 next.

None of this authorizes Phase 3. It only removes five of the eight blockers.

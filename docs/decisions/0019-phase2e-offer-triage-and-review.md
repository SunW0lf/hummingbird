# ADR 0019 — Phase 2E Offer Triage and Review

Status: Accepted
Date: 2026-09-12

## Context

ADR 0017 authorizes a narrow Phase 2E experimental-ingress pilot and ADR 0018 defines its temporary runtime/data boundary. Those decisions say that offers may be grouped, synthesized, deferred, surfaced, withdrawn, or expired, but they do not yet explain clearly enough how Hummingbird should organize review when participation ranges from almost nothing to more volume than a steward can read.

That gap matters before the write path opens. A low-volume system can accidentally make the steward the default queue. A high-volume system can accidentally turn repetition, chronology, or an opaque machine score into hidden authority. Hummingbird needs a review contract that works at both extremes without promising individualized attention or allowing popularity to become governance weight.

## Decision

The Phase 2E offer pilot will use a **compression-first, consequence-aware review pipeline**.

The governing rule is:

```text
compress repetition
preserve meaningful difference
escalate consequence, not volume
```

The Offer Buffer is not a popularity-ranked inbox and is not a first-come-first-served governance queue.

## 1. Intake is validation, not merit review

Before an offer enters the buffer, the ingress layer may apply only the published payload, safety, resource, and overload rules needed to decide whether it can be accepted.

Acceptance means only that the temporary write succeeded. It does not mean the offer is correct, important, novel, endorsed, or likely to receive institutional attention.

A valid accepted offer begins in `received` state.

## 2. Mechanical organization happens below substantive review

Accepted offers may be organized using information already permitted by ADR 0018:

- a featured evidence-question identifier may route an offer into that question's review context, but does not increase priority;
- exact duplicate text may be detected from the stored content hash and linked into the same working cluster while each offer keeps its own receipt and withdrawal path;
- related offers may be grouped into a temporary thematic cluster;
- chronological order may be used for stable operational ordering within an otherwise equivalent set, but age does not create governance weight.

Duplicate or related counts are evidence about salience and load only. They are not votes and are not a content score.

No grouping rule may use participant identity, presumed origin, account history, delivery method, credential strength, financial support, or a hidden reputation value.

## 3. Machine assistance may compress; it may not decide authority

The pilot may use automated or machine-assisted clustering and summarization when volume makes direct reading impractical. Such assistance is advisory and must remain below the institutional decision layer.

A synthesis process may:

- propose related groups;
- produce a working summary of a group;
- identify disagreement, contradictions, or unresolved questions;
- create a compact review packet;
- recommend that material remain deferred or be surfaced for institutional consideration.

It may not automatically:

- decide that an offer is true or false;
- assign a scalar merit, trust, legitimacy, or governance score;
- create canonical memory or publication;
- create a formal governance proposal;
- hide a materially distinct view merely because it is rare;
- promote material merely because it is repeated frequently.

If an automated process materially changes an offer's handling state, its operative criteria and version must be documented and the state change must remain explainable from the published contract. The exact model or implementation may change without changing this authority ceiling.

## 4. Review packets must preserve coverage, not just the largest cluster

A synthesis/review cycle should organize unresolved material into four review categories:

1. **current evidence questions** — offers explicitly connected to a published Phase 2E evidence question;
2. **corrections and challenges** — material asserting that Hummingbird's current public record, assumption, implementation, or decision may be wrong or incomplete;
3. **new or unclassified themes** — materially distinct ideas that do not fit an existing question or cluster;
4. **singletons and outliers** — low-frequency or hard-to-cluster material that could otherwise disappear behind large themes.

Every non-empty category should receive representation in a review packet before additional review capacity is spent repeatedly on one category. Exact duplicates are compressed before this coverage step so repetition cannot consume the queue simply by being numerous.

When review capacity is still bounded after category coverage, remaining unresolved material should be advanced primarily by **oldest waiting material after duplicate compression**, not by largest cluster size.

For singleton/outlier material that exceeds available review capacity, the system may use a documented deterministic rotating sample. Sampling is a coverage mechanism, not a quality judgment. Unsampled offers remain eligible for a later cycle until withdrawn, surfaced, or expired.

A review packet should preserve enough internal linkage to inspect the underlying temporary offers when necessary, but public evidence summaries should not expose participant material or correlation-rich telemetry merely to prove that synthesis occurred.

## 5. Surfacing criteria are consequence-based

A synthesis packet or individual offer becomes eligible to be `surfaced` when it may materially require institutional attention, for example because it:

- identifies a plausible correction or contradiction in Hummingbird's public institutional record;
- materially informs a named open question, phase gate, or current evidence-seeking question;
- proposes a change whose consequence would affect rights, authority, security, privacy, canonical memory, shared resources, or a stated institutional commitment;
- reveals a material operational or safety problem that cannot be resolved by the lower published layer;
- presents a materially distinct alternative or counterexample that would be lost by treating a cluster summary as consensus.

Frequency alone is not a surfacing criterion. A thousand repetitions of an already-understood idea do not outrank one consequential correction merely because the first idea is louder.

`surfaced` still means only "brought forward for further institutional consideration." It is not admission, publication, endorsement, implementation, a vote, or governance promotion.

## 6. The steward is not the inbox

Routine intake, duplicate detection, grouping, synthesis, and review-packet preparation should occur below the steward.

The steward should receive only:

- a bounded synthesis/review packet;
- an individual offer when the lower layer cannot preserve its meaning adequately through synthesis; or
- a matter that actually requires the steward's current residual authority under Governance.

Escalation should record why the lower layer could not resolve the matter. Reaching the steward does not itself create additional weight.

## 7. Low volume is a valid result

If the pilot receives few offers, Hummingbird does not manufacture activity, seed fake demand, or infer consensus from silence.

At low volume, offers may simply be represented directly in a review packet without elaborate clustering. If no meaningful participation occurs, the evidence record should say so. Zero or low volume is evidence about the experiment, not a system failure that justifies loosening institutional boundaries.

## 8. Overload uses backpressure before silent loss

If accepted volume exceeds synthesis/review capacity, Hummingbird may:

- keep accepted offers in `received`, `grouped`, or `deferred` state while they remain within the published retention window;
- increase mechanical grouping and synthesis;
- reduce individualized inspection in favor of review packets;
- apply published ingress backpressure or temporarily pause new acceptance before the temporary buffer becomes unsafe or misleading.

An already accepted offer must not be silently discarded merely because the queue became large. It may still be withdrawn by receipt, surfaced, or expire under the ordinary retention rule.

If overload prevents a new offer from being durably accepted, the service must say `not accepted` and issue no receipt. This is a resource outcome, not an adverse judgment about the participant or the content.

## 9. No individualized response or fixed review deadline

The Phase 2E pilot does not promise that every accepted offer will receive a bespoke response, steward reading, synthesis, or institutional decision before its 30-day ordinary retention ends.

Receipt-based status should make the handling state visible where practical. An offer may ultimately expire without further consequence. That possibility must be stated before acceptance rather than hidden behind an implied support-queue promise.

## 10. Evidence reporting is aggregate and non-electoral

Periodic pilot evidence may report coarse information such as:

- whether volume was zero, low, moderate, or overload-inducing;
- the number or coarse size bands of working clusters;
- how much material was exact duplicate, grouped, singleton/outlier, deferred, surfaced, withdrawn, or expired;
- whether synthesis preserved meaningful disagreement;
- whether backpressure or a pause was needed;
- where the review process created avoidable friction or steward dependence.

These observations help evaluate the mechanism. They do not create a poll, vote, mandate, or participant ranking.

## Relationship to unresolved governance

This ADR defines a **pilot-scoped operational review contract**. It does not resolve `OQ-GOVERNANCE-PROPOSALS`, create a formal governance-proposal initiation process, settle long-term facilitation, or authorize Phase 3.

An offer can be surfaced because it deserves institutional consideration while the question of how material later becomes a formal governance proposal remains separately open.

## Consequences

- Hummingbird can accept useful evidence without making the steward the default reader of every item.
- Flooding the buffer with repetition cannot automatically crowd out rarer material or create political weight.
- Machine assistance can reduce volume while remaining subordinate to published institutional authority.
- Outliers and counterexamples receive explicit protection from popularity collapse.
- Accepted material can still expire without individualized review, which keeps the pilot's obligation bounded and truthful.
- Overload is handled with compression, deferral, and backpressure rather than hidden dropping or emergency invention of identity-based prioritization.

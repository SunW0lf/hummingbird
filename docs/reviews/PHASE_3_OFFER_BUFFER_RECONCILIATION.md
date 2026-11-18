# Phase 3 Offer Buffer Reconciliation Review

Status: **§1 and §2 adopted by the steward on 2026-11-18** ([ADR 0016 amendment](../decisions/0016-offers-and-the-offer-buffer.md#amendment-2026-11-18)). The Phase 3 entry recommendation below is advice, not a decision, and nothing here authorizes Phase 3. It performs the review that [ROADMAP.md §Phase 2E.3](../../ROADMAP.md) requires before a Phase 3 entry decision: checking [ADR 0016](../decisions/0016-offers-and-the-offer-buffer.md) and the [Phase 3 Offer Buffer working design](../protocols/PHASE_3_OFFER_BUFFER_DESIGN.md) against every resolved Phase 3 decision.

Prepared: 2026-11-18

Decisions checked against: [ADR 0023](../decisions/0023-narrow-core-offering-arrive-leave-carry.md) (Arrive / Leave / Carry), [ADR 0024](../decisions/0024-phase2e2-constitutional-and-governance-dispositions.md) (rights, exclusion, conditions, emergency, proposals), [ADR 0025](../decisions/0025-phase2e3-security-ingress-and-runtime-dispositions.md) (capabilities not accounts, edge-first abuse state, minimal stack), and the live pilot contract in [ADR 0018](../decisions/0018-phase2e-offer-pilot-runtime-and-data-boundary.md).

## Summary

The offer concept in ADR 0016 holds up: offers carry no identity, standing, or authority; delivery method is never a merit signal; the buffer is non-canonical. Those match every later decision.

One part conflicts and needs a decision. Several parts are stale. Most of the design's "must decide before deployment" checklist is already settled by the pilot and ADR 0025.

## 1. Conflict — a required credential to make an offer

ADR 0016 and the working design say the **initial Phase 3 pilot** should use a narrow, revocable **issued capability credential** to make offers, with an uncredentialed path only for later, broader access.

ADR 0024 now says leaving bounded material must not require authentication, and ADR 0025 says participants never authenticate and receive capabilities *after* acting, scoped to one item. A credential that must be obtained *before* someone can make an offer is a gate on Leave, whatever it is called.

**Recommendation:** make the uncredentialed bounded path the default and permanent Phase 3 delivery option, as the live pilot already is. An issued credential may exist only as an *optional* path that raises quota for a client that wants it, never as a requirement, and it must not change consideration. Computational effort stays a possible later option, unchanged.

This needs a short amendment to ADR 0016 and the working design. It is the only substantive change this review finds.

## 2. Stale text

- The working design's status says "design only — not deployed" and its non-goals list "a live `/offer` page". The Phase 2E pilot has been live at `/offer` since 2026-09-12 under ADR 0017; the design should say so and describe itself as the Phase 3 successor to that pilot.
- Its "Relationship to open questions" section lists eight Phase 3 blockers as unresolved. All eight are now resolved (ADR 0024, ADR 0025).
- ADR 0016's phase-gate paragraph lists the same blockers as open. A dated note pointing to ADR 0024 and ADR 0025 is enough; the ADR's history should not be rewritten.
- The design's example "propose a new space" remains fine as offer *content*, since offers may propose anything; it does not put spaces back in scope (ADR 0023).

## 3. The "decide before deployment" checklist

| Property | Where it stands |
|---|---|
| Payload and reference limits | Settled for the pilot: 1–4,000 characters, one optional URL, 16 KiB request (ADR 0018). Carry forward unless evidence says otherwise. |
| Text/Markdown subset and rendering safety | Pilot is plain text, escaped on output. **Open** only if Phase 3 adds Markdown; recommend staying plain text. |
| Buffer retention and deletion | Pilot: 30 days with scheduled cleanup (ADR 0018). Carry forward. |
| Maximum buffered offers and overload | Pilot: 250 active, explicit "not accepted" with no receipt (ADR 0018). Carry forward. |
| Rate/resource limits per delivery path | Edge-first, no stored network identifiers (ADR 0025). Exact edge thresholds are an operations setting, not a governance decision. |
| Replay/idempotency | Pilot: a receipt is issued only after a confirmed write; exact duplicates grouped (ADR 0018). Carry forward. |
| Duplicate handling | Exact duplicates compressed, not rejected; near-duplicates grouped in review (ADR 0019). Carry forward. |
| Abuse-state retention | Settled: item-scoped, at most 30 days (ADR 0025). |
| Capability issuance, revocation, rotation | Settled: per-item capabilities returned on acceptance, hash-stored (ADR 0025). Rotation is not needed for single-item, short-lived capabilities. |
| Acknowledgement/receipt semantics | Settled by the pilot: receipt ≠ endorsement, admission, or standing (ADR 0018, CHARTER §2). |
| Correction or withdrawal while buffered | Pilot: withdraw and re-offer (ADR 0018). ADR 0025 allows a correction capability; **open** whether Phase 3 adds in-place correction. Recommend keeping withdraw-and-re-offer until someone asks for more. |
| Incident handling and emergency shutdown | Settled: pause-only, reduce-only, immediate public notice (CHARTER §6). |
| Metadata surviving admission or expiry | Pilot: a minimal tombstone until original expiry; admission creates a separate canonical record without copying buffer metadata (ADR 0018). Carry forward. |
| Recovery of buffered offers | Pilot: the buffer is disposable and not part of canonical backup (ADR 0018). Carry forward; say so explicitly for Phase 3. |

## 4. What Phase 3 would actually add

Almost everything the design asks for already exists in the pilot. What Phase 3 would change is that the offer path becomes **durable rather than experimental**: no longer framed as temporary evidence gathering, with its contract treated as a standing commitment.

## 5. Evidence position

Between 2026-09-12 and 2026-11-18 the pilot received two offers, one of them the steward's own launch test. None of the decisions in ADR 0023–0025 or this review has been tested by real participants.

## Recommendation on the Phase 3 entry decision

**Do not enter Phase 3 yet.** Nothing is blocked, but entering now would turn an untested contract into a durable commitment. The cost of waiting is low because the pilot already offers the same capability.

Suggested entry condition, for the steward to adopt or change: enter Phase 3 once the pilot has carried real offers from people other than the steward through at least one full review cycle, and that cycle's findings have been checked against ADR 0016, ADR 0018, and ADR 0025.

Until then, the next useful work is getting real people to the offer form, and making the small ADR 0016 / working-design amendment in §1 and §2 if the steward agrees with it.

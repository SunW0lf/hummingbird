# Phase 2E Experimental Ingress Protocol

Status: **open for testing**

Authoritative decisions: [ADR 0017](../decisions/0017-phase2e-experimental-ingress.md), [ADR 0018](../decisions/0018-phase2e-offer-pilot-runtime-and-data-boundary.md), [ADR 0019](../decisions/0019-phase2e-offer-triage-and-review.md), and [ADR 0020](../decisions/0020-phase2e-offer-pilot-launch-profile.md)

This protocol defines the evidence-gathering pilot running during Phase 2E without opening Phase 3.

## Purpose

The pilot tests whether Hummingbird can receive useful low-friction participation directly at `datum.quest` while preserving the boundary between temporary ingress and institutional authority.

It is intended to generate evidence about:

- entry friction;
- participant expectations after making an offer;
- duplicate and related offers;
- useful synthesis at volumes larger than one steward can read individually;
- receipt and consequence-path expectations;
- metadata actually needed for operation;
- overload and abuse pressure;
- whether origin-neutral, account-free ingress remains practical.

It is not intended to test voting, participant identity, durable reputation, persistent accounts, governance standing, canonical self-publication, or broad Phase 3 capabilities.

## Public funnel

The public front door presents three progressively deeper ideas:

### 1. The project — exists now

Explain what Hummingbird already is:

- an experimental origin-neutral commons;
- public read access and inspectable institutional records;
- explicit separation between ingress, canonical admission, publication, and governance authority;
- working Charter/governance rather than a claim of ratification.

### 2. The plan — visible now

Show a short roadmap with clear state labels:

- **exists now**;
- **open for testing**;
- **planned**.

The visitor should be able to understand the direction without reading the full repository, while the full Roadmap and Decisions remain available for inspection.

### 3. Open now — test Hummingbird

The primary call to action is the direct low-friction offer path at `datum.quest/offer`:

> **Help test Hummingbird**  
> Offer an idea, correction, question, criticism, or observation. No account or identity declaration required.

The Seed Bank remains available for participants who want a durable public GitHub discussion thread, but it is no longer the intended primary ingress.

## Minimum participant surface

Baseline fields:

- **Offer** — required text;
- **Reference** — optional URL or short reference;
- **Featured question ID** — optional bounded identifier.

The basic path does not require:

- an account;
- a handle;
- an origin declaration;
- JavaScript;
- CAPTCHA;
- proof of humanness, cognition, or participant type.

A successful accept returns a clear acknowledgement and the receipt behavior defined by ADR 0018. A receipt does not imply identity, canonical status, governance standing, or a promise of individualized review.

## Published handling contract

The live surface publishes the following in ordinary language before the participant sends an offer.

### Purpose and scope

Receive temporary offers for Phase 2E testing and institutional learning.

### Entry conditions

An offer must satisfy the published payload, safety, and resource bounds selected for the pilot. Broad subject matter is not by itself an abuse signal.

### Required information

Only the offer text, optional reference, optional featured-question identifier, and the minimum operational information justified by the pilot's published abuse/resource design may be collected.

No identity or origin declaration is required.

### Authority and limits

The experimental ingress layer may:

- accept an offer into temporary non-canonical state;
- apply published resource/safety bounds;
- identify exact duplicates or related material;
- group or synthesize related offers for evidence review;
- create bounded review packets that preserve disagreement and outliers;
- surface material to an authorized institutional layer for further consideration.

It may not automatically:

- create canonical memory;
- publish offered material;
- establish a governance proposal or vote;
- grant a capability or participant standing;
- create a reputation record;
- require a steward to provide an individualized response;
- infer or rank participant origin or identity;
- turn repetition, cluster size, delivery method, or a hidden machine score into substantive priority.

### Potential outcomes

The participant-facing vocabulary supports at least:

- `received` — accepted into the experimental buffer;
- `grouped` — linked with materially related offers;
- `synthesized` — represented within a synthesis for institutional learning;
- `deferred` — retained for later handling within the published retention window;
- `expired` — removed from the experimental buffer without further promised processing;
- `not accepted` — rejected at the ingress boundary under a published resource/safety rule;
- `surfaced` — passed onward for further institutional consideration;
- `withdrawn` — removed from active experimental state using the offer receipt.

These states do not imply that the offer is true, false, good, bad, endorsed, canonical, published, or granted governance weight unless a separate authorized process explicitly creates such a consequence.

## Triage and review at zero, ordinary, and flood volume

The pilot does not treat the Offer Buffer as a popularity-ranked inbox or as a first-come-first-served governance queue.

The review rule from ADR 0019 is:

```text
compress repetition
preserve meaningful difference
escalate consequence, not volume
```

### Intake and grouping

Acceptance checks format, safety, resource bounds, and overload only. It is not a merit decision.

After acceptance:

- a featured evidence-question identifier routes an offer into that question's review context but does not increase priority;
- exact duplicate text may be detected from the content hash and grouped while each offer retains its own receipt and withdrawal path;
- related material may be grouped into temporary thematic clusters;
- automated or machine-assisted clustering/summarization may help compress volume, but remains advisory and below institutional authority.

No grouping or review rule may use presumed participant identity/origin, account history, financial support, delivery method, credential strength, or hidden reputation.

### Review coverage

Unresolved material is organized into four categories:

1. current evidence questions;
2. corrections and challenges to Hummingbird's existing record or assumptions;
3. new or unclassified themes;
4. singletons and outliers.

Every non-empty category should receive representation in a review packet before additional capacity is repeatedly spent on one category. Exact duplicates are compressed before this coverage step so repetition cannot occupy the queue by sheer volume.

If capacity remains bounded after category coverage, remaining material is advanced primarily by oldest waiting material after duplicate compression, not by largest cluster size. When singleton/outlier material still exceeds capacity, a documented deterministic rotating sample may be used so rare material remains visible without pretending every item received bespoke review.

A review packet should preserve the core claim, material disagreement or uncertainty, and enough internal linkage to inspect the underlying temporary offers if necessary. Machine summaries are working compression, not institutional truth.

### What gets surfaced

Material becomes eligible for `surfaced` status because of consequence, not popularity. Examples include a plausible correction to Hummingbird's public record, material evidence for a named open question or gate, a change affecting rights/authority/security/privacy/canonical memory/shared resources, an operational problem a lower layer cannot resolve, or a materially distinct counterexample that would be lost by a cluster summary.

Frequency alone is not a surfacing criterion. A large cluster may demonstrate salience or load; it does not outrank a consequential singleton by being louder.

### Steward involvement

Routine receipt, duplicate detection, grouping, synthesis, and review-packet construction stay below the steward where possible. The steward receives a bounded packet, an individual offer whose meaning cannot safely be compressed, or a matter that genuinely requires present residual authority.

Escalation records why the lower layer could not resolve the matter. Reaching the steward creates no additional deliberative weight.

### If almost nothing arrives

Low volume is a valid experimental result. Hummingbird does not manufacture activity or infer consensus from silence. A small number of offers may be represented directly without elaborate clustering. If nothing meaningful arrives, the evidence record should say so.

### If the pilot is flooded

Accepted offers are not silently dropped merely because the queue becomes large. They may remain `received`, `grouped`, or `deferred` until processed, withdrawn, surfaced, or expired under the ordinary retention rule.

If the buffer or review pipeline cannot safely absorb more accepted material, Hummingbird uses published backpressure or may temporarily pause new acceptance before the queue becomes unsafe or misleading. A request that cannot be durably accepted receives no receipt and is reported as `not accepted`.

The pilot does not promise a fixed review deadline or individualized response. An accepted offer may expire after the ordinary 30-day retention period without further institutional consequence, and that possibility is visible before acceptance.

## Escalation and review

Routine experimental handling should remain below the steward whenever possible. A matter should escalate only where the lower layer lacks authority or capability to handle it under the published contract.

The pilot does not invent a durable appeal/identity system merely to support low-consequence temporary ingress. ADR 0018 supplies the pilot-scoped continuity mechanism: a private receipt controls status and withdrawal for one accepted offer. Corrections use withdraw-and-reoffer rather than permanent edit history.

## Launch implementation and verification

The pilot-scoped semantic choices are published in ADRs 0017–0020. The launch implementation now includes:

1. a dedicated `OFFER_DB` provider binding and experimental migration, separate from canonical D1;
2. a basic no-JavaScript GET/POST offer path with the published payload limits;
3. bounded capacity/backpressure behavior that returns `not accepted` rather than issuing a false receipt;
4. transactional acceptance and one-time receipt generation;
5. receipt-based status and withdrawal behavior;
6. scheduled expiry cleanup with the published post-expiry cleanup target;
7. deterministic exact-duplicate grouping, while broader thematic synthesis remains advisory/future pilot work;
8. an operational pause path that does not damage the public read plane;
9. production checks for unchanged public-read accessibility, the offer route/binding, validation failure, and the accept → status → withdraw lifecycle.

Launch evidence on 2026-09-11 Pacific Time: the dedicated offer store was provisioned/migrated/bound successfully; the production public-read and offer-route smoke tests passed; and a one-time production test successfully accepted a unique offer, retrieved its status by private receipt, withdrew it, and confirmed the withdrawn state. The test offer was left withdrawn. Credentials, receipt secrets, provider database identifiers, and participant material are not part of this public evidence record.

These are minimum safe-pilot choices, not universal answers to the corresponding Phase 3 questions.

## Evidence review

The project should periodically publish a compact evidence summary rather than raw participant telemetry. Useful observations include:

- whether participation was zero, low, moderate, or overload-inducing;
- coarse accepted/withdrawn/expired/surfaced ranges appropriate to privacy and correlation risk;
- exact-duplicate and relatedness patterns;
- the number or coarse size bands of working clusters;
- whether singleton/outlier coverage changed what the synthesis noticed;
- synthesis usefulness and preserved disagreement;
- capacity, backpressure, or abuse failures;
- unexpected participant expectations;
- friction or accessibility problems;
- where routine handling still depended unnecessarily on the steward;
- which open questions gained meaningful evidence and which did not.

Volume is not a vote. The evidence summary must not turn offer count, cluster size, or repetition into governance weight.

## Exit / expansion rule

The experiment may remain small, change, pause, or be removed based on evidence.

Expansion beyond this authority ceiling — especially durable participant capabilities, accounts, automatic canonical writes, participant-specific durable restrictions, governance standing, or binding proposal/voting mechanics — requires the relevant Phase 3 decisions and explicit Phase 3 authorization.

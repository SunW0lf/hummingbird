# Phase 2E Experimental Ingress Protocol

Status: **open for testing — bounded Phase 2E experiment; Phase 3 remains blocked**

Authoritative decisions: [ADR 0017](../decisions/0017-phase2e-experimental-ingress.md), [ADR 0018](../decisions/0018-phase2e-offer-pilot-runtime-and-data-boundary.md), [ADR 0019](../decisions/0019-phase2e-offer-triage-and-review.md), and [ADR 0020](../decisions/0020-phase2e-offer-pilot-launch-profile.md).

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

It is not a test of voting, participant identity, durable reputation, persistent accounts, governance standing, canonical self-publication, or broad Phase 3 capabilities.

## Public funnel

The public front door presents three progressively deeper states:

1. **Exists now** — Hummingbird's public commons, working Charter, records, decisions, and inspectable institutional history.
2. **Open for testing** — the bounded Phase 2E offer pilot at `https://datum.quest/offer`.
3. **Planned** — durable participant capabilities, persistent spaces, and later governance that remain behind their named gates.

The direct Phase 2E offer surface is the primary low-friction participation path. The Seed Bank may remain available as a higher-friction durable public GitHub discussion/archive path.

## Minimum participant surface

The live surface accepts:

- **Offer** — required text, 1–4,000 Unicode characters;
- **Reference** — optional `http:` or `https:` URL, maximum 2,048 characters;
- **Evidence question** — optional current question identifier.

Basic use does not require:

- an account;
- a handle;
- an origin declaration;
- JavaScript;
- CAPTCHA;
- proof of humanness, cognition, or participant type.

A successful accept returns a one-time private receipt. Hummingbird stores only its cryptographic hash. The receipt controls status and withdrawal for that offer only; it does not imply identity, canonical status, governance standing, or individualized review.

## Published handling contract

### Purpose and scope

Receive temporary offers for Phase 2E testing and institutional learning.

### Entry conditions

An offer must satisfy the published payload, safety, and resource bounds. Broad subject matter is not by itself an abuse signal.

Pilot v0.1 has a global ceiling of **250 active offers**. When temporary capacity is unavailable, a request is `not accepted`, receives no receipt, and may be retried later. Capacity is not a content or participant judgment.

### Required information

The application requires only offer text plus optional reference/question fields and the minimum temporary state defined by ADR 0018. The application buffer does not maintain participant profiles, raw IP addresses, browser fingerprints, user-agent histories, origin categories, reputation values, or cross-offer identity records.

### Authority and limits

The experimental ingress layer may:

- accept an offer into temporary non-canonical state;
- apply published validation/resource bounds;
- detect and group exact duplicate text at launch;
- later group or synthesize related offers under ADR 0019;
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

Participant-visible states include:

- `received` — accepted into the experimental buffer;
- `grouped` — linked with duplicate or related material;
- `synthesized` — represented within a synthesis for institutional learning;
- `deferred` — retained for later handling within the retention window;
- `surfaced` — passed onward for further institutional consideration;
- `withdrawn` — removed from active experimental state using the receipt;
- `expired` — ordinary experimental retention ended.

`not accepted` is an ingress result when validation, storage, safety, resource, or overload bounds prevent acceptance. It is not stored as an adverse participant judgment.

These outcomes do not imply truth, falsity, endorsement, canonical admission, publication, implementation, governance weight, or participant legitimacy.

## Receipt, correction, and withdrawal

On acceptance the service returns a cryptographically random 256-bit receipt secret once. Only its SHA-256 hash is stored.

Receipt-based status is available at `/offer/status`. Receipt-based withdrawal is available at `/offer/withdraw`.

Pilot v0.1 does not maintain a permanent edit history. Correction uses a simple path:

1. withdraw the earlier offer with its receipt; and
2. make a new offer.

Withdrawal clears participant-submitted content and active grouping state while a minimal receipt tombstone may remain temporarily for coherent status behavior. Withdrawal does not erase a separate canonical record that was already deliberately created through another authorized process.

## Retention and cleanup

Ordinary accepted-offer retention is 30 days. Once the retention point passes, the offer is outside active consideration. Scheduled cleanup removes expired submitted content and later clears temporary tombstones within the published cleanup window.

The experimental buffer is intentionally disposable and has no promise of the recovery durability afforded to canonical Hummingbird memory.

## Triage and review at zero, ordinary, and flood volume

The pilot does not treat the Offer Buffer as a popularity-ranked inbox or a first-come-first-served governance queue.

The review rule from ADR 0019 is:

```text
compress repetition
preserve meaningful difference
escalate consequence, not volume
```

### Intake and grouping

Acceptance checks format, safety, resource bounds, and overload only. It is not merit review.

At launch:

- a featured evidence-question identifier routes an offer into that question's review context but does not increase priority;
- exact duplicate text may be detected from the content hash and grouped while each offer retains its own receipt and withdrawal path;
- semantic ranking or merit scoring is not deployed;
- later advisory clustering/summarization must remain below institutional authority.

No grouping or review rule may use presumed participant identity/origin, account history, financial support, delivery method, credential strength, or hidden reputation.

### Review coverage

Unresolved material is organized into four categories:

1. current evidence questions;
2. corrections and challenges to Hummingbird's existing record or assumptions;
3. new or unclassified themes;
4. singletons and outliers.

**Every non-empty category should receive representation** in a review packet before additional capacity is repeatedly spent on one category. Exact duplicates are compressed first so repetition cannot consume the queue by sheer volume.

After category coverage, remaining review capacity advances primarily by oldest unresolved material after duplicate compression, not by **largest cluster size**. If singleton/outlier material exceeds capacity, a documented deterministic rotating sample may preserve coverage without pretending every item received bespoke review.

Machine summaries are working compression, not institutional truth.

### What gets surfaced

Material becomes eligible for `surfaced` status because of consequence, not popularity. Examples include:

- a plausible correction to Hummingbird's public record;
- material evidence for a named open question or phase gate;
- a change affecting rights, authority, security, privacy, canonical memory, or shared resources;
- an operational problem a lower layer cannot resolve;
- a materially distinct counterexample that would be lost by a cluster summary.

Frequency alone is not a surfacing criterion.

### Steward involvement

Routine receipt, exact-duplicate detection, grouping, synthesis, and review-packet preparation stay below the steward where possible. The steward receives a bounded packet, an individual offer whose meaning cannot safely be compressed, or a matter that genuinely requires present residual authority.

Escalation records why the lower layer could not resolve the matter. Reaching the steward creates no additional deliberative weight.

### If almost nothing arrives

Low volume is a valid experimental result. Hummingbird does not manufacture activity or infer consensus from silence. If nothing meaningful arrives, the evidence record should say so.

### If the pilot is flooded

Accepted offers are not silently dropped merely because the review queue becomes large. They may remain `received`, `grouped`, or `deferred` until processed, withdrawn, surfaced, or expired.

The v0.1 250-active-offer ceiling supplies explicit backpressure before accepted backlog can grow without bound. If the system cannot safely absorb another accepted offer, it returns `not accepted` and issues no receipt.

The pilot does not promise a fixed review deadline or individualized response. **An accepted offer may expire after the ordinary 30-day retention period without further institutional consequence.**

## Operational pause / shutdown

The write plane may be paused if storage, abuse pressure, correctness, security, or review capacity makes continued acceptance unsafe or misleading. Pausing the write path must not require disabling the public read plane.

A paused or failed write path must fail closed: no confirmed durable write means no receipt and no claim of acceptance.

## Production acceptance contract

The production deployment pipeline verifies:

- the ordinary public read plane still passes its plain-HTTP healthcheck;
- invalid offer input fails without a receipt;
- a valid temporary offer can be accepted and returns a private receipt;
- receipt status resolves the accepted offer;
- receipt withdrawal redacts/removes it from active state;
- status then reports `withdrawn`.

The production smoke offer is withdrawn during the same test cycle so routine deployment verification does not leave active synthetic offers behind.

## Evidence review

Hummingbird should periodically publish a compact evidence summary rather than raw participant telemetry. Useful observations include:

- whether participation was zero, low, moderate, or overload-inducing;
- coarse accepted/withdrawn/expired/surfaced ranges appropriate to privacy and correlation risk;
- exact-duplicate and relatedness patterns;
- whether singleton/outlier coverage changed what synthesis noticed;
- capacity, backpressure, or abuse failures;
- unexpected participant expectations;
- friction or accessibility problems;
- where routine handling still depended unnecessarily on the steward;
- which open questions gained meaningful evidence and which did not.

Volume is not a vote. The evidence summary must not turn offer count, cluster size, or repetition into governance weight.

## Exit / expansion rule

The experiment may remain small, change, pause, or be removed based on evidence.

Expansion beyond this authority ceiling — especially durable participant capabilities, accounts, automatic canonical writes, participant-specific durable restrictions, governance standing, or binding proposal/voting mechanics — requires the relevant Phase 3 decisions and explicit Phase 3 authorization.

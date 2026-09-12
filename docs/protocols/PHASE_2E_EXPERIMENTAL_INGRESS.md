# Phase 2E Experimental Ingress Protocol

Status: **authorized design; not yet deployed**

Authoritative decision: [ADR 0017](../decisions/0017-phase2e-experimental-ingress.md)

This protocol defines the evidence-gathering pilot that may run during Phase 2E without opening Phase 3.

## Purpose

The pilot exists to test whether Hummingbird can receive useful low-friction participation directly at `datum.quest` while preserving the boundary between temporary ingress and institutional authority.

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

Once the pilot is live, the public front door should present three progressively deeper ideas:

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

When the first-party surface is deployed, the primary call to action should be a direct low-friction offer path such as:

> **Help test Hummingbird**  
> Offer an idea, correction, question, criticism, or observation. No account or identity declaration required.

Until that endpoint is genuinely live and the handling contract below is fully published, the site must label the pilot as being prepared rather than open for testing.

The Seed Bank may remain available for participants who want a durable public GitHub discussion thread, but it is not the intended primary ingress once the experimental surface exists.

## Minimum participant surface

Baseline fields:

- **Offer** — required text;
- **Reference** — optional URL or short reference.

The basic path must not require:

- an account;
- a handle;
- an origin declaration;
- JavaScript;
- CAPTCHA;
- proof of humanness, cognition, or participant type.

A successful accept must return a clear acknowledgement. The exact receipt mechanism remains a pre-deployment implementation decision and must not imply identity, canonical status, or durable standing.

## Published handling contract

The live surface must publish the following in ordinary language before the participant sends an offer.

### Purpose and scope

Receive temporary offers for Phase 2E testing and institutional learning.

### Entry conditions

An offer must satisfy the published payload, safety, and resource bounds selected for the pilot. Broad subject matter is not by itself an abuse signal.

### Required information

Only the offer text, optional reference, and the minimum operational information justified by the pilot's published abuse/resource design may be collected.

No identity or origin declaration is required.

### Authority and limits

The experimental ingress layer may:

- accept an offer into temporary non-canonical state;
- apply published resource/safety bounds;
- identify obvious duplicates or related material;
- group or synthesize related offers for evidence review;
- surface material to an authorized institutional layer for further consideration.

It may not automatically:

- create canonical memory;
- publish offered material;
- establish a governance proposal or vote;
- grant a capability or participant standing;
- create a reputation record;
- require a steward to provide an individualized response;
- infer or rank participant origin or identity.

### Potential outcomes

The participant-facing vocabulary should support at least:

- `received` — accepted into the experimental buffer;
- `related` — grouped or linked with materially related offers;
- `synthesized` — represented within a synthesis for institutional learning;
- `deferred` — retained for later handling within the published retention window;
- `expired` — removed from the experimental buffer without further promised processing;
- `not accepted` — rejected at the ingress boundary under a published resource/safety rule;
- `surfaced` — passed onward for further institutional consideration.

These states do not imply that the offer is true, false, good, bad, endorsed, canonical, published, or granted governance weight unless a separate authorized process explicitly creates such a consequence.

### Escalation and review

Routine experimental handling should remain below the steward whenever possible. A matter should escalate only where the lower layer lacks authority or capability to handle it under the published contract.

The pilot must not invent a durable appeal/identity system merely to support low-consequence temporary ingress. Before deployment, the handling contract must nevertheless state whether any correction, withdrawal, or reconsideration path exists and what continuity evidence, if any, is required to use it.

## Pre-deployment decisions still required

The pilot may be built before all Phase 3 blockers are resolved, but it must not go live until these pilot-scoped decisions are explicit and tested:

1. runtime and deployment boundary;
2. storage boundary separate from canonical admission semantics;
3. payload size/format bounds;
4. retention duration for offers;
5. minimal rate-limit/abuse state and retention;
6. duplicate/replay handling;
7. overload/backpressure behavior;
8. acknowledgement/receipt semantics;
9. correction/withdrawal behavior, if any;
10. incident/shutdown behavior;
11. buffer-loss/recovery expectation;
12. production health/acceptance tests for the write path and unchanged public-read plane.

These are minimum safe-pilot choices, not universal answers to the corresponding Phase 3 questions.

## Evidence review

The project should periodically publish a compact evidence summary rather than raw participant telemetry. Useful observations include:

- number/range of accepted offers at a coarse level appropriate to privacy and correlation risk;
- duplication/relatedness patterns;
- synthesis usefulness;
- capacity or abuse failures;
- unexpected participant expectations;
- friction or accessibility problems;
- which open questions gained meaningful evidence and which did not.

Volume is not a vote. The evidence summary should not turn offer count into governance weight.

## Exit / expansion rule

The experiment may remain small, change, pause, or be removed based on evidence.

Expansion beyond this authority ceiling — especially durable participant capabilities, accounts, automatic canonical writes, participant-specific durable restrictions, governance standing, or binding proposal/voting mechanics — requires the relevant Phase 3 decisions and explicit Phase 3 authorization.

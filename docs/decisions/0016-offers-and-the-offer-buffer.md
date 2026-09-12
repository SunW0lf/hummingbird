# ADR 0016 — Offers and the Offer Buffer: Broad Possibility, Bounded Authority

Status: Accepted
Date: 2026-09-11

## Context

Hummingbird's current public participation boundary is the external GitHub-backed Seed Bank. Phase 3 will eventually introduce a Hummingbird-owned write surface, but the project needs a concept for that boundary that does not smuggle hierarchy, participant classification, or content authority into the act of sending material toward the commons.

The conventional words `submit` and `submission` imply an applicant/authority relationship that does not fit Hummingbird well. They also encourage product designs in which the receiver appears to sit above the participant and where passing an intake gate can be mistaken for approval.

Hummingbird instead needs a term and flow that assume agency and good intent while remaining explicit about abuse controls and institutional authority.

## Decision

Hummingbird will use **offer** as the primary participant-facing concept for future Hummingbird-owned ingress.

An **offer** is material a participant intentionally places before Hummingbird for consideration. Making an offer does not establish identity, participant class, reputation, authority, canonical status, publication status, or governance weight.

Hummingbird may still use the words `submit` or `submission` where they are technically unavoidable, historically descriptive, or part of an external provider's interface, but future participant-facing Phase 3 design should prefer `offer`, `make an offer`, `offer delivery`, and `consideration`.

## What an offer may be or do

An offer is not limited to a small content contribution. It may be narrow, expansive, technical, institutional, corrective, exploratory, or foundational.

Examples include:

- an idea, observation, question, correction, critique, or piece of evidence;
- a contribution to existing work;
- a proposal, need, relationship, activity, or space;
- a suggested change to software, architecture, operations, documentation, or public presentation;
- a challenge to an existing assumption or decision;
- a proposed ADR;
- a recommendation to correct, supersede, withdraw, or archive canonical material;
- a proposed governance or Charter change, subject to the appropriate constitutional process;
- a recommendation to redesign a major subsystem or, under the right circumstances, change the whole site or project shape.

The scope of an offer does not by itself make the offer improper. Hummingbird should be able to consider foundational change without treating scale as an abuse signal.

The central rule is:

```text
possible consequence of an offer may be broad
        ≠
authority granted by making the offer
```

What an offer may propose is broad. What process is required to act on it depends on what would change.

## Offer Buffer

A future Hummingbird-owned write surface will place accepted offers into a bounded, non-canonical **Offer Buffer** before any deliberate admission into institutional memory.

The intended boundary is:

```text
participant makes an offer
        ↓
chooses an offer delivery option
        ↓
bounded Offer Buffer
        ↓
consideration / synthesis
        ↓
optional explicit admission
        ↓
canonical memory
        ↓
optional publication
```

The Offer Buffer is operational ingress state, not canonical institutional truth. Its retention, payload limits, deduplication behavior, abuse state, and recovery expectations must be explicitly bounded before deployment.

An offer entering the buffer does not imply:

- canonical admission;
- publication;
- endorsement;
- governance approval;
- an ADR number;
- implementation commitment;
- priority based on participant identity or origin.

## Offer delivery options

Phase 3 should describe anti-abuse and resource-boundary choices as **offer delivery options**, not a "menu of proof."

Delivery options exist to control resource consumption, pacing, and abuse risk. They do not prove that a participant is human, automated, intelligent, trustworthy, sincere, or deserving of greater institutional attention.

The initial controlled Phase 3 pilot should follow ADR 0014 and favor a narrow, revocable capability credential with explicit quotas, payload bounds, expiry/revocation, schema validation, and replay/duplicate controls.

Future broader access may offer additional delivery paths, for example a modest computational-effort path or an uncredentialed low-throughput path, but the same options must not be assigned to presumed participant categories.

A delivery option may affect how quickly or how often an offer can cross the resource boundary. Once an offer is accepted into the Offer Buffer, the delivery method must not become a hidden content score, reputation signal, governance weight, or presumption of merit.

In short:

```text
delivery friction may regulate resource use
        ≠
substantive consideration weight
```

## Accessibility and ordinary web semantics

The future Offer surface should be usable with ordinary HTML and without requiring JavaScript for basic operation.

When implemented, the form should favor semantic native controls such as:

- `<form>`;
- `<label>`;
- `<textarea>`;
- `<fieldset>` and `<legend>` for grouped delivery options;
- `aria-describedby` where a choice has meaningful tradeoffs that should be announced explicitly.

Progressive enhancement may be added later, but a standards-compliant client should be able to understand the offer shape and delivery choices without executing JavaScript.

## Rejected approaches

Hummingbird will not use the following as the conceptual basis for Phase 3 offer ingress:

- "proof of thought" or proof of cognition;
- trivia/context questions that are treated as evidence of participant legitimacy;
- CAPTCHA or proof-of-human requirements;
- delivery options labeled for "humans," "LLMs," "scripts," or "agents";
- a resource-intensive delivery option that grants greater substantive priority merely because more compute was spent;
- hidden reputation or trust scores derived from delivery method;
- treating offer acceptance as canonical admission or governance approval.

## Phase gate

This ADR defines terminology and the general offer/Offer Buffer architecture. [ADR 0017](0017-phase2e-experimental-ingress.md) creates one narrow Phase 2E exception to the earlier no-Hummingbird-owned-write-surface rule: Hummingbird may operate temporary, evidence-gathering ingress whose authority ends at a non-canonical experimental buffer and whose handling contract is published before deployment.

ADR 0017 does **not** authorize a Phase 3 capability system, participant accounts, automatic canonical admission/publication, governance standing, or other durable participant authority.

Phase 3 remains gated by the Open Questions Registry, including participant rights/exclusion/participation conditions, governance-proposal process, interactive framework choice, rate-limit/abuse-state retention, and authentication/authorization design.

The implementation must not silently resolve those questions merely because this ADR defines the direction or because the Phase 2E pilot succeeds.

## Consequences

- Hummingbird gains participant-facing language that assumes good intent and avoids unnecessary hierarchy.
- The project can receive ideas whose potential consequences range from trivial to foundational without granting authority merely through ingress.
- Anti-abuse controls remain focused on resource use and harmful behavior rather than participant origin.
- Delivery method cannot quietly become a reputation or governance system.
- The Offer Buffer gives Hummingbird a clear non-canonical boundary between receiving material and deciding to remember it.
- The Phase 2E experimental pilot can test that boundary without opening Phase 3 or granting durable participant authority.
- Phase 3 implementation can be tested against an explicit conceptual contract before broader controlled participation exists.

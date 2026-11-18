# Phase 3 Working Design — Offer Buffer and Offer Delivery Options

Status: **design for the Phase 3 successor to the live Phase 2E pilot; reconciled with ADR 0023–0025 on 2026-11-18 ([review](../reviews/PHASE_3_OFFER_BUFFER_RECONCILIATION.md)); Phase 3 still needs an explicit entry decision**

The Phase 2E evidence pilot has been live at `/offer` since 2026-09-12 under [ADR 0017](../decisions/0017-phase2e-experimental-ingress.md) and [ADR 0018](../decisions/0018-phase2e-offer-pilot-runtime-and-data-boundary.md). This design describes what would make that path durable in Phase 3.

This document translates ADR 0016 into a concrete working design for the first Hummingbird-owned offer surface without authorizing implementation during Phase 2.

## Purpose

The future `/offer` surface should let a participant place material before Hummingbird for consideration without requiring the participant to declare what produced the offer or prove a preferred identity class.

An offer can be small or foundational. It can suggest a typo fix, provide evidence, challenge a decision, propose a new space, recommend a new ADR, or argue that Hummingbird itself should substantially change. Broad scope is not itself an abuse signal.

What changes with scope is the process required to act on the offer.

## Conceptual lifecycle

```text
make an offer
    ↓
choose an offer delivery option
    ↓
validate payload / resource bounds
    ↓
Offer Buffer (operational, non-canonical)
    ↓
consideration / synthesis
    ↓
optional explicit admission
    ↓
canonical draft
    ↓
optional publication
```

The Offer Buffer must never be treated as a second canonical store.

## Participant-facing language

Preferred terms:

- **offer** — material intentionally placed before Hummingbird for consideration;
- **make an offer** — the participant action;
- **offer delivery options** — ways an offer may cross the anti-abuse/resource boundary;
- **Offer Buffer** — bounded non-canonical operational ingress;
- **consideration** — examination, synthesis, connection, challenge, deferral, decline, or movement toward admission;
- **admission** — the separate deliberate act that creates canonical institutional memory.

Avoid `submit` / `submission` in new participant-facing Phase 3 copy unless external tooling or a technical protocol requires the term.

## Offer shape

The first pilot should remain intentionally small. A candidate envelope is:

```text
offer
├─ offer_id            operational identifier
├─ received_at         operational timestamp
├─ kind?               optional declared shape, not participant type
├─ title?              optional short label
├─ body                bounded text/Markdown
├─ references[]?       bounded external/canonical references
└─ delivery receipt    operational anti-abuse state, not content merit
```

This is not yet a canonical schema. Exact fields, limits, identifiers, retention, and storage are deferred until the Phase 3 gate opens.

No participant-origin field is required.

## Offer delivery options

### 1. Uncredentialed bounded delivery — the default

No credential is ever required to make an offer ([ADR 0016, amended 2026-11-18](../decisions/0016-offers-and-the-offer-buffer.md#amendment-2026-11-18)). The uncredentialed bounded path, as in the live pilot, is the default from the first Phase 3 pilot onward. Flooding is handled at the hosting edge without storing network identifiers ([ADR 0025](../decisions/0025-phase2e3-security-ingress-and-runtime-dispositions.md)).

### 2. Optional issued capability — possible later path

A narrow revocable capability credential may be offered as an **optional** path, for example to raise quota for a client that wants it. It is never required and never changes consideration. If offered, it may bound:

- offer kinds;
- maximum body size;
- maximum offers per window;
- maximum active buffered offers;
- expiration;
- replay/idempotency behavior;
- revocation.

Possession establishes only the bounded ability to make an offer. It does not establish identity, origin, reputation, publication entitlement, or governance weight.

### 3. Computational effort — possible later delivery path

A future broader pilot may allow a modest proof-of-effort challenge to regulate request cost without an account or participant-origin declaration.

If adopted:

- the work factor must be published and bounded;
- it must remain feasible for ordinary commodity hardware;
- it must not be framed as an agent lane;
- spending more compute must not improve substantive consideration;
- accessibility and energy/cost implications must be reviewed;
- it should be replaceable rather than constitutionalized.

Whatever paths exist, once an offer enters the buffer it receives the same substantive consideration rules as an equivalent offer delivered another way.

## Delivery is not priority

The system must keep these facts separate:

```text
delivery method
    → resource pacing / anti-abuse handling

content and effect
    → consideration
```

The delivery method must not become a hidden `priority`, `trust`, `quality`, `reputation`, or governance field.

If operational scheduling is required because the buffer is overloaded, scheduling rules must be explicit, bounded, and designed to preserve access rather than reward expensive delivery methods.

## Form requirements when Phase 3 opens

The initial page should function without client-side JavaScript.

Minimum semantic requirements:

- `<main id="main-content">`;
- visible heading and plain-language explanation of the Offer Buffer boundary;
- explicit statement that participant origin need not be declared;
- `<label>` connected to every user-editable control;
- `<fieldset>` / `<legend>` for offer delivery options;
- `aria-describedby` for meaningful tradeoffs;
- server-side validation for all security properties;
- no inline styles required for operation;
- no hidden proof-of-thought, proof-of-cognition, origin-category, or identity-class fields.

The action endpoint must not be published until it genuinely exists and has passed the Phase 3 security/governance gate.

## Buffer properties that must be decided before deployment

Before the Phase 3 path becomes durable, the project must explicitly settle at least the following. The [reconciliation review](../reviews/PHASE_3_OFFER_BUFFER_RECONCILIATION.md#3-the-decide-before-deployment-checklist) maps each item to where it is already settled; only Markdown rendering and in-place correction remain open, and both are recommended to stay as in the pilot.

- maximum payload and reference counts;
- accepted text/Markdown subset and rendering safety;
- offer-buffer retention and deletion timing;
- maximum buffered offers and overload behavior;
- rate/resource limits per delivery path;
- replay/idempotency semantics;
- duplicate/near-duplicate handling;
- abuse-state retention;
- capability issuance/revocation/rotation;
- acknowledgement/receipt semantics;
- correction or withdrawal of a still-buffered offer;
- incident handling and emergency shutdown behavior;
- what, if any, operational metadata survives after an offer is admitted or expires;
- recovery expectations for non-canonical buffered offers.

## Relationship to open questions

All eight Phase 3 blockers it once depended on are resolved: participant rights, exclusion, participation conditions, emergency authority, and proposals by [ADR 0024](../decisions/0024-phase2e2-constitutional-and-governance-dispositions.md); authentication, abuse-state retention, and framework/runtime by [ADR 0025](../decisions/0025-phase2e3-security-ingress-and-runtime-dispositions.md).

## Non-goals

This design does not by itself create (the live `/offer` page belongs to the Phase 2E pilot):

- `/api/offer`;
- a public mutation endpoint;
- an Offer Buffer D1 table;
- participant accounts;
- reputation or trust scoring;
- automatic admission;
- automatic publication;
- governance voting;
- an implementation commitment for computational proof-of-effort.

It is a design contract for the Phase 3 gate, not a Phase 2 capability.

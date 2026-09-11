# Phase 3 Working Design — Offer Buffer and Offer Delivery Options

Status: **design only — not deployed; Phase 3 remains gated**

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

### 1. Scoped capability — initial controlled pilot

The initial Phase 3 pilot should follow ADR 0014 and use a narrow revocable capability credential.

The capability may bound:

- offer kinds;
- maximum body size;
- maximum offers per window;
- maximum active buffered offers;
- expiration;
- replay/idempotency behavior;
- revocation.

Possession establishes only the bounded ability to make an offer. It does not establish identity, origin, reputation, publication entitlement, or governance weight.

### 2. Computational effort — possible later delivery path

A future broader pilot may allow a modest proof-of-effort challenge to regulate request cost without an account or participant-origin declaration.

If adopted:

- the work factor must be published and bounded;
- it must remain feasible for ordinary commodity hardware;
- it must not be framed as an agent lane;
- spending more compute must not improve substantive consideration;
- accessibility and energy/cost implications must be reviewed;
- it should be replaceable rather than constitutionalized.

### 3. Uncredentialed bounded delivery — accessibility path

Broader participation should retain a path that does not require a capability credential or computational work.

The control may use a stricter throughput/resource envelope, but once the offer enters the buffer it must receive the same substantive consideration rules as an equivalent offer delivered another way.

Exact limits are deliberately undecided.

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

Before `/offer` becomes live, the project must explicitly settle at least:

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

This design constrains implementation but does not resolve the existing Phase 3 blockers in `docs/governance/OPEN_QUESTIONS.md`.

In particular, the project must still resolve participant rights, exclusion conditions, participant responsibilities, emergency authority, governance-proposal process, application framework/runtime, abuse-state retention, and authentication/authorization.

## Non-goals

This design does not create:

- a live `/offer` page;
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

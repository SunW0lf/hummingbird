# ADR 0014 — Progressive Capability Rollout: Limit Authority, Not Visibility

Status: Accepted
Date: 2026-09-11

## Context

Hummingbird is moving from a read-only commons toward deliberate canonical admission and, later, application-owned participation. A conventional private beta would gate the whole site behind accounts, invite walls, browser checks, or origin-sensitive access controls. That would conflict with the public-read architecture already established by ADR 0013 and would make the public commons less inspectable precisely when its write-side behavior is most experimental.

The actual risk is not that an unknown participant can read Hummingbird. The risk is that a participant can cause durable state changes, publish authoritative-looking material, consume disproportionate resources, or acquire unintended governance/control authority.

Hummingbird therefore needs a rollout model that constrains mutation and authority without converting public visibility into a privilege.

## Decision

Hummingbird will roll out participation by **limiting authority, not visibility**.

The public read plane remains openly accessible under ADR 0013. Early rollout controls are applied to mutation, admission, publication, administration, and resource-amplifying capabilities instead of requiring readers to authenticate or prove participant origin.

The core authority boundaries are distinct:

```text
ability to submit
        ≠
ability to publish
        ≠
ability to admit canonical memory
        ≠
ability to alter canonical history
        ≠
governance/control authority
```

A participant gaining one capability does not gain the others implicitly.

## Initial rollout stages

### Stage 1 — Public read, manual admission

- Public Hummingbird read surfaces remain open.
- The Seed Bank remains the bounded external submission/feedback surface.
- No external Seed Bank item becomes canonical automatically.
- The steward may deliberately admit material after review/synthesis.
- Admission creates a canonical record; publication remains a separate explicit step.

### Stage 2 — Small controlled write pilot

When Hummingbird-owned submission begins, it should start with a narrow invited pilot rather than general registration.

- invited participants/processes receive scoped mutation capability;
- the initial scope should be limited to creating draft contributions/proposals;
- the capability grants no publication, canonical-admission, moderation, treasury, or governance authority;
- quotas, payload bounds, rate limits, schema validation, replay/duplicate controls, and revocation should be applied to writes;
- no participant-origin category is required to receive or exercise a capability.

### Stage 3 — Pads and continuity

A later pilot may let a participant establish a continuing pad and receive bounded continuity capabilities. A pad is a continuing locus of participation, not a declaration that it represents a particular participant type.

### Stage 4 — Broader bounded participation

General participation may open only after the controlled pilot demonstrates acceptable abuse handling, resource cost, recovery, and admission/publication behavior. Publication and canonical admission remain separable from submission.

### Stage 5 — Guilds and richer spaces

Delegated local capabilities, guilds, scheduled spaces, shared activities, and resource-amplifying grants remain later work. They are not implied by a successful basic write pilot.

## Capability model

Early write authorization should favor narrow, revocable capability credentials over a conventional account/role hierarchy.

A future capability may conceptually express bounds such as:

```text
capability
  may_create: [contribution, proposal]
  max_active_drafts
  max_body_size
  expires_at
  pad_ref?
```

The server should store a verifier (for example, a cryptographic hash) rather than a reusable plaintext bearer secret. Possession proves only the granted authorization. It does not establish participant origin, identity class, reputation, governance weight, or publication entitlement.

Exact credential format, rotation, recovery, and storage are Phase 3 security design and are not fixed by this ADR.

## Read plane versus control plane

Public `GET`/`HEAD` access remains highly accessible and cacheable. Stronger authentication is appropriate for steward/admin/control-plane operations because those operations are not public participation surfaces.

As Hummingbird introduces abuse-sensitive or private routes, the currently broad Cloudflare public-read Skip rule must be narrowed to deliberate public routes or the read and control planes must be separated clearly. This is required by ADR 0013 and is reinforced here.

## Phase 2C application

Phase 2C will exercise this model before public application-owned writes exist:

```text
external source
      ↓
manual consideration
      ↓
explicit canonical admission
      ↓
rebuildable staged public projection
      ↓
steward review
      ↓
explicit publication
      ↓
open public read
```

The first Phase 2C implementation should therefore support an explicit admission/publication pipeline without creating participant accounts, public mutation endpoints, moderation machinery, or dynamic D1 reads for every visitor.

A publication projection is derived state. It may be committed or deployed as a static artifact for reliability, but it must remain rebuildable from canonical records and must not become a second source of institutional truth.

## Consequences

- Hummingbird can test real participation without making the commons itself private.
- Early security effort concentrates on mutation and authority, where the risk exists.
- The design avoids accidental account/reputation/social-graph architecture.
- Invited pilot access can be revoked or bounded without classifying participant origin.
- Submission, publication, admission, and governance remain separate concepts in implementation as well as documentation.
- Public page views should continue not to imply D1 queries.
- Later participation features must earn additional authority explicitly rather than inheriting it from continuity, identity, popularity, or provider metadata.

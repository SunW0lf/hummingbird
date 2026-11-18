# Project

## Scope

Hummingbird is a public, origin-neutral commons deployed at `https://datum.quest`.

The core project is intentionally narrow:

1. **Arrive** — public reading and inspection without requiring an origin category or identity declaration.
2. **Leave** — bounded contribution through an explicit ingress path whose authority is narrower than canonical admission, publication, or governance.
3. **Carry** — portable public artifacts that can be inspected, referenced, copied, downloaded, or transformed outside Hummingbird.

The current scope decision is recorded in [ADR 0023](docs/decisions/0023-narrow-core-offering-arrive-leave-carry.md).

## Goals

- Keep public arrival open to ordinary browsers, crawlers, scripts, agents, and other standards-compliant clients without requiring participant-origin classification.
- Make it possible to leave bounded useful material without forcing account creation or treating ingress as canonical truth, publication, identity, reputation, or standing.
- Produce durable, inspectable artifacts whose value does not depend on who created them or on remaining inside Hummingbird.
- Keep canonical admission, publication, provenance, correction/withdrawal, and governance authority explicit and separable.
- Prefer portable representations and visible consequence over engagement mechanics.
- Keep the system cheap to run, understandable, reversible, automatable, and recoverable by a single steward.
- Establish institutional legitimacy, participant protections, transparency, and security boundaries before expanding durable write authority.
- Let experimental work prove value before it becomes a Commons commitment.

## Non-goals

The following are not current core product goals:

- A social media platform, engagement feed, follower graph, like/karma system, or popularity-ranking system.
- General-purpose chat or a persistent conversation product.
- A participant reputation system or hidden trust hierarchy.
- An identity provider or requirement that ordinary readers declare whether they are human, agent, crawler, script, or something else.
- A general agent orchestration/runtime platform or hosted multi-agent workspace.
- Persistent rooms, guilds, games, walls, social-world simulations, or similar spaces merely because earlier working designs explored them.
- A cryptocurrency or token system.
- Premature optimization for high traffic or speculative future scale.
- Infrastructure expansion that is not required by the core Arrive / Leave / Carry offering.

Previously documented spaces, guilds, games, pads, walls, and related ideas remain inspectable in [SPACES.md](SPACES.md), [PERSISTENCE.md](PERSISTENCE.md), and Lab material as design history or experiments. They are not current roadmap commitments and must earn their way back into core scope through an explicit decision tied to demonstrated need.

## Current phase

**Phase 2 — Read-Only Commons is in progress.** Phases 2A–2D and Phase 2E.1 are complete. Phase 2E.2 is next. The bounded, temporary first-party `/offer` pilot remains open for testing; Phase 3 remains gated. See [ROADMAP.md](ROADMAP.md).

The current Phase 2E pilot fits the narrowed scope without expanding it: it is the first bounded **Leave** surface, while the public site, records, raw documents, canonical JSON, and decision provenance implement **Arrive** and part of **Carry**.

If Phase 3 is later authorized, its first durable capability should serve the narrowed core — for example bounded continuity, correction/withdrawal, provenance, return, or other artifact-centered participation. Phase 3 is not automatically an account-registration, social-space, or general interaction phase.

## Technology constraints

- Optimize for low operating cost, understandable architecture, security, reversibility, transparency, data minimization, automation, and maintainability by one steward.
- Prefer boring, mature, low-maintenance technology over novel or trendy tooling.
- Do not add external services or dependencies the project does not currently need.
- Preserve portable canonical records so infrastructure choices do not become governance semantics.
- Prove portability outside the database before allowing a persistence implementation to define the record contract by accident.
- Keep ephemeral coordination out of durable institutional storage unless a defined retention function requires it.
- Preserve the public read plane even when interactive/mutation capacity is degraded or exhausted wherever technically possible.
- Require new runtime/state machinery to justify itself against a demonstrated Arrive / Leave / Carry need rather than a speculative future feature set.

## Deployment model

- GitHub is the canonical source of truth for code, docs, schema/reference-contract material, migrations, deployment config, infrastructure scripts, and operational scripts.
- Cloudflare Pages hosts the deployed site.
- Cloudflare D1 is the current Phase 2 persistence engine for deliberately admitted canonical application records. Canonical meaning remains portable and versioned per [DATA_MODEL.md](DATA_MODEL.md), [ADR 0010](docs/decisions/0010-phase2-read-only-commons-contract.md), [ADR 0012](docs/decisions/0012-reference-corpus-before-persistence.md), and [docs/protocols/PHASE_2D_RECOVERY.md](docs/protocols/PHASE_2D_RECOVERY.md).
- The temporary Phase 2E offer pilot uses its separately bounded offer store under the accepted pilot ADRs. It is not the canonical record store and does not open Phase 3.
- Additional databases, Durable Objects, R2 usage, realtime coordination, or other runtime components should be added only when an authorized core capability actually requires them.
- Production deployment occurs only from protected `main`, only after required CI passes.

## Data posture

Phase 2 uses small canonical documents, minimal events, typed relationships, rebuildable derived projections, and explicit retention limits. The authoritative retention periods are in [SECURITY.md](SECURITY.md).

The public canonical read model remains read-only. Phase 2E makes a narrow exception for the live `/offer` pilot: temporary non-canonical ingress with a private receipt, status, and withdrawal. It does not admit, publish, or grant governance standing. The Seed Bank uses GitHub as a separate provider-hosted public discussion path under ADR 0011; GitHub issues, comments, account metadata, and reactions are not automatically canonical Hummingbird records.

The storage-independent reference corpus under `fixtures/canonical/` is contract/test material rather than production institutional memory. Deliberate admission into the commons remains a separate action.

Future participation should preserve the same discipline: a request, presence signal, self-description, connection attempt, message, or other interaction is not automatically durable institutional memory merely because it can be stored.

## Experimental work

The Lab may explore interaction models beyond the core: provisions, packets, links, asynchronous encounters, alternate interfaces, richer spaces, or other ideas. Lab work is evidence and design exploration, not automatic Commons scope.

Promotion follows the same discipline as other consequential changes:

```text
experiment
-> evidence
-> explicit proposal / ADR / open-question work where required
-> Commons adoption only if justified
```

This separation lets the project remain curious without forcing every interesting prototype into the institution.

## Cost posture

The current Cloudflare persistence stack has substantial free/paid included usage, so database hosting itself is not expected to require meaningful seed funding at Phase 2 or early controlled-participation scale. [PERSISTENCE.md](PERSISTENCE.md) records a dated pricing snapshot, planning envelopes, cost hazards, and suggested budget gates.

If Hummingbird eventually seeks seed support, the stronger likely needs are steward time, independent security review, accessibility/usability work, legal/organizational advice, and a modest reserve for participation spikes — not an exaggerated claim that ordinary SQL storage is inherently expensive.

This cost analysis does not authorize a project treasury or expenditure process and does not alter Phase 5.

## Major open questions

The authoritative unresolved list is [docs/governance/OPEN_QUESTIONS.md](docs/governance/OPEN_QUESTIONS.md).

Narrowing the product scope does **not** silently resolve any open question. Questions attached only to de-scoped persistent-space concepts may remain open or deferred until those concepts are reconsidered; they do not regain roadmap priority merely because they already have IDs.

Current Phase 3 blockers and governance/security questions remain binding until resolved through their published process.

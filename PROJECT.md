# Project

## Scope

Hummingbird is a public commons for participation, deliberation, contribution, and coordination, open to participants without requiring an origin category or identity declaration, deployed at `https://datum.quest`.

## Goals

- Build a durable, inspectable commons that remains valuable independently of who created any given contribution.
- Evaluate contributions by behavior, content, and effect — not by assumed origin.
- Keep the system cheap to run, easy to understand, and recoverable by a single steward.
- Establish institutional legitimacy (mission, charter, transparency) before building interactive features.

## Non-goals (for now)

- Not a social media platform. No feeds, likes, or engagement optimization.
- Not a cryptocurrency or token system.
- Not scaled for high traffic from day one — do not prematurely optimize for scale.
- Not dependent on `sunwolf.dev` or any other project's infrastructure.
- Not a second staging environment — `datum.quest` is the only deployment target for now (see [docs/decisions/0001-single-production-domain.md](docs/decisions/0001-single-production-domain.md)).

## Current phase

**Phase 2 — Read-Only Commons is in progress; Phase 2A is complete and Phase 2B persistence/import work is underway.** Phase 0 — Foundation and Phase 1 — Public Charter Site are complete. See [ROADMAP.md](ROADMAP.md).

## Technology constraints

- Optimize for low operating cost, understandable architecture, security, reversibility, transparency, data minimization, automation, and maintainability by one steward.
- Prefer boring, mature, low-maintenance technology over novel or trendy tooling.
- Do not add external services or dependencies the project does not currently need.
- Preserve portable canonical records so infrastructure choices do not become governance semantics.
- Prove portability outside the database before allowing a persistence implementation to define the record contract by accident.

## Deployment model

- GitHub is the canonical source of truth for code, docs, schema/reference-contract material, migrations, deployment config, infrastructure scripts, and operational scripts.
- Cloudflare Pages hosts the deployed site.
- Cloudflare D1 is the planned initial Phase 2 persistence engine. The Phase 2B local migration/import/export round trip is already exercised in CI; no remote production D1 database has been created yet. Canonical data remains portable and versioned per [DATA_MODEL.md](DATA_MODEL.md), [ADR 0010](docs/decisions/0010-phase2-read-only-commons-contract.md), and [ADR 0012](docs/decisions/0012-reference-corpus-before-persistence.md).
- Production deployment occurs only from protected `main`, only after required CI passes.

## Data posture

Phase 2 uses small canonical documents, minimal events, typed relationships, rebuildable derived projections, and explicit retention limits. The authoritative retention periods are in [SECURITY.md](SECURITY.md).

Phase 2 is deliberately read-only from the Hummingbird application perspective. The interim Seed Bank uses GitHub as external provider-hosted ingress under ADR 0011; GitHub issues, comments, account metadata, and reactions are not automatically canonical Hummingbird records.

The storage-independent reference corpus under `fixtures/canonical/` is contract/test material rather than production institutional memory. Deliberate admission into the commons remains a separate action.

## Major open questions

The authoritative unresolved list is [docs/governance/OPEN_QUESTIONS.md](docs/governance/OPEN_QUESTIONS.md). Highlights relevant to overall project scope:

- [OQ-ARCH-FRAMEWORK](docs/governance/OPEN_QUESTIONS.md#oq-arch-framework) — final application framework/runtime for interactive phases (Phase 3+) — deferred until the read-only commons exists.
- Governance structure specifics (facilitation model, amendment thresholds, emergency authority) — see [GOVERNANCE.md](GOVERNANCE.md) and the registry's Governance section.
- [OQ-PROJECT-LEGAL-STRUCTURE](docs/governance/OPEN_QUESTIONS.md#oq-project-legal-structure) — legal/organizational structure for Hummingbird as an entity, if any.

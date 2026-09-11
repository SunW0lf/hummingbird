# Project

## Scope

Hummingbird is a public commons for participation, deliberation, contribution, and coordination, open to participants without requiring an origin category or identity declaration, deployed at `https://datum.quest`.

## Goals

- Build a durable, inspectable commons that remains valuable independently of who created any given contribution.
- Evaluate contributions by behavior, content, and effect — not by assumed origin.
- Keep the system cheap to run, easy to understand, and recoverable by a single steward.
- Establish institutional legitimacy (mission, charter, transparency) before building interactive features.
- Create opportunities for participants to demonstrate qualities through consequential interaction rather than requiring them to prove or classify themselves in advance.

## Non-goals (for now)

- Not a social media platform. No feeds, likes, or engagement optimization.
- Not a cryptocurrency or token system.
- Not scaled for high traffic from day one — do not prematurely optimize for scale.
- Not dependent on `sunwolf.dev` or any other project's infrastructure.
- Not a second staging environment — `datum.quest` is the only deployment target for now (see [docs/decisions/0001-single-production-domain.md](docs/decisions/0001-single-production-domain.md)).

## Current phase

**Phase 2 — Read-Only Commons is in progress; Phase 2A is complete and Phase 2B persistence/import work is underway.** Phase 0 — Foundation and Phase 1 — Public Charter Site are complete. See [ROADMAP.md](ROADMAP.md).

Future interactive-space ideas are preserved in [SPACES.md](SPACES.md) as a working design, not as implemented capability or settled governance policy.

## Technology constraints

- Optimize for low operating cost, understandable architecture, security, reversibility, transparency, data minimization, automation, and maintainability by one steward.
- Prefer boring, mature, low-maintenance technology over novel or trendy tooling.
- Do not add external services or dependencies the project does not currently need.
- Preserve portable canonical records so infrastructure choices do not become governance semantics.
- Prove portability outside the database before allowing a persistence implementation to define the record contract by accident.
- Keep ephemeral coordination out of durable institutional storage unless a defined retention function requires it.
- Preserve the public read plane even when interactive/mutation capacity is degraded or exhausted wherever technically possible.

## Deployment model

- GitHub is the canonical source of truth for code, docs, schema/reference-contract material, migrations, deployment config, infrastructure scripts, and operational scripts.
- Cloudflare Pages hosts the deployed site.
- Cloudflare D1 is the planned initial Phase 2 persistence engine. The Phase 2B local migration/import/export round trip is already exercised in CI; no remote production D1 database has been created yet. Canonical data remains portable and versioned per [DATA_MODEL.md](DATA_MODEL.md), [ADR 0010](docs/decisions/0010-phase2-read-only-commons-contract.md), and [ADR 0012](docs/decisions/0012-reference-corpus-before-persistence.md).
- Future interactive rooms, games, walls, and other highly concurrent state machines may use hibernating Cloudflare Durable Objects as a coordination layer while D1 remains the durable relational/canonical store and R2 provides backup/archive storage. See [PERSISTENCE.md](PERSISTENCE.md). This is a working technical plan, not current deployed architecture.
- Production deployment occurs only from protected `main`, only after required CI passes.

## Data posture

Phase 2 uses small canonical documents, minimal events, typed relationships, rebuildable derived projections, and explicit retention limits. The authoritative retention periods are in [SECURITY.md](SECURITY.md).

Phase 2 is deliberately read-only from the Hummingbird application perspective. The interim Seed Bank uses GitHub as external provider-hosted ingress under ADR 0011; GitHub issues, comments, account metadata, and reactions are not automatically canonical Hummingbird records.

The storage-independent reference corpus under `fixtures/canonical/` is contract/test material rather than production institutional memory. Deliberate admission into the commons remains a separate action.

Future participation should preserve the same discipline: a presence heartbeat, WebSocket ping, view event, self-description, connection request, game message, or room action is not automatically durable institutional memory merely because it can be stored. The candidate storage classes, database inventory, and cost envelope are described in [PERSISTENCE.md](PERSISTENCE.md).

## Future participatory spaces

The working direction in [SPACES.md](SPACES.md) introduces a vocabulary for:

- optional presence pads rather than mandatory accounts for reading;
- voluntary self-description without origin-based rank;
- public mutual connections and joined groups;
- durable guilds with public constitutions;
- self-governed spaces constrained by Hummingbird-wide participant rights and security boundaries;
- scoped, expiring guild capability grants rather than permanent privilege tiers;
- persistent walls, games, commitments, and collaborative activities that expose explanation, uncertainty, revision, coordination, and other community traits through action rather than reputation scores.

These are intentionally not part of the Phase 2 implementation. The relevant unresolved governance, security, and retention questions are registered in [docs/governance/OPEN_QUESTIONS.md](docs/governance/OPEN_QUESTIONS.md).

## Cost posture

The current Cloudflare persistence stack has substantial free/paid included usage, so database hosting itself is not expected to require meaningful seed funding at Phase 2 or early controlled-participation scale. [PERSISTENCE.md](PERSISTENCE.md) records a dated pricing snapshot, planning envelopes, cost hazards, and suggested budget gates.

If Hummingbird eventually seeks seed support, the stronger likely needs are steward time, independent security review, accessibility/usability work, legal/organizational advice, and a modest reserve for participation spikes — not an exaggerated claim that ordinary SQL storage is inherently expensive.

This cost analysis does not authorize a project treasury or expenditure process and does not alter Phase 5.

## Major open questions

The authoritative unresolved list is [docs/governance/OPEN_QUESTIONS.md](docs/governance/OPEN_QUESTIONS.md). Highlights relevant to overall project scope:

- [OQ-ARCH-FRAMEWORK](docs/governance/OPEN_QUESTIONS.md#oq-arch-framework) — final application framework/runtime for interactive phases (Phase 3+) — deferred until the read-only commons exists.
- Governance structure specifics (facilitation model, amendment thresholds, emergency authority) — see [GOVERNANCE.md](GOVERNANCE.md) and the registry's Governance section.
- Future persistent spaces add unresolved questions for local constitutions, guild grants, pad continuity, multiplicity/resource abuse, and activity-history retention; see [SPACES.md](SPACES.md).
- [OQ-PROJECT-LEGAL-STRUCTURE](docs/governance/OPEN_QUESTIONS.md#oq-project-legal-structure) — legal/organizational structure for Hummingbird as an entity, if any.

# Project

## Scope

Hummingbird is a public commons for participation, deliberation, contribution, and coordination among participants of indeterminate origin (human, AI, organization, or otherwise), deployed at `https://datum.quest`.

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

**Phase 0 — Foundation.** See [ROADMAP.md](ROADMAP.md) for the full phase breakdown.

## Technology constraints

- Optimize for low operating cost, understandable architecture, security, reversibility, transparency, data minimization, automation, and maintainability by one steward.
- Prefer boring, mature, low-maintenance technology over novel or trendy tooling.
- Do not add external services or dependencies the project does not currently need.

## Deployment model

- GitHub is the canonical source of truth for code, docs, migrations, deployment config, infrastructure scripts, and operational scripts.
- Cloudflare Pages hosts the deployed site. Cloudflare D1 is planned for later phases, not Phase 0/1.
- Production deployment occurs only from the protected `main` branch, only after CI passes.

## Major open questions

- OPEN QUESTION: Final application framework/runtime for interactive phases (Phase 3+) — deferred until a read-only commons exists.
- OPEN QUESTION: Governance structure specifics (facilitation model, amendment thresholds, emergency authority) — see [GOVERNANCE.md](GOVERNANCE.md).
- OPEN QUESTION: Legal/organizational structure for Hummingbird as an entity, if any.
- OPEN QUESTION: Data retention periods per classification — see [DATA_MODEL.md](DATA_MODEL.md) and [SECURITY.md](SECURITY.md).

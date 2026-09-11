# Architecture

This document describes the actual technical architecture of Hummingbird as built, with clearly marked near-term Phase 2 work. It should not describe aspirational components as though they already exist.

## Current system components

```text
GitHub repository (source of truth)
      │
      ├── canonical institutional Markdown
      ├── Phase 2 schema/reference corpus
      ├── GitHub Issues (interim Seed Bank transport)
      │
      ▼
GitHub Actions (test, build, audit)
      │
      ▼
Cloudflare Pages (static/read-only site)
      │
      ▼
datum.quest
```

- **`app/`** — current public static/read-only site, including the Seed Bank discovery surface.
- **Root Markdown + `docs/`** — authoritative institutional/project documentation and ADRs.
- **`schemas/` + `fixtures/canonical/`** — Phase 2 storage-independent reference contract defined by ADR 0012. These fixtures are contract material, not production institutional memory.
- **GitHub Issues** — temporary external transport for Seed Bank Seed / Feedback / Question discussion under ADR 0011. GitHub account metadata is provider metadata, not Hummingbird origin verification or canonical participant identity.
- **No production application database exists yet.** D1 is Phase 2B work.
- **No Hummingbird-owned public write API or participant account system exists yet.** Those remain Phase 3 concerns.
- **No queue/background-worker system exists yet.**

## Phase 2 target flow

Phase 2 is deliberately split so persistence cannot silently define institutional meaning:

```text
storage-independent canonical contract
        ↓
reference corpus + CI validation
        ↓
D1 migrations/import (implementation detail)
        ↓
canonical records
        ↓
rebuildable public read projections
        ↓
publication buffer where required
        ↓
public commons views / machine-readable representations
```

External material follows a separate boundary:

```text
external offer/source (for example a Seed Bank thread)
        ↓
consideration / synthesis
        ↓
explicit admission decision
        ↓
canonical Hummingbird object
```

External discussion is never automatically copied into canonical storage. Submission, provider reactions, visible account identity, and popularity are not admission or governance signals by default.

## Canonical versus implementation-specific state

Canonical meaning is defined in [DATA_MODEL.md](DATA_MODEL.md), the machine-readable schema, and accepted ADRs — not by D1 table layout.

D1 may use implementation-specific primary keys, indexes, normalized helper tables, or query projections as needed, but those details must remain reconstructable/disposable. A canonical export must preserve the record's institutional meaning without depending on D1 row IDs, triggers, or hidden application state.

Derived artifacts such as indexes, caches, summaries, analytics, embeddings, and public projections are non-canonical unless a later decision explicitly says otherwise.

## Trust boundaries

- **GitHub repository / Actions** — source, project history, protected production change path, deployment secret, CodeQL, dependency/security controls. Compromise of repository write access or Actions is a critical risk.
- **GitHub Issues** — public, provider-hosted Seed Bank transport. Treat issue bodies/comments/links as untrusted external input. Public issue activity is not silently persisted into Hummingbird's application data.
- **Cloudflare** — DNS, Pages deployment, and planned D1 persistence. The deployment token is scoped to Pages:Edit; database credentials/configuration must follow least privilege when D1 is introduced.
- **Local development machine** — not authoritative production state. Production changes flow through protected `main` and CI.
- **External authoritative systems** — GitHub for GitHub activity, Cloudflare for provider telemetry, Base for blockchain facts. Hummingbird references authoritative external facts rather than cloning complete external ledgers.

## External services

Current:

- GitHub — source control, CI/CD, security tooling, pull requests, issue tracking, and interim Seed Bank discussion transport.
- Cloudflare — DNS, Pages hosting, and proxying for `datum.quest`.
- Base blockchain — authoritative public record for the interim receive-only support wallet; Hummingbird does not maintain a duplicate transaction ledger.

Planned during Phase 2:

- Cloudflare D1 — first application persistence engine, treated as replaceable infrastructure rather than institutional semantics.

## Secrets management

- Public receive-only wallet addresses are configuration, not secrets. Private keys/signing credentials are never stored in the repository or web server.
- Production deployment uses a Cloudflare API Token stored as a GitHub Actions secret and scoped to the minimum deployed capability.
- D1-related credentials/configuration must be environment-driven and may not be committed as secret values.
- Local schema/corpus tests require no production secrets.

## Backups and recovery

- Git/document/schema/reference-corpus state is recoverable from the repository.
- Once D1 exists, Hummingbird will maintain an independent export/restore path and exercise restoration into an empty replacement database before Phase 2 can complete.
- Rebuildable public projections are not themselves backup targets for institutional meaning.

See [OPERATIONS.md](OPERATIONS.md) and the Phase 2D roadmap milestone.

## Deferred

Explicitly not part of current Phase 2 implementation unless a later ADR changes the boundary:

- Hummingbird-owned public submission API
- participant authentication/authorization
- voting/reputation systems
- moderation workflow engine
- queues/background orchestration
- financial-governance transaction management

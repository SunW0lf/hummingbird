# Roadmap

Phases are sequential by design. Later phases are not commitments — they are planned or experimental until actually underway.

## Phase 0 — Foundation (complete)

Status: **complete** — verified against this checklist and closed out; see [CHANGELOG.md](CHANGELOG.md).

- Local and GitHub repository
- Documentation skeleton
- Minimal static application skeleton
- CI (consistency checks, tests, build, dependency audit)
- Deployment scripts and server/DNS connection
- HTTPS on `datum.quest`
- Backup/restore process (trivial until a database exists)
- Health checks

## Phase 1 — Public Charter Site (complete)

Status: **complete** — public surfaces are live and the public-repository security baseline has been activated and verified to the extent exposed by GitHub, with remaining repository-setting controls explicitly confirmed by the steward on 2026-09-10 (Pacific Time).

Published surfaces include Home, Mission, Charter (working draft, C0), Governance, Roadmap, How It Works, Transparency, Changelog, Contributing, Open Questions, and Security/Contact. Publishing a Charter Candidate (C1) is a distinct governance action, not automatic upon phase completion — see [GOVERNANCE.md](GOVERNANCE.md).

The repository is public. `main` is protected with required `Checks, test, build` and enforcement for everyone including the steward/admin. Repository Actions are restricted and full-length SHA pinning is required. GitHub private vulnerability reporting, secret scanning/push protection, Dependabot security controls, and CodeQL default setup are enabled; CodeQL execution has been independently observed succeeding on `main`.

No accounts, voting, application-managed payments, financial-governance workflows, reputation, moderation, AI orchestration, feeds, or chat were added in Phase 1. An interim personal-steward voluntary support address (see [ADR 0008](docs/decisions/0008-interim-steward-support-wallet.md)) remains a deliberate, narrowly scoped exception to "no payments" — it confers no standing and is not Phase 5.

## Phase 2 — Read-Only Commons

Status: **in progress**

The Phase 2 data-model, workflow-state, retention, and operational-transparency entry gates are resolved in [DATA_MODEL.md](DATA_MODEL.md), [SECURITY.md](SECURITY.md), [TRANSPARENCY.md](TRANSPARENCY.md), and [ADR 0010](docs/decisions/0010-phase2-read-only-commons-contract.md).

Phase 2 implements public read-only representations of contributions, proposals, needs, relationships, minimal events, statuses, and transparency records. It introduces the first application database using Cloudflare D1 while keeping canonical records portable and versioned.

Phase 2 does **not** accept public submissions. Records may be seeded/imported by the steward from public project material while the read model, storage, backup, and publication-buffer behavior are tested.

Immediate implementation sequence:

1. Provision/configure Cloudflare D1 without placing credentials in the repository.
2. Add versioned migrations for the minimal canonical object/event/relationship model.
3. Seed a deliberately small read-only dataset from public Hummingbird material.
4. Publish rebuildable public projections without exposing operational/security-sensitive metadata.
5. Add database backup/restore procedures and test them before expanding the dataset.

## Phase 3 — Controlled Participation

Status: **planned**

Contribution form, proposal form, amendment form, challenge/report form, API participation. Rate limits and abuse controls added before broadly opening submission.

## Phase 4 — Governance Workflows

Status: **deferred**

Proposals, reviews, validated needs, disputes, decisions, fulfillment tracking.

## Phase 5 — Financial Support

Status: **deferred**

Donations, validated expenditures, steward compensation where appropriate, public aggregate financial transparency. Donation must never automatically grant influence. Only begins after the needs process (Phase 4) is functioning.

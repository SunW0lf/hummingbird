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

## Phase 1 — Public Charter Site

Status: **final security verification**

Published surfaces include Home, Mission, Charter (working draft, C0), Governance, Roadmap, How It Works, Transparency, Changelog, Contributing, Open Questions, and Security/Contact. Publishing a Charter Candidate (C1) is a distinct governance action, not automatic upon phase completion — see [GOVERNANCE.md](GOVERNANCE.md).

The repository is public. `main` is protected with required `Checks, test, build` and enforcement for everyone including the steward/admin. Repository Actions have been restricted and SHA pinning is required. Phase 1 is not declared complete until the remaining public-repository security controls in [SECURITY.md](SECURITY.md), especially private vulnerability reporting and Advanced Security settings, are explicitly verified.

No accounts, voting, application-managed payments, financial-governance workflows, reputation, moderation, AI orchestration, feeds, or chat are part of Phase 1. An interim personal-steward voluntary support address (see [ADR 0008](docs/decisions/0008-interim-steward-support-wallet.md)) is a deliberate, narrowly scoped exception to "no payments" — it confers no standing and is not Phase 5.

## Phase 2 — Read-Only Commons

Status: **entry contract accepted; implementation queued behind Phase 1 closeout**

The Phase 2 data-model, workflow-state, retention, and operational-transparency entry gates are now resolved in [DATA_MODEL.md](DATA_MODEL.md), [SECURITY.md](SECURITY.md), [TRANSPARENCY.md](TRANSPARENCY.md), and [ADR 0010](docs/decisions/0010-phase2-read-only-commons-contract.md).

Phase 2 will implement public read-only representations of contributions, proposals, needs, relationships, minimal events, statuses, and transparency records. It introduces the first application database using Cloudflare D1 while keeping canonical records portable and versioned.

Phase 2 does **not** accept public submissions. Records may be seeded/imported by the steward from public project material while the read model, storage, backup, and publication-buffer behavior are tested.

## Phase 3 — Controlled Participation

Status: **planned**

Contribution form, proposal form, amendment form, challenge/report form, API participation. Rate limits and abuse controls added before broadly opening submission.

## Phase 4 — Governance Workflows

Status: **deferred**

Proposals, reviews, validated needs, disputes, decisions, fulfillment tracking.

## Phase 5 — Financial Support

Status: **deferred**

Donations, validated expenditures, steward compensation where appropriate, public aggregate financial transparency. Donation must never automatically grant influence. Only begins after the needs process (Phase 4) is functioning.

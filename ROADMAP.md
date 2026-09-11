# Roadmap

Phases are sequential by design. Later phases are not commitments — they are planned or experimental until actually underway.

## Phase 0 — Foundation (complete)

Status: **complete** — verified against this checklist and closed out; see [CHANGELOG.md](CHANGELOG.md).

- Local and GitHub repository
- Documentation skeleton
- Minimal static application skeleton
- CI (lint, test, build)
- Deployment scripts and server/DNS connection
- HTTPS on `datum.quest`
- Backup/restore process (trivial until a database exists)
- Health checks

Repository/CI hardening items (branch protection, GitHub Actions allow-list, a real vulnerability-reporting channel) were **not** part of this checklist and remain open — see [OQ-OPS-BRANCH-PROTECTION](docs/governance/OPEN_QUESTIONS.md#oq-ops-branch-protection), [OQ-SECURITY-ACTIONS-HARDENING](docs/governance/OPEN_QUESTIONS.md#oq-security-actions-hardening), and [OQ-SECURITY-VULN-REPORTING](docs/governance/OPEN_QUESTIONS.md#oq-security-vuln-reporting). They block completion of Phase 1 / repository publication, not Phase 0.

## Phase 1 — Public Charter Site

Status: **in progress**

Publish: Home, Mission, Charter (working draft, C0), How It Works, Transparency philosophy, Changelog, Security/Contact. Publishing a Charter Candidate (C1) is a distinct governance action, not automatic upon phase completion — see [GOVERNANCE.md](GOVERNANCE.md). No accounts, voting, payments, reputation, moderation, AI orchestration, feeds, chat, or cryptocurrency.

## Phase 2 — Read-Only Commons

Status: **planned**

Public representations of contributions, proposals, needs, decisions, statuses, and transparency records. Introduces the first real database (Cloudflare D1).

## Phase 3 — Controlled Participation

Status: **planned**

Contribution form, proposal form, amendment form, challenge/report form, API participation. Rate limits and abuse controls added before broadly opening submission.

## Phase 4 — Governance Workflows

Status: **deferred**

Proposals, reviews, validated needs, disputes, decisions, fulfillment tracking.

## Phase 5 — Financial Support

Status: **deferred**

Donations, validated expenditures, steward compensation where appropriate, public aggregate financial transparency. Donation must never automatically grant influence. Only begins after the needs process (Phase 4) is functioning.

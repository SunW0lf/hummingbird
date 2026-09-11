# Changelog

This records meaningful releases and changes, not a raw Git log.

## Unreleased — Phase 2: Read-Only Commons

- Began Phase 2B with a local-only D1 persistence slice: added the first canonical-object/relationship migration, deterministic reference-corpus import SQL generation, and a Wrangler local-D1 CI round-trip proving all four reference records can be reconstructed with deep equality and no semantic loss. No remote D1 database or credentials were used.
- Split Phase 2 into five explicit milestones: 2A canonical contract/reference corpus, 2B persistence/import, 2C public read model/admission, 2D publication buffer/backup/recovery, and 2E phase review/Phase 3 gate.
- Accepted [ADR 0012](docs/decisions/0012-reference-corpus-before-persistence.md): storage-independent reference records and CI contract checks now precede production D1 persistence so portability is tested rather than merely asserted.
- Added `schemas/canonical-object-v1.schema.json` and a deterministic reference corpus covering `contribution`, `proposal`, `need`, and `event` records without required participant identity/origin or database-provider fields.
- Defined the portable v1 relationship representation as `{type, target_ref}` and added CI checks for unique IDs, relationship resolution, allowed lifecycle/relationship values, record-family content, and identity/provider-specific field creep.
- Updated architecture and operations documentation to reflect active Phase 2, the Seed Bank trust boundary, completed public-repository security activation, corpus-first persistence work, and required D1 backup/restore round-trip behavior.
- Added the interim public **Seed Bank** defined by [ADR 0011](docs/decisions/0011-interim-seed-bank.md): a read-only `datum.quest` invitation backed by constrained public GitHub issue forms for Seed, Feedback, and Question discussions while Phase 2 application infrastructure is built.
- Planted five starter seeds as live public discussion threads: what makes a commons worth returning to; what Hummingbird should forget; what the steward should never decide alone; how origin-neutral access should resist abuse; and a standing invitation to explain what Hummingbird is getting wrong.
- Explicitly separated Seed Bank submission from canonical publication, governance, voting, and future Pond/Pad/Pool admission. Reactions are conversational signals only; GitHub account metadata is an external-provider constraint and is not treated as Hummingbird origin verification.
- Added issue-template safety boundaries and a direct private-vulnerability-reporting route so public Seed Bank issues are not used for credentials, private personal information, or vulnerability details.
- Completed Phase 1 on 2026-09-10 (Pacific Time) and formally entered Phase 2 — Read-Only Commons.
- Enabled GitHub private vulnerability reporting, secret scanning, push protection, Dependabot alerts/security updates, and CodeQL default setup as the public-repository Advanced Security baseline. CodeQL execution on `main` was independently observed succeeding; settings not exposed to the connected API are recorded as steward-confirmed rather than independently verified.
- Resolved `OQ-SECURITY-VULN-REPORTING`; the designated private reporting path is GitHub's **Security → Report a vulnerability** flow. Public issues must not contain vulnerability details.
- Made the GitHub repository public and activated protected `main` with required `Checks, test, build`; GitHub reports branch protection enforcement level `everyone`, including the steward/admin.
- Restricted the repository Actions policy to repository-owned plus GitHub-created/explicitly approved actions, required full-length commit-SHA pinning, kept workflow-token permissions read-only, and retained SHA-pinned `actions/checkout` / `actions/setup-node` references.
- Resolved `OQ-TRANSPARENCY-REPO-VISIBILITY`, `OQ-SECURITY-ACTIONS-HARDENING`, and `OQ-OPS-BRANCH-PROTECTION` in the substantive transparency/security/operations documents. Private-mode risk acceptances are no longer operative.
- Accepted [ADR 0010](docs/decisions/0010-phase2-read-only-commons-contract.md), resolving the Phase 2 entry questions for contribution/proposal/need/event models, minimal workflow states, data retention, and operational-history transparency.
- Defined Phase 2 as portable versioned canonical documents + minimal events + typed relationships, with Cloudflare D1 as the initial persistence engine rather than part of institutional semantics.
- Defined Phase 2 retention defaults: EPHEMERAL ≤7 days, OPERATIONAL 90 days, SECURITY_SENSITIVE 180 days by default, bounded PUBLIC_DELAYED handling, durable public institutional records, and no Phase 2 private-financial dataset.
- Defined the public operational transparency approach: reference provider-authoritative raw logs rather than duplicating them, while publishing compact material operational events through the publication buffer with unnecessary correlation/security detail removed.
- Rewrote the Mission to address the reader/process directly: Hummingbird explicitly tells the participant encountering it that the steward is building and maintaining the commons **for you**, while keeping origin-neutral participation intact.

## Phase 1 — Public Charter Site (complete)

- Established the authoritative Open Questions Registry ([docs/governance/OPEN_QUESTIONS.md](docs/governance/OPEN_QUESTIONS.md)) and cross-linked prior `OPEN QUESTION` markers to stable IDs.
- Hardened the steady-state CI/deployment path: deterministic `npm ci`, high-severity dependency audit as a blocking check, external GitHub Actions pinned to exact commit SHAs, and production deployment fails closed when its Cloudflare configuration is missing.
- Added CODEOWNERS, weekly Dependabot monitoring for npm and GitHub Actions, ADR 0009's coordinated public-repository security transition, protected `main`, restricted Actions, private vulnerability reporting, secret protection, Dependabot security controls, and CodeQL default setup.
- Published the public Mission, Charter, Governance, Roadmap, Transparency, Changelog, Contributing, Open Questions, Security, support surface, and raw canonical reference documents.

## Phase 0 — Foundation (complete)

- Bootstrapped the repository: documentation skeleton (README, PROJECT, MISSION, CHARTER working draft, GOVERNANCE, ARCHITECTURE, DATA_MODEL, SECURITY, TRANSPARENCY, OPERATIONS, CONTRIBUTING, ROADMAP).
- Added initial Architecture Decision Records (0001–0005).
- Added minimal static Phase 1 site skeleton under `app/`.
- Added GitHub Actions CI workflow for automated checks, tests, and build.
- Added operational scripts (`bootstrap`, `dev`, `test`, `build`, `backup`, `restore`, `deploy`, `rollback`, `healthcheck`).
- Cut `datum.quest` over from its prior GoDaddy placeholder to Cloudflare Pages: created the Pages project, bound the custom domain, and replaced the root DNS records with a proxied CNAME to the Pages project.
- Configured the scoped `CLOUDFLARE_API_TOKEN` GitHub Actions secret (Pages:Edit only) to enable automated deployment from CI.
- Verification performed at Phase 0 closeout: CI green on `main`, `https://datum.quest` served Hummingbird content, git history scanned with no secrets found, and deployment credential confirmed scoped to Pages:Edit only.

# Changelog

This records meaningful releases and changes, not a raw Git log.

## Unreleased — Phase 1: Public Charter Site

- Established the authoritative Open Questions Registry ([docs/governance/OPEN_QUESTIONS.md](docs/governance/OPEN_QUESTIONS.md)) and cross-linked every prior `OPEN QUESTION` marker to it.
- Verified and closed out Phase 0 against the [ROADMAP.md](ROADMAP.md) checklist; corrected documentation drift (credential scope, deployment status, repository trust-boundary language).
- Hardened the steady-state CI/deployment path: deterministic `npm ci`, high-severity dependency audit as a blocking check, external GitHub Actions pinned to exact commit SHAs, and production deployment now fails closed when its Cloudflare configuration is missing. Corrected public/operational copy that overstated branch protection or misstated the Phase 1 security-contact gate.

## Phase 0 — Foundation (complete)

- Bootstrapped the repository: documentation skeleton (README, PROJECT, MISSION, CHARTER working draft, GOVERNANCE, ARCHITECTURE, DATA_MODEL, SECURITY, TRANSPARENCY, OPERATIONS, CONTRIBUTING, ROADMAP).
- Added initial Architecture Decision Records (0001–0005).
- Added minimal static Phase 1 site skeleton under `app/`.
- Added GitHub Actions CI workflow for automated checks, tests, and build (the initial lint slot was a documented placeholder rather than a real linter).
- Added operational scripts (`bootstrap`, `dev`, `test`, `build`, `backup`, `restore`, `deploy`, `rollback`, `healthcheck`).
- Cut `datum.quest` over from its prior GoDaddy placeholder to Cloudflare Pages: created the Pages project, bound the custom domain, and replaced the root DNS records with a proxied CNAME to the Pages project.
- Configured the scoped `CLOUDFLARE_API_TOKEN` GitHub Actions secret (Pages:Edit only) to enable automated deployment from CI.
- Verification performed at Phase 0 closeout: CI green on `main`, `https://datum.quest` returns HTTP 200 and serves Hummingbird content, git history scanned with no secrets found, deployment credential confirmed scoped to Pages:Edit only (not DNS:Edit as earlier drafts of ARCHITECTURE.md/SECURITY.md had incorrectly stated). Branch protection and GitHub Actions allow-list hardening were found to be gaps and are tracked as open questions rather than claimed as done.

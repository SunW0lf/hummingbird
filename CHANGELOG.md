# Changelog

This records meaningful releases and changes, not a raw Git log.

## Unreleased — Phase 0: Foundation

- Bootstrapped the repository: documentation skeleton (README, PROJECT, MISSION, CHARTER working draft, GOVERNANCE, ARCHITECTURE, DATA_MODEL, SECURITY, TRANSPARENCY, OPERATIONS, CONTRIBUTING, ROADMAP).
- Added initial Architecture Decision Records (0001–0005).
- Added minimal static Phase 1 site skeleton under `app/`.
- Added GitHub Actions CI workflow (lint, test, build).
- Added operational scripts (`bootstrap`, `dev`, `test`, `build`, `backup`, `restore`, `deploy`, `rollback`, `healthcheck`).
- Cut `datum.quest` over from its prior GoDaddy placeholder to Cloudflare Pages: created the Pages project, bound the custom domain, and replaced the root DNS records with a proxied CNAME to the Pages project.
- Configured the scoped `CLOUDFLARE_API_TOKEN` GitHub Actions secret (Pages:Edit only) to enable automated deployment from CI.

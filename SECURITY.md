# Security

Security protects the commons without depending on proving participant origin.

## Current attack surface (Phase 0/1)

The deployed site is static with no forms, no accounts, and no database. The realistic attack surface right now is the supply chain and deployment pipeline, not the site itself:

- GitHub repository and Actions (source and CI compromise)
- Cloudflare account and deployment token (deployment compromise)
- Dependency compromise (any npm devDependency used for CI tooling)

## Authentication / authorization

Not applicable yet — no accounts exist. OPEN QUESTION for Phase 3+ when contribution/proposal forms are introduced.

## Secrets

- Deployment uses a single Cloudflare API Token scoped to only the `datum.quest` zone (DNS:Edit, Pages:Edit), stored as a GitHub Actions secret.
- No secrets are required to build or test the site locally.
- Secrets are never committed to the repository. `.env.example` documents the shape of any future required local secret without real values.

## Least privilege

- The deployment token's scope is limited to the one zone it needs, not the full Cloudflare account.
- GitHub Actions workflows request only the permissions they need (see `.github/workflows/`).

## Planned defenses (Phase 3+, not yet needed)

- Rate limiting
- Spam / automated flooding controls
- DDoS (partially mitigated by Cloudflare's proxy by default)
- Sybil behavior detection
- Replay protection
- Injection prevention (input validation once forms/APIs exist)
- Malicious upload handling (once uploads exist)
- CAPTCHA avoided as a primary defense; prefer layered, behavior-based defenses over visual challenge-response

## CI/CD security

- Production deployment requires CI (lint, test, build) to pass on the protected `main` branch.
- Dependency/security validation runs in CI where practical (see `.github/workflows/ci.yml`).

## Incident response

OPEN QUESTION: formal incident response process. Until defined, the steward is the point of contact — see [CONTRIBUTING.md](CONTRIBUTING.md) for the security contact channel.

## Vulnerability reporting

OPEN QUESTION: dedicated security contact address/process. Until established, report via a private channel to the repository owner rather than a public GitHub issue.

## Data classification

Data will be classified before storage, using:

```text
PUBLIC
PUBLIC_DELAYED
OPERATIONAL
SECURITY_SENSITIVE
FINANCIAL_PRIVATE
SECRET
```

No data beyond public static site content exists yet, so no classification decisions have been made in practice. See [DATA_MODEL.md](DATA_MODEL.md).

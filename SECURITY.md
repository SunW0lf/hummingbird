# Security

Security protects the commons without depending on proving participant origin.

## Current attack surface (Phase 0/1)

The deployed site is static with no forms, no accounts, and no database. The realistic attack surface right now is the supply chain and deployment pipeline, not the site itself:

- GitHub repository and Actions (source and CI compromise)
- Cloudflare account and deployment token (deployment compromise)
- Dependency compromise (any npm devDependency used for CI tooling)

## Authentication / authorization

Not applicable yet — no accounts exist. Open question: [OQ-SECURITY-AUTHN-MODEL](docs/governance/OPEN_QUESTIONS.md#oq-security-authn-model) for Phase 3+ when contribution/proposal forms are introduced.

## Secrets

- Deployment uses a single Cloudflare API Token scoped to only the `datum.quest` zone (Pages:Edit only — DNS is managed separately and not covered by this token), stored as a GitHub Actions secret. The account ID is stored as a non-secret repository variable (`CLOUDFLARE_ACCOUNT_ID`).
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

- Production deployment is gated by the CI workflow's own job dependency (`deploy` `needs: verify`), which requires tests, a successful build, and the high-severity dependency audit to pass first. This is enforced by the workflow definition, not yet by a GitHub branch protection rule — see [OQ-OPS-BRANCH-PROTECTION](docs/governance/OPEN_QUESTIONS.md#oq-ops-branch-protection).
- External GitHub Actions used by the workflow are pinned to exact commit SHAs rather than mutable version tags.
- The workflow-level `GITHUB_TOKEN` permission is read-only for repository contents.
- `.github/dependabot.yml` monitors npm and GitHub Actions dependencies on a weekly cadence so updates to packages and pinned Action SHAs arrive as reviewable pull requests.
- `.github/CODEOWNERS` records the current steward as the default code owner; enforcement depends on the repository protection settings.
- GitHub Actions is currently configured with repository-level `allowed_actions: all` rather than a restricted allow-list. Pinning action commits reduces supply-chain exposure but does not resolve that repository-policy gap. Open question: [OQ-SECURITY-ACTIONS-HARDENING](docs/governance/OPEN_QUESTIONS.md#oq-security-actions-hardening).

### Phase 1 risk acceptance — repository Actions policy

**Recorded 2026-09-10 (Pacific Time).** For completion of the current **private, single-steward Phase 1 only**, the steward accepts the residual risk that the repository-level Actions policy remains `allowed_actions: all`. A future repository change could therefore reference a public Action outside the two currently used.

Current mitigations are deliberately narrow and verifiable: the repository is private and single-steward; the workflow uses only `actions/checkout` and `actions/setup-node`; both are pinned to exact commit SHAs; the workflow token is read-only for repository contents; CI runs tests, build, and a blocking high-severity dependency audit before deployment; and the production deploy job cannot run until verification succeeds.

This acceptance expires when the repository becomes public. Publication has been authorized in principle, but public mode requires the Actions policy to be restricted to GitHub-owned/explicitly approved actions and then verified.

## Public repository security baseline

Before or immediately as the repository becomes public, the following controls are required and must be verified rather than merely assumed:

- GitHub private vulnerability reporting enabled for the repository, providing a genuinely private reporting path.
- Secret scanning enabled and push protection enabled so supported secrets are detected and blocked before new pushes land.
- Dependabot alerts and security updates enabled; version updates remain driven by `.github/dependabot.yml` and must pass normal CI before merge.
- CodeQL/default code scanning enabled where GitHub makes it available for the public repository.
- `main` protected as described in `OPERATIONS.md`, including required CI and no force-push/deletion path.
- Repository Actions policy restricted to GitHub-owned/explicitly approved actions while workflow references remain SHA-pinned.

A public repository exposes source, history, and Actions logs to anyone. No repository visibility change should be treated as complete until these controls have been checked after the transition.

## Incident response

Open question: [OQ-SECURITY-INCIDENT-RESPONSE](docs/governance/OPEN_QUESTIONS.md#oq-security-incident-response) — formal incident response process. Until defined, the steward is the point of contact — see [CONTRIBUTING.md](CONTRIBUTING.md) for the security contact channel.

## Vulnerability reporting

Open question: [OQ-SECURITY-VULN-REPORTING](docs/governance/OPEN_QUESTIONS.md#oq-security-vuln-reporting) — dedicated security contact address/process. Until established, do not open a public GitHub issue for a vulnerability; there is currently no working private channel either, so treat this as unresolved rather than assuming one exists.

The intended public-repository solution is GitHub private vulnerability reporting. This document and the public Security page must not advertise that path as active until the repository is public, the setting is enabled, and the reporting path is verified.

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

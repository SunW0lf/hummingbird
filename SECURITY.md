# Security

Security protects the commons without depending on proving participant origin.

## Current attack surface

The deployed site remains static while Phase 2 is being prepared: there are still no public forms, accounts, or production database. The realistic attack surface is therefore concentrated in the supply chain and deployment pipeline:

- public GitHub repository and Actions (source and CI compromise)
- Cloudflare account and deployment token (deployment compromise)
- dependency compromise (npm devDependencies used for CI tooling)
- future Phase 2 persistence once D1 is deployed

## Authentication / authorization

Not applicable yet — no accounts exist. Open question: [OQ-SECURITY-AUTHN-MODEL](docs/governance/OPEN_QUESTIONS.md#oq-security-authn-model) for Phase 3+ when contribution/proposal forms are introduced.

## Secrets

- Deployment uses a single Cloudflare API Token scoped to Pages:Edit only, stored as a GitHub Actions secret. The account ID is stored as a non-secret repository variable (`CLOUDFLARE_ACCOUNT_ID`).
- No secrets are required to build or test the site locally.
- Secrets are never committed to the repository. `.env.example` documents the shape of any future required local secret without real values.

## Least privilege

- The deployment token is restricted to the capability needed for deployment rather than broad account administration.
- GitHub Actions workflows request only the permissions they need (see `.github/workflows/`).
- Repository workflow-token default permissions are configured read-only; the workflow also declares read-only repository-content permission explicitly.

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

- `main` is protected. Changes require the `Checks, test, build` status check, and protection is enforced for everyone including the steward/admin. Force pushes and deletion remain disallowed by policy. The branch-level API independently reports protection enabled, required `Checks, test, build`, and enforcement level `everyone`.
- Production deployment is also gated by the CI workflow's own `deploy` → `needs: verify` dependency, so the deployment job cannot run until tests, build, and the high-severity dependency audit succeed.
- External GitHub Actions used by the workflow are pinned to exact full-length commit SHAs rather than mutable version tags.
- Repository Actions policy is steward-configured to allow repository-owned actions plus GitHub-created/explicitly approved actions, with full-length SHA pinning required. The current workflow uses only `actions/checkout` and `actions/setup-node`.
- The workflow-level `GITHUB_TOKEN` permission is read-only for repository contents.
- `.github/dependabot.yml` monitors npm and GitHub Actions dependencies weekly so package and pinned-Action updates arrive as reviewable pull requests.
- `.github/CODEOWNERS` records the current steward as default code owner.

The earlier private-mode risk acceptances for missing branch protection and unrestricted Actions expired when the repository became public and are no longer operative.

## Public repository security baseline

The repository is now public. The following controls are part of the required public baseline:

- **Verified active:** public repository visibility; protected `main`; required `Checks, test, build`; admin/steward enforcement; SHA-pinned workflow action references.
- **Steward-configured:** restricted Actions policy and read-only default workflow permissions.
- **Still requiring explicit verification before Phase 1 closeout:** GitHub private vulnerability reporting; secret scanning and push protection; Dependabot alerts/security updates; CodeQL/default code scanning where available.

Public source, history, forks, and repository Actions logs should be treated as visible to outside observers.

## Incident response

Open question: [OQ-SECURITY-INCIDENT-RESPONSE](docs/governance/OPEN_QUESTIONS.md#oq-security-incident-response) — formal incident response process. Until defined, the steward is the operational point of contact.

## Vulnerability reporting

Open question: [OQ-SECURITY-VULN-REPORTING](docs/governance/OPEN_QUESTIONS.md#oq-security-vuln-reporting) — a genuinely private reporting path must be active and verified before Phase 1 is declared complete.

The intended current solution is GitHub private vulnerability reporting. Do not open a public issue containing vulnerability details. This document and the public Security page must not claim the GitHub private-reporting path is active until its repository setting and public reporting affordance are verified.

## Data classification

Every persisted datum has a **visibility classification** and a separate **retention class**. The visibility classes are:

```text
PUBLIC
PUBLIC_DELAYED
OPERATIONAL
SECURITY_SENSITIVE
FINANCIAL_PRIVATE
SECRET
```

Retention classes and canonical-model rules are defined in [DATA_MODEL.md](DATA_MODEL.md). Defaults below are authoritative for Phase 2; see [ADR 0010](docs/decisions/0010-phase2-read-only-commons-contract.md).

### PUBLIC

Material deliberately admitted to the public institutional record is **DURABLE** and has no automatic expiry. Correction, withdrawal, supersession, archival, and future participant-rights rules may change how it is presented without silently erasing history.

### PUBLIC_DELAYED

Material awaiting the publication buffer may remain delayed for **no more than 30 days** before it is published or explicitly reclassified. Temporary pre-publication metadata that is not part of the public record is deleted within **30 days after release**, unless it has become necessary to an active security incident.

### OPERATIONAL

Ordinary operational records have a default retention of **90 days**. Provider systems may retain their own authoritative logs under their own policies; Hummingbird does not duplicate them merely to extend retention.

### SECURITY_SENSITIVE

Security-sensitive records have a default retention of **180 days**. They may be retained longer only while needed for an active incident, investigation, legal obligation, or remediation, and extended retention must be periodically reviewed rather than becoming permanent by inertia.

### FINANCIAL_PRIVATE

Not collected in Phase 2. If a later phase must keep private financial records for accounting or legal reasons, retention is limited to the applicable obligation, using **seven years as the planning ceiling** unless law or a specific obligation requires otherwise. Public blockchain facts remain externally authoritative and are not duplicated into an internal transaction ledger.

### SECRET

Secrets are retained only while active and required. Superseded credentials are rotated/revoked and removed from active systems rather than archived as institutional data. Secret values are never placed in public transparency records.

## Collection rule

A retention period is **not permission to collect the data**. Data minimization comes first: if Hummingbird does not need a datum for a defined institutional, security, or operational purpose, it should not be persisted at all.

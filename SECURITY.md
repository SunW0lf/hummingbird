# Security

Security protects the commons without depending on proving participant origin.

## Current attack surface

Phase 2 is in progress. Public `GET`/`HEAD` reading remains open and largely static. The bounded first-party `/offer` pilot now accepts temporary, non-canonical offers through a Pages Function and a dedicated `OFFER_DB` separate from canonical D1. It accepts ordinary HTML form posts without an account, origin declaration, CAPTCHA, or JavaScript for basic use. Receipt-based status and withdrawal are pilot-scoped; no durable participant account or Phase 3 public write API exists. See [ADR 0017](docs/decisions/0017-phase2e-experimental-ingress.md) and [ADR 0018](docs/decisions/0018-phase2e-offer-pilot-runtime-and-data-boundary.md).

The interim Seed Bank defined by [ADR 0011](docs/decisions/0011-interim-seed-bank.md) introduces a bounded external write surface through public GitHub issue forms and discussion threads. That surface inherits GitHub's account, spam, abuse, and moderation mechanisms; it does not create Hummingbird application credentials or a direct write path into Hummingbird persistence.

The realistic attack surface is concentrated in:

- public GitHub repository and Actions (source and CI compromise)
- public Seed Bank issue intake (spam, harassment, malicious links, social engineering, accidental disclosure, and attempts to smuggle vulnerability details into public threads)
- first-party `/offer` intake and receipt-based status/withdrawal (untrusted content, resource exhaustion, receipt exposure, and availability of the temporary review path)
- Cloudflare account, Pages deployment credential, and separate D1 operational/recovery credentials (deployment or persistence compromise)
- dependency compromise (npm devDependencies used for CI tooling)
- canonical D1 persistence, migrations, backup, and recovery, alongside the separate disposable offer-store boundary

## Interim Seed Bank safety boundary

- Seed, Feedback, and Question forms explicitly state that the resulting issue is public.
- Public forms instruct participants not to submit secrets, credentials, private personal information, or vulnerability details.
- GitHub's private vulnerability-reporting path is presented separately from public issue intake.
- A GitHub account is an external-provider participation requirement, not Hummingbird origin verification or proof of authority.
- Issue authorship, comments, reactions, and provider metadata are not automatically ingested into Hummingbird's future database.
- Reactions are not votes and do not carry governance weight.
- Seed Bank material is not automatically propagated into other Hummingbird spaces.
- The steward may close, moderate, or restrict abusive provider-hosted threads as an operational safety action; doing so does not by itself establish the future constitutional exclusion policy tracked for Phase 3.

## Authentication / authorization

The first-party `/offer` pilot accepts an uncredentialed offer. A one-time random receipt, stored only as a hash, controls that offer's temporary status and withdrawal; it does not authenticate a participant, establish identity, or grant standing. GitHub separately handles accounts for the interim Seed Bank. The durable Phase 3 authentication/authorization model remains open: [OQ-SECURITY-AUTHN-MODEL](docs/governance/OPEN_QUESTIONS.md#oq-security-authn-model).

## Secrets

- Production Pages deployment uses a Cloudflare API Token scoped to Pages:Edit only, stored as a GitHub Actions secret. The account ID is stored as a non-secret repository variable (`CLOUDFLARE_ACCOUNT_ID`).
- D1 persistence/recovery operations use separate deliberate credentials rather than widening the Pages deployment token. The guarded Phase 2D recovery drill used a separate account-owned D1 recovery token whose production access was limited to canonical `SELECT` queries while writes targeted only the disposable recovery database.
- No secrets are required to build or test the ordinary site/canonical contract locally.
- Secrets are never committed to the repository. `.env.example` documents the shape of any future required local secret without real values.

## Least privilege

- The Pages deployment token is restricted to the capability needed for deployment rather than broad account administration or database access.
- D1 operations use a separate credential boundary and must not gain unrelated Pages/deployment authority merely for convenience.
- Recovery testing writes only to an explicitly disposable replacement database; the live production database is not a restore-test target.
- GitHub Actions workflows request only the permissions they need (see `.github/workflows/`).
- Repository workflow-token default permissions are configured read-only; the workflow also declares read-only repository-content permission explicitly.

## Phase 2E pilot controls and future defenses

The live pilot bounds offer text and request size, validates the form and optional reference, enforces a 250-active-offer ceiling at insertion, groups exact duplicate text without rejecting a valid offer, and fails closed when persistence cannot confirm acceptance. Accepted content has 30-day ordinary retention, with scheduled cleanup; receipt-bearing responses are `no-store` and `noindex`. The application offer store does not retain raw network identifiers, user-agent history, or a cross-offer identity profile. The public observer releases counts only; restricted short-lived review packets are a separate projection. See [ADR 0018](docs/decisions/0018-phase2e-offer-pilot-runtime-and-data-boundary.md), [ADR 0021](docs/decisions/0021-offer-review-visibility.md), and [OPERATIONS.md](OPERATIONS.md#phase-2e-offer-review).

Additional durable Phase 3 defenses remain design work, subject to the open rights, governance, security, and runtime decisions:

- Rate limiting
- Spam / automated flooding controls
- DDoS (partially mitigated by Cloudflare's proxy by default)
- Sybil behavior detection
- Replay protection
- Input validation across any later forms/APIs
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

The Phase 1 public-repository activation gate is complete as of 2026-09-10 (Pacific Time).

- **Independently observed:** public repository visibility; protected `main`; required `Checks, test, build`; admin/steward enforcement; SHA-pinned workflow action references; successful CodeQL default-setup execution on `main`.
- **Steward-confirmed in GitHub repository settings:** restricted Actions policy; read-only default workflow permissions; private vulnerability reporting; secret scanning; push protection; Dependabot alerts; Dependabot malware alerts; Dependabot security updates; grouped security updates; and CodeQL default setup.
- **Repository-configured:** Dependabot version updates via `.github/dependabot.yml`.

GitHub's connected API does not expose every Advanced Security setting to the current integration, so controls that cannot be read back programmatically are recorded as steward-confirmed rather than falsely described as independently verified.

Public source, history, forks, repository Actions logs, and public Seed Bank threads should be treated as visible to outside observers.

## Incident response

Phase 2 uses a small operational incident lifecycle while the mature participant-facing Phase 3 process remains open under [OQ-SECURITY-INCIDENT-RESPONSE](docs/governance/OPEN_QUESTIONS.md#oq-security-incident-response). The full Phase 2E.1 disposition is recorded in [ADR 0022](docs/decisions/0022-phase2e1-review-gate-dispositions.md).

An incident is a credible event involving plausible compromise, unauthorized mutation, exposure of secrets or non-public material, loss/corruption of canonical state, material loss of recoverability, sustained attack/resource exhaustion, or material violation of a published security/privacy boundary. Loss of a key or recovery capability may qualify even without an attacker.

The Phase 2 lifecycle is:

1. **Recognize / declare.** The steward may treat a credible material threat as an incident before proof is complete.
2. **Contain reversibly where practicable.** Existing operational authority may be used to pause a bounded experimental surface, revoke/rotate credentials, stop a workflow or deployment, isolate suspect state, preserve a snapshot, roll back code, fail closed, or use an already-authorized recovery path.
3. **Preserve minimum necessary evidence.** Keep only the evidence needed to understand and remediate the event when preservation does not prolong harm. Security-sensitive evidence follows the retention rules below rather than becoming permanent by default.
4. **Recover and verify.** Recovery is not complete merely because a page responds. Re-establish trust in the affected capability: code/provenance, credentials, canonical state, backup/recovery state, and production health as applicable.
5. **Record and disclose proportionately.** Restricted exploit/security detail may remain private while necessary; a later public institutional record should preserve material consequence, response, recovery status, and durable corrective action while minimizing secrets, participant material, provider identifiers, and correlation-rich telemetry.
6. **Close and learn.** Record residual risk and corrective action, and verify temporary containment measures were removed or separately authorized rather than becoming permanent policy by inertia.

Hummingbird distinguishes ordinary observations from incidents and critical incidents. A critical incident includes loss of trust in canonical integrity, material secret/control-plane compromise, material private-data exposure, or inability to trust or recover production state. A more detailed mature severity model remains Phase 2E.3 work.

**Containment authority derives from authority published before the incident, not from the existence or severity of the incident itself.** An incident does not grant new constitutional, governance, exclusion, canonical-deletion, participant-restriction, or emergency authority. Permanent participant exclusion, suspension of governance rights, secret constitutional change, or other exceptional authority remains governed by the still-open participant-rights/exclusion/emergency questions.

The steward remains the current Phase 2 operational point of contact. Single-contact unavailability is an acknowledged residual continuity risk and is handled by the succession/continuity design rather than by inventing unauthorized emergency governance.

## Vulnerability reporting

GitHub private vulnerability reporting is enabled for the public repository and is the designated private vulnerability-reporting channel for the current phase.

Do **not** open a public issue containing vulnerability details. Use GitHub's **Report a vulnerability** flow under the repository Security area so the report is delivered privately to the repository maintainer. No response-time guarantee is made.

A dedicated project security email may be added later, but it is not required for the current reporting path.

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

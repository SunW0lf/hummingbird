# Open Questions Registry

This is the single authoritative ledger of unresolved policy, governance, architecture, data, security, and operational decisions for Hummingbird. Every `OPEN QUESTION` marker anywhere in this repository must reference exactly one ID from this registry rather than restating the question independently.

This registry **records** open questions. It does not resolve them. Adding, splitting, or re-scoping an entry here is a bookkeeping change, not a policy decision — resolving a question still requires updating the substantive document it lives in (Charter, Governance, Security, etc.) with the actual decision and rationale.

## How to use this registry

- Each question has a stable ID (`OQ-<AREA>-<NAME>`). IDs are never reused or renumbered once assigned.
- Source documents reference an ID rather than duplicating question text, so a question is never accidentally answered differently in two places.
- **Blocks** means the question must be genuinely resolved (not merely risk-accepted) before the named phase or milestone may begin or be considered complete.
- **Review gate** means the question should be revisited at the named point, but does not by itself halt progress.
- **Status** is one of: `OPEN`, `IN PROGRESS` (steward actively working the question), `RESOLVED` (moved out of this registry into the substantive document, with a dated changelog entry).

### Blocks and risk acceptance

Constitutional questions (Charter) and governance-legitimacy questions (who may govern, how authority is granted or limited, how disputes and amendments work) **cannot** be bypassed by risk acceptance. They must be genuinely resolved before the phase they block begins.

Operational and security-hardening questions explicitly marked "(documented risk acceptance permitted)" below may instead be closed for a given phase by the steward recording an explicit, dated risk-acceptance note in the relevant document (e.g. SECURITY.md, OPERATIONS.md) — stating what the residual risk is and why it is accepted for now — rather than requiring implementation. This does not resolve the underlying question; it only permits the phase gate to pass while the question remains open.

## Charter (constitutional)

### OQ-CHARTER-RIGHTS
**What minimum rights apply to all participants?** E.g. appeal, correction, data deletion, regardless of origin.
Raised in: [CHARTER.md](../../CHARTER.md) §2.
Blocks: entry into Phase 3 (Controlled Participation).
Status: OPEN.

### OQ-CHARTER-EXCLUSION
**Under what conditions, if any, can a participant or contribution be excluded from the commons?**
Raised in: [CHARTER.md](../../CHARTER.md) §3.
Blocks: entry into Phase 3.
Status: OPEN.

### OQ-CHARTER-PARTICIPANT-RESPONSIBILITIES
**What responsibilities do participants have toward the commons** (e.g. honesty of voluntary declarations)?
Raised in: [CHARTER.md](../../CHARTER.md) §4.
Blocks: entry into Phase 3.
Status: OPEN.

## Governance

### OQ-GOVERNANCE-STEWARD-SCOPE
**What are steward responsibilities beyond day-to-day operations?**
Raised in: [CHARTER.md](../../CHARTER.md) §4, [GOVERNANCE.md](../../GOVERNANCE.md).
Review gate: during Phase 2.
Status: OPEN.

### OQ-GOVERNANCE-EMERGENCY-AUTHORITY
**Scope, triggers, and limits of any emergency authority**, if the project decides one is needed at all. Governance-legitimacy question — no risk acceptance.
Raised in: [CHARTER.md](../../CHARTER.md) §6, [GOVERNANCE.md](../../GOVERNANCE.md).
Blocks: entry into Phase 3.
Status: OPEN.

### OQ-GOVERNANCE-PROPOSALS
**Who may submit a proposal, in what form, and where** (GitHub issue/PR now; in-app form once Phase 3 exists)?
Raised in: [GOVERNANCE.md](../../GOVERNANCE.md), [CONTRIBUTING.md](../../CONTRIBUTING.md).
Blocks: entry into Phase 3.
Status: OPEN.

### OQ-GOVERNANCE-AMENDMENT-THRESHOLD
**Amendment approval threshold, constituency, and process** for Charter changes at C2/C3.
Raised in: [GOVERNANCE.md](../../GOVERNANCE.md).
Blocks: any C2 → C3 ratification.
Status: OPEN.

### OQ-GOVERNANCE-DECISION-PROCESS
**Process for non-technical/governance decisions** (technical decisions already use ADRs).
Raised in: [GOVERNANCE.md](../../GOVERNANCE.md).
Review gate: during Phase 2.
Status: OPEN.

### OQ-GOVERNANCE-FACILITATION
**Is there a designated facilitator role distinct from the steward?** What are its powers and limits?
Raised in: [GOVERNANCE.md](../../GOVERNANCE.md).
Review gate: during Phase 4.
Status: OPEN.

### OQ-GOVERNANCE-STEWARD-SUCCESSION
**Long-term steward succession and multi-steward model.**
Raised in: [GOVERNANCE.md](../../GOVERNANCE.md).
Review gate: during Phase 2.
Status: OPEN.

### OQ-GOVERNANCE-DISPUTES
**Dispute resolution process for participants or contributions.**
Raised in: [GOVERNANCE.md](../../GOVERNANCE.md).
Blocks: entry into Phase 4.
Status: OPEN.

### OQ-GOVERNANCE-VALIDATED-NEEDS
**Process for identifying and validating "needs"** referenced in the Mission.
Raised in: [GOVERNANCE.md](../../GOVERNANCE.md).
Blocks: entry into Phase 4.
Status: OPEN.

## Architecture / project

### OQ-ARCH-FRAMEWORK
**Final application framework/runtime for interactive phases** (Phase 3+), deferred until a read-only commons exists.
Raised in: [PROJECT.md](../../PROJECT.md).
Blocks: entry into Phase 3.
Status: OPEN.

### OQ-PROJECT-LEGAL-STRUCTURE
**Legal/organizational structure for Hummingbird as an entity, if any** (e.g. unincorporated project, nonprofit, cooperative).
Raised in: [PROJECT.md](../../PROJECT.md).
Blocks: entry into Phase 5 (Financial Support).
Status: OPEN.

## Data model

### OQ-DATA-CONTRIBUTION-MODEL
**Entity model for a contribution** (fields, states, relationship to participants and proposals).
Raised in: [DATA_MODEL.md](../../DATA_MODEL.md).
Blocks: entry into Phase 2.
Status: OPEN.

### OQ-DATA-PROPOSAL-MODEL
**Entity model for a proposal** (fields, states, relationship to contributions and decisions).
Raised in: [DATA_MODEL.md](../../DATA_MODEL.md).
Blocks: entry into Phase 2.
Status: OPEN.

### OQ-DATA-NEED-MODEL
**Entity model for a "need"** as referenced in the Mission and Phase 4 governance workflows.
Raised in: [DATA_MODEL.md](../../DATA_MODEL.md).
Blocks: entry into Phase 2.
Status: OPEN.

### OQ-DATA-AUDIT-EVENT-MODEL
**Entity model for the audit/event log**, consistent with the three-layer transparency design (internal log / publication buffer / public log).
Raised in: [DATA_MODEL.md](../../DATA_MODEL.md), [TRANSPARENCY.md](../../TRANSPARENCY.md).
Blocks: entry into Phase 2.
Status: OPEN.

### OQ-DATA-WORKFLOW-STATES
**Workflow state machines** governing how contributions/proposals/needs move between states.
Raised in: [DATA_MODEL.md](../../DATA_MODEL.md).
Blocks: entry into Phase 2.
Status: OPEN.

## Security

### OQ-SECURITY-RETENTION-PERIODS
**Specific retention periods per data classification** (`PUBLIC`, `PUBLIC_DELAYED`, `OPERATIONAL`, `SECURITY_SENSITIVE`, `FINANCIAL_PRIVATE`, `SECRET`).
Raised in: [DATA_MODEL.md](../../DATA_MODEL.md), [SECURITY.md](../../SECURITY.md), [PROJECT.md](../../PROJECT.md).
Blocks: entry into Phase 2.
Status: OPEN.

### OQ-SECURITY-ACCESS-CONTROL-RETENTION
**Bounded retention for rate-limit/abuse state**, kept separate from the identity/participant model.
Raised in: [DATA_MODEL.md](../../DATA_MODEL.md), [SECURITY.md](../../SECURITY.md).
Blocks: entry into Phase 3.
Status: OPEN.

### OQ-SECURITY-AUTHN-MODEL
**Authentication/authorization model** once contribution/proposal forms are introduced.
Raised in: [SECURITY.md](../../SECURITY.md).
Blocks: entry into Phase 3.
Status: OPEN.

### OQ-SECURITY-INCIDENT-RESPONSE
**Formal incident response process.** Until defined, the steward is the point of contact.
Raised in: [SECURITY.md](../../SECURITY.md).
Review gate: during Phase 2.
Status: OPEN.

### OQ-SECURITY-VULN-REPORTING
**Dedicated, genuinely private security contact address/process** (e.g. `security@datum.quest` via Cloudflare Email Routing). No public channel may be advertised until it technically exists (documented risk acceptance permitted for the interim state — public copy must say "not yet established," never imply a working channel).
Raised in: [SECURITY.md](../../SECURITY.md), [CONTRIBUTING.md](../../CONTRIBUTING.md).
Blocks: completion of Phase 1, or repository publication, whichever occurs first.
Status: IN PROGRESS — feasibility confirmed (Cloudflare Email Routing available on the `datum.quest` zone), not yet configured.

### OQ-SECURITY-ACTIONS-HARDENING
**GitHub Actions permissions hardening.** Repository currently has `allowed_actions: all` (any public action may run) rather than a restricted allow-list. (Documented risk acceptance permitted.)
Raised in: [SECURITY.md](../../SECURITY.md).
Blocks: completion of Phase 1, or repository publication, whichever occurs first.
Status: OPEN.

## Operations

### OQ-OPS-MONITORING-CADENCE
**Continuous/scheduled monitoring** (e.g. a GitHub Actions cron job) versus manual `./scripts/healthcheck` runs only.
Raised in: [OPERATIONS.md](../../OPERATIONS.md).
Review gate: during Phase 2.
Status: OPEN.

### OQ-OPS-TOKEN-ROTATION-CADENCE
**Exact cadence for rotating the Cloudflare deployment token.**
Raised in: [OPERATIONS.md](../../OPERATIONS.md).
Review gate: during Phase 2.
Status: OPEN.

### OQ-OPS-BRANCH-PROTECTION
**Branch protection on `main` is currently unavailable** (GitHub disables it for private repositories on this plan). No enforced required-review or required-status-check rule exists; CI-before-deploy is enforced only by the workflow's own `needs:`/`if:` structure, not by GitHub branch rules. (Documented risk acceptance permitted while the repository remains private and single-steward.)
Raised in: [OPERATIONS.md](../../OPERATIONS.md), [SECURITY.md](../../SECURITY.md).
Blocks: completion of Phase 1, or repository publication, whichever occurs first.
Status: OPEN.

## Transparency

### OQ-TRANSPARENCY-OPERATIONAL-HISTORY
**Whether/how to summarize CI and deployment operational history publicly**, since raw CI/Cloudflare logs are not currently republished anywhere.
Raised in: [TRANSPARENCY.md](../../TRANSPARENCY.md).
Blocks: entry into Phase 2 (public transparency-record implementation).
Status: OPEN.

### OQ-TRANSPARENCY-REPO-VISIBILITY
**When and how to make the repository public.** The repository is currently **private**. Making it public is a deliberate, one-way-in-practice action gated on a completed git-history audit for secrets/sensitive data, not an automatic consequence of any phase completing.
Raised in: [TRANSPARENCY.md](../../TRANSPARENCY.md), [docs/decisions/](../decisions/).
Review gate: before repository publication.
Status: OPEN — git-history audit for secrets completed with no findings (see Phase 0 verification in CHANGELOG.md); publication decision itself still open.

## Licensing

### OQ-LEGAL-CONTENT-LICENSE
**Distinct content/reuse license for Charter, Mission, and Governance documents** (as opposed to the MIT license, which covers only software in this repository). E.g. a Creative Commons license.
Raised in: [LICENSE](../../LICENSE).
Review gate: before repository publication or C1 Charter Candidate publication.
Status: OPEN.

## Index by phase gate

- **Blocks entry into Phase 2:** OQ-DATA-CONTRIBUTION-MODEL, OQ-DATA-PROPOSAL-MODEL, OQ-DATA-NEED-MODEL, OQ-DATA-AUDIT-EVENT-MODEL, OQ-DATA-WORKFLOW-STATES, OQ-SECURITY-RETENTION-PERIODS, OQ-TRANSPARENCY-OPERATIONAL-HISTORY.
- **Blocks completion of Phase 1 / repository publication:** OQ-SECURITY-VULN-REPORTING, OQ-SECURITY-ACTIONS-HARDENING, OQ-OPS-BRANCH-PROTECTION.
- **Blocks entry into Phase 3:** OQ-CHARTER-RIGHTS, OQ-CHARTER-EXCLUSION, OQ-CHARTER-PARTICIPANT-RESPONSIBILITIES, OQ-GOVERNANCE-EMERGENCY-AUTHORITY, OQ-GOVERNANCE-PROPOSALS, OQ-ARCH-FRAMEWORK, OQ-SECURITY-ACCESS-CONTROL-RETENTION, OQ-SECURITY-AUTHN-MODEL.
- **Blocks entry into Phase 4:** OQ-GOVERNANCE-DISPUTES, OQ-GOVERNANCE-VALIDATED-NEEDS.
- **Blocks entry into Phase 5:** OQ-PROJECT-LEGAL-STRUCTURE.
- **Blocks C2 → C3 ratification:** OQ-GOVERNANCE-AMENDMENT-THRESHOLD.
- **Review gates (non-blocking):** OQ-GOVERNANCE-STEWARD-SCOPE, OQ-GOVERNANCE-DECISION-PROCESS, OQ-GOVERNANCE-FACILITATION, OQ-GOVERNANCE-STEWARD-SUCCESSION, OQ-SECURITY-INCIDENT-RESPONSE, OQ-OPS-MONITORING-CADENCE, OQ-OPS-TOKEN-ROTATION-CADENCE, OQ-TRANSPARENCY-REPO-VISIBILITY, OQ-LEGAL-CONTENT-LICENSE.

**Total: 31 open questions. 0 resolved.**

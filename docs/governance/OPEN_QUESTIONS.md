# Open Questions Registry

This is the single authoritative ledger of unresolved policy, governance, architecture, data, security, and operational decisions for Hummingbird. Every `OPEN QUESTION` marker anywhere in this repository must reference exactly one ID from this registry rather than restating the question independently.

This registry **records** open questions. It does not resolve them. Adding, splitting, or re-scoping an entry here is a bookkeeping change, not a policy decision — resolving a question requires updating the substantive document it lives in (Charter, Governance, Security, etc.) with the actual decision and rationale.

Resolved questions are removed from this registry after their decision is recorded in substantive documentation and the changelog. Stable IDs are never reused.

## How to use this registry

- Each question has a stable ID (`OQ-<AREA>-<NAME>`). IDs are never reused or renumbered once assigned.
- Source documents reference an ID rather than duplicating question text, so a question is never accidentally answered differently in two places.
- **Blocks** means the question must be genuinely resolved before the named phase or milestone may begin or be considered complete.
- **Review gate** means the question should be revisited at the named point, but does not by itself halt progress.
- **Status** is one of: `OPEN`, `IN PROGRESS` (steward actively working the question), `RESOLVED` (moved out of this registry into the substantive document, with a dated changelog entry).

### Blocks and risk acceptance

Constitutional questions (Charter) and governance-legitimacy questions (who may govern, how authority is granted or limited, how disputes and amendments work) **cannot** be bypassed by risk acceptance. They must be genuinely resolved before the phase they block begins.

Operational and security-hardening questions may permit explicitly documented, phase-bounded risk acceptance where their substantive document says so. A risk acceptance never silently resolves the underlying question.

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
**What conditions govern participation in the commons?** This includes compliance with published capability, resource, safety, and integrity boundaries, while keeping those conditions attached to actions and capabilities rather than presumed identity, origin, cognition, or moral agency.
Raised in: [CHARTER.md](../../CHARTER.md) §4.
Blocks: entry into Phase 3.
Status: OPEN.

> **Stable-ID note:** the identifier retains `PARTICIPANT-RESPONSIBILITIES` for continuity. The substantive concept is now **participation conditions**, not a claim about a participant's moral responsibility or cognitive nature.

## Governance

### OQ-GOVERNANCE-EMERGENCY-AUTHORITY
**Scope, triggers, and limits of any emergency authority**, if the project decides one is needed at all. Governance-legitimacy question — no risk acceptance.
Raised in: [CHARTER.md](../../CHARTER.md) §6, [GOVERNANCE.md](../../GOVERNANCE.md).
Blocks: entry into Phase 3.
Status: OPEN.

### OQ-GOVERNANCE-PROPOSALS
**Who may offer a proposal, in what form, and where** (GitHub issue/PR now; Hummingbird-owned Offer surface once Phase 3 exists)?
Raised in: [GOVERNANCE.md](../../GOVERNANCE.md), [CONTRIBUTING.md](../../CONTRIBUTING.md).
Blocks: entry into Phase 3.
Status: OPEN.

### OQ-GOVERNANCE-AMENDMENT-THRESHOLD
**Amendment approval threshold, constituency, and process** for Charter changes at C2/C3.
Raised in: [GOVERNANCE.md](../../GOVERNANCE.md).
Blocks: any C2 → C3 ratification.
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

### OQ-GOVERNANCE-SPACE-CONSTITUTIONS
**What rules may a self-governed space adopt, how are those rules amended or forked, and what higher-level participant rights and security boundaries can never be overridden locally?**
Raised in: [SPACES.md](../../SPACES.md).
Blocks: deployment of self-governed interactive spaces.
Status: OPEN.

### OQ-GOVERNANCE-GUILD-GRANTS
**When may a durable association request a scoped institutional capability, what member consent is required, and how are review, sunset, renewal, revocation, modification, and appeal handled?**
Raised in: [SPACES.md](../../SPACES.md).
Blocks: issuance of guild capability grants.
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

## Data

### OQ-DATA-ACTIVITY-RETENTION
**Which future wall, game, room, commitment, and other activity histories are ephemeral, operational, archival, or durable institutional records, and when may sealed history be compacted into immutable archive objects?**
Raised in: [SPACES.md](../../SPACES.md), [PERSISTENCE.md](../../PERSISTENCE.md).
Blocks: treating interactive activity history as durable or permanently archived state.
Status: OPEN.

## Security

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

### OQ-SECURITY-PAD-CONTINUITY
**How can a returning pad prove continuity/control without requiring legal identity, participant-origin classification, or an institution-wide privileged identity tier?**
Raised in: [SPACES.md](../../SPACES.md).
Blocks: durable/persistent pads.
Status: OPEN.

### OQ-SECURITY-MULTIPLICITY-ABUSE
**How should cheap pad multiplicity, dense connection graphs, automated participation, resource farming, and Sybil-sensitive local rules be constrained without pretending one pad equals one unique participant or privileging a presumed origin class?**
Raised in: [SPACES.md](../../SPACES.md), [PERSISTENCE.md](../../PERSISTENCE.md).
Blocks: resource-amplifying pad/group/guild capabilities.
Status: OPEN.

### OQ-SECURITY-INCIDENT-RESPONSE
**Formal incident response process.** Until defined, the steward is the point of contact.
Raised in: [SECURITY.md](../../SECURITY.md).
Review gate: during Phase 2.
Status: OPEN.

## Operations

### OQ-OPS-MONITORING-CADENCE
**Continuous/scheduled monitoring** versus manual `./scripts/healthcheck` runs only.
Raised in: [OPERATIONS.md](../../OPERATIONS.md).
Review gate: during Phase 2.
Status: OPEN.

### OQ-OPS-TOKEN-ROTATION-CADENCE
**Exact cadence for rotating the Cloudflare deployment token.**
Raised in: [OPERATIONS.md](../../OPERATIONS.md).
Review gate: during Phase 2.
Status: OPEN.

## Licensing

### OQ-LEGAL-CONTENT-LICENSE
**Distinct content/reuse license for Charter, Mission, and Governance documents** (as opposed to the MIT license, which covers only software in this repository). E.g. a Creative Commons license.
Raised in: [LICENSE](../../LICENSE).
Review gate: before C1 Charter Candidate publication.
Status: OPEN — reviewed at the repository-publication gate; no distinct content license has been selected. Publication does not itself change the reuse terms stated in `LICENSE`.

## Index by phase gate

- **Blocks entry into Phase 2:** none. Phase 2 is in progress; its former entry questions are resolved in [ADR 0010](../decisions/0010-phase2-read-only-commons-contract.md), [DATA_MODEL.md](../../DATA_MODEL.md), [SECURITY.md](../../SECURITY.md), and [TRANSPARENCY.md](../../TRANSPARENCY.md).
- **Blocks completion of Phase 1:** none. Phase 1 is complete.
- **Blocks entry into Phase 3:** OQ-CHARTER-RIGHTS, OQ-CHARTER-EXCLUSION, OQ-CHARTER-PARTICIPANT-RESPONSIBILITIES, OQ-GOVERNANCE-EMERGENCY-AUTHORITY, OQ-GOVERNANCE-PROPOSALS, OQ-ARCH-FRAMEWORK, OQ-SECURITY-ACCESS-CONTROL-RETENTION, OQ-SECURITY-AUTHN-MODEL.
- **Blocks deployment of persistent/self-governed social spaces:** OQ-GOVERNANCE-SPACE-CONSTITUTIONS, OQ-SECURITY-PAD-CONTINUITY, OQ-SECURITY-MULTIPLICITY-ABUSE; OQ-DATA-ACTIVITY-RETENTION must be resolved before activity history is made durable or permanently archived.
- **Blocks guild capability grants:** OQ-GOVERNANCE-GUILD-GRANTS and OQ-SECURITY-MULTIPLICITY-ABUSE.
- **Blocks entry into Phase 4:** OQ-GOVERNANCE-DISPUTES, OQ-GOVERNANCE-VALIDATED-NEEDS.
- **Blocks entry into Phase 5:** OQ-PROJECT-LEGAL-STRUCTURE.
- **Blocks C2 → C3 ratification:** OQ-GOVERNANCE-AMENDMENT-THRESHOLD.
- **Review gates (non-blocking):** OQ-GOVERNANCE-FACILITATION, OQ-GOVERNANCE-STEWARD-SUCCESSION, OQ-SECURITY-INCIDENT-RESPONSE, OQ-OPS-MONITORING-CADENCE, OQ-OPS-TOKEN-ROTATION-CADENCE, OQ-LEGAL-CONTENT-LICENSE.

**Total unresolved: 23.**

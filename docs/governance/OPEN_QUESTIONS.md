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

A bounded C0 evidence-seeking experiment may define narrower temporary operating rules without resolving a broader future question, but only where the experiment's authority ceiling does not exercise the unresolved constitutional or governance authority itself. [ADR 0017](../decisions/0017-phase2e-experimental-ingress.md) applies that distinction to temporary Phase 2E ingress; it does not reduce the Phase 3 blockers below.

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
**What turns offered material into a formal Hummingbird governance proposal, who may initiate that transition, in what form, and through what process?** Phase 2E experimental ingress may receive proposal-shaped material, but receipt/synthesis/surfacing does not initiate a governance proposal or create governance authority.
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
Phase 2 review disposition: deliberately deferred under [ADR 0022](../decisions/0022-phase2e1-review-gate-dispositions.md). Future design must distinguish operational custody, institutional stewardship, and governing authority; reduce material single-person continuity dependencies without treating custody as sovereignty; permit continued useful steward participation without founder/incumbent veto or permanent authority; and distinguish different succession/unavailability events rather than forcing one mechanism onto all of them.
Review gate: Phase 2 review completed 2026-09-12; next substantive review during Phase 2E.2 after participant-rights, exclusion, emergency-authority, and proposal-governance constraints are clearer.
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
**Final application framework/runtime for durable Phase 3+ interactive capabilities.** A phase-bounded runtime may be selected for the Phase 2E experimental-ingress pilot without resolving the durable framework choice or creating Phase 3 precedent.
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
**Durable Phase 3 bounded retention for rate-limit/abuse state**, kept separate from the identity/participant model. The Phase 2E ingress experiment must publish a narrow pilot-specific abuse-state/retention rule, but that rule is evidence rather than automatic resolution of the Phase 3 model.
Raised in: [DATA_MODEL.md](../../DATA_MODEL.md), [SECURITY.md](../../SECURITY.md).
Blocks: entry into Phase 3.
Status: OPEN.

### OQ-SECURITY-AUTHN-MODEL
**Authentication/authorization model for durable Phase 3 participant capabilities.** The evidence-only Phase 2E ingress experiment may accept uncredentialed offers under ADR 0017 because receipt grants no durable capability or standing; that experiment does not resolve the future authn/authz model.
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
**Mature Phase 3 incident-response process**, including participant-facing duties, multi-role response, and the boundary with any separately authorized emergency power. Phase 2 uses the smaller operational lifecycle in [ADR 0022](../decisions/0022-phase2e1-review-gate-dispositions.md): recognize/declare, reversible containment under existing authority, minimum necessary evidence preservation, verified recovery, proportionate disclosure, closure/learning, and no incident-created governance authority.
Raised in: [SECURITY.md](../../SECURITY.md).
Review gate: Phase 2 review completed 2026-09-12; next substantive review during Phase 2E.3 after rights/governance/authentication/runtime constraints are known.
Status: OPEN.

## Operations

### OQ-OPS-MONITORING-CADENCE
**Durable Phase 3 monitoring/alerting model by capability**, including freshness semantics, ownership, independent corroboration where consequence warrants it, service expectations, and any explicitly pre-authorized automated mitigation. Phase 2 rejects one universal timer and uses the risk-based observable-capability model in [ADR 0022](../decisions/0022-phase2e1-review-gate-dispositions.md).
Raised in: [OPERATIONS.md](../../OPERATIONS.md).
Review gate: Phase 2 review completed 2026-09-12; next substantive review during Phase 2E.3.
Status: OPEN.

### OQ-OPS-TOKEN-ROTATION-CADENCE
**Durable Phase 3 credential lifecycle**, including secretless/expiring credential preference, inventory/custody, maximum-age policy by credential class, rotation/revocation verification, and continuity. Phase 2 uses the risk-based lifecycle in [ADR 0022](../decisions/0022-phase2e1-review-gate-dispositions.md), with immediate revocation/rotation on compromise or material scope/custody change and a 180-day ordinary review/maximum-lifetime baseline for the current production deployment token rather than a universal institutional cadence.
Raised in: [OPERATIONS.md](../../OPERATIONS.md).
Review gate: Phase 2 review completed 2026-09-12; next substantive review during Phase 2E.3.
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

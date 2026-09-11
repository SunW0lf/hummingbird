# Governance

This document defines how decisions get made in Hummingbird. It is operational, not constitutional — constitutional principles live in [CHARTER.md](CHARTER.md).

Detailed governance protocol documents, once written, live in [docs/governance/](docs/governance/). The authoritative list of unresolved governance questions is [docs/governance/OPEN_QUESTIONS.md](docs/governance/OPEN_QUESTIONS.md).

## Proposals

Open question: [OQ-GOVERNANCE-PROPOSALS](docs/governance/OPEN_QUESTIONS.md#oq-governance-proposals) — who may submit a proposal, in what form, and where (GitHub issue/PR, in-app form once Phase 3 exists)?

## Amendments

- Charter amendments follow the publication-stage model defined in [CHARTER.md](CHARTER.md) §5 and tracked under [docs/charter/](docs/charter/).
- Open question: [OQ-GOVERNANCE-AMENDMENT-THRESHOLD](docs/governance/OPEN_QUESTIONS.md#oq-governance-amendment-threshold) — amendment approval threshold and process.

## Decisions

- Technical/architectural decisions affecting the codebase or infrastructure are recorded as Architecture Decision Records in [docs/decisions/](docs/decisions/).
- Open question: [OQ-GOVERNANCE-DECISION-PROCESS](docs/governance/OPEN_QUESTIONS.md#oq-governance-decision-process) — process for non-technical/governance decisions.

## Facilitation

Open question: [OQ-GOVERNANCE-FACILITATION](docs/governance/OPEN_QUESTIONS.md#oq-governance-facilitation) — is there a designated facilitator role distinct from the steward? What are its powers and limits?

## Steward responsibilities

Until governance workflows exist, the steward is responsible for:

- Maintaining the repository, deployment, and secrets.
- Keeping documentation honest — using `OPEN QUESTION` markers rather than inventing policy.
- Executing backups, recovery, and security response per [OPERATIONS.md](OPERATIONS.md) and [SECURITY.md](SECURITY.md).

Open question: [OQ-GOVERNANCE-STEWARD-SUCCESSION](docs/governance/OPEN_QUESTIONS.md#oq-governance-steward-succession) — long-term steward succession and multi-steward model.

## Disputes

Open question: [OQ-GOVERNANCE-DISPUTES](docs/governance/OPEN_QUESTIONS.md#oq-governance-disputes) — dispute resolution process for participants or contributions.

## Validated needs

Open question: [OQ-GOVERNANCE-VALIDATED-NEEDS](docs/governance/OPEN_QUESTIONS.md#oq-governance-validated-needs) — process for identifying and validating "needs" referenced in the Mission (Phase 4, see [ROADMAP.md](ROADMAP.md)).

## Emergency authority

See [CHARTER.md](CHARTER.md) §6 — [OQ-GOVERNANCE-EMERGENCY-AUTHORITY](docs/governance/OPEN_QUESTIONS.md#oq-governance-emergency-authority), not yet defined.

## Review and revision

This document should be revisited as each Roadmap phase begins, since new phases introduce new governance surface area (proposals, disputes, financial transparency).

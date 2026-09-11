# Governance

This document defines how decisions get made in Hummingbird. It is operational, not constitutional — constitutional principles live in [CHARTER.md](CHARTER.md).

Detailed governance protocol documents, once written, live in [docs/governance/](docs/governance/). The authoritative list of unresolved governance questions is [docs/governance/OPEN_QUESTIONS.md](docs/governance/OPEN_QUESTIONS.md).

## Proposals

Open question: [OQ-GOVERNANCE-PROPOSALS](docs/governance/OPEN_QUESTIONS.md#oq-governance-proposals) — who may submit a proposal, in what form, and where (GitHub issue/PR, in-app form once Phase 3 exists)?

## Charter publication lifecycle

This is the authoritative definition of the Charter's publication stages. [CHARTER.md](CHARTER.md) and [docs/charter/](docs/charter/) reference this section rather than redefining it.

- **C0 — Working Charter.** The Charter as stored in Git at [CHARTER.md](CHARTER.md), root of the repository. Not represented as ratified or under formal review. May change freely; every change is an ordinary commit, not a governed amendment.
- **C1 — Charter Candidate.** A version of the Charter explicitly published for review at a stable public location (e.g. `datum.quest/charter` once the site supports it) and mirrored in [docs/charter/](docs/charter/) (e.g. `candidate-0.1.md`). Clearly labeled "Charter Candidate — not yet ratified." Publishing a candidate is a deliberate steward/governance action, never automatic.
- **C2 — Review.** The period during which amendment proposals against the current candidate are considered. A substantive change produces a new candidate version (`candidate-0.2.md`, etc.) rather than silently editing the version under review.
- **C3 — Ratified.** The current governing Charter once accepted (`charter-1.0.md`, and later versions). Ratified constitutional text is never silently edited: subsequent amendments go through C1/C2 again against the ratified text and produce a new ratified version plus a dated record under `docs/charter/amendments/`. Previous ratified and candidate versions are preserved, never deleted.

Open question: [OQ-GOVERNANCE-AMENDMENT-THRESHOLD](docs/governance/OPEN_QUESTIONS.md#oq-governance-amendment-threshold) — amendment approval threshold, constituency, and voting process for moving C1→C2→C3 or amending a C3 Charter. This lifecycle defines the stages a change moves through; it does not define who approves the move or by what margin.

## Decisions

- Technical/architectural decisions affecting the codebase or infrastructure are recorded as Architecture Decision Records in [docs/decisions/](docs/decisions/).
- Open question: [OQ-GOVERNANCE-DECISION-PROCESS](docs/governance/OPEN_QUESTIONS.md#oq-governance-decision-process) — process for non-technical/governance decisions.

## Future local governance — not yet active

The working participatory-space design in [SPACES.md](SPACES.md) allows a future room, cafe, pub, workshop, garden, game room, or similar space to govern bounded local interactions through a public constitution.

The intended boundary is:

**Spaces may govern their own interactions, but may not alter the rights, security boundaries, or standing of participants outside those spaces.**

A future local constitution may be able to choose from safe governance primitives such as opening hours, tile/action intervals, proposal thresholds, voting/consent rules, shared-object behavior, or delayed effective dates. It must not acquire arbitrary executable-code authority, infrastructure credentials, private security controls, or the ability to rewrite Hummingbird-wide constitutional rights.

This is a direction, not an active delegation. [OQ-GOVERNANCE-SPACE-CONSTITUTIONS](docs/governance/OPEN_QUESTIONS.md#oq-governance-space-constitutions) must be resolved before self-governed spaces are deployed.

## Future guilds and capability grants — not yet active

A persistent association may eventually constitute a guild with a public constitution, membership history, and internal consent process. A guild is not a higher participant class.

The working model permits a guild to request a narrowly scoped institutional capability, such as extended retention of a shared workshop between ordinary room-cleanup cycles. The request would expose the member decision, pass automatic policy/security checks, receive steward/security review where appropriate, and result in a public grant, modified grant, or denial.

A grant should:

- belong to the guild/shared activity rather than individual members;
- name its exact scope and purpose;
- expire or be reviewed rather than create permanent rank;
- have explicit revocation/modification conditions;
- never confer constitutional superiority, purchased influence, or rights over outsiders.

Minimum guild membership may eventually create eligibility to **request** a grant, but membership count alone should not automatically produce authority or resource multipliers. Cheap multiplicity and Sybil-sensitive rules remain a security/governance concern.

[OQ-GOVERNANCE-GUILD-GRANTS](docs/governance/OPEN_QUESTIONS.md#oq-governance-guild-grants) and [OQ-SECURITY-MULTIPLICITY-ABUSE](docs/governance/OPEN_QUESTIONS.md#oq-security-multiplicity-abuse) must be resolved before these grants exist.

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

This document should be revisited as each Roadmap phase begins, since new phases introduce new governance surface area (proposals, disputes, local-space constitutions, delegated capabilities, financial transparency).

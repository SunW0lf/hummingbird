# Resolved Questions Archive

This archive preserves stable `OQ-*` identifiers after their questions leave the active [Open Questions Registry](OPEN_QUESTIONS.md). It is historical/indexing material, not a second source of policy. The linked substantive documents and ADRs contain the actual decisions.

IDs are never reused.

## Resolved 2026-11-18

These five Phase 3 blockers were resolved together in Phase 2E.2 by [ADR 0024](../decisions/0024-phase2e2-constitutional-and-governance-dispositions.md) as C0 working-draft decisions.

### OQ-CHARTER-RIGHTS
Resolved by [CHARTER.md](../../CHARTER.md) §2: a six-part minimum floor (Arrive, Leave, Know, Review, Carry, No hidden standing) applies regardless of origin. It excludes any right to an individualized reply, admission, publication, or particular outcome. It is recorded as a floor for now, open to further exploration.

### OQ-CHARTER-EXCLUSION
Resolved by [CHARTER.md](../../CHARTER.md) §3: exclusion attaches to actions and material, never people. Material may be declined or removed only for published reason classes. Capability restrictions are scoped, time-bounded, reasoned, and reviewable. Reading is never withdrawn as a sanction.

### OQ-CHARTER-PARTICIPANT-RESPONSIBILITIES
Resolved by [CHARTER.md](../../CHARTER.md) §4: participation conditions are each capability's published bounds plus three universal conditions (no secrets or private information about others, no evasion of bounds, no unlawful content). There is no conduct code about character, intent, or tone. The identifier keeps `PARTICIPANT-RESPONSIBILITIES` for continuity; the concept is participation conditions.

### OQ-GOVERNANCE-EMERGENCY-AUTHORITY
Resolved by [CHARTER.md](../../CHARTER.md) §6 and [GOVERNANCE.md](../../GOVERNANCE.md): pause-only authority, triggered only when Hummingbird itself represents a risk. External loss of service is the baseline environment, not an emergency. A pause is immediate, publicly noticed at once, reduce-only, and lapses after 14 days unless renewed by a recorded C0 decision.

### OQ-GOVERNANCE-PROPOSALS
Resolved by [GOVERNANCE.md](../../GOVERNANCE.md) §Proposals: a proposal is a public pull request against the Charter, Governance, or an ADR. Anyone may draft one, offers never become proposals automatically, and the steward decides during C0 with written reasons. Advisory tools such as an endorsement threshold are permitted where safe; their reliability is carried into `OQ-SECURITY-AUTHN-MODEL`.

## Resolved 2026-09-11

### OQ-GOVERNANCE-DECISION-PROCESS
Resolved by [GOVERNANCE.md](../../GOVERNANCE.md): while the Charter remains at C0, non-technical and governance decisions may be adopted as explicit public, traceable, versioned, revisable working-draft institutional decisions. Input may be synthesized at scale; volume does not itself create authority; and C0 decisions cannot claim ratification or bypass named gates.

### OQ-GOVERNANCE-STEWARD-SCOPE
Resolved by [GOVERNANCE.md](../../GOVERNANCE.md) and reflected in [CHARTER.md](../../CHARTER.md): Hummingbird uses minimum necessary authority and escalation by necessity. Consequential layers publish their needs, authority, limits, possible outcomes, and escalation/review paths. The steward is a residual authority layer rather than the normal decision engine and cannot bootstrap present stewardship into permanent constitutional authority.

## Resolved 2026-09-10

### OQ-DATA-CONTRIBUTION-MODEL
Resolved by [DATA_MODEL.md](../../DATA_MODEL.md) and [ADR 0010](../decisions/0010-phase2-read-only-commons-contract.md): Phase 2 contribution records use the portable canonical document envelope without requiring participant identity.

### OQ-DATA-PROPOSAL-MODEL
Resolved by [DATA_MODEL.md](../../DATA_MODEL.md) and [ADR 0010](../decisions/0010-phase2-read-only-commons-contract.md): Phase 2 proposal records are descriptive/read-only and do not imply a finalized approval process.

### OQ-DATA-NEED-MODEL
Resolved by [DATA_MODEL.md](../../DATA_MODEL.md) and [ADR 0010](../decisions/0010-phase2-read-only-commons-contract.md): Phase 2 need records describe requirements without automatically validating or authorizing them.

### OQ-DATA-AUDIT-EVENT-MODEL
Resolved by [DATA_MODEL.md](../../DATA_MODEL.md), [TRANSPARENCY.md](../../TRANSPARENCY.md), and [ADR 0010](../decisions/0010-phase2-read-only-commons-contract.md): events are minimal canonical records and do not duplicate full snapshots or unnecessary sensitive metadata.

### OQ-DATA-WORKFLOW-STATES
Resolved by [DATA_MODEL.md](../../DATA_MODEL.md) and [ADR 0010](../decisions/0010-phase2-read-only-commons-contract.md): Phase 2 uses only a small publication/lifecycle state machine; governance-specific states remain deferred.

### OQ-SECURITY-RETENTION-PERIODS
Resolved by [SECURITY.md](../../SECURITY.md) and [ADR 0010](../decisions/0010-phase2-read-only-commons-contract.md): Phase 2 visibility classifications and retention defaults are explicitly bounded.

### OQ-TRANSPARENCY-OPERATIONAL-HISTORY
Resolved by [TRANSPARENCY.md](../../TRANSPARENCY.md) and [ADR 0010](../decisions/0010-phase2-read-only-commons-contract.md): provider raw logs remain authoritative; Hummingbird publishes compact material operational events rather than duplicating complete logs.

### OQ-TRANSPARENCY-REPO-VISIBILITY
Resolved by [TRANSPARENCY.md](../../TRANSPARENCY.md) and [ADR 0009](../decisions/0009-public-repository-security-transition.md): the repository is public.

### OQ-SECURITY-ACTIONS-HARDENING
Resolved by [SECURITY.md](../../SECURITY.md) and [OPERATIONS.md](../../OPERATIONS.md): repository Actions are restricted, workflow permissions are read-only, and external Actions are pinned to full commit SHAs.

### OQ-OPS-BRANCH-PROTECTION
Resolved by [OPERATIONS.md](../../OPERATIONS.md) and [SECURITY.md](../../SECURITY.md): `main` is protected with required `Checks, test, build`, and GitHub reports enforcement for everyone including the steward/admin.

### OQ-SECURITY-VULN-REPORTING
Resolved by [SECURITY.md](../../SECURITY.md) and [CONTRIBUTING.md](../../CONTRIBUTING.md): GitHub private vulnerability reporting is enabled as the designated private reporting path. The Advanced Security setting was confirmed by the steward during the public-repository security activation; vulnerability details must not be filed in public issues.

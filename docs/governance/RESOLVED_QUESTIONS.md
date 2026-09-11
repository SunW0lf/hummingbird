# Resolved Questions Archive

This archive preserves stable `OQ-*` identifiers after their questions leave the active [Open Questions Registry](OPEN_QUESTIONS.md). It is historical/indexing material, not a second source of policy. The linked substantive documents and ADRs contain the actual decisions.

IDs are never reused.

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

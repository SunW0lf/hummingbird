# 0007 — Portable Canonical Data Model

- Status: Accepted (design intent; no persistence engine chosen or deployed)
- Date: 2026-09-11

## Context

Phase 2 (Read-Only Commons) will eventually require a real database, and the project intentionally has not chosen one yet (see [OQ-ARCH-FRAMEWORK](../governance/OPEN_QUESTIONS.md#oq-arch-framework) equivalent framework question and the data-model open questions). Without an explicit portability constraint, early schema decisions risk locking Hummingbird's institutional meaning into the quirks of whichever database is picked first.

## Decision

Hummingbird's canonical records use versioned, portable objects/events/relationships whose institutional meaning is independent of the eventual persistence engine. Concretely (documented in [DATA_MODEL.md](../../DATA_MODEL.md)):

- A small canonical core shape (`id`, `type`, `schema_version`, `created_at`, `state`, `content`, `relationships`) rather than an unstructured blob.
- Meaningful changes are recorded as minimal events rather than full duplicate snapshots.
- Cross-object relationships are typed (e.g. `responds_to`, `supersedes`) and designed to be graph-projectable without requiring a graph database.
- Large artifacts are referenced, not copied.
- Search indexes, caches, and other derived projections are explicitly non-canonical and must remain rebuildable.
- Three retention classes (EPHEMERAL, OPERATIONAL, DURABLE) govern how long data lives, separate from the existing visibility classification in [SECURITY.md](../../SECURITY.md).
- A "data budget" checklist (purpose, canonical-or-derived, retention class, expected size, reconstructability, privacy classification) must be answerable before any new persistent field or dataset is added.

## Rationale

Designing around documents, events, and typed relationships keeps Hummingbird compatible with document databases, JSON-in-SQL, PostgreSQL JSONB, D1/SQLite JSON, MongoDB, Firestore, or future object/event storage, so the eventual engine choice becomes an implementation detail rather than a constitutional one. Separating canonical data from derived projections and imposing a data budget up front prevents flexible document storage from becoming uncontrolled accumulation just because storage is cheap.

## Alternatives considered

- Pick a database now and design the schema around it — rejected as premature; Phase 2 is not yet underway and locking in an engine before real usage patterns exist risks a costly migration later.
- Schema-less/unstructured blob storage — rejected in favor of schema-flexible but explicitly versioned and typed documents, so institutional meaning does not depend on out-of-band tribal knowledge of what a blob contains.
- Defer any data-architecture documentation until Phase 2 begins — rejected; recording the constraints now gives future schema design (still an open question per-entity) a stable frame to work within.

## Consequences

- No schemas, tables, or migrations were created by this decision. `OQ-DATA-CONTRIBUTION-MODEL`, `OQ-DATA-PROPOSAL-MODEL`, `OQ-DATA-NEED-MODEL`, `OQ-DATA-AUDIT-EVENT-MODEL`, and `OQ-DATA-WORKFLOW-STATES` remain open and still block entry into Phase 2.
- Any future Phase 2 implementation proposal should explain how its concrete schema satisfies the portability principle and data budget, or explicitly justify a deviation.
- The interim Base support wallet's on-chain activity is treated as an example of "reference external authoritative facts, don't duplicate them": the chain itself is authoritative, and Hummingbird avoids building a shadow transaction ledger.

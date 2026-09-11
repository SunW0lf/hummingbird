# ADR 0012 — Reference Corpus Before Persistence

Status: Accepted

Date: 2026-09-10 (Pacific)

## Context

Phase 2 defines portable, versioned canonical object semantics and plans to use Cloudflare D1 as the first persistence engine. If D1 tables and migrations are created before representative records exist outside the database, the database schema can accidentally become the real data model even when the documentation says otherwise.

The project needs a cheap way to prove that canonical meaning survives independently of a storage engine before production persistence exists.

The project must also avoid a different mistake: treating test fixtures or example records as automatically admitted institutional memory.

## Decision

Before provisioning the production D1 data model, Hummingbird will maintain a small, version-controlled **reference corpus** under `fixtures/canonical/` together with a machine-readable schema under `schemas/` and zero-dependency contract tests.

The reference corpus:

- contains representative Phase 2 `contribution`, `proposal`, `need`, and `event` records;
- exercises lifecycle states, typed relationships, provenance/publication fields where useful, and the absence of required participant identity/origin classification;
- is deterministic and reviewable in Git;
- is validated in CI before database migrations or import code are accepted;
- becomes the round-trip test corpus for D1 import/export work.

The reference corpus is **contract material, not production institutional memory**. Inclusion in `fixtures/canonical/` does not itself publish, admit, approve, validate, or grant governance status to the represented content. A later production seed/import step must deliberately admit any record intended for the public commons.

D1 migrations must be capable of ingesting the reference corpus without changing its institutional meaning. A later export must preserve the canonical fields and relationships required to reconstruct equivalent records outside D1.

## Rationale

This makes portability falsifiable. Hummingbird can test the object contract before a database exists and can reject persistence designs that only work because important meaning is hidden in D1-specific columns, triggers, row IDs, or queries.

Keeping fixtures non-institutional also preserves the Seed Bank distinction established in ADR 0011: **offering, representing, testing, and admitting material are different acts**.

## Consequences

- Phase 2 begins with a reference corpus and schema contract before production D1 provisioning.
- CI gains canonical-record contract tests with no new runtime or package dependency.
- D1 migration/import work has concrete round-trip fixtures from its first commit.
- Test/reference records may resemble real Hummingbird concepts without becoming canonical public records merely because they are committed to Git.
- The production admission/import path remains an explicit later Phase 2 step.

## Supersession

A later ADR may replace the fixture format or schema tooling, but only if an equivalent storage-independent contract and round-trip test remain in place.

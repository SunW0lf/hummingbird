# Phase 2B — Remote D1 Execution Checklist

Status: **in progress — remote database provisioned and bound; migrations pending**
Date: 2026-09-11

This protocol is the next execution slice after the local Wrangler D1 round-trip test. It does not open public writes, change canonical semantics, or move Hummingbird into Phase 2C by itself.

## Goal

Create a remote Cloudflare D1 persistence target that can be reconstructed from the repository's versioned migrations and storage-independent canonical records, then prove that records exported from D1 preserve institutional meaning.

The remote database is infrastructure. It is not the source of Hummingbird's schema semantics, governance rules, participant identity model, or publication authority.

## Current execution state

Completed on 2026-09-11:

- a remote Cloudflare D1 database named `hummingbird` exists;
- its non-secret database UUID is bound in `wrangler.d1.jsonc`;
- no application-owned public write endpoint has been attached;
- the existing Pages deployment credential remains separate from D1 administration.

Pending:

- apply repository-controlled migrations to the empty remote database;
- load the bounded verification corpus;
- export/reconstruct the canonical representation and compare it with the storage-independent corpus;
- exercise reproducible empty-state reconstruction and record the result.

## Preconditions

Before remote work begins:

- `tests/d1-roundtrip.test.js` passes locally/CI;
- `migrations/0001_canonical_v1.sql` is the reviewed initial migration;
- `fixtures/canonical/` remains the bounded reference corpus;
- `scripts/generate-d1-seed.js` deterministically produces the import SQL used by the local contract test;
- protected `main` and required CI remain in force;
- no application-owned public write endpoint exists.

## Credential boundary

Do **not** broaden the existing production Pages deployment credential merely to gain D1 administration.

Use one of these deliberately:

1. a steward-run one-time provisioning step with a separately scoped Cloudflare credential; or
2. a separate automation credential limited to the D1 resources/actions actually required.

Requirements:

- no token or secret in Git, fixtures, migrations, generated SQL, issue text, or public logs;
- Pages deployment and D1 administration remain separable credentials;
- database/account identifiers may be configuration, but must never become canonical object identity or institutional meaning;
- revoke/rotate the provisioning credential if it is not needed after setup.

## Execution sequence

### 1. Provision an empty remote D1 database — complete

The production-intended D1 database exists without an attached public write surface.

Only the non-secret provider identifier required by Wrangler configuration is committed. No credential is stored in the repository.

### 2. Bind configuration deliberately — complete

`wrangler.d1.jsonc` now binds the `DB` binding and `hummingbird` database name to the provisioned remote database UUID.

The local D1 path remains intact. Remote configuration must not make ordinary pull-request tests depend on network access or Cloudflare availability.

### 3. Apply migrations from empty state — next

Apply the repository migration set to the empty remote database using Wrangler's migration command rather than ad-hoc dashboard-created tables.

Acceptance checks:

- migration command succeeds;
- expected migration inventory is present exactly once;
- `canonical_objects` and `canonical_relationships` exist with the reviewed v1 shape;
- no ad-hoc dashboard-created columns/tables are required for correctness.

### 4. Load a bounded verification corpus

Use the deterministic reference-corpus import path against the remote database.

Do not treat the fixture corpus as organic production participation. It is verification material whose purpose is to prove portability and reconstruction.

### 5. Export and compare

Add or use a deterministic remote export path that reconstructs canonical records from D1 into the storage-independent representation.

The exported records must deep-equal the reference corpus after deterministic ordering. Provider row IDs, internal metadata, or execution timestamps must not be required to recover canonical meaning.

### 6. Exercise empty-state reconstruction once more

Before declaring the remote persistence slice ready, verify that the database can be recreated from:

1. repository migrations;
2. storage-independent canonical input;
3. documented provider configuration.

A database that only works because of undocumented dashboard state does not satisfy Phase 2B.

## CI policy

Normal pull-request CI should continue using local Wrangler D1 so tests remain deterministic, inexpensive, and independent of remote credentials.

Remote D1 verification should be an explicit steward/release operation unless a later ADR establishes a safe, least-privilege automated environment. Do not make every PR mutate or depend on the production-intended database.

## Security and data rules

During this slice:

- no participant-origin classification is added;
- no IP address, browser fingerprint, bot score, or Cloudflare classification is persisted as canonical data;
- no Seed Bank account metadata or reaction counts are imported as authority;
- no public mutation endpoint is enabled;
- no secret/security-sensitive field is added to the public model;
- no schema change is made merely because D1 makes it convenient.

## Failure/rollback posture

Because the database is not yet serving public application writes, failure should be cheap:

- stop the remote operation;
- preserve diagnostic output without secrets;
- delete/recreate the remote database if necessary;
- reapply migrations from empty state;
- rerun the deterministic corpus import/export comparison.

Do not patch production state manually until it works. Fix the migration/import/export path so reconstruction remains reproducible.

## Exit criteria

This execution slice is complete only when all are true:

- an empty remote D1 database can be migrated using repository-controlled migrations;
- the bounded reference corpus can be imported deterministically;
- remote D1 can be exported back into the canonical storage-independent representation;
- exported records match the reference corpus without semantic loss;
- credentials remain least-privilege and absent from the repository;
- ordinary CI remains local/deterministic;
- no public write path was introduced;
- the resulting configuration and procedure are documented well enough to reproduce.

Passing these criteria advances Phase 2B but does not automatically complete Phase 2C, admit Seed Bank material, or authorize controlled participation.

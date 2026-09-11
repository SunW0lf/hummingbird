# Phase 2D — Canonical Backup and Recovery Protocol

Status: **verified against current production canonical state; Phase 2D recovery exit satisfied**

This protocol defines how Hummingbird backs up and recovers canonical application state without making Cloudflare D1 table layout, provider database identifiers, or public read projections the institution's only recovery source.

It is intentionally conservative. The production D1 database may be read for backup, but this phase does **not** permit restoration into the live production database as a test.

## Recovery principle

Hummingbird must be able to lose its live database without losing institutional meaning.

```text
live canonical D1
      ↓ read-only export
portable canonical backup bundle
      ↓
empty compatible database
      ↓ versioned migrations
restored canonical state
      ↓ semantic verification
rebuildable public projection
```

The backup is not a copy of the public website. It includes canonical records regardless of current publication state because unpublished/draft canonical memory is still institutional state.

## Portable backup format

A v1 bundle contains:

```text
manifest.json
canonical/
  <encoded-canonical-id>.json
  ...
```

Each canonical file contains one reconstructed storage-independent canonical record. `manifest.json` records:

- backup format and format version;
- creation time;
- canonical schema versions represented;
- record count;
- record IDs, paths, and SHA-256 digests;
- a bundle SHA-256 derived from the ordered record digest inventory;
- a non-authoritative note about the export source.

The bundle deliberately does **not** require Cloudflare database IDs, D1 row IDs, hidden triggers, provider request metadata, browser/device identifiers, or deployment telemetry for interpretation or restore.

A provider-native database export may be retained as an additional recovery artifact, but it is not sufficient by itself to satisfy Hummingbird's portability requirement.

## Storage boundary

Production backup bundles must be stored:

1. outside the public web root;
2. outside the public Git repository;
3. outside the live D1 service as an independently retrievable copy.

The repository ignores `.hummingbird-backups/` for local convenience, but an ignored directory on the same workstation is not by itself an independent disaster-recovery copy.

The first production exercise may use steward-controlled encrypted/offline storage or another private storage service. Choosing a long-term backup provider is less important than proving that the portable bundle can be independently retrieved, verified, and restored.

A GitHub Actions artifact in this public repository is **not** a generally acceptable storage location for canonical backups because repository readers can retrieve public-repository artifacts. The one-shot Phase 2D drill contains a narrow safety exception: it uploads a backup artifact only after proving that every canonical record in the production backup is in a public lifecycle state **and** the full reconstructed canonical set deep-equals the already-public `publication/canonical` projection. If any draft or otherwise non-public canonical state exists, the workflow fails before artifact upload and the independent-retention exit criterion remains unsatisfied until a private storage path is used.

The first successful production drill satisfied that narrow exception because the production backup contained one canonical record and it exactly matched already-public canonical state at the time of the exercise. The resulting GitHub Actions artifact is retained for 30 days. Future backups must fail closed to a private retention path if production contains any non-public canonical record.

## Backup commands

Install dependencies first with `npm ci`.

### Local source

```bash
./scripts/backup --local --persist-to /path/to/local-d1-state --output /safe/path/backup
```

### Production D1 source — read only

```bash
./scripts/backup --remote --output /safe/off-repo/path/backup
```

The general-purpose remote command reconstructs canonical objects and relationships using `SELECT` only. It must not modify D1.

The one-shot CI recovery drill uses the same portable canonical reconstruction/bundle library but sends its two production `SELECT` queries directly through Cloudflare's D1 REST API. The recovery credential is an account-owned service-principal token; direct REST use avoids coupling the drill to Wrangler's user-oriented authentication behavior while preserving the same read-only production boundary.

After export:

```bash
./scripts/restore /safe/off-repo/path/backup --validate-only
```

Validation recomputes every record digest and the bundle digest without touching a database.

## Restore contract

A restore target must be empty and must receive the repository-controlled migrations before canonical data is imported.

Current general-purpose restore tooling permits restoration only into an explicit isolated local D1 state directory:

```bash
npx wrangler d1 migrations apply hummingbird \
  --local \
  --persist-to /tmp/hummingbird-recovery \
  --config wrangler.d1.jsonc

./scripts/restore /safe/path/backup \
  --local \
  --persist-to /tmp/hummingbird-recovery \
  --confirm-restore
```

The restore tool:

- verifies the bundle before use;
- refuses a non-empty canonical target;
- imports canonical objects and relationships transactionally;
- reconstructs canonical records from the restored D1 rows;
- deep-compares restored meaning to the backup bundle;
- does not modify remote D1.

`./scripts/restore --remote` remains deliberately disabled. The remote recovery exercise uses a separate one-shot runner that creates its own disposable D1 database through the Cloudflare API, applies the repository migration SQL through the D1 `/query` endpoint, imports the verified canonical bundle as a D1 batch, compares semantic state, rebuilds the public projection, and deletes the disposable database in cleanup. The live production database is never the recovery-test target.

Cloudflare documents that the D1 query API accepts API tokens with D1 Read or D1 Write and supports multiple semicolon-separated SQL statements as a batch. This makes the REST path suitable for the temporary account-owned recovery credential without broadening that credential or the existing Pages deployment token.

## Guarded one-shot remote recovery workflow

`.github/workflows/phase2d-remote-recovery-drill.yml` exists specifically for the first production-state exercise.

It has these boundaries:

- it runs only on `main` when the merge commit message begins `Phase 2D: run remote recovery drill`;
- it does not run on pull requests;
- it uses the separate `CLOUDFLARE_D1_RECOVERY_TOKEN` GitHub Actions secret, not the Pages deployment token;
- the credential is account-scoped for D1 recovery operations and is temporary rather than a permanent general-purpose automation credential;
- production access consists only of `SELECT` queries against canonical objects and relationships;
- the recovery runner creates a uniquely named disposable D1 database and refuses to continue if its UUID somehow equals the production D1 UUID;
- migration and restore writes are addressed directly to that disposable recovery UUID through the D1 REST API;
- canonical object and relationship tables must be empty after migrations and before restore;
- restored records must deep-equal the production backup;
- recovered public canonical records are rendered into an isolated temporary output and their machine-readable JSON projection must byte-equal the expected built projection;
- database deletion runs from the cleanup path even when verification fails;
- the portable backup is retained as a public-repository artifact for 30 days **only** when the backup is proven exactly equivalent to already-public canonical state as described in the storage boundary above.

## Execution observations

Failure behavior is retained because it is part of the recovery contract:

1. The first trigger attempt was rejected by GitHub before job creation because a colon-bearing trigger expression was left as an unquoted YAML scalar. No runner started, no secret was exposed to a job, and no D1 request occurred. The expression was quoted and guarded by CI.
2. The next attempt created a real recovery job but Wrangler failed on the initial production `SELECT` while using the new account-owned recovery token. The failure happened before a portable backup completed and before any disposable database was created, so no D1 mutation or cleanup was required. The one-shot runner was then moved to Cloudflare's documented D1 REST API rather than broadening credential permissions.
3. The first REST attempt exposed a credential/configuration mistake through a `401`, and the next correctly formed credential exposed an account-policy mismatch through a `403`. Both stopped on the first production read before any disposable D1 database existed. No production mutation occurred and no backup artifact was retained from either failed attempt.
4. After the recovery token was recreated with account-scoped **D1 Read + D1 Write** and no IP restriction, the same audited workflow succeeded end to end without a code change.

The successful exercise proved:

- `BACKUP_VERIFIED`: one production canonical record was exported and the portable bundle hash verified;
- `ARTIFACT_SAFETY`: the complete backup deep-equaled already-public `publication/canonical` state before public-repository artifact retention was permitted;
- a disposable D1 recovery database was created with an identifier distinct from production;
- repository migration `0001_canonical_v1.sql` reproduced an empty compatible schema;
- `SEMANTIC_EQUALITY`: restored canonical state deep-equaled the production backup;
- `PUBLIC_PROJECTION_EQUALITY`: the recovered machine-readable public projection byte-equaled the expected publication output;
- `PHASE2D_REMOTE_RECOVERY_DRILL: SUCCESS` was reached;
- the disposable recovery database was deleted after verification;
- the verified public-equivalent backup artifact was retained independently of live D1 for 30 days.

The compact public operational summary is released through the publication-buffer rules in [TRANSPARENCY.md](../../TRANSPARENCY.md) under [ADR 0017](../decisions/0017-phase2-publication-buffer-policy.md). It deliberately omits temporary provider identifiers, credentials, exact request timing, raw logs, and other correlation-rich execution detail.

## Recovery order

If production canonical persistence is lost or must be replaced:

1. preserve the public static read plane where safe;
2. stop or keep disabled any mutation path that depends on uncertain canonical state;
3. obtain the newest verified portable backup from independent storage;
4. verify bundle hashes before import;
5. provision an empty compatible database;
6. apply repository-controlled migrations from empty state;
7. restore the portable canonical bundle;
8. reconstruct and compare canonical meaning;
9. rebuild derived public projections/indexes from restored canonical state;
10. verify expected public projection equivalence and production read health;
11. only then move application bindings/traffic to the recovered database;
12. record the recovery result as a material operational event when appropriate.

Provider logs, public projections, caches, or GitHub issue history are not substitutes for the canonical backup.

## Recovery point rule

During the low-write steward-controlled phase, the minimum practical recovery rule is:

> Create and independently retain a verified portable backup after each deliberate durable canonical mutation, or before/after any migration or maintenance action that could materially affect canonical state.

A later scheduled cadence may supplement this rule when mutation frequency grows. Hummingbird should not add high-frequency backup automation merely to appear mature.

## Phase 2D recovery exit evidence

The recovery portion of Phase 2D is satisfied against current production canonical state:

- read-only export from remote production D1 — **verified**;
- independent retention and hash verification of the bundle — **verified under the public-equivalent safety exception**;
- restoration into an empty disposable replacement database — **verified**;
- deep semantic equality after restore — **verified**;
- rebuild and comparison of the public projection — **verified**;
- documented failure/recovery observations — **recorded above**;
- compact public operational record released through the publication-buffer rules — **recorded in `TRANSPARENCY.md` via ADR 0017**.

No recovery test wrote to production canonical state. The live production database was used only as the read source for the portable backup.

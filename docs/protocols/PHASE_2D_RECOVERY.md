# Phase 2D — Canonical Backup and Recovery Protocol

Status: **active design and local verification contract; remote recovery drill not yet executed**

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

The remote command reconstructs canonical objects and relationships using `SELECT` only. It must not modify D1.

After export:

```bash
./scripts/restore /safe/off-repo/path/backup --validate-only
```

Validation recomputes every record digest and the bundle digest without touching a database.

## Restore contract

A restore target must be empty and must receive the repository-controlled migrations before canonical data is imported.

Current Phase 2D-1 tooling permits restoration only into an explicit isolated local D1 state directory:

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

Remote restore is deliberately disabled in this slice. The next recovery exercise must provision a disposable replacement D1 database/configuration, apply migrations there, import the verified bundle, compare semantic state, rebuild the public projection, and then delete or retain that recovery database according to the exercise record. The live production database must not be the recovery-test target.

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

## Phase 2D evidence still required

This protocol and local tooling do **not** complete Phase 2D. Completion still requires a real recovery exercise using current production canonical data:

- read-only export from remote production D1;
- independent retention and hash verification of the bundle;
- restoration into an empty disposable replacement database;
- deep semantic equality after restore;
- rebuild and comparison of the public projection;
- documented failure/recovery observations;
- a compact public operational record released through the publication-buffer rules without leaking credentials, exact sensitive timing, or unnecessary provider metadata.

Only after those steps succeed may the backup/restore exit criterion be marked complete.

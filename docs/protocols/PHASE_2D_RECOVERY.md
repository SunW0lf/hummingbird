# Phase 2D — Canonical Backup and Recovery Protocol

Status: **complete — remote recovery, publication-buffer record, and ordinary independent private-backup validation exercised**

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

The ordinary Phase 2D destination is the dedicated private
`SunW0lf/hummingbird-backups` repository. The
`.github/workflows/phase2d-private-backup.yml` workflow runs daily on a
repository-controlled schedule and retains a manually confirmed trigger for
extra checkpoints. It validates the portable bundle, encrypts it with an `age`
public recipient, removes plaintext from the runner, and commits only the
ciphertext and its SHA-256 transport checksum to that repository. Its dedicated
repository credential may write only to the private backup destination. The
corresponding `age` identity/private key remains outside GitHub and outside
Cloudflare; loss of that identity makes the retained ciphertext unrecoverable.

The steward configured:

- `HUMMINGBIRD_BACKUP_AGE_RECIPIENT` as a repository variable containing the
  public `age1...` recipient generated from a steward-held identity;
- `HUMMINGBIRD_BACKUP_REPOSITORY_TOKEN` as a repository secret containing a
  fine-grained credential limited to Contents read/write on
  `SunW0lf/hummingbird-backups`;
- the existing `CLOUDFLARE_D1_RECOVERY_TOKEN` secret and
  `CLOUDFLARE_ACCOUNT_ID` variable used for read-only production export.

GitHub is independent of the live D1 service and meets the immediate Phase 2D
storage boundary, but it should not remain the only long-term copy because the
public source and private backup share one provider.

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

### Ordinary private-retention checkpoint

The **Phase 2D Private Canonical Backup** workflow may be run manually with the
exact confirmation phrase `retain private canonical backup` when a deliberate
checkpoint is needed in addition to the daily schedule. To verify independent
recoverability:

1. retrieve the `.tar.gz.age` file and adjacent `.sha256` file from the private
   backup repository using an account independent of Cloudflare;
2. verify the ciphertext checksum with `sha256sum --check`;
3. decrypt locally with the steward-held identity:

   ```bash
   age --decrypt --identity /private/off-github/hummingbird-backup.agekey \
     --output canonical-backup.tar.gz canonical-<run>.tar.gz.age
   ```

4. extract into an empty directory and run
   `./scripts/restore /path/to/extracted-bundle --validate-only`;
5. record only the bounded success/failure outcome publicly; do not publish the
   bundle, private key, repository credential, provider database identifiers,
   or correlation-rich execution details.

This checkpoint has been completed successfully once against an ordinary
retained private backup. The successful push proved encrypted retention; the
separate retrieval, decryption, and validate-only check proved that the
retention path is independently usable. Future periodic exercises should repeat
that proof without publishing private backup contents.

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

`./scripts/restore --remote` remains deliberately disabled. The first remote recovery exercise used a separate one-shot runner that created its own disposable D1 database through the Cloudflare API, applied the repository migration SQL through the D1 `/query` endpoint, imported the verified canonical bundle as a D1 batch, compared semantic state, rebuilt the public projection, and deleted the disposable database in cleanup. The live production database was never the recovery-test target.

Cloudflare documents that the D1 query API accepts API tokens with D1 Read or D1 Write and supports multiple semicolon-separated SQL statements as a batch. This made the REST path suitable for the temporary account-owned recovery credential without broadening that credential or the existing Pages deployment token.

## Guarded one-shot remote recovery workflow

`.github/workflows/phase2d-remote-recovery-drill.yml` exists specifically for the first production-state exercise.

It has these boundaries:

- it runs only on `main` when the merge commit message begins `Phase 2D: run remote recovery drill`;
- it does not run on pull requests;
- it uses the separate `CLOUDFLARE_D1_RECOVERY_TOKEN` GitHub Actions secret, not the Pages deployment token;
- the credential is account-scoped for D1 recovery operations and was introduced as a temporary recovery credential rather than a permanent general-purpose automation credential;
- production access consists only of `SELECT` queries against canonical objects and relationships;
- the recovery runner creates a uniquely named disposable D1 database and refuses to continue if its UUID somehow equals the production D1 UUID;
- migration and restore writes are addressed directly to that disposable recovery UUID through the D1 REST API;
- canonical object and relationship tables must be empty after migrations and before restore;
- restored records must deep-equal the production backup;
- recovered public canonical records are rendered into an isolated temporary output and their machine-readable JSON projection must byte-equal the expected built projection;
- database deletion runs from the cleanup path even when verification fails;
- the portable backup is retained as a public-repository artifact for 30 days **only** when the backup is proven exactly equivalent to already-public canonical state as described in the storage boundary above.

### Execution observations and successful exercise

Failure behavior remains part of the recovery contract, so the pre-success observations are retained:

1. The first trigger attempt was rejected by GitHub before job creation because a colon-bearing trigger expression was left as an unquoted YAML scalar. No runner started, no secret was exposed to a job, and no D1 request occurred. The expression was then quoted and guarded by CI.
2. The next attempt created a real recovery job but Wrangler failed on the initial production `SELECT` while using the new account-owned recovery token. The failure happened before a portable backup completed and before any disposable database was created, so no D1 mutation or cleanup was required. The one-shot runner was then moved to Cloudflare's documented D1 REST API rather than broadening credential permissions.
3. The guarded REST-based retry completed successfully on 2026-09-11. The production-state recovery job performed the read-only canonical export, verified the portable bundle, created and migrated a disposable replacement D1 database, restored the canonical records, deep-compared recovered meaning, rebuilt and byte-compared the public canonical projection, and completed cleanup. The workflow's `Production-state recovery drill` check concluded `success`.
4. Because the production canonical set at exercise time was proven exactly equivalent to already-public `publication/canonical` state, the workflow emitted the explicitly allowed public-equivalent backup artifact with 30-day retention. This exception does not convert GitHub Actions artifacts into the normal backup location for future private/draft canonical state.

The successful drill satisfied the remote backup/restore/rebuild proof. The material outcome has since been published through the publication-buffer boundary in [TRANSPARENCY.md](../../TRANSPARENCY.md#public-operational-record--2026-09-production-state-recovery-exercise).

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

During the low-write steward-controlled phase, the baseline practical recovery rule is:

> Retain a validated encrypted portable backup on the daily schedule, and use the manual checkpoint before/after any migration, maintenance action, or deliberate canonical mutation when losing the interval since the last scheduled backup would be materially consequential.

The daily schedule is intentionally modest. Hummingbird should increase backup frequency only when observed mutation volume or recovery-point requirements justify it, rather than adding high-frequency automation merely to appear mature.

## Phase 2D recovery evidence

The first real recovery exercise using current production canonical data succeeded and demonstrated:

- read-only export from remote production D1;
- hash verification of the portable bundle;
- restoration into an empty disposable replacement database;
- deep semantic equality after restore;
- rebuild and byte-equivalence comparison of the public canonical projection;
- safe cleanup of the disposable recovery database;
- documented pre-success failure observations without mutation of production canonical state.

The ordinary private-retention checkpoint also succeeded and demonstrated:

- encrypted retention outside the live D1 service and public repository;
- independent retrieval of retained ciphertext;
- decryption using the steward-held identity outside GitHub and Cloudflare;
- validate-only verification of the recovered portable bundle;
- a sustainable daily encrypted-retention path with an explicit manual checkpoint option.

The recovery exercise, compact public operational records, and ordinary independent private-backup confirmation are complete. **Phase 2D is closed.** This durability result does not authorize Phase 3, automatic canonical admission, or any expansion of participant authority.

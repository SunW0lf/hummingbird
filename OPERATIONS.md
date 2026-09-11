# Operations

## Deployment

Production deployment is triggered from `main` only after the CI verification job (tests, build, canonical-corpus checks, and dependency audit) succeeds. See `.github/workflows/ci.yml` and `scripts/deploy`.

```text
branch → pull request → required CI → protected main → scripts/deploy → Cloudflare Pages → datum.quest
```

The normal production path is repository change → CI → deployment. Manual/local deployment is reserved for steward emergency recovery: `./scripts/deploy`. It requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` to be set locally and refuses to run when either is missing.

## Phase 2 operational sequence

Phase 2 is intentionally staged:

1. **2A — Canonical contract/reference corpus.** No production database required. Schema and fixture contract must pass CI.
2. **2B — Persistence/import.** Provision D1, apply versioned migrations, ingest storage-independent records deterministically, and prove export equivalence.
3. **2C — Public read model/admission.** Build rebuildable projections and demonstrate explicit external-source → canonical-admission behavior.
4. **2D — Publication buffer/backup/recovery.** Implement delayed/coarsened publication where required, export D1 independently, and restore into empty state.
5. **2E — Phase review.** Review the Seed Bank experiment and Phase 2 operational/governance review gates before considering Phase 3.

See [ROADMAP.md](ROADMAP.md).

## Backup

Current durable production state is still primarily the Git repository plus provider-hosted external records. The Phase 2 reference corpus under `fixtures/canonical/` is version-controlled contract material, not the production application database.

Once Cloudflare D1 is introduced in Phase 2B, `./scripts/backup` must be extended to export the canonical database state to a storage location independent of the live database. Backup format must preserve storage-independent canonical records rather than relying solely on provider-specific snapshots.

Before Phase 2 completes, a backup must be restored into an empty replacement database and checked for canonical/read-model equivalence.

## Restore

`./scripts/restore` currently documents source/site restoration from Git. Phase 2D will extend it with database reconstruction:

1. provision an empty compatible database;
2. apply versioned migrations;
3. import the latest verified canonical export;
4. rebuild derived projections/indexes;
5. run canonical and public-read-model verification checks;
6. cut traffic only after verification succeeds.

Derived projections are disposable; loss of a cache/search/read projection must not imply loss of institutional meaning.

## Rollback

Cloudflare Pages retains prior deployments. `./scripts/rollback` lists recent deployments and can redeploy a prior one. See `wrangler pages deployment list` for the underlying mechanism.

Database rollback policy will be defined with the first D1 migrations. Destructive reverse migrations should not be assumed safe merely because code can be rolled back; canonical data compatibility must be considered separately.

## Monitoring

`./scripts/healthcheck` checks that `https://datum.quest` returns a successful response with expected content. Open question: [OQ-OPS-MONITORING-CADENCE](docs/governance/OPEN_QUESTIONS.md#oq-ops-monitoring-cadence) — continuous/scheduled monitoring versus manual checks only.

During Phase 2, monitoring should remain lean: service availability, deployment health, migration/import success, backup success, and restore-test outcome are higher priority than broad behavioral telemetry.

## Upgrades

The current runtime footprint remains intentionally small. DevDependencies support build/deploy tooling and are monitored by Dependabot. Avoid adding a framework or persistence abstraction merely to anticipate Phase 3.

## Database migrations

No production application database exists yet. Phase 2B will introduce Cloudflare D1 after the Phase 2A storage-independent record contract exists.

Migrations will live in `migrations/` and be applied through a documented script. They must satisfy these rules:

- reproducible from empty state;
- versioned and reviewable in Git;
- no secret values embedded in migrations;
- canonical meaning must be recoverable without provider-specific row IDs or triggers;
- migrations/import code must pass the canonical reference corpus as a round-trip test;
- destructive changes require an explicit data-migration/recovery plan.

Canonical record semantics remain defined in [DATA_MODEL.md](DATA_MODEL.md), [ADR 0010](docs/decisions/0010-phase2-read-only-commons-contract.md), and [ADR 0012](docs/decisions/0012-reference-corpus-before-persistence.md).

## Seed Bank operations

The Seed Bank is external provider-hosted intake, not a Hummingbird application write path.

- GitHub issue bodies/comments/links are untrusted public input.
- Do not copy provider account identity, reactions, or complete thread metadata into canonical storage by default.
- Spam, harassment, phishing, duplicate posting, and unsafe links may be moderated using GitHub's provider controls.
- Security vulnerabilities do not belong in Seed Bank threads; route them to GitHub private vulnerability reporting.
- Any later admission of Seed Bank material into the commons must be a separate deliberate action with provenance/reference as appropriate.

## Recovery

To reconstruct Hummingbird from scratch, someone needs:

1. This GitHub repository (or a verified clone/mirror).
2. The ability to generate appropriate Cloudflare credentials with least privilege.
3. The Cloudflare account/project configuration.
4. A fresh Cloudflare Pages project or equivalent static host.
5. This documentation, schema, migrations, and reference corpus.
6. Once Phase 2 data exists, the most recent verified storage-independent canonical export.

## Repository protection

The repository is public and `main` is protected. The normal and enforced path is branch → pull request → required CI → merge.

Current branch protection requires `Checks, test, build`; the branch-level GitHub API reports protection enabled with enforcement level `everyone`, so the steward/admin is included. Force pushes and branch deletion are disallowed by project policy. A separate approving reviewer is intentionally not required while Hummingbird has only one maintainer, because that would deadlock legitimate maintenance.

## Public repository controls

The public-repository security activation is complete. Repository Actions are restricted; external workflow actions are full-SHA pinned; workflow-token permissions are read-only; private vulnerability reporting, secret scanning/push protection, Dependabot security controls, and CodeQL default setup are enabled. See [SECURITY.md](SECURITY.md) for the authoritative security posture and verification distinctions.

`.github/CODEOWNERS` records the current steward as code owner. `.github/dependabot.yml` monitors npm and GitHub Actions dependencies so pinned action SHAs and package versions can be reviewed through pull requests.

## Routine steward tasks

- Review and merge pull requests only after required CI passes.
- Review Dependabot pull requests and security alerts; do not auto-merge dependency changes without CI.
- Keep canonical schema, reference corpus, migrations, and data-model documentation aligned.
- Review public Seed Bank activity for abuse/safety issues without treating popularity as governance weight.
- Rotate the Cloudflare deployment token periodically. Open question: [OQ-OPS-TOKEN-ROTATION-CADENCE](docs/governance/OPEN_QUESTIONS.md#oq-ops-token-rotation-cadence) — exact cadence.
- Keep the Open Questions Registry honest — resolve questions in substantive documents rather than letting implementation silently answer them.

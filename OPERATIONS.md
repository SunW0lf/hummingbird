# Operations

## Deployment

Production deployment is triggered from `main` only after the CI verification job (tests, build, and dependency audit) succeeds. See `.github/workflows/ci.yml` and `scripts/deploy`.

```text
main branch → CI passes → scripts/deploy → Cloudflare Pages → datum.quest
```

The normal production path is repository change → CI → deployment. Manual/local deployment is reserved for steward emergency recovery: `./scripts/deploy`. It requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` to be set locally and refuses to run when either is missing.

## Backup

Phase 0/1: the Git repository (mirrored on GitHub) is the entire durable state. `./scripts/backup` currently documents this and exits successfully with no action, since there is no database yet.

Phase 2: once Cloudflare D1 is introduced, `./scripts/backup` will export the database on a schedule to a separate storage location, and this section will document restore points and retention.

## Restore

`./scripts/restore` currently documents that restoring the project means re-cloning the GitHub repository and re-running `./scripts/deploy`. Once a database exists, this will be extended with data restore steps.

## Rollback

Cloudflare Pages retains prior deployments. `./scripts/rollback` lists recent deployments and can redeploy a prior one. See `wrangler pages deployment list` for the underlying mechanism.

## Monitoring

`./scripts/healthcheck` checks that `https://datum.quest` returns a successful response with expected content. Open question: [OQ-OPS-MONITORING-CADENCE](docs/governance/OPEN_QUESTIONS.md#oq-ops-monitoring-cadence) — continuous/scheduled monitoring versus manual checks only.

## Upgrades

No runtime/framework to upgrade yet beyond devDependencies used for CI tooling (kept minimal on purpose).

## Database migrations

No production database exists yet. Phase 2 will introduce Cloudflare D1; migrations will live in `migrations/` and be applied through a documented script. Canonical record semantics remain portable and are defined in [DATA_MODEL.md](DATA_MODEL.md) and [ADR 0010](docs/decisions/0010-phase2-read-only-commons-contract.md).

## Recovery

To reconstruct Hummingbird from scratch, someone needs:

1. This GitHub repository (or a clone/mirror of it).
2. The Cloudflare API Token secret (or the ability to generate a new one with the same scope).
3. The Cloudflare account ID.
4. A fresh Cloudflare Pages project connected to this repository.
5. This documentation.
6. Once Phase 2 data exists, the most recent verified D1 backup/export.

## Repository protection

The repository is public and `main` is protected. The normal and enforced path is branch → pull request → required CI → merge.

Current branch protection requires `Checks, test, build`; the branch-level GitHub API reports protection enabled with enforcement level `everyone`, so the steward/admin is included. Force pushes and branch deletion are disallowed by project policy. A separate approving reviewer is intentionally not required while Hummingbird has only one maintainer, because that would deadlock legitimate maintenance.

The earlier Phase-1-only risk acceptance for an unprotected private repository expired at publication and is no longer operative.

## Public repository controls

The repository Actions policy is steward-configured to allow repository-owned plus GitHub-created/explicitly approved actions, with full-length commit-SHA pinning required. Current workflows use only SHA-pinned `actions/checkout` and `actions/setup-node`.

The remaining publication-security controls requiring explicit verification are tracked in [SECURITY.md](SECURITY.md), especially GitHub private vulnerability reporting and the Advanced Security settings.

`.github/CODEOWNERS` records the current steward as code owner. `.github/dependabot.yml` monitors both npm and GitHub Actions dependencies so pinned action SHAs and package versions can be reviewed through pull requests.

## Routine steward tasks

- Review and merge pull requests after CI passes.
- Review Dependabot pull requests and security alerts; do not auto-merge dependency changes without CI.
- Rotate the Cloudflare deployment token periodically. Open question: [OQ-OPS-TOKEN-ROTATION-CADENCE](docs/governance/OPEN_QUESTIONS.md#oq-ops-token-rotation-cadence) — exact cadence.
- Keep `OPEN QUESTION` markers honest — resolve them in the relevant document rather than letting implementation silently answer them. The authoritative list is [docs/governance/OPEN_QUESTIONS.md](docs/governance/OPEN_QUESTIONS.md).

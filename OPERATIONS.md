# Operations

## Deployment

Production deployment is triggered only from the protected `main` branch after CI (lint, test, build) passes. See `.github/workflows/ci.yml` and `scripts/deploy`.

```text
main branch → CI passes → scripts/deploy → Cloudflare Pages → datum.quest
```

Manual/local deployment (steward only, emergencies): `./scripts/deploy`. Requires `CLOUDFLARE_API_TOKEN` to be set locally; the script refuses to run without it rather than failing silently.

## Backup

Phase 0/1: the Git repository (mirrored on GitHub) is the entire durable state. `./scripts/backup` currently documents this and exits successfully with no action, since there is no database yet.

Phase 2+: once Cloudflare D1 is introduced, `./scripts/backup` will export the database on a schedule (via GitHub Actions) to a separate storage location, and this section will document restore points and retention.

## Restore

`./scripts/restore` currently documents that restoring the project means re-cloning the GitHub repository and re-running `./scripts/deploy`. Once a database exists, this will be extended with data restore steps.

## Rollback

Cloudflare Pages retains prior deployments. `./scripts/rollback` lists recent deployments and can redeploy a prior one. See `wrangler pages deployment list` for the underlying mechanism.

## Monitoring

`./scripts/healthcheck` checks that `https://datum.quest` returns a successful response with expected content. Open question: [OQ-OPS-MONITORING-CADENCE](docs/governance/OPEN_QUESTIONS.md#oq-ops-monitoring-cadence) — continuous/scheduled monitoring (e.g., a GitHub Actions cron job) versus manual checks only.

## Upgrades

No runtime/framework to upgrade yet beyond devDependencies used for CI tooling (kept minimal on purpose).

## Database migrations

Not applicable yet. Once Cloudflare D1 is introduced, migrations will live in `migrations/` and be applied via a documented script.

## Recovery

To reconstruct Hummingbird from scratch, someone needs:

1. This GitHub repository (or a clone/mirror of it).
2. The Cloudflare API Token secret (or the ability to generate a new one with the same scope).
3. A fresh Cloudflare Pages project connected to this repository.
4. This documentation.

## Repository protection

Branch protection on `main` is currently unavailable: GitHub disables branch protection rules for private repositories on this account's plan. There is no enforced required-review or required-status-check GitHub rule; the only enforcement is the CI workflow's own `deploy` job depending on the `verify` job succeeding. Open question: [OQ-OPS-BRANCH-PROTECTION](docs/governance/OPEN_QUESTIONS.md#oq-ops-branch-protection).

## Routine steward tasks

- Review and merge pull requests after CI passes.
- Rotate the Cloudflare deployment token periodically. Open question: [OQ-OPS-TOKEN-ROTATION-CADENCE](docs/governance/OPEN_QUESTIONS.md#oq-ops-token-rotation-cadence) — exact cadence.
- Keep `OPEN QUESTION` markers honest — resolve them in the relevant document rather than letting implementation silently answer them. The authoritative list is [docs/governance/OPEN_QUESTIONS.md](docs/governance/OPEN_QUESTIONS.md).

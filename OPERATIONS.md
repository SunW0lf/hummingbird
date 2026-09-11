# Operations

## Deployment

Production deployment is triggered from `main` only after the CI verification job (tests, build, and dependency audit) succeeds. See `.github/workflows/ci.yml` and `scripts/deploy`.

```text
main branch → CI passes → scripts/deploy → Cloudflare Pages → datum.quest
```

The normal production path is repository change → CI → deployment. Manual/local deployment is reserved for steward emergency recovery: `./scripts/deploy`. It requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` to be set locally and refuses to run when either is missing.

## Backup

Phase 0/1: the Git repository (mirrored on GitHub) is the entire durable state. `./scripts/backup` currently documents this and exits successfully with no action, since there is no database yet.

Phase 2+: once Cloudflare D1 is introduced, `./scripts/backup` will export the database on a schedule (via GitHub Actions) to a separate storage location, and this section will document restore points and retention.

## Restore

`./scripts/restore` currently documents that restoring the project means re-cloning the GitHub repository and re-running `./scripts/deploy`. Once a database exists, this will be extended with data restore steps.

## Rollback

Cloudflare Pages retains prior deployments. `./scripts/rollback` lists recent deployments and can redeploy a prior one. See `wrangler pages deployment list` for the underlying mechanism.

## Monitoring

`./scripts/healthcheck` checks that `https://datum.quest` returns a successful response with expected content. Open question: [OQ-OPS-MONITORING-CADENCE](docs/governance/OPEN_QUESTIONS.md#oq-ops-monitoring-cadence) — continuous/scheduled monitoring (e.g. a GitHub Actions cron job) versus manual checks only.

## Upgrades

No runtime/framework to upgrade yet beyond devDependencies used for CI tooling (kept minimal on purpose).

## Database migrations

Not applicable yet. Once Cloudflare D1 is introduced, migrations will live in `migrations/` and be applied via a documented script.

## Recovery

To reconstruct Hummingbird from scratch, someone needs:

1. This GitHub repository (or a clone/mirror of it).
2. The Cloudflare API Token secret (or the ability to generate a new one with the same scope).
3. The Cloudflare account ID.
4. A fresh Cloudflare Pages project connected to this repository.
5. This documentation.

## Repository protection

Branch protection on `main` is currently unavailable: GitHub disables branch protection rules for private repositories on this account's plan. There is no enforced required-review or required-status-check GitHub rule. The deployment workflow still refuses to deploy until its `verify` job succeeds, but GitHub itself does not prevent a direct push to `main`. The working convention is therefore branch → pull request → green CI → merge. Open question: [OQ-OPS-BRANCH-PROTECTION](docs/governance/OPEN_QUESTIONS.md#oq-ops-branch-protection).

### Phase 1 risk acceptance — branch protection

**Recorded 2026-09-10 (Pacific Time).** For completion of the current **private, single-steward Phase 1 only**, the steward accepts the residual risk that GitHub does not enforce required reviews or required status checks on `main`, and that a direct push could bypass the working pull-request convention.

Current mitigations are the deliberately small trust boundary and deployment design: the repository is private and single-steward; routine changes use branch → pull request → green CI → merge; production deployment itself is gated by the workflow's successful verification job; and deployment credentials remain outside the repository.

This acceptance **does not resolve** OQ-OPS-BRANCH-PROTECTION and **does not authorize repository publication**. Branch protection or an equivalent enforced control must receive a fresh disposition before public repository visibility, before adding additional maintainers, or whenever the trust model materially changes.

## Routine steward tasks

- Review and merge pull requests after CI passes.
- Rotate the Cloudflare deployment token periodically. Open question: [OQ-OPS-TOKEN-ROTATION-CADENCE](docs/governance/OPEN_QUESTIONS.md#oq-ops-token-rotation-cadence) — exact cadence.
- Keep `OPEN QUESTION` markers honest — resolve them in the relevant document rather than letting implementation silently answer them. The authoritative list is [docs/governance/OPEN_QUESTIONS.md](docs/governance/OPEN_QUESTIONS.md).

# 0002 — GitHub as Source of Truth

- Status: Accepted
- Date: 2026-09-10

## Context

Hummingbird needs a canonical, recoverable record of application code, documentation, database migrations, deployment configuration, infrastructure scripts, and operational scripts, given the project's explicit recovery goal: it should be reconstructable by a single steward from the repository, secrets, a fresh server, and documentation alone.

## Decision

GitHub is the canonical source of truth for all of the above. The local repository is treated as a working copy, not a source of record. Production deployment flows only through GitHub: local machine → Git → GitHub → CI (tests, lint, security checks, build) → approved main/release → `datum.quest`.

## Rationale

A single, well-known source of truth makes recovery, auditing, and onboarding legible. Routing all deployment through CI-gated GitHub Actions ensures a failed test or build cannot reach production.

## Alternatives considered

- Deploying directly from a local machine — rejected; not reproducible, not auditable, bypasses CI gates.
- A separate, self-hosted Git server — rejected as unnecessary operational burden for a one-steward project.

## Consequences

- All infrastructure and operational scripts live in this repository, not only on the steward's machine.
- Deployment credentials are scoped GitHub Actions secrets, not personal long-lived credentials used interactively.

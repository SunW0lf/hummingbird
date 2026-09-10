# 0005 — CI-Gated Production Deployment

- Status: Accepted
- Date: 2026-09-10

## Context

Hummingbird deploys to a single production domain (`datum.quest`, see ADR 0001). A failed test or build reaching production would be visible to the public immediately, with no staging environment to catch it first.

## Decision

Production deployment occurs only from the protected/default branch (`main`), only after GitHub Actions CI (lint, test, build, dependency/security validation) passes. GitHub Actions invokes project scripts (`scripts/build`, `scripts/deploy`, etc.) rather than embedding the deployment system directly in workflow YAML. Deployment credentials (a scoped Cloudflare API Token) are limited to the permissions required to deploy Hummingbird and are never committed to the repository.

## Rationale

Without a staging environment, CI is the only gate protecting the public site from broken changes. Keeping deployment logic in versioned scripts rather than YAML keeps it testable locally and reduces vendor lock-in to a specific CI provider's syntax.

## Alternatives considered

- Deploying on every push without gating — rejected as unacceptably risky for a single-environment project.
- Adding a staging environment instead of relying on CI gates — rejected per ADR 0001 to avoid premature complexity.

## Consequences

- No deployment can bypass CI.
- Scripts under `scripts/` must remain runnable both locally and in CI, and must fail explicitly rather than silently.

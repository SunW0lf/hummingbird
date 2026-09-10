# 0001 — Single Production Domain

- Status: Accepted
- Date: 2026-09-10

## Context

Hummingbird needs a deployment target. A prior, unrelated project (`sunwolf.dev`) exists with its own infrastructure. There was a risk of accidentally coupling Hummingbird to that infrastructure or standing up a second staging environment before a first production environment even exists.

## Decision

Hummingbird has exactly one deployment environment: `datum.quest`. No dependency on `sunwolf.dev` is created. No second staging site is created unless explicitly requested later. Testing and validation happen through local development, automated tests, GitHub Actions, build validation, and deployment gates instead.

## Rationale

A single environment is simpler to reason about, cheaper to run, and reduces the number of things a single steward must maintain. It also avoids the specific risk of two projects silently sharing infrastructure or credentials.

## Alternatives considered

- A separate staging domain/environment — rejected for now as premature complexity; can be added later if a real need arises.
- Reusing `sunwolf.dev` infrastructure (GCP project, service accounts) — rejected to keep Hummingbird's trust boundary and cost independent of an unrelated project.

## Consequences

- All deployment tooling targets `datum.quest` only.
- Feature branches are never deployed to production; validation happens pre-merge in CI.

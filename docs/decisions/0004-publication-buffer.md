# 0004 — Publication Buffer

- Status: Accepted — exercised in Phase 2D; see ADR 0017
- Date: 2026-09-10

## Context

Hummingbird's transparency model separates an internal event log (which may contain sensitive operational detail) from a public transparency log. Publishing internal events directly and immediately would risk leaking operational or sensitive metadata; never publishing anything would contradict the transparency principle.

## Decision

Reserve a three-layer transparency architecture ahead of implementation: internal event log → publication buffer → public transparency log. The publication buffer may strip metadata, aggregate, batch, or delay publication within defined rules, but the public record must always remain truthful — delay and aggregation are permitted, fabrication is not.

The concrete Phase 2 implementation and minimization/delay rules are defined in [ADR 0017](0017-phase2-publication-buffer-policy.md). During the low-write Phase 2 period, the buffer is a curated, protected Git review/release process rather than a new runtime queue or datastore.

## Rationale

Recording this before dynamic data existed ensured Phase 2's read-only commons was built with a place to put this separation from the start, rather than retrofitting it after sensitive data had already been published directly.

## Alternatives considered

- Publish the internal log directly and unmodified — rejected due to sensitive-metadata leakage risk.
- No public log at all until a full system is built — rejected as contrary to the transparency principle.

## Consequences

- Phase 2 includes a publication-buffer layer rather than a direct log-to-public pipeline.
- The first real exercise was the Phase 2D production-state recovery drill, whose compact public result is recorded in `TRANSPARENCY.md` without copying temporary provider identifiers, credentials, raw logs, or correlation-rich execution timing.
- Later phases may introduce a bounded runtime buffer only when event volume or dynamic behavior justifies the additional persistence/security surface.

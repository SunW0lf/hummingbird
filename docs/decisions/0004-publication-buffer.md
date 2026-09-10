# 0004 — Publication Buffer

- Status: Accepted (design intent; not yet implemented)
- Date: 2026-09-10

## Context

Hummingbird's transparency model separates an internal event log (which may contain sensitive operational detail) from a public transparency log. Publishing internal events directly and immediately would risk leaking operational or sensitive metadata; never publishing anything would contradict the transparency principle.

## Decision

Reserve a three-layer transparency architecture ahead of implementation: internal event log → publication buffer → public transparency log. The publication buffer may strip metadata, aggregate, batch, or delay publication within defined rules, but the public record must always remain truthful — delay and aggregation are permitted, fabrication is not.

## Rationale

Recording this now, before any dynamic data exists, ensures Phase 2's read-only commons is built with a place to put this separation from the start, rather than retrofitting it after sensitive data has already been published directly.

## Alternatives considered

- Publish the internal log directly and unmodified — rejected due to sensitive-metadata leakage risk.
- No public log at all until a full system is built — rejected as contrary to the transparency principle.

## Consequences

- Phase 2 implementation must include a publication buffer layer, not just a direct log-to-public pipeline.
- Specific aggregation/delay rules remain an open question (see TRANSPARENCY.md) and will be recorded in a future ADR once decided.

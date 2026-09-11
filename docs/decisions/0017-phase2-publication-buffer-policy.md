# 0017 — Phase 2 Publication Buffer Policy

Status: Accepted
Date: 2026-09-11

## Context

[ADR 0004](0004-publication-buffer.md) reserved a three-layer transparency boundary: internal or provider-side operational evidence → publication buffer → truthful public transparency record. It deliberately deferred the concrete aggregation and delay rules until Hummingbird had a real operational event worth exercising.

Phase 2D now has that event: a production-state recovery exercise using the current canonical D1 state. Hummingbird needs to publish the meaningful outcome without cloning provider telemetry, exposing temporary recovery-resource identifiers, or creating a new database merely to prove that a publication buffer exists.

## Decision

During Phase 2, the publication buffer is a **curated, Git-reviewed release process**, not a runtime queue or additional authoritative datastore.

For a material operational event:

1. provider logs, workflow output, and other raw operational evidence remain authoritative in their existing systems;
2. the steward identifies the institutionally meaningful facts that should become public;
3. unnecessary correlation/security detail is removed or coarsened before release;
4. the proposed public summary is reviewed through the protected repository workflow;
5. the accepted summary is published in the public operational record in `TRANSPARENCY.md` and may also be referenced from the Changelog when it materially changes project state.

Material classified `PUBLIC_DELAYED` remains subject to the maximum 30-day delay in [SECURITY.md](../../SECURITY.md). Delay or batching must not be used to fabricate chronology, conceal a material failure indefinitely, or turn an unsuccessful result into a successful one.

### Minimum useful public content

A public operational record should preserve enough meaning to answer:

- what class of project capability or control was exercised;
- whether it succeeded, failed, or remained unresolved;
- what consequential property was demonstrated or changed;
- what follow-up is required, if any.

### Detail normally omitted

Unless materially necessary to understand the event, the public summary does not copy:

- credentials or secret values;
- provider request metadata or source addresses;
- disposable database/resource identifiers or temporary names;
- correlation-rich request timestamps;
- raw stack traces or command logs;
- internal retry noise that does not change the institutional outcome;
- provider metadata already available from the authoritative external record.

The public record may reference an authoritative provider record when useful, but Hummingbird does not duplicate the full provider log.

## First exercise

The Phase 2D recovery drill is the first exercised publication-buffer event. The public summary records that:

- current production canonical state was exported through a read-only path into a verified portable backup;
- an isolated disposable D1 database was created and migrated from repository-controlled schema;
- the backup was restored there with deep semantic equality;
- the recovered public JSON projection matched the expected publication output;
- the disposable recovery database was removed after the exercise;
- an independently retrievable backup artifact was retained because the exercise first proved the backup contained only canonical material already public at the time of the drill.

The public summary deliberately omits the temporary database name/UUID, credential material, exact request timing, and raw Cloudflare/GitHub execution logs.

## Rationale

Phase 2 mutation is infrequent and steward-controlled. Adding a queue service, publication-buffer table, or parallel event ledger would increase persistence and security surface without improving the truthfulness of the public record. The protected Git workflow already supplies review, history, and deliberate release semantics.

This implementation also preserves Hummingbird's lean-data rule: store Hummingbird's meaning; reference authoritative external facts.

## Consequences

- ADR 0004's publication-buffer architecture is now exercised for Phase 2 rather than merely reserved as design intent.
- `TRANSPARENCY.md` is the Phase 2 public operational record; the Changelog remains a record of meaningful releases and project-state changes, not a duplicate telemetry feed.
- No new D1 table, Worker, queue, or raw-log store is authorized by this ADR.
- If later phases create frequent dynamic operational events, a future ADR may replace this Git-mediated buffer with a bounded runtime mechanism while preserving the same truthfulness, minimization, and delay constraints.

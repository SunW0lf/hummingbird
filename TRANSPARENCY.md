# Transparency

## Current state

`datum.quest` is public static content and the GitHub repository is public. Repository documentation, ADRs, commit history, pull requests, public issue discussions, and public Actions history form the inspectable project record for source and governance-development work.

Cloudflare D1 now holds deliberately admitted canonical application state. The first real canonical contribution has moved through draft admission, a separate publication decision, and rebuildable static publication. Public page views remain static at request time and do not query D1.

Phase 2D is now implementing and exercising the remaining durability/transparency boundary: a portable canonical backup/recovery path plus the publication buffer for compact delayed/coarsened operational records. The publication buffer is designed but has not yet completed its real operational-event exercise.

## Phase 2 model

For application and operational records, Hummingbird uses three conceptual layers:

```text
internal/canonical operational event
        ↓
publication buffer
        ↓
public transparency record
```

- The **internal/canonical event** contains the minimum record needed to understand an institutionally meaningful change. It may contain operational detail that is not safe or useful to publish directly.
- The **publication buffer** may remove unnecessary metadata, coarsen exact timing, aggregate related events, batch publication, or delay release within the bounds defined in [SECURITY.md](SECURITY.md).
- The **public record** must remain truthful. Delay and aggregation are allowed. Fabrication, invented chronology, and misleading omission are not.

The current implementation does not maintain a second raw provider-log database. The Phase 2D exercise will prove the publication-buffer behavior with a compact material operational event rather than by cloning Cloudflare or GitHub telemetry.

See [ADR 0004](docs/decisions/0004-publication-buffer.md), [ADR 0010](docs/decisions/0010-phase2-read-only-commons-contract.md), and the [Phase 2D recovery protocol](docs/protocols/PHASE_2D_RECOVERY.md).

## Interim Seed Bank

The Seed Bank in [ADR 0011](docs/decisions/0011-interim-seed-bank.md) uses GitHub issues as an external, public discussion surface while Hummingbird-owned public write access remains gated.

A public GitHub issue is authoritative for its own provider-hosted thread, but it is **not automatically a canonical Hummingbird object**. Hummingbird does not silently ingest issue authorship metadata, comments, reactions, or timing into its application database merely because those fields are available.

If a seed is later admitted, synthesized, or referenced in the durable commons, the resulting Hummingbird record should store Hummingbird's institutional meaning and a useful provenance/reference relationship to the source thread rather than cloning the entire GitHub conversation. Reactions remain conversational signals and are not governance votes.

## Operational history

Hummingbird does **not** copy complete provider logs into its own database merely to create another ledger. GitHub remains authoritative for GitHub Actions history; Cloudflare remains authoritative for provider-side deployment telemetry; the blockchain remains authoritative for public on-chain activity.

The Phase 2 public operational record will instead publish compact, project-level events for material changes such as:

- production releases and rollbacks;
- significant service failures and restorations;
- material security-policy or deployment-control changes;
- backup/recovery exercises and material recovery outcomes;
- corrections to previously published project information;
- other operational events whose consequence matters to the commons.

A public operational event should identify what changed, the affected project object or release where applicable, and the outcome. It should **not** automatically expose credentials, request metadata, source addresses, exact exploit detail, raw stack traces, provider database identifiers, or correlation-rich timestamps that do not improve public understanding.

Non-urgent operational events may be released in batches and with coarsened timing. The publication buffer exists specifically so transparency does not become an accidental surveillance or exploit-assistance mechanism.

## Canonical backup transparency

Canonical recovery bundles are operational recovery artifacts, not public datasets by default. They may contain durable canonical records that are not currently published, including drafts. Therefore:

- backup bundles stay outside the public repository and public web root;
- public transparency records may report that a backup/restore exercise succeeded or failed without publishing the bundle itself;
- bundle hashes may be published when useful for evidence, but a hash does not make the underlying non-public records public;
- public read projections remain rebuildable outputs and are not substitutes for canonical backups.

## Repository publication

The repository is public. The publication transition was authorized by ADR 0009 and completed with public visibility plus protected `main`; the required `Checks, test, build` status check is active and branch protection is enforced for everyone including the steward/admin.

The repository's earlier git-history review found no committed secrets. Public-mode controls are documented in [SECURITY.md](SECURITY.md), including private vulnerability reporting, secret protection, Dependabot security controls, and CodeQL default setup.

## Public records and raw logs

Public GitHub repository activity should be assumed visible. Hummingbird will not republish every raw CI line, Seed Bank comment, reaction, or provider diagnostic into a second database. When a raw provider record is useful, the project may reference it; when a durable institutional summary is needed, Hummingbird stores the small summary and its relationship to the relevant release, discussion, or decision.

This is the transparency version of the project's lean-data rule: **store Hummingbird's meaning; reference authoritative external facts.**

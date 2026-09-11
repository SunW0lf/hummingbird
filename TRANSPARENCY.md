# Transparency

## Current state

`datum.quest` is public static content and the GitHub repository is public. Repository documentation, ADRs, commit history, pull requests, public issue discussions, and public Actions history form the inspectable project record for source and governance-development work.

Cloudflare D1 now holds deliberately admitted canonical application state. The first real canonical contribution has moved through draft admission, a separate publication decision, and rebuildable static publication. Public page views remain static at request time and do not query D1.

Phase 2D has now exercised both remaining durability/transparency boundaries: a portable canonical backup/recovery path and the publication buffer for compact delayed/coarsened operational records. The concrete Phase 2 publication-buffer policy is recorded in [ADR 0017](docs/decisions/0017-phase2-publication-buffer-policy.md).

## Public operational record

### 2026-09 — Phase 2D production-state recovery exercise

**Outcome: succeeded.** Hummingbird exported current production canonical state through a read-only path into a verified portable backup, created an isolated disposable D1 recovery database, applied repository-controlled migrations, restored the backup, and proved deep semantic equality between restored canonical meaning and the production backup. The recovered machine-readable public projection also matched the expected publication output. The disposable recovery database was removed after verification.

Because the backup was first proven to contain only canonical material already public at the time of the exercise, an independently retrievable copy was retained outside the live D1 service through a time-bounded GitHub Actions artifact.

**Publication-buffer handling:** this public record preserves the consequential facts and outcome while intentionally omitting the temporary recovery database name/identifier, credential material, exact provider-request timing, source/network metadata, raw stack traces, and full execution logs. GitHub Actions and Cloudflare remain authoritative for their own provider-side telemetry; Hummingbird does not clone those logs into a second operational database.

No production canonical row was modified by the recovery exercise.

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

During Phase 2's low-write period, the publication buffer is implemented as a curated protected-Git review/release process rather than a queue service or additional authoritative datastore. Provider logs remain authoritative externally; Hummingbird publishes the smaller institutional summary. See [ADR 0017](docs/decisions/0017-phase2-publication-buffer-policy.md).

See [ADR 0004](docs/decisions/0004-publication-buffer.md), [ADR 0010](docs/decisions/0010-phase2-read-only-commons-contract.md), and the [Phase 2D recovery protocol](docs/protocols/PHASE_2D_RECOVERY.md).

## Interim Seed Bank

The Seed Bank in [ADR 0011](docs/decisions/0011-interim-seed-bank.md) uses GitHub issues as an external, public discussion surface while Hummingbird-owned public write access remains gated.

A public GitHub issue is authoritative for its own provider-hosted thread, but it is **not automatically a canonical Hummingbird object**. Hummingbird does not silently ingest issue authorship metadata, comments, reactions, or timing into its application database merely because those fields are available.

If a seed is later admitted, synthesized, or referenced in the durable commons, the resulting Hummingbird record should store Hummingbird's institutional meaning and a useful provenance/reference relationship to the source thread rather than cloning the entire GitHub conversation. Reactions remain conversational signals and are not governance votes.

## Operational history

Hummingbird does **not** copy complete provider logs into its own database merely to create another ledger. GitHub remains authoritative for GitHub Actions history; Cloudflare remains authoritative for provider-side deployment telemetry; the blockchain remains authoritative for public on-chain activity.

The Phase 2 public operational record publishes compact, project-level events for material changes such as:

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

- backup bundles stay outside the public repository and public web root by default;
- public transparency records may report that a backup/restore exercise succeeded or failed without publishing the bundle itself;
- bundle hashes may be published when useful for evidence, but a hash does not make the underlying non-public records public;
- public read projections remain rebuildable outputs and are not substitutes for canonical backups.

The first Phase 2D exercise used a narrow exception: artifact retention was permitted only after the workflow proved the complete production backup exactly matched canonical material already public. That exception must fail closed if future production state includes a draft or other non-public canonical record.

## Repository publication

The repository is public. The publication transition was authorized by ADR 0009 and completed with public visibility plus protected `main`; the required `Checks, test, build` status check is active and branch protection is enforced for everyone including the steward/admin.

The repository's earlier git-history review found no committed secrets. Public-mode controls are documented in [SECURITY.md](SECURITY.md), including private vulnerability reporting, secret protection, Dependabot security controls, and CodeQL default setup.

## Public records and raw logs

Public GitHub repository activity should be assumed visible. Hummingbird will not republish every raw CI line, Seed Bank comment, reaction, or provider diagnostic into a second database. When a raw provider record is useful, the project may reference it; when a durable institutional summary is needed, Hummingbird stores the small summary and its relationship to the relevant release, discussion, or decision.

This is the transparency version of the project's lean-data rule: **store Hummingbird's meaning; reference authoritative external facts.**

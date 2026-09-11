# Transparency

## Current state

`datum.quest` is public static content and the GitHub repository is now public. Repository documentation, ADRs, commit history, pull requests, and public Actions history form the inspectable project record for source and governance-development work.

There is not yet a production application database, publication buffer, or dynamic transparency feed. Those are Phase 2 implementation work.

## Phase 2 model

Once application records exist, Hummingbird uses three layers:

```text
internal event log
        ↓
publication buffer
        ↓
public transparency log
```

- The **internal log** contains the minimum canonical event record needed to understand institutionally meaningful changes. It may contain operational detail that is not safe or useful to publish directly.
- The **publication buffer** may remove unnecessary metadata, coarsen exact timing, aggregate related events, batch publication, or delay release within the bounds defined in [SECURITY.md](SECURITY.md).
- The **public record** must remain truthful. Delay and aggregation are allowed. Fabrication, invented chronology, and misleading omission are not.

See [ADR 0004](docs/decisions/0004-publication-buffer.md) and [ADR 0010](docs/decisions/0010-phase2-read-only-commons-contract.md).

## Operational history

Hummingbird does **not** copy complete provider logs into its own database merely to create another ledger. GitHub remains authoritative for GitHub Actions history; Cloudflare remains authoritative for provider-side deployment telemetry; the blockchain remains authoritative for public on-chain activity.

The Phase 2 public operational record will instead publish compact, project-level events for material changes such as:

- production releases and rollbacks;
- significant service failures and restorations;
- material security-policy or deployment-control changes;
- corrections to previously published project information;
- other operational events whose consequence matters to the commons.

A public operational event should identify what changed, the affected project object or release where applicable, and the outcome. It should **not** automatically expose credentials, request metadata, source addresses, exact exploit detail, raw stack traces, or correlation-rich timestamps that do not improve public understanding.

Non-urgent operational events may be released in batches and with coarsened timing. The publication buffer exists specifically so transparency does not become an accidental surveillance or exploit-assistance mechanism.

## Repository publication

The repository is public. The publication transition was authorized by ADR 0009 and completed with public visibility plus protected `main`; the required `Checks, test, build` status check is active and branch protection is enforced for everyone including the steward/admin.

The repository's earlier git-history review found no committed secrets. Public mode invalidated the earlier private-only risk acceptances, so the remaining public-repository security controls are tracked in [SECURITY.md](SECURITY.md) until their settings are explicitly verified.

## Public records and raw logs

Public GitHub repository activity should be assumed visible. Hummingbird will not republish every raw CI line or provider diagnostic into a second database. When a raw provider record is useful, the project may reference it; when a durable institutional summary is needed, Hummingbird stores the small summary and its relationship to the relevant release/decision.

This is the transparency version of the project's lean-data rule: **store Hummingbird's meaning; reference authoritative external facts.**

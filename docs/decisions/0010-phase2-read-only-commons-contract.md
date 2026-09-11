# ADR 0010 — Phase 2 read-only commons contract

Status: **Accepted**

Date: 2026-09-10 (Pacific Time)

## Context

Phase 2 is the first Hummingbird phase that introduces durable application data. The roadmap intentionally blocks entry until the project defines the minimum canonical models, workflow states, retention rules, and public operational-transparency behavior needed to avoid letting implementation choices silently become policy.

The project has already adopted several constraints: origin-neutral participation, minimal data collection, portable versioned records, externally authoritative systems remaining authoritative, and a three-layer transparency design in which sensitive operational detail may be delayed or aggregated before public release.

Phase 2 is read-only from the public participant perspective. It does not introduce public submission forms, accounts, authentication, voting, moderation workflows, or financial-governance machinery.

## Decision

### 1. Canonical record architecture

Hummingbird uses **documents + minimal events + typed relationships** as its canonical logical model.

All canonical records use a small common envelope:

- `id`
- `type`
- `schema_version`
- `created_at`
- `state`
- `content`
- `relationships`

Optional provenance or publication fields are added only when a concrete institutional function requires them. Derived projections such as indexes, caches, embeddings, analytics, and summaries are non-canonical and must remain rebuildable wherever practical.

### 2. Phase 2 record types

Phase 2 admits four canonical record families:

- `contribution` — an idea, observation, argument, artifact reference, question, correction, or other substantive addition to the commons;
- `proposal` — a bounded suggestion for a project or governance change, displayed in Phase 2 without implying a finalized decision process;
- `need` — a stated requirement, deficiency, dependency, or resource need that can later participate in governance workflows;
- `event` — a minimal record that something institutionally meaningful happened to another canonical record.

Phase 2 records do not require a participant identity. Optional attribution may be stored only when voluntarily supplied and appropriate for publication.

### 3. Minimal Phase 2 workflow

Phase 2 uses only a publication/lifecycle state machine, not a full governance state machine:

`draft -> published -> corrected | superseded | withdrawn | archived`

A record may be created directly as `published` when imported from an already public authoritative source. Corrections attach rather than silently rewriting institutional history. `superseded`, `withdrawn`, and `archived` do not erase the fact that a record existed.

Proposal approval, need validation, dispute resolution, reputation, voting, and other governance semantics remain deferred to their later roadmap phases.

### 4. Relationships

Records may use a bounded set of typed relationships including:

- `responds_to`
- `references`
- `supports`
- `challenges`
- `supersedes`
- `duplicates`
- `derives_from`
- `summarizes`
- `implements`

This does not require a graph database. Relationships are portable data that may later be projected into a graph.

### 5. Event model

A Phase 2 event contains only the minimum required to explain a meaningful transition:

- `id`
- `type: event`
- `schema_version`
- `created_at`
- `event_type`
- `subject_ref`
- `content`
- `relationships`
- `publication`

Events must not duplicate complete object snapshots by default. Exact operational timestamps, source addresses, security data, request metadata, or participant-origin guesses are not automatically public event fields.

### 6. Retention

Retention and visibility are independent axes.

Default retention classes are:

- **EPHEMERAL:** no more than 7 days unless a shorter control-specific limit applies;
- **OPERATIONAL:** 90 days by default;
- **DURABLE:** no automatic expiry for records deliberately admitted to institutional memory, subject to correction/removal policy and future participant rights.

Visibility-class defaults are:

- `PUBLIC`: durable while part of the public institutional record;
- `PUBLIC_DELAYED`: held for no more than 30 days before publication or reclassification; temporary pre-publication metadata is removed within 30 days after release unless needed for an active incident;
- `OPERATIONAL`: 90 days;
- `SECURITY_SENSITIVE`: 180 days by default, extendable only for an active incident/investigation with periodic review;
- `FINANCIAL_PRIVATE`: not collected in Phase 2; if later legally/accountingly required, retain no longer than the applicable obligation, with a seven-year planning ceiling unless law requires otherwise;
- `SECRET`: retained only while active/required, rotated or deleted when superseded, and never treated as an archival dataset.

These are defaults, not permission to collect data merely because a retention period exists.

### 7. Transparency

GitHub and other authoritative providers remain authoritative for their own raw logs. Hummingbird does not duplicate complete CI or provider logs into its database.

Phase 2 public operational transparency will publish compact records for material project events such as production releases, significant failures, restorations, security-policy changes, and material corrections. Public records contain only the information needed to understand what happened and its consequence.

Security-sensitive detail, exact timing where it creates avoidable correlation risk, request metadata, credentials, and exploit-enabling diagnostics are excluded from automatic public publication. Non-urgent operational records may be delayed, batched, and time-coarsened through the publication buffer. Delay and aggregation may obscure correlation; they may not change the truth of the event.

### 8. Persistence

Cloudflare D1 is the planned initial Phase 2 persistence engine because it fits the existing deployment footprint and low-runway constraint. D1 is an implementation choice, not part of the institutional meaning of the records. Canonical objects remain portable, versioned JSON-compatible representations so another storage engine can replace D1 without redefining the commons.

## Consequences

- The Phase 2 data-model, workflow-state, retention-period, and operational-transparency entry questions are resolved by this ADR and their substantive documents.
- Phase 2 may implement a read-only database and public projections without introducing accounts or public submission.
- Later phases must extend rather than silently reinterpret these semantics; governance-specific state machines require their own explicit decisions.
- Participant identity remains unnecessary for ordinary Phase 2 records.
- Storage cost remains bounded by default through small canonical records, rebuildable projections, bounded events, and explicit retention.

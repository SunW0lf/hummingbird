# Data Model

Phase 2 introduces the first application data as a **read-only commons**. The logical model below is authoritative for Phase 2; see [ADR 0010](docs/decisions/0010-phase2-read-only-commons-contract.md).

A machine-readable v1 contract lives at [`schemas/canonical-object-v1.schema.json`](schemas/canonical-object-v1.schema.json). A deterministic, storage-independent reference corpus lives under [`fixtures/canonical/`](fixtures/canonical/) and is governed by [ADR 0012](docs/decisions/0012-reference-corpus-before-persistence.md).

The reference corpus is **contract material, not production institutional memory**. Inclusion there does not itself publish, admit, approve, validate, or grant governance status to content.

## Participant model

Hummingbird does not build identity around `human` / `AI` / `bot` categories. It uses an abstract participant model only when a later phase actually needs one:

```text
participant
  participant_id
  declarations[]
  credentials[]
  capabilities[]
  rate_limit_state
```

- A **declaration** is a voluntary claim made by a participant about itself.
- A **credential** verifies only the specific claim it attests to. It does not define the participant's underlying nature and does not grant additional authority.
- Anonymous or pseudonymous participation should remain possible where security permits.
- **Phase 2 canonical records do not require a participant record.** Optional attribution may be attached only where voluntarily supplied and appropriate for publication.

## Portability principle

**Canonical Hummingbird records use portable, versioned representations whose institutional meaning is independent of the database engine used to store them.**

Cloudflare D1 is the first Phase 2 persistence engine because it fits the existing deployment footprint and hobby-scale runway. Phase 2B proved the v1 contract through both local and remote D1 round trips; that implementation choice does not make D1 semantics canonical.

Prefer **schema-flexible, versioned documents**, not unstructured schema-less blobs: every canonical object declares its own `type` and `schema_version` rather than relying on a database schema to convey institutional meaning.

Before production D1 persistence, the v1 contract was exercised outside any database through the reference corpus. D1 migrations/import/export now round-trip those records without depending on provider row IDs, triggers, hidden state, or database-only meaning.

### Semantic contract before storage

Every new Hummingbird concept must receive a portable semantic definition **before** it receives an authoritative database table, migration, provider-specific implementation, or public mutation endpoint.

The order is:

```text
institutional concept
        ↓
portable semantic contract
        ↓
reference examples / tests
        ↓
storage representation
        ↓
provider implementation
```

A migration must not silently decide what a pad, guild, proposal workflow, grant, connection, space, or activity means. Storage exists to preserve and query an already-defined concept.

This rule deliberately permits different implementation shapes. A future pad may require several operational tables while exporting as one portable object family; a live activity may coordinate through a Durable Object while only meaningful durable transitions enter D1. Provider layout is not institutional meaning.

## Canonical object core shape

An ordinary canonical object contains only what is necessary for meaning, state, and relationships:

```text
id
type
schema_version
created_at
state
content
relationships[]
```

Optional `attribution`, `provenance`, or `publication` fields are added only where a specific institutional function justifies them. Do not add speculative future fields merely because storage is cheap.

The v1 machine-readable contract currently permits these record families:

```text
contribution
proposal
need
event
```

## Phase 2 record families

### Contribution

A `contribution` is an idea, observation, argument, artifact reference, question, correction, or other substantive addition to the commons.

```text
id
type: contribution
schema_version: 1
created_at
state
content:
  title?
  body
  format
relationships[]
attribution?      # voluntary only
provenance?       # source reference when institutionally useful
publication?
```

The model deliberately does not require a participant identity, origin category, device identifier, wallet, provider account, or source address.

### Proposal

A `proposal` is a bounded suggestion for a project or governance change.

```text
id
type: proposal
schema_version: 1
created_at
state
content:
  title
  summary
  body
relationships[]
attribution?
provenance?
publication?
```

Phase 2 may display proposals, but its lifecycle states do **not** imply that a governance approval process has been finalized. Proposal review/approval semantics belong to later governance phases.

### Need

A `need` is a stated requirement, deficiency, dependency, or resource need.

```text
id
type: need
schema_version: 1
created_at
state
content:
  title
  description
  scope?
relationships[]
attribution?
provenance?
publication?
```

A Phase 2 `need` is descriptive, not automatically validated or authorized. Validation and expenditure consequences remain Phase 4/5 concerns.

### Event

An `event` records a meaningful institutional change without cloning a full record snapshot.

```text
id
type: event
schema_version: 1
created_at
state
event_type
subject_ref
content
relationships[]
publication
```

Events contain the minimum needed to understand the change. Exact request metadata, source addresses, security-sensitive diagnostics, and guesses about participant origin are not ordinary event fields.

## Phase 2 lifecycle states

Phase 2 uses one deliberately small publication/lifecycle state machine:

```text
draft -> published -> corrected | superseded | withdrawn | archived
```

- Deliberate canonical admission may create a `draft` record without publishing it. This is the initial Phase 2C admission boundary.
- A record may enter directly as `published` when deliberately imported from an already-public authoritative source.
- A correction is attached to history rather than silently erasing what was previously represented.
- `superseded`, `withdrawn`, and `archived` preserve the fact that the record existed.
- Approval, validation, voting, disputes, moderation, and reputation are **not** Phase 2 states.

## Typed relationships

The portable v1 relationship shape is deliberately small:

```json
{
  "type": "references",
  "target_ref": "some-canonical-id-or-stable-external-reference"
}
```

Allowed v1 relationship types are:

- `responds_to`
- `references`
- `supports`
- `challenges`
- `supersedes`
- `duplicates`
- `derives_from`
- `summarizes`
- `implements`

The relationship object does not require a graph database. D1 may normalize relationships into helper tables for querying, but the canonical export remains the portable `{type, target_ref}` representation.

**External artifacts** should be stored once in their authoritative system and referenced rather than copied into multiple records.

**Derived projections** — search indexes, caches, summaries, embeddings, analytics, database helper rows, and public view models — are not canonical. They should remain rebuildable and disposable wherever practical; losing one should never lose institutional meaning.

Phase 2C's static `publication/canonical/` deployment input and generated `/records` HTML/JSON are examples of derived public projections. They do not replace D1 as canonical persistence, and a public page view must not require a D1 query.

## External ingress and admission

Phase 2 distinguishes material that exists outside the canonical commons from material deliberately admitted into it.

```text
external offer/source
        ↓
consideration / synthesis
        ↓
explicit admission
        ↓
canonical record
```

The interim Seed Bank is the first live example. A GitHub issue, comment, reaction, provider identity, or issue timestamp is not automatically canonical Hummingbird data. If material is later admitted, Hummingbird should store the admitted meaning plus only the provenance/reference needed to understand where it came from.

Phase 2C adds an explicit publication step after admission for ordinary draft-first records:

```text
external source
      ↓
explicit canonical admission (draft)
      ↓
independent publication decision
      ↓
rebuildable public projection
```

**Submission ≠ publication ≠ admission ≠ governance approval.**

## Reference corpus and persistence test

The Phase 2A reference corpus must:

- contain at least one representative object for every v1 record family;
- exercise typed relationships and relevant optional fields;
- contain no required participant identity/origin classification;
- contain no provider-specific persistence keys such as D1 row identity;
- pass CI contract checks;
- become the required input for D1 import/export round-trip testing.

A future D1 design fails the portability requirement if an equivalent canonical export cannot be reconstructed from the stored data without hidden database-specific semantics.

## Growth beyond v1

The v1 schema is a foundation, not an attempt to encode all later Hummingbird behavior.

### Proposals

`proposal` already exists as a canonical family. Later governance phases may add review, amendment, decision, challenge, or authorization semantics only after those processes are separately defined. A proposal's existence must not imply approval or governance weight.

### Pads

Before a `pad` table or object family becomes authoritative, Hummingbird must define the smallest portable pad contract: what continuity means, which declarations are public, what credentials or capabilities are optional, what can expire, and what information is explicitly *not* identity or origin classification.

A pad should be able to function as a continuing locus of participation without requiring a declaration that it represents any particular participant type.

### Connections and guilds

Pad connections should represent explicit relationship state rather than inferred social graphs. Guild membership should likewise be a deliberate state transition.

A guild is not a higher participant class. Future guild capabilities should be scoped and, where practical, expiring: for example a bounded shared-space lifetime, resource allowance, or scheduled-space capability. Global reputation or permanent authority must not emerge accidentally from a guild table.

### Spaces and live activities

Durable definitions, commitments, memberships, grants, and meaningful outcomes may belong in D1. High-frequency live coordination — presence, sockets, turns, locks, cursor movement, temporary game state — should not automatically become canonical D1 history.

Where serialized real-time coordination becomes necessary, a separate live coordination mechanism may manage transient state and emit only institutionally meaningful transitions into durable storage.

The resulting long-term pattern is:

```text
portable concept
      ↓
D1 durable meaning
      ↑
meaningful transitions
      ↑
live/ephemeral coordination when actually required
```

## Data classification and retention

Visibility classification and retention class are separate axes. See [SECURITY.md](SECURITY.md) for the authoritative retention periods.

Retention classes are:

- **EPHEMERAL** — maximum 7 days unless a shorter control-specific limit applies.
- **OPERATIONAL** — 90 days by default.
- **DURABLE** — no automatic expiry for material deliberately admitted to institutional memory, subject to correction/removal policy and future participant rights.

Nothing becomes durable merely because storage is cheap. **Durability must be earned or deliberately granted**, not defaulted into.

## Data budget

Before adding any new persistent field or dataset, answer:

- Why do we need it?
- Is it canonical or derived?
- What institutional function requires it?
- What retention class applies?
- What is the expected maximum size/cardinality?
- Can it be reconstructed if lost?
- What privacy/security classification applies?

If those questions cannot be answered, do not collect the information by default.

## Anti-bloat rules

- Prefer references over copies.
- Avoid storing full snapshots for every ordinary state transition.
- Avoid telemetry by default; do not retain browser, device, request, or participant metadata merely because it is technically available.
- Bound metadata size, relationship counts, event payloads, operational logs, security data, attachments, and abuse-control state.
- An ordinary textual contribution should remain small in canonical storage — it should not silently create orders of magnitude more permanent backend data than the contribution itself.

## Blockchain-derived data (interim support; not Phase 5)

Hummingbird does not require supporter identity collection for the interim voluntary support mechanism, and does not create donor accounts, supporter profiles, participant identities derived from wallets, leaderboards, badges, or donation-linked reputation.

A public wallet address and its on-chain activity are not a durable canonical transaction ledger inside Hummingbird. The chain remains authoritative. If financial transparency is built later, activity should be derived from the chain/indexer; any local index/cache remains rebuildable and non-authoritative.

Unsolicited inbound support and future project-authorized expenditure are separate concepts. A future expenditure-authorization record would represent a governance decision to use resources for a defined purpose; that remains Phase 5 design, not current implementation.

## Current state

The Phase 2 logical model and storage-independent v1 reference contract are defined. Phase 2B is complete: the v1 D1 migration exists in the repository, the real remote D1 database is provisioned and migrated, and the bounded reference corpus has been imported, reconstructed, deep-compared without semantic loss, and removed again by the guarded remote verifier.

Phase 2C is complete. The first public-read-model exercise moved one deliberately synthesized Seed Bank contribution through draft canonical admission, a separate publication decision, read-only staging, and protected promotion into `/records.html`, `/records/index.json`, and per-record HTML/JSON routes. The derived projection remains rebuildable; Seed Bank material is not automatically admitted. See [ADR 0014](docs/decisions/0014-progressive-capability-rollout.md) and [the Phase 2C protocol](docs/protocols/PHASE_2C_ADMISSION_PUBLICATION.md).

Pads, guilds, spaces, live activities, public application-owned writes, and later governance workflows remain semantic designs until their portable contracts and entry gates are satisfied.

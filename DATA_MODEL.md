# Data Model

Phase 0/1 stores no participant or contribution data — the site is static. Phase 2 introduces the first application data as a **read-only commons**. The logical model below is authoritative for Phase 2; see [ADR 0010](docs/decisions/0010-phase2-read-only-commons-contract.md).

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
- Anonymous or pseudonymous participation should remain possible where security permits (see [SECURITY.md](SECURITY.md)).
- **Phase 2 canonical records do not require a participant record.** Optional attribution may be attached only where voluntarily supplied and appropriate for publication.

## Portability principle

**Canonical Hummingbird records use portable, versioned representations whose institutional meaning is independent of the database engine used to store them.** The logical model must not depend on a particular vendor. It must remain compatible with document databases, JSON-in-SQL, PostgreSQL JSONB, D1/SQLite JSON, MongoDB, Firestore, and future object/event storage approaches.

Cloudflare D1 is the planned first Phase 2 persistence engine because it fits the existing deployment footprint and hobby-scale runway. That choice does not make D1 semantics canonical.

Prefer **schema-flexible, versioned documents**, not unstructured schema-less blobs: every canonical object declares its own `type` and `schema_version` rather than relying on the database's schema (or lack of one) to convey meaning.

## Canonical object core shape

An ordinary canonical object contains only what is necessary for meaning, state, and relationships:

```text
id
type
schema_version
created_at
state
content
relationships
```

Optional `attribution`, `provenance`, or `publication` fields are added only where a specific institutional function justifies them. Do not add speculative future fields on the chance they become useful.

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

The model deliberately does not require a participant identity, origin category, device identifier, wallet, or account.

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

- A record may enter directly as `published` when imported from an already-public authoritative source.
- A correction is attached to history rather than silently erasing what was previously represented.
- `superseded`, `withdrawn`, and `archived` preserve the fact that the record existed.
- Approval, validation, voting, disputes, moderation, and reputation are **not** Phase 2 states.

## Typed relationships

Canonical records may express bounded relationships such as:

- `responds_to`
- `references`
- `supports`
- `challenges`
- `supersedes`
- `duplicates`
- `derives_from`
- `summarizes`
- `implements`

This does not imply deploying a graph database. The canonical model simply remains compatible with a graph projection later.

**External artifacts** (large files) should be stored once and referenced from canonical objects rather than copied into multiple records.

**Derived projections** — search indexes, caches, summaries, embeddings, analytics, and other derived representations — are not canonical. They should remain rebuildable and disposable wherever practical; losing one should never lose institutional meaning.

## Data classification and retention

Visibility classification and retention class are separate axes. See [SECURITY.md](SECURITY.md) for the authoritative retention periods.

Retention classes are:

- **EPHEMERAL** — maximum 7 days unless a shorter control-specific limit applies. Temporary processing and short-lived coordination belong here.
- **OPERATIONAL** — 90 days by default. Diagnostics, ordinary operational support records, and review support material belong here unless another classification overrides the period.
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

## Blockchain-derived data (interim support, see [ROADMAP.md](ROADMAP.md) — this is not Phase 5)

Hummingbird does not require supporter identity collection for the interim voluntary support mechanism, and does not create donor accounts, supporter profiles, donor emails/names, participant identities derived from wallets, leaderboards, badges, or donation-linked reputation. A public wallet address and its on-chain activity are not treated as a durable canonical record inside Hummingbird's own storage: the chain itself is the authoritative record of any inbound value. If financial transparency reporting is built later, it should derive activity from the chain or an appropriate indexer rather than maintaining a separate internal transaction ledger; any local index or cache must remain rebuildable and non-authoritative. This is the portability/lean-data principle applied to an external system: **store Hummingbird's decisions; reference external authoritative facts.**

Unsolicited inbound support and any future project-authorized expenditure are separate concepts. Inbound support to the public address has `governance_effect: none` and does not itself authorize any action. A future `ExpenditureAuthorization` record (conceptually: `authorization_id`, `purpose`, `authorized amount/limit`, `decision reference`, `status`) would represent a governance decision to use resources for a defined purpose — this is a Phase 5 design note only and is not implemented.

## Current state

The Phase 2 logical model is now defined. No production database has been deployed yet; implementing D1, migrations, seed/import paths, and read-only public projections is Phase 2 work.

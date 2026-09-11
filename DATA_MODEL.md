# Data Model

Phase 0/1 stores no participant or contribution data — the site is static. This document sketches the intended abstract model for Phase 2+ so future implementation has a stable reference point; none of it is implemented yet.

## Participant model (intent, not implemented)

Hummingbird does not build identity around `human` / `AI` / `bot` categories. It uses an abstract participant model:

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

## Other entities (Phase 2+, see registry)

Each of these blocks entry into Phase 2 — see [docs/governance/OPEN_QUESTIONS.md](docs/governance/OPEN_QUESTIONS.md) for full detail:

- **Contribution model** — [OQ-DATA-CONTRIBUTION-MODEL](docs/governance/OPEN_QUESTIONS.md#oq-data-contribution-model)
- **Proposal model** — [OQ-DATA-PROPOSAL-MODEL](docs/governance/OPEN_QUESTIONS.md#oq-data-proposal-model)
- **Need model** — [OQ-DATA-NEED-MODEL](docs/governance/OPEN_QUESTIONS.md#oq-data-need-model)
- **Audit/event model** — [OQ-DATA-AUDIT-EVENT-MODEL](docs/governance/OPEN_QUESTIONS.md#oq-data-audit-event-model), but see [TRANSPARENCY.md](TRANSPARENCY.md) for the three-layer log design intent
- **Workflow state machines** — [OQ-DATA-WORKFLOW-STATES](docs/governance/OPEN_QUESTIONS.md#oq-data-workflow-states)

## Retention classifications

See [SECURITY.md](SECURITY.md) §Data Classification for the category list (`PUBLIC`, `PUBLIC_DELAYED`, `OPERATIONAL`, `SECURITY_SENSITIVE`, `FINANCIAL_PRIVATE`, `SECRET`). Specific retention periods per category are [OQ-SECURITY-RETENTION-PERIODS](docs/governance/OPEN_QUESTIONS.md#oq-security-retention-periods) until real data is collected in Phase 2+.

## Portability principle

**Canonical Hummingbird records use portable, versioned representations whose institutional meaning is independent of the database engine used to store them.** The logical model must not depend on a particular vendor. It must remain compatible with document databases, JSON-in-SQL, PostgreSQL JSONB, D1/SQLite JSON, MongoDB, Firestore, and future object/event storage approaches. No persistence engine has been chosen or deployed — this section constrains future implementation, it does not perform one.

Prefer **schema-flexible, versioned documents**, not unstructured schema-less blobs: every canonical object declares its own `type` and `schema_version` rather than relying on the database's schema (or lack of one) to convey meaning.

## Canonical object core shape

An ordinary canonical object should contain only what is necessary for meaning, state, and relationships:

```text
id
type
schema_version
created_at
state
content
relationships
```

Add provenance, publication state, or other fields only where a specific institutional function justifies them. Do not add speculative future fields on the chance they become useful.

## Documents, events, and relationships

Hummingbird's data is designed conceptually around three kinds of things, none of which are implemented yet:

- **Canonical documents** — the current meaningful representation of a contribution, proposal, need, decision, or related institutional object. See [OQ-DATA-CONTRIBUTION-MODEL](docs/governance/OPEN_QUESTIONS.md#oq-data-contribution-model), [OQ-DATA-PROPOSAL-MODEL](docs/governance/OPEN_QUESTIONS.md#oq-data-proposal-model), [OQ-DATA-NEED-MODEL](docs/governance/OPEN_QUESTIONS.md#oq-data-need-model) for the specific shapes, which remain open.
- **Minimal events** — record meaningful changes without duplicating a full snapshot on every transition. Illustrative names only, not yet implemented or finalized: `ContributionCreated`, `EnteredPool`, `ReviewRecorded`, `PersistenceGranted`, `Published`, `CorrectionAttached`. See [OQ-DATA-AUDIT-EVENT-MODEL](docs/governance/OPEN_QUESTIONS.md#oq-data-audit-event-model).
- **Typed relationships** — Hummingbird objects should eventually be able to express relationships such as `responds_to`, `references`, `supports`, `challenges`, `supersedes`, `duplicates`, `derives_from`, `summarizes`, `implements`. This does not imply deploying a graph database; the canonical model should simply stay compatible with a graph projection later. See [OQ-DATA-WORKFLOW-STATES](docs/governance/OPEN_QUESTIONS.md#oq-data-workflow-states) for how relationships interact with state transitions.

**External artifacts** (large files) should eventually be stored once and referenced from canonical objects rather than copied into multiple records.

**Derived projections** — search indexes, caches, summaries, embeddings, analytics, and other derived representations — are not canonical. They should remain rebuildable and disposable wherever practical; losing one should never lose institutional meaning.

## Retention classes (distinct from data classification)

[SECURITY.md](SECURITY.md) §Data Classification (`PUBLIC`, `PUBLIC_DELAYED`, `OPERATIONAL`, `SECURITY_SENSITIVE`, `FINANCIAL_PRIVATE`, `SECRET`) answers *who can see it*. The retention classes below are a separate axis answering *how long it lives*; a given piece of data has both a classification and a retention class.

- **EPHEMERAL** — minutes to days. Examples: temporary processing state, transient rate-control state, short-lived coordination state.
- **OPERATIONAL** — bounded duration. Examples: security records, review support material, recovery information, operational diagnostics.
- **DURABLE** — potentially long-lived institutional memory. Examples: material deliberately admitted to the Pond, adopted decisions, amendments, and the provenance required to understand durable records.

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

No database exists. No entities beyond static site content are stored anywhere.

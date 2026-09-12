# Architecture

This document describes the actual technical architecture of Hummingbird as built, with clearly marked near-term Phase 2 work and explicitly labeled future interactive design. It should not describe aspirational components as though they already exist.

## Current system components

```text
GitHub repository (source of truth)
      │
      ├── canonical institutional Markdown
      ├── Phase 2 schema/reference corpus
      ├── GitHub Issues (interim Seed Bank transport)
      │
      ▼
GitHub Actions (test, build, audit)
      │
      ├── static public projection
      │
      ▼
Cloudflare Pages
      │
      ├── static public/read plane
      └── /offer* Pages Functions only
              │
              └── dedicated experimental OFFER_DB (temporary, non-canonical)
      │
      ▼
datum.quest

Canonical Cloudflare D1
      │
      └── durable canonical application records
              ↓
        read-only staging / explicit promotion
              ↓
        static public projection
```

- **`app/`** — current public site, including static read surfaces, Seed Bank discovery, and the live Phase 2E offer form/contract.
- **`functions/offer/`** — bounded Phase 2E write-plane handlers for offer acceptance, receipt-based status, and receipt-based withdrawal. Function routing is limited to `/offer` and `/offer/*` so ordinary public reading stays static.
- **Root Markdown + `docs/`** — authoritative institutional/project documentation and ADRs.
- **`schemas/` + `fixtures/canonical/`** — Phase 2 storage-independent reference contract defined by ADR 0012. These fixtures are contract material, not production institutional memory.
- **Canonical Cloudflare D1** — durable persistence engine for deliberately admitted canonical application records. D1 is an implementation detail, not the definition of canonical meaning.
- **Dedicated experimental `OFFER_DB`** — separate D1 store for temporary Phase 2E offers under ADRs 0018–0020. It is not part of canonical migrations, canonical backup/restore, or canonical institutional memory.
- **`publication/canonical/`** — reviewed, derived deployment projection reconstructed from canonical D1 state; disposable and rebuildable rather than a second source of institutional truth.
- **GitHub Issues** — external transport for Seed Bank Seed / Feedback / Question discussion under ADR 0011. GitHub account metadata is provider metadata, not Hummingbird origin verification or canonical participant identity.
- **No Hummingbird-owned participant account system, durable participant capability issuance, or general Phase 3 write API exists.** The only current Hummingbird-owned participant write surface is the narrow Phase 2E temporary `/offer` experiment.
- **No Durable Objects, public game engine, presence-pad system, or queue/background-worker system exists yet.**

## Phase 2 flow

Phase 2 is deliberately split so persistence cannot silently define institutional meaning:

```text
storage-independent canonical contract
        ↓
reference corpus + CI validation
        ↓
D1 migrations/import (implementation detail)
        ↓
canonical records
        ↓
explicit publication decision
        ↓
read-only staging + reviewed promotion
        ↓
rebuildable public read projections
        ↓
publication buffer where required
        ↓
public commons views / machine-readable representations
```

External material follows a separate boundary:

```text
external or Phase 2E temporary offer/source
        ↓
consideration / synthesis
        ↓
explicit admission decision
        ↓
new canonical Hummingbird object
```

External discussion and Phase 2E offer rows are never automatically converted into canonical storage. Making an offer, provider reactions, visible account identity, repetition, and popularity are not admission or governance signals by default.

## Canonical versus implementation-specific state

Canonical meaning is defined in [DATA_MODEL.md](DATA_MODEL.md), the machine-readable schema, and accepted ADRs — not by D1 table layout.

D1 may use implementation-specific primary keys, indexes, normalized helper tables, or query projections as needed, but those details must remain reconstructable/disposable. A canonical export must preserve the record's institutional meaning without depending on D1 row IDs, triggers, or hidden application state.

The Phase 2E `OFFER_DB` is explicitly outside this canonical contract. Its rows may expire, be withdrawn, be lost, or be deleted without rewriting canonical Hummingbird history. If meaning from an offer is worth preserving, a separate explicit admission action creates a new canonical record.

Derived artifacts such as indexes, caches, summaries, analytics, embeddings, and public projections are non-canonical unless a later decision explicitly says otherwise.

## Representation discovery and provenance

Public machine readability should normally be achieved with static standards rather than requester classification or request-time middleware. Under [ADR 0015](docs/decisions/0015-standards-based-representation-discovery-and-provenance.md), deliberately published ADRs expose ordinary HTML plus directly retrievable canonical Markdown, explicit alternate-representation links, source revision metadata, and content digests.

For decision records, Hummingbird distinguishes:

```text
source commit = revision that last changed the canonical ADR source
build commit  = revision whose build produced the deployed artifact
source digest = SHA-256 of the exact canonical Markdown bytes
```

These facts must not be collapsed into one ambiguous “commit hash.” A content digest establishes byte identity; it is not by itself a signature or proof of institutional authorization.

The public read plane should prefer discoverable static representations (`rel="alternate"`, visible raw-source links, `llms.txt`, `sitemap.xml`, and static machine indexes) over an edge Worker that branches on requester type or `Accept` headers when no material runtime capability is gained.

A static schema describing how to offer a proposed ADR is documentation, not a formal-governance write endpoint. Proposal-shaped material may now enter through the live Phase 2E offer surface or the Seed Bank, but neither path automatically receives an ADR number, canonical admission, publication, or governance status.

## Phase 2E experimental ingress — open for testing

[ADR 0017](docs/decisions/0017-phase2e-experimental-ingress.md) authorizes a deliberately narrow Hummingbird-owned write experiment during Phase 2E so Hummingbird can learn from real interaction before settling every Phase 3 question in the abstract. [ADR 0018](docs/decisions/0018-phase2e-offer-pilot-runtime-and-data-boundary.md), [ADR 0019](docs/decisions/0019-phase2e-offer-triage-and-review.md), and [ADR 0020](docs/decisions/0020-phase2e-offer-pilot-launch-profile.md) define its data, review, and launch boundaries.

Its live authority ceiling is:

```text
participant makes a low-friction offer
        ↓
pilot payload/resource validation
        ↓
temporary experimental OFFER_DB (non-canonical)
        ↓
exact-duplicate grouping / later bounded synthesis / evidence review
        ↓
possible surfacing to an already-authorized institutional layer
```

The experimental layer may receive temporary offers and apply its published resource/safety rules. It may not automatically create canonical memory, publication, formal governance proposals, votes, reputation, accounts, standing, durable participant capabilities, or participant-specific durable restrictions.

Current v0.1 boundaries include:

- 1–4,000-character offer text and a 16 KiB request ceiling;
- optional bounded reference URL and evidence-question identifier;
- 30-day ordinary offer retention plus bounded cleanup;
- 256-bit participant-held receipt secret with only its SHA-256 hash stored;
- receipt-based status and withdrawal;
- 250 active offers globally before explicit backpressure returns `not accepted`;
- exact-text duplicate grouping only at launch;
- no application-level raw-IP store, browser fingerprint, participant profile, origin category, or hidden reputation score;
- Functions routed only to `/offer` and `/offer/*`;
- scheduled expiry/redaction cleanup;
- production deployment smoke testing of accept → status → withdraw → withdrawn status.

These choices are deliberately phase-bounded evidence, not automatic Phase 3 precedent.

The live protocol is [docs/protocols/PHASE_2E_EXPERIMENTAL_INGRESS.md](docs/protocols/PHASE_2E_EXPERIMENTAL_INGRESS.md).

## Future Phase 3 offer boundary — durable participation designed, not deployed

[ADR 0016](docs/decisions/0016-offers-and-the-offer-buffer.md) defines the participant-facing concept for Hummingbird-owned ingress, while ADR 0017 creates the narrower live Phase 2E experimental exception described above.

An **offer** is material intentionally placed before Hummingbird for consideration. Its possible consequence may range from a trivial correction to a proposal to redesign the entire site or change Hummingbird's institutional shape. Scope is not itself an abuse signal and does not grant authority.

The candidate Phase 3 boundary is:

```text
participant makes an offer
        ↓
chooses an offer delivery option
        ↓
validation of payload / resource bounds
        ↓
Offer Buffer (bounded operational state, non-canonical)
        ↓
consideration / synthesis
        ↓
optional explicit admission
        ↓
canonical memory
        ↓
optional publication
```

Offer delivery options exist to regulate resource consumption and harmful behavior. They must not classify presumed participant origin or become hidden content priority, trust/reputation, or governance weight.

The initial Phase 3 durable-capability pilot is expected to favor a narrow revocable capability credential under ADR 0014. Additional future delivery paths may be explored, including bounded computational effort or uncredentialed low-throughput access, but those paths must not change substantive consideration merely because one participant spent more compute or accepted more friction.

The future Phase 3 Offer Buffer is deliberately **not canonical**. Exact durable Phase 3 storage, retention, payload bounds, deduplication, replay protection, capability issuance, abuse-state retention, correction/withdrawal, overload behavior, and recovery semantics remain gated Phase 3 design questions. The working Phase 2E choices are evidence, not automatic durable defaults.

The working Phase 3 design is recorded in [docs/protocols/PHASE_3_OFFER_BUFFER_DESIGN.md](docs/protocols/PHASE_3_OFFER_BUFFER_DESIGN.md). It does not authorize durable Phase 3 accounts, capability issuance, governance standing, automatic canonical writes, or broader public mutation before the Phase 3 gate opens.

## Future interactive-state architecture — not deployed

The working direction for pads, rooms, guilds, walls, games, and other persistent activities is documented in [SPACES.md](SPACES.md). The proposed storage split is documented in [PERSISTENCE.md](PERSISTENCE.md).

The current candidate shape is:

```text
public static/read plane
        │
        ├── D1
        │     canonical records
        │     durable associations / grants / selected activity history
        │
        ├── Durable Objects
        │     live room and activity state machines
        │     serialized concurrent actions
        │     hibernating WebSocket coordination
        │
        └── R2
              backups / exports
              sealed immutable activity archives
              larger public artifacts if later allowed
```

This split is intentionally provisional. It does **not** make Durable Objects, R2, or any Cloudflare-specific schema part of Hummingbird's constitutional or canonical meaning.

### Why live coordination is separate from the canonical database

A persistent chess board, collaborative wall, room constitution, or guild workshop may receive concurrent actions that need strict ordering. Treating every transient action as a D1 transaction or durable institutional event would create unnecessary race complexity, cost, and data retention.

A future coordination object can own one bounded state machine, validate permitted transitions, and emit only meaningful durable state/events when required.

Presence heartbeats, WebSocket pings, cursors, and similar transient coordination should not become canonical history by default.

### Hibernation requirement

If Durable Objects are adopted, real-time designs should prefer hibernation/scale-to-zero behavior. Hummingbird should not pay continuous compute merely to maintain the fiction of an always-awake room. A closed or quiet space should become operationally quiet while its readable/persistent state remains recoverable.

## Trust boundaries

- **GitHub repository / Actions** — source, project history, protected production change path, deployment secret, CodeQL, dependency/security controls. Compromise of repository write access or Actions is a critical risk.
- **GitHub Issues** — public, provider-hosted Seed Bank transport. Treat issue bodies/comments/links as untrusted external input. Public issue activity is not silently persisted into Hummingbird's application data.
- **Cloudflare** — DNS, Pages deployment, proxying, canonical D1 persistence, and the separate temporary offer D1 resource. The Pages deployment token remains scoped to Pages:Edit; D1 operations use their own deliberate credential/steward boundary.
- **Phase 2E experimental ingress — live** — temporary untrusted first-party input with a published authority ceiling, bounded retention/resource rules, one-off receipt continuity, and no automatic canonical or governance consequence.
- **Future Phase 3 Offer Buffer** — durable controlled-participation ingress remains a separate operational trust boundary. Buffered offers remain untrusted, bounded, and non-canonical until deliberate admission.
- **Future coordination runtime** — if Durable Objects or equivalent are introduced, participant-supplied room rules remain bounded declarative data rather than executable code. A room may govern its interactions but cannot gain infrastructure authority.
- **Local development machine** — not authoritative production state. Production changes flow through protected `main` and CI.
- **External authoritative systems** — GitHub for GitHub activity, Cloudflare for provider telemetry, Base for blockchain facts. Hummingbird references authoritative external facts rather than cloning complete external ledgers.

## External services

Current:

- GitHub — source control, CI/CD, security tooling, pull requests, issue tracking, and Seed Bank discussion transport.
- Cloudflare — DNS, Pages hosting, proxying for `datum.quest`, canonical D1 persistence, and the dedicated temporary Phase 2E `OFFER_DB`.
- Base blockchain — authoritative public record for the interim receive-only support wallet; Hummingbird does not maintain a duplicate transaction ledger.

Potential future interactive components, not yet approved for durable Phase 3 deployment:

- Cloudflare Durable Objects — live serialized coordination for bounded rooms/activities where concurrent state requires it.
- Cloudflare R2 — independent backups, exports, sealed immutable archives, and larger objects where D1 is the wrong storage tier.

The Phase 2E experimental runtime/storage choice does not settle these broader durable architecture choices.

See [PERSISTENCE.md](PERSISTENCE.md) for the dated cost snapshot and decision gates.

## Secrets management

- Public receive-only wallet addresses are configuration, not secrets. Private keys/signing credentials are never stored in the repository or web server.
- Production deployment uses a Cloudflare API Token stored as a GitHub Actions secret and scoped to the minimum deployed capability.
- D1-related credentials/configuration are environment-driven and may not be committed as secret values.
- Participant offer receipts are generated at acceptance, shown once, and stored only as hashes; they are not deployment secrets or participant identities.
- Any future Durable Object/R2 bindings follow the same least-privilege/environment-driven rule; participant-visible identifiers must not expose provider credentials.
- Local schema/corpus tests require no production secrets.

## Backups and recovery

- Git/document/schema/reference-corpus state is recoverable from the repository.
- D1 canonical state has a storage-independent export/restore path, and restoration into an empty disposable replacement database has been exercised successfully in Phase 2D. The remaining Phase 2D work is keeping the normal independent-backup boundary explicit for non-public canonical state.
- The Phase 2E offer buffer is deliberately not given the canonical backup promise. Temporary offer loss is possible and must not be represented as canonical durability.
- R2 is a candidate independent storage target for encrypted or otherwise appropriately protected canonical recovery bundles, but backup format and restoration remain more important than vendor choice.
- Rebuildable public projections are not themselves backup targets for institutional meaning.
- Future room/activity state must declare whether it is ephemeral, operational, durable, or archival. Losing an ephemeral coordination object must not silently lose a record that Hummingbird promised to preserve.

See [OPERATIONS.md](OPERATIONS.md), [PERSISTENCE.md](PERSISTENCE.md), and the Phase 2D roadmap milestone.

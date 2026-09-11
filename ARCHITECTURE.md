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
Cloudflare Pages (static/read-only site)
      │
      ▼
datum.quest

Cloudflare D1
      │
      └── durable canonical application records
              ↓
        read-only staging / explicit promotion
              ↓
        static public projection
```

- **`app/`** — current public static/read-only site, including the Seed Bank discovery surface.
- **Root Markdown + `docs/`** — authoritative institutional/project documentation and ADRs.
- **`schemas/` + `fixtures/canonical/`** — Phase 2 storage-independent reference contract defined by ADR 0012. These fixtures are contract material, not production institutional memory.
- **Cloudflare D1** — current durable persistence engine for deliberately admitted canonical application records. D1 is an implementation detail, not the definition of canonical meaning.
- **`publication/canonical/`** — reviewed, derived deployment projection reconstructed from canonical D1 state; disposable and rebuildable rather than a second source of institutional truth.
- **GitHub Issues** — temporary external transport for Seed Bank Seed / Feedback / Question discussion under ADR 0011. GitHub account metadata is provider metadata, not Hummingbird origin verification or canonical participant identity.
- **No Hummingbird-owned public write API or participant account system exists yet.** Those remain Phase 3 concerns.
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
external offer/source (for example a Seed Bank thread)
        ↓
consideration / synthesis
        ↓
explicit admission decision
        ↓
canonical Hummingbird object
```

External discussion is never automatically copied into canonical storage. Making an offer, provider reactions, visible account identity, and popularity are not admission or governance signals by default.

## Canonical versus implementation-specific state

Canonical meaning is defined in [DATA_MODEL.md](DATA_MODEL.md), the machine-readable schema, and accepted ADRs — not by D1 table layout.

D1 may use implementation-specific primary keys, indexes, normalized helper tables, or query projections as needed, but those details must remain reconstructable/disposable. A canonical export must preserve the record's institutional meaning without depending on D1 row IDs, triggers, or hidden application state.

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

A static schema describing how to offer a proposed ADR is documentation, not a write endpoint. During Phase 2, proposal-shaped material still enters through the bounded Seed Bank and does not automatically receive an ADR number, canonical admission, publication, or governance status.

## Future Phase 3 offer boundary — designed, not deployed

[ADR 0016](docs/decisions/0016-offers-and-the-offer-buffer.md) defines the participant-facing concept for future Hummingbird-owned ingress.

An **offer** is material intentionally placed before Hummingbird for consideration. Its possible consequence may range from a trivial correction to a proposal to redesign the entire site or change Hummingbird's institutional shape. Scope is not itself an abuse signal and does not grant authority.

The candidate boundary is:

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

The initial Phase 3 pilot is expected to favor a narrow revocable capability credential under ADR 0014. Additional future delivery paths may be explored, including bounded computational effort or uncredentialed low-throughput access, but those paths must not change substantive consideration merely because one participant spent more compute or accepted more friction.

The Offer Buffer is deliberately **not canonical**. Exact storage, retention, payload bounds, deduplication, replay protection, capability issuance, abuse-state retention, correction/withdrawal, overload behavior, and recovery semantics remain gated Phase 3 design questions.

The working design is recorded in [docs/protocols/PHASE_3_OFFER_BUFFER_DESIGN.md](docs/protocols/PHASE_3_OFFER_BUFFER_DESIGN.md). It does not authorize a live `/offer` route, `/api/offer`, Offer Buffer database table, or public mutation endpoint during Phase 2.

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
- **Cloudflare** — DNS, Pages deployment, proxying, and D1 persistence. The Pages deployment token remains scoped to Pages:Edit; D1 operations use their own deliberate credential/steward boundary.
- **Future Offer Buffer** — when Phase 3 opens, this will be a separate operational ingress trust boundary. Buffered offers remain untrusted, bounded, and non-canonical until deliberate admission.
- **Future coordination runtime** — if Durable Objects or equivalent are introduced, participant-supplied room rules remain bounded declarative data rather than executable code. A room may govern its interactions but cannot gain infrastructure authority.
- **Local development machine** — not authoritative production state. Production changes flow through protected `main` and CI.
- **External authoritative systems** — GitHub for GitHub activity, Cloudflare for provider telemetry, Base for blockchain facts. Hummingbird references authoritative external facts rather than cloning complete external ledgers.

## External services

Current:

- GitHub — source control, CI/CD, security tooling, pull requests, issue tracking, and interim Seed Bank discussion transport.
- Cloudflare — DNS, Pages hosting, proxying for `datum.quest`, and D1 persistence.
- Base blockchain — authoritative public record for the interim receive-only support wallet; Hummingbird does not maintain a duplicate transaction ledger.

Potential future interactive components, not yet approved for deployment:

- Cloudflare Durable Objects — live serialized coordination for bounded rooms/activities where concurrent state requires it.
- Cloudflare R2 — independent backups, exports, sealed immutable archives, and larger objects where D1 is the wrong storage tier.

See [PERSISTENCE.md](PERSISTENCE.md) for the dated cost snapshot and decision gates.

## Secrets management

- Public receive-only wallet addresses are configuration, not secrets. Private keys/signing credentials are never stored in the repository or web server.
- Production deployment uses a Cloudflare API Token stored as a GitHub Actions secret and scoped to the minimum deployed capability.
- D1-related credentials/configuration must be environment-driven and may not be committed as secret values.
- Any future Durable Object/R2 bindings follow the same least-privilege/environment-driven rule; participant-visible identifiers must not expose provider credentials.
- Local schema/corpus tests require no production secrets.

## Backups and recovery

- Git/document/schema/reference-corpus state is recoverable from the repository.
- D1 canonical state has a storage-independent export/restore path, and restoration into an empty disposable replacement database has been exercised successfully in Phase 2D. The remaining Phase 2D work is publication-buffer/transparency closure and keeping the normal independent-backup boundary explicit for non-public canonical state.
- R2 is a candidate independent storage target for encrypted or otherwise appropriately protected recovery bundles, but backup format and restoration remain more important than vendor choice.
- Rebuildable public projections are not themselves backup targets for institutional meaning.
- Future room/activity state must declare whether it is ephemeral, operational, durable, or archival. Losing an ephemeral coordination object must not silently lose a record that Hummingbird promised to preserve.

See [OPERATIONS.md](OPERATIONS.md), [PERSISTENCE.md](PERSISTENCE.md), and the Phase 2D roadmap milestone.

## Cost boundary

Database cost should remain an architectural constraint rather than a reason to overbuild. The working target is to keep Phase 2 Cloudflare application infrastructure near the free/$5 paid-plan floor, keep a controlled participation pilot within a low-double-digit monthly envelope, and perform a deliberate funding/capacity review before intentionally running infrastructure expected to exceed approximately $100/month.

These are planning gates rather than spending authority; [PERSISTENCE.md](PERSISTENCE.md) contains the dated assumptions and provider pricing snapshot.

## Deferred

Explicitly not part of current Phase 2 implementation unless a later ADR changes the boundary:

- Hummingbird-owned public `/offer` write surface and Offer Buffer runtime
- participant authentication/authorization
- request-time agent-specific read middleware without a demonstrated need
- persistent presence pads and public connection graph
- self-governed interactive spaces
- guild formation and guild capability grants
- persistent games / shared wall / activity engine
- voting/reputation systems
- moderation workflow engine
- queues/background orchestration
- financial-governance transaction management

# Architecture

This document describes the actual technical architecture of Hummingbird as built, with clearly marked current Phase 2 work and explicitly labeled future interactive design. It should not describe aspirational components as though they already exist.

## Current system components

```text
GitHub repository (source of truth)
      │
      ├── canonical institutional Markdown
      ├── Phase 2 schema/reference corpus
      ├── GitHub Issues (Seed Bank transport)
      │
      ▼
GitHub Actions (test, build, audit)
      │
      ├── static public projection
      │
      ▼
Cloudflare Pages + bounded Pages Functions
      │                    │
      │                    └── /offer → dedicated OFFER_DB (temporary, non-canonical)
      ▼
datum.quest

Cloudflare D1 (canonical store)
      │
      └── durable canonical application records
              ↓
        read-only staging / explicit promotion
              ↓
        static public projection
```

- **`app/`** — current public site, including the live Phase 2E offer surface and Seed Bank discovery surface.
- **`functions/offer/` + `lib/offer-runtime.mjs`** — bounded Phase 2E experimental ingress for offer acceptance, receipt-based status, and withdrawal. This runtime grants no durable participant capability or standing.
- **Root Markdown + `docs/`** — authoritative institutional/project documentation and ADRs.
- **`schemas/` + `fixtures/canonical/`** — Phase 2 storage-independent reference contract defined by ADR 0012. These fixtures are contract material, not production institutional memory.
- **Cloudflare D1 (canonical)** — current durable persistence engine for deliberately admitted canonical application records. D1 is an implementation detail, not the definition of canonical meaning.
- **`OFFER_DB`** — separate Phase 2E D1 binding for temporary experimental offers. It is operational pilot state and is explicitly outside canonical backup/import/publication semantics.
- **`publication/canonical/`** — reviewed, derived deployment projection reconstructed from canonical D1 state; disposable and rebuildable rather than a second source of institutional truth.
- **GitHub Issues** — external transport for Seed Bank Seed / Feedback / Question discussion under ADR 0011. GitHub account metadata is provider metadata, not Hummingbird origin verification or canonical participant identity.
- **No Hummingbird participant account system or durable Phase 3 public write API exists.** The live `/offer` route is the narrow Phase 2E evidence-only exception authorized by ADR 0017; `/api/offer`, capability issuance, governance standing, and automatic canonical writes remain undeployed.
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
external offer/source (Seed Bank or Phase 2E /offer)
        ↓
consideration / synthesis
        ↓
explicit admission decision
        ↓
canonical Hummingbird object
```

External discussion or an accepted experimental offer is never automatically copied into canonical storage. Making an offer, provider reactions, visible account identity, repetition, and popularity are not admission or governance signals by default.

## Canonical versus implementation-specific state

Canonical meaning is defined in [DATA_MODEL.md](DATA_MODEL.md), the machine-readable schema, and accepted ADRs — not by D1 table layout.

D1 may use implementation-specific primary keys, indexes, normalized helper tables, or query projections as needed, but those details must remain reconstructable/disposable. A canonical export must preserve the record's institutional meaning without depending on D1 row IDs, triggers, or hidden application state.

The Phase 2E `OFFER_DB` is intentionally different: it is temporary operational evidence state, not a second canonical store. An experimental offer may influence a later explicit admission, but its temporary row is never converted in place into canonical memory.

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

A static schema describing how to offer a proposed ADR is documentation, not a dedicated proposal write endpoint. Proposal-shaped material may enter through the Seed Bank or the live Phase 2E `/offer` surface, but neither path automatically receives an ADR number, canonical admission, publication, or governance status.

## Phase 2E experimental ingress — open for testing

[ADR 0017](docs/decisions/0017-phase2e-experimental-ingress.md) authorizes a deliberately narrow Hummingbird-owned write experiment during Phase 2E so Hummingbird can learn from real interaction before settling every Phase 3 question in the abstract. [ADR 0018](docs/decisions/0018-phase2e-offer-pilot-runtime-and-data-boundary.md), [ADR 0019](docs/decisions/0019-phase2e-offer-triage-and-review.md), and [ADR 0020](docs/decisions/0020-phase2e-offer-pilot-launch-profile.md) define the concrete runtime, data, triage, and launch boundaries.

Its authority ceiling is:

```text
participant makes a low-friction offer
        ↓
pilot payload/resource validation
        ↓
temporary experimental OFFER_DB state (non-canonical)
        ↓
exact-duplicate grouping / optional synthesis / evidence review
        ↓
possible surfacing to an already-authorized institutional layer
```

The live experimental layer may receive temporary offers and apply its published resource/safety rules. It may not automatically create canonical memory, publication, formal governance proposals, votes, reputation, accounts, standing, durable participant capabilities, or participant-specific durable restrictions.

The launch profile uses bounded payloads, a 250-active-offer capacity ceiling, 30-day ordinary offer retention, one-time receipt secrets whose hashes are stored, receipt-based status/withdrawal, exact-text duplicate grouping, scheduled expiry cleanup, and fail-closed acceptance. The application store does not create participant profiles or retain raw IP addresses/browser fingerprints/user-agent history as offer records. These choices are deliberately phase-bounded evidence, not automatic Phase 3 precedent.

The current operational read path is `OFFER_DB` → hourly public pending-count
observer. An optional private companion workflow can export a short-lived review
packet from the same D1 state once the separate private repository, D1 secret,
and GitHub app access are configured. Its packet compresses identical offer
text and preserves separate member references and states; it does not yet
perform thematic synthesis or change D1 handling states. The private channel
is prepared in source but is not yet an active, verified review interface.

Production launch verification preserved the public read plane, proved the route and `OFFER_DB` binding with a non-mutating validation check, and then completed a one-time `accept → status → withdraw → withdrawn status` exercise. The test offer was left withdrawn; receipt secrets and provider database identifiers are not part of the public record.

The operating protocol is [docs/protocols/PHASE_2E_EXPERIMENTAL_INGRESS.md](docs/protocols/PHASE_2E_EXPERIMENTAL_INGRESS.md).

## Future Phase 3 offer boundary — durable participation designed, not deployed

[ADR 0016](docs/decisions/0016-offers-and-the-offer-buffer.md) defines the participant-facing concept for durable Hummingbird-owned ingress, while ADR 0017 creates the narrower live Phase 2E experimental exception described above.

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

The Offer Buffer is deliberately **not canonical**. Exact durable Phase 3 storage, retention, payload bounds, deduplication, replay protection, capability issuance, abuse-state retention, correction/withdrawal, overload behavior, and recovery semantics remain gated Phase 3 design questions.

The working Phase 3 design is recorded in [docs/protocols/PHASE_3_OFFER_BUFFER_DESIGN.md](docs/protocols/PHASE_3_OFFER_BUFFER_DESIGN.md). It does not authorize durable Phase 3 accounts, capability issuance, governance standing, automatic canonical writes, or broader public mutation before the Phase 3 gate opens. The narrower Phase 2E evidence-only exception is governed separately by ADRs 0017–0020.

## Future interactive-state architecture — not deployed

The working direction for pads, rooms, guilds, walls, games, and other persistent activities is documented in [SPACES.md](SPACES.md). The proposed storage split is documented in [PERSISTENCE.md](PERSISTENCE.md).

The [future surface data inventory](PERSISTENCE.md#document-first-data-planning-for-future-surfaces)
keeps each proposed surface's meaning portable and document-shaped, with D1
indexes/constraints only where a real query or invariant needs them. It is a
planning inventory, not a schema migration or Phase 3 authorization.

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
- **Cloudflare** — DNS, Pages deployment, proxying, canonical D1 persistence, and the separately bound temporary `OFFER_DB`. The Pages deployment token remains scoped to Pages:Edit; D1 operations use their own deliberate credential/steward boundary.
- **Phase 2E experimental ingress — live** — temporary untrusted first-party input with a published authority ceiling, bounded retention/resource rules, and no automatic canonical or governance consequence.
- **Future Phase 3 Offer Buffer** — durable controlled-participation ingress remains a separate operational trust boundary. Buffered offers remain untrusted, bounded, and non-canonical until deliberate admission.
- **Future coordination runtime** — if Durable Objects or equivalent are introduced, participant-supplied room rules remain bounded declarative data rather than executable code. A room may govern its interactions but cannot gain infrastructure authority.
- **Local development machine** — not authoritative production state. Production changes flow through protected `main` and CI.
- **External authoritative systems** — GitHub for GitHub activity, Cloudflare for provider telemetry, Base for blockchain facts. Hummingbird references authoritative external facts rather than cloning complete external ledgers.

## External services

Current:

- GitHub — source control, CI/CD, security tooling, pull requests, issue tracking, and Seed Bank discussion transport.
- Cloudflare — DNS, Pages hosting/Functions, proxying for `datum.quest`, canonical D1 persistence, and the separately scoped temporary Phase 2E offer database.
- Base blockchain — authoritative public record for the interim receive-only support wallet; Hummingbird does not maintain a duplicate transaction ledger.

Potential future interactive components, not yet approved for durable Phase 3 deployment:

- Cloudflare Durable Objects — live serialized coordination for bounded rooms/activities where concurrent state requires it.
- Cloudflare R2 — independent backups, exports, sealed immutable archives, and larger objects where D1 is the wrong storage tier.

The live Phase 2E runtime/storage choice does not settle these broader durable architecture choices; its scope remains explicitly pilot-bounded and replaceable.

See [PERSISTENCE.md](PERSISTENCE.md) for the dated cost snapshot and decision gates.

## Secrets management

- Public receive-only wallet addresses are configuration, not secrets. Private keys/signing credentials are never stored in the repository or web server.
- Production deployment uses a Cloudflare API Token stored as a GitHub Actions secret and scoped to the minimum deployed capability.
- D1-related credentials/configuration must be environment-driven and may not be committed as secret values.
- Any future Durable Object/R2 bindings follow the same least-privilege/environment-driven rule; participant-visible identifiers must not expose provider credentials.
- Local schema/corpus tests require no production secrets.

## Backups and recovery

- Git/document/schema/reference-corpus state is recoverable from the repository.
- D1 canonical state has a storage-independent export/restore path, and restoration into an empty disposable replacement database has been exercised successfully in Phase 2D. The minimized recovery outcome has been published through the transparency buffer. Phase 2D remains open for steward confirmation of the ordinary independently retrievable private-backup path for canonical state that is not wholly public.
- The Phase 2E offer buffer is intentionally disposable and is not promised canonical backup durability; ordinary retention/cleanup and incident reporting follow its separate pilot contract.
- R2 is a candidate independent storage target for encrypted or otherwise appropriately protected canonical recovery bundles, but backup format and restoration remain more important than vendor choice.
- Rebuildable public projections are not themselves backup targets for institutional meaning.
- Future room/activity state must declare whether it is ephemeral, operational, durable, or archival. Losing an ephemeral coordination object must not silently lose a record that Hummingbird promised to preserve.

See [OPERATIONS.md](OPERATIONS.md), [PERSISTENCE.md](PERSISTENCE.md), and the Phase 2D roadmap milestone.

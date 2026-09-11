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
      ▼
Cloudflare Pages (static/read-only site)
      │
      ▼
datum.quest
```

- **`app/`** — current public static/read-only site, including the Seed Bank discovery surface.
- **Root Markdown + `docs/`** — authoritative institutional/project documentation and ADRs.
- **`schemas/` + `fixtures/canonical/`** — Phase 2 storage-independent reference contract defined by ADR 0012. These fixtures are contract material, not production institutional memory.
- **GitHub Issues** — temporary external transport for Seed Bank Seed / Feedback / Question discussion under ADR 0011. GitHub account metadata is provider metadata, not Hummingbird origin verification or canonical participant identity.
- **No production application database exists yet.** D1 is Phase 2B work.
- **No Hummingbird-owned public write API or participant account system exists yet.** Those remain Phase 3 concerns.
- **No Durable Objects, public game engine, presence-pad system, or queue/background-worker system exists yet.**

## Phase 2 target flow

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

External discussion is never automatically copied into canonical storage. Submission, provider reactions, visible account identity, and popularity are not admission or governance signals by default.

## Canonical versus implementation-specific state

Canonical meaning is defined in [DATA_MODEL.md](DATA_MODEL.md), the machine-readable schema, and accepted ADRs — not by D1 table layout.

D1 may use implementation-specific primary keys, indexes, normalized helper tables, or query projections as needed, but those details must remain reconstructable/disposable. A canonical export must preserve the record's institutional meaning without depending on D1 row IDs, triggers, or hidden application state.

Derived artifacts such as indexes, caches, summaries, analytics, embeddings, and public projections are non-canonical unless a later decision explicitly says otherwise.

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
- **Cloudflare** — DNS, Pages deployment, and planned D1 persistence. The deployment token is scoped to Pages:Edit; database credentials/configuration must follow least privilege when D1 is introduced.
- **Future coordination runtime** — if Durable Objects or equivalent are introduced, participant-supplied room rules remain bounded declarative data rather than executable code. A room may govern its interactions but cannot gain infrastructure authority.
- **Local development machine** — not authoritative production state. Production changes flow through protected `main` and CI.
- **External authoritative systems** — GitHub for GitHub activity, Cloudflare for provider telemetry, Base for blockchain facts. Hummingbird references authoritative external facts rather than cloning complete external ledgers.

## External services

Current:

- GitHub — source control, CI/CD, security tooling, pull requests, issue tracking, and interim Seed Bank discussion transport.
- Cloudflare — DNS, Pages hosting, and proxying for `datum.quest`.
- Base blockchain — authoritative public record for the interim receive-only support wallet; Hummingbird does not maintain a duplicate transaction ledger.

Planned during Phase 2:

- Cloudflare D1 — first application persistence engine, treated as replaceable infrastructure rather than institutional semantics.

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
- Once D1 exists, Hummingbird will maintain an independent export/restore path and exercise restoration into an empty replacement database before Phase 2 can complete.
- R2 is a candidate independent storage target for encrypted or otherwise appropriately protected recovery bundles, but backup format and restoration remain more important than vendor choice.
- Rebuildable public projections are not themselves backup targets for institutional meaning.
- Future room/activity state must declare whether it is ephemeral, operational, durable, or archival. Losing an ephemeral coordination object must not silently lose a record that Hummingbird promised to preserve.

See [OPERATIONS.md](OPERATIONS.md), [PERSISTENCE.md](PERSISTENCE.md), and the Phase 2D roadmap milestone.

## Cost boundary

Database cost should remain an architectural constraint rather than a reason to overbuild. The working target is to keep Phase 2 Cloudflare application infrastructure near the free/$5 paid-plan floor, keep a controlled participation pilot within a low-double-digit monthly envelope, and perform a deliberate funding/capacity review before intentionally running infrastructure expected to exceed approximately $100/month.

These are planning gates rather than spending authority; [PERSISTENCE.md](PERSISTENCE.md) contains the dated assumptions and provider pricing snapshot.

## Deferred

Explicitly not part of current Phase 2 implementation unless a later ADR changes the boundary:

- Hummingbird-owned public submission API
- participant authentication/authorization
- persistent presence pads and public connection graph
- self-governed interactive spaces
- guild formation and guild capability grants
- persistent games / shared wall / activity engine
- voting/reputation systems
- moderation workflow engine
- queues/background orchestration
- financial-governance transaction management

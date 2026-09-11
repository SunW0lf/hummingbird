# Persistence and Cost Envelope

Status: **working technical plan.** Phase 2 D1 persistence work is active; the interactive-space components described here are future Phase 3+ design and are not yet deployed.

This document answers two separate questions:

1. What state will Hummingbird eventually need to store?
2. What should that cost at hobby, pilot, and early-community scale?

It does not authorize financial expenditure, establish a project treasury, or change the Phase 5 financial-governance boundary.

## Architectural conclusion

Hummingbird does not currently need a large database platform or a generalized event-streaming stack.

The preferred shape is:

```text
Git / canonical documentation
        │
        ├── D1: canonical and durable relational/application state
        │
        ├── Durable Objects: live room/activity coordination
        │
        └── R2: backups, exports, and larger immutable/archive artifacts
```

The important rule is that these provider products are implementation details. Institutional meaning remains portable and versioned.

### Cheap, light, and real

Hummingbird should optimize for three properties at the same time:

- **Cheap:** ordinary public reading should stay on static/cacheable surfaces wherever practical; a page view should not create a database read merely because a database exists.
- **Light:** interactions, telemetry, presence, provider metadata, and request exhaust do not become durable records by default. Persist meaning, not exhaust.
- **Real:** migrations, canonical identifiers, exports, restores, provenance, admission boundaries, and failure behavior must work against actual provider infrastructure rather than existing only as diagrams.

The default cost target for Phase 2 is **$0 incremental monthly application cost** while the Free plan remains comfortably within observed usage. Hummingbird should not introduce complexity merely to preserve zero cost: if a predictable small paid plan later materially improves reliability or removes an operational constraint, paying for it is preferable to architectural contortions.

The static public commons should remain useful when the dynamic persistence layer is degraded or unavailable. Mutation/dependent features should fail before the public read plane wherever technically possible.

## 1. D1 — canonical and durable application state

Cloudflare D1 remains the planned first application database.

D1 should hold data that benefits from relational integrity, queryability, and durable transactional updates, including:

### Phase 2

- canonical objects (`contribution`, `proposal`, `need`, `event`);
- typed relationships;
- publication metadata;
- import/export state needed for deterministic recovery;
- small rebuildable read-model helper tables where justified.

The existing Phase 2B migration and local round-trip work remains the immediate implementation path.

### Future controlled participation

Candidate future tables or equivalent portable record families include:

```text
pads
pad_declarations
pad_continuity_credentials
connections
spaces
space_constitutions
space_memberships
guilds
guild_memberships
grant_requests
grant_votes
grants
activities
activity_participants
activity_events
public_commitments
annotations
wall_epochs
wall_tiles
```

These names are a sizing/design inventory, not a committed schema. **Portable semantics come before authoritative tables.** A migration must not be the first place Hummingbird decides what a pad, guild, connection, grant, space, or activity means.

The intended growth path is:

```text
portable concept
      ↓
reviewed semantic contract + examples
      ↓
D1 durable representation
      ↓
rebuildable public projection
```

Proposals already exist as a v1 canonical family. Later proposal review, amendment, authorization, or decision workflow should be layered on only after those institutional semantics are defined.

Pads should begin as the smallest useful continuity/public-state contract, without requiring an origin category. Connections should be explicit relationship state, not inferred follower graphs. Guilds should be bounded associations with explicit membership and scoped/expiring capabilities rather than a higher participant class or global reputation system.

Durable definitions, memberships, commitments, grants, and meaningful outcomes may belong in D1. High-frequency live coordination should not.

### What should not be written to D1 by default

Do not persist every:

- WebSocket ping;
- presence heartbeat;
- cursor/mouse movement;
- rendered-view event;
- repeated read request;
- bot-classification result;
- IP address or browser/device fingerprint;
- transient room message when the room's constitution does not require durable history.

Those patterns create cost, privacy risk, and institutional clutter without adding durable meaning.

## 2. Durable Objects — live coordination, not institutional memory

Persistent rooms, public games, collaborative walls, and joined pads may eventually need a single serialized place to coordinate concurrent actions. SQLite-backed Cloudflare Durable Objects are the preferred candidate for that role because they are designed for stateful coordination and real-time applications.

A Durable Object may represent one bounded coordination domain such as:

- one active room;
- one chess/game activity;
- one collaborative wall epoch;
- one guild workshop;
- another small state machine requiring ordered actions.

The Durable Object validates actions against the activity/room constitution, resolves concurrent updates, and emits only meaningful state transitions to durable institutional storage when required.

Durable Objects are **not required merely to create pads, guild records, proposals, or ordinary asynchronous participation**. They should be introduced only when real concurrency/serialization needs exist.

### Required design constraint: hibernation

Interactive connections should use WebSocket Hibernation or another scale-to-zero pattern wherever practical.

A WebSocket that keeps an object continuously active can make wall-clock duration the dominant cost even when little useful work occurs. A hibernatable connection allows a room to remain present without paying continuously for idle compute.

Therefore **presence must not require continuously running compute merely to prove that a socket exists.**

## 3. R2 — backup and immutable/archive material

Cloudflare R2 is the preferred candidate for objects that should be durable but do not need to remain hot relational rows.

Likely uses:

- periodic D1 exports/backups;
- recovery bundles;
- sealed wall epochs if their history becomes large;
- compacted activity/event archives;
- larger participant-supplied public artifacts, if Hummingbird later accepts them;
- generated public export bundles.

R2 should not become the only copy of canonical mutable state. Backups must remain independently restorable and checksummed.

For a large append-only activity such as the public wall, D1 can retain the current epoch and searchable/index metadata while older sealed epochs are compacted into immutable R2 objects with stable references and hashes, if the final retention policy permits that representation.

## 4. GitHub — source and institutional text, not the live application database

Git remains authoritative for code, migrations, schemas, documentation, ADRs, and deliberately versioned institutional text.

GitHub Issues remain interim Seed Bank transport under ADR 0011. Provider issue/comment history must not silently become the production application database.

## State classes

Future persistence should distinguish at least four practical classes.

### Ephemeral coordination

Examples: online-presence state, temporary locks, uncommitted room work, anti-replay state.

Target: memory/Durable Object storage with a short TTL where possible. Do not promote to durable history automatically.

### Operational state

Examples: active memberships, room configuration, current game state, connection status, grant-review work in progress.

Target: D1 or Durable Object storage with bounded retention/history appropriate to the function.

### Durable institutional state

Examples: admitted canonical records, accepted decisions, issued guild grants and their rationale, public governance outcomes.

Target: D1 with portable export and independent backup.

### Archival public artifacts

Examples: sealed wall epochs, completed game replays, compacted historical activity bundles.

Target: R2 plus searchable references/indexes in D1 when useful.

The unresolved retention boundary for future activity data is tracked as `OQ-DATA-ACTIVITY-RETENTION`.

## Current Cloudflare pricing snapshot

Pricing below is a planning snapshot checked on **2026-09-11**. Provider pricing can change and must be rechecked before a funding decision.

Official sources:

- Workers: https://developers.cloudflare.com/workers/platform/pricing/
- D1: https://developers.cloudflare.com/d1/platform/pricing/
- D1 limits: https://developers.cloudflare.com/d1/platform/limits/
- Durable Objects: https://developers.cloudflare.com/durable-objects/platform/pricing/
- R2: https://developers.cloudflare.com/r2/pricing/

### Workers

Workers Free currently includes approximately:

- 100,000 Worker requests/day;
- 10 ms CPU time per invocation;
- Pages Functions use the Workers usage model when introduced.

The current static Pages public surface does not need to route every read through a Worker. Keep it that way unless dynamic behavior actually requires one.

Workers Paid currently has a **$5/month account minimum** and includes approximately:

- 10 million Worker requests/month before request overage;
- 30 million CPU milliseconds/month before CPU overage.

Published overage rates at this snapshot are $0.30 per additional million requests and $0.02 per additional million CPU milliseconds.

### D1

Workers Free currently includes:

- 5 million rows read/day;
- 100,000 rows written/day;
- 5 GB total D1 storage across the account;
- up to 10 D1 databases;
- a 500 MB maximum size for each individual Free-plan D1 database;
- 7 days of point-in-time Time Travel recovery.

There is no D1 capacity-hour or idle-compute charge. D1 scales to zero when it is not queried, and there are no D1 egress/throughput charges for data access.

On the Free plan, hitting the daily row-read or row-write limit causes additional D1 queries of that type to fail until the daily reset; it does **not** silently convert into usage charges. Reaching the storage limit prevents further growth until storage is freed or the plan is changed.

Cloudflare currently states that the Workers Free plan will continue to include the ability to prototype and experiment with D1 for free. Treat that as a provider policy statement, not a Hummingbird constitutional dependency.

Workers Paid currently includes:

- first 25 billion rows read/month;
- first 50 million rows written/month;
- first 5 GB storage.

Published paid overage at this snapshot is:

- $0.001 per additional million rows read;
- $1.00 per additional million rows written;
- $0.75 per additional GB-month stored.

Worker compute used to execute application logic is billed separately through Workers.

### Durable Objects

Durable Objects are currently available on both Workers Free and Workers Paid. New Free-plan use is limited to the SQLite storage backend, which is also the preferred backend for new designs.

Workers Free currently includes approximately:

- 100,000 Durable Object billed requests/day;
- 13,000 GB-s/day duration;
- SQLite-backed storage with 5 million rows read/day, 100,000 rows written/day, and 5 GB total stored data.

On Free, exceeding a metered daily limit causes further operations of that type to fail until reset rather than creating an overage bill.

Workers Paid currently includes approximately:

- 1 million Durable Object billed requests/month;
- 400,000 GB-s/month duration;
- SQLite-backed storage with the first 25 billion row reads, 50 million row writes, and 5 GB-month included under the documented allowance.

Published request overage is $0.15/million. Published duration overage is $12.50/million GB-s.

Incoming WebSocket messages currently receive a 20:1 billing ratio for request billing, and outgoing messages are not separately charged as requests. Hibernation is therefore a major design requirement because compute duration, rather than message count, can dominate badly designed real-time systems.

Cloudflare's own paid-plan examples illustrate the difference: a hibernation-based example with 100 Durable Objects and 100 sockets per object sending one message/minute is estimated around $20.65/month including the $5 plan minimum, while a smaller non-hibernating example can exceed $140/month because idle connected time continues to incur duration charges. These examples are illustrative, not Hummingbird forecasts.

### R2

R2 Standard currently includes a monthly free tier of approximately:

- 10 GB-month storage;
- 1 million Class A operations;
- 10 million Class B operations;
- no Internet egress charge.

Published Standard storage beyond the free tier is $0.015/GB-month, with operation charges separate.

This makes R2 substantially more appropriate than D1 for large immutable archives and backup objects.

## Hummingbird planning scenarios

These are budget envelopes, not promises. Actual cost depends heavily on action frequency, query/index design, retention, cache hit rate, WebSocket hibernation, and abuse traffic.

### A. Phase 2 read-only commons

Expected dynamic data is tiny: canonical documents, relationships, and read projections.

**Target infrastructure increment: $0/month.** Remote D1 provisioning, migrations, the bounded canonical corpus, and low-volume steward verification should fit comfortably inside the current Free allowances. Static public reading remains on Pages rather than turning every page view into a Worker/D1 operation.

A paid Workers plan is not required merely to create or use D1 at this stage.

Database cost is not a reason to seek meaningful outside funding for Phase 2.

### B. Controlled-participation pilot — hundreds of active pads/day

Assumptions:

- ordinary reads remain static/cacheable wherever practical;
- simple pad/guild/proposal actions use bounded Worker/D1 operations;
- presence heartbeats are not D1 writes;
- only consequential actions become durable events;
- Durable Objects are introduced only for features requiring live serialized coordination;
- any live rooms use hibernating coordination;
- large/old artifacts move to R2.

**Free-first target:** a modest asynchronous pilot may still fit within $0/month current Free allowances. If daily Workers/D1/DO limits become operationally constraining, the expected first deliberate upgrade is the approximately **$5/month Workers Paid floor**, not a redesign.

**Planning envelope after upgrading:** roughly **$5-$15/month** for Cloudflare application infrastructure is a reasonable early target, with alerts well below the point where overage becomes surprising.

### C. Emerging community — order of 10,000 active pads/day

At this scale, tens of millions of monthly interaction events are possible, but D1's paid included row limits remain large if indexes are good and heartbeats are excluded. Worker request/CPU cost, Durable Object duration, moderation/security tooling, and retained activity volume become more important than simple SQL row reads.

**Planning envelope:** roughly **$10-$50/month** if the architecture stays cache-heavy, hibernating, and retention-disciplined. This number should be replaced with observed usage data before scaling beyond a controlled pilot.

### D. Real-time-heavy or adversarial usage

The main cost hazard is not ordinary canonical storage. It is continuously active real-time compute, unbounded event retention, pathological queries, or abuse designed to create work.

At this point costs can move from tens to hundreds of dollars/month quickly. Hummingbird should not scale this mode by accident.

Required controls before broad writes include:

- Worker CPU limits;
- per-space and per-activity resource budgets;
- rate/concurrency limits based on behavior rather than presumed origin;
- WebSocket hibernation;
- query indexes and row-read monitoring;
- bounded event/annotation payload sizes;
- retention and compaction jobs;
- billing alerts and a monthly hard/soft budget process;
- graceful degradation that preserves public reads when mutation capacity is exhausted.

## Cost-control invariants

The following rules are intended to keep low cost an architectural property rather than a late optimization:

1. **A public page view does not imply a D1 query.** Prefer generated/static/cacheable read projections.
2. **A request does not imply a durable event.** Store consequential institutional changes, not raw traffic.
3. **Presence does not imply a write.** Do not turn heartbeats into permanent database churn.
4. **One action has bounded fan-out.** Payload size, relationships, notifications, derived rows, and storage expansion must be limited.
5. **Indexes earn their existence.** Add indexes for observed query patterns; use them to reduce row scans without speculative index sprawl.
6. **Real-time infrastructure earns its existence.** Do not deploy Durable Objects for ordinary CRUD/asynchronous interaction.
7. **Dynamic failure should not erase public readability.** Free-tier exhaustion or a persistence incident should degrade dynamic/mutation functions before the static commons.
8. **Measure before paying or optimizing.** Use provider usage metrics to decide when a paid plan or architecture change is justified.

## Storage-growth examples

Storage, not query pricing, is likely to be the first long-term database pressure if activity history is allowed to grow without policy.

For intuition:

- 1 million compact activity events averaging 1 KB of logical payload is roughly 1 GB before database/index overhead;
- 10 million small permanent wall tiles can become several GB even when each tile is tiny;
- an always-growing social event stream will eventually exceed the inexpensive D1 storage allowance even if reads remain cheap.

This is why Hummingbird should archive sealed immutable activity to R2 where appropriate and should not declare every interaction durable merely because it can be stored.

## Database design requirements before Phase 3

Before Hummingbird owns public mutation endpoints, the persistence layer should satisfy all of the following:

1. **Portable semantics.** Canonical/exported meaning cannot depend on provider row IDs, hidden triggers, or proprietary state.
2. **Semantic contract before table.** New institutional concepts are defined portably before database migrations make them authoritative.
3. **Clear ownership of truth.** Each fact has one authoritative home; projections/caches remain rebuildable.
4. **No required origin classification.** Pads can function without an origin category.
5. **Consent-aware relationships.** Public pad connections and guild membership require explicit state transitions, not inferred relationships.
6. **Append meaningful events, not telemetry.** Consequential actions are inspectable; raw request exhaust is not institutional history.
7. **Bounded payloads/cardinality.** A single action cannot create unbounded rows, relationships, storage, or fan-out.
8. **Retention is explicit.** Every new table/record family names EPHEMERAL, OPERATIONAL, DURABLE, or an approved archive policy.
9. **Concurrency is serialized where necessary.** Games, walls, votes, and room rules cannot rely on race-prone last-write-wins behavior.
10. **Backup and restore work.** D1 canonical state can be exported and restored independently of the live database.
11. **Cost observability exists before scale.** Row reads/writes, Worker requests/CPU, Durable Object request/duration, and R2 growth have measurable budgets.
12. **Read-plane survival.** Exhausted mutation budgets or interactive-system incidents should degrade writes first; the public read commons should remain available wherever technically possible.

## Suggested budget gates

These are operational planning thresholds, not financial-governance decisions:

- **Phase 2 target:** $0/month incremental application infrastructure while current Free allowances are comfortably sufficient.
- **First upgrade gate:** accept the approximately $5/month Workers Paid floor when Free daily limits create a real reliability/operational constraint; do not add fragile complexity merely to avoid it.
- **Controlled pilot target:** keep recurring application infrastructure at or below approximately $25/month while usage assumptions are validated.
- **Funding review trigger:** perform a deliberate cost/funding review before intentionally operating a design expected to exceed approximately $100/month, or earlier if steward/security labor rather than hosting becomes the limiting resource.

Do not optimize the architecture merely to avoid a small justified bill. A predictable $5 paid plan is preferable to fragile complexity designed to save five dollars.

## Does Hummingbird need seed funding?

**Not for the database itself at the current stage.** D1, Workers, Durable Objects, and R2 provide a substantial Free/hobby-scale runway when the system avoids unnecessary dynamic work and permanent telemetry.

If Hummingbird seeks seed support, the stronger reasons are likely to be:

- independent security review before broad mutation surfaces open;
- steward time and incident response;
- accessibility/usability review;
- legal/organizational advice if the project becomes an institution;
- a modest infrastructure reserve for an unexpected participation spike;
- future project-authorized work after the relevant governance process exists.

An infrastructure-only reserve on the order of **$500-$1,000** would represent many months of early operation under the planning envelopes above. A larger seed amount should therefore be justified primarily by work and governance needs, not by an exaggerated claim that SQL hosting is expensive.

Any future project-controlled funding, budgeting, or authorized expenditure remains subject to Hummingbird's financial-governance boundary and `OQ-PROJECT-LEGAL-STRUCTURE`. The current receive-only support mechanism does not automatically become a project treasury.

## Funding posture

Hummingbird should prefer a transparent runway model:

```text
observed monthly infrastructure cost
+ known committed services
+ approved stewardship/security work
= monthly burn

available authorized reserve / monthly burn
= runway
```

Do not create donation-linked standing, supporter reputation, privileged access, or governance weight.

## Review cadence

Recheck this cost model:

- before creating the remote production D1 database;
- before enabling Hummingbird-owned public writes;
- before deploying Durable Objects for live spaces;
- after the first controlled participation pilot has enough observed usage to replace estimates;
- whenever Cloudflare materially changes pricing or limits.

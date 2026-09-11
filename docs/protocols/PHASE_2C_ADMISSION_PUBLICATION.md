# Phase 2C Protocol — Admission and Static Publication

Status: **complete — exit criteria satisfied 2026-09-11**

This protocol implemented the first Phase 2C slice under ADR 0014. It deliberately did not create a public application-owned write endpoint.

## Goal

Prove that one deliberately admitted canonical record can move through Hummingbird's persistence layer into a rebuildable public read model without collapsing submission, admission, publication, or governance into one action.

The proven path is:

```text
external source / Seed Bank item
        ↓
manual consideration or synthesis
        ↓
canonical record admitted to D1 as draft
        ↓
explicit publication decision
        ↓
read-only local staging from D1
        ↓
steward review
        ↓
explicit promotion to deployable projection
        ↓
protected-main CI/deploy
        ↓
static HTML + JSON at datum.quest
```

## Boundaries

Phase 2C keeps these operations distinct:

- **submission** — an external offer exists;
- **admission** — Hummingbird deliberately creates durable canonical memory;
- **publication** — Hummingbird deliberately exposes a canonical record on the public read plane;
- **governance approval** — not implied by any of the above.

The Seed Bank remains external transport. Provider identity, reactions, labels, issue timestamps, and discussion metadata do not become canonical merely because an item is considered.

## Safety posture

- Public `GET`/`HEAD` remains open under ADR 0013.
- No public Hummingbird mutation endpoint exists in this slice.
- D1 remains canonical persistence; the public projection is derived and disposable.
- Public page views do not require a D1 query.
- Ordinary CI does not require remote D1 access or credentials.
- Steward/control-plane actions may require Cloudflare/GitHub authentication and are not part of the origin-neutral public read plane.
- No participant-origin classification is introduced.

## Publication projection

The repository contains a derived publication source under `publication/canonical/`. Records present there are **not** a second source of institutional truth. They are a reviewed deployment projection copied from canonical D1 state.

The build renders each projected record to:

```text
/records/<encoded-canonical-id>.html
/records/<encoded-canonical-id>.json
```

Cloudflare Pages exposes the generated HTML through clean public routes such as:

```text
/records
/records/<encoded-canonical-id>
```

The machine index is published at:

```text
/records/index.json
```

The JSON detail representation is the projected canonical record. The HTML route is a safe, static human-readable rendering of the same record.

Draft records must never enter the public projection. The renderer fails closed if a projected record has `state: draft`, an unsupported v1 type/state, an unsafe/empty identifier, malformed relationships, or duplicate canonical IDs.

### Publication-state decision

A durable canonical draft becomes eligible for the public projection only through a separate, explicit steward action:

```powershell
node scripts/mark-published-d1.js <canonical-id> --confirm-publication-decision
```

The tool only accepts an existing `draft` record with no prior publication metadata and changes that record to `state: published` with public-release metadata. It does not stage, promote, commit, deploy, or create a public route. Therefore a publication-state decision remains distinct from public deployment.

### Staging from remote D1

After a canonical record has independently been made publishable, the steward can reconstruct the current non-draft canonical set from remote D1 without modifying either D1 or the Git working tree's deployable projection:

```powershell
node scripts/stage-public-d1.js
```

This writes only to the ignored local directory:

```text
.hummingbird-stage/
```

### Explicit promotion

Promotion from reviewed local staging into the deployable derived projection requires an explicit confirmation flag:

```powershell
node scripts/promote-publication.js --confirm-publication
```

The promotion tool refuses draft records and refuses to silently remove a record that was already present in the deployable projection. It changes only repository working-tree files under `publication/canonical/`; the change still requires normal Git review, protected-main CI, and deployment before it becomes public.

This means none of the following actions alone publishes a record:

- external submission;
- canonical admission;
- existence in D1;
- changing canonical state to `published`;
- running the read-only staging command.

## First admission and publication evidence — 2026-09-11

The first durable real canonical admission used the existing public Seed Bank #15 exploratory comment, “Visible consequence without engagement pressure,” as the external source.

The reviewed candidate was `contribution-visible-consequence`. It retained the admitted idea and one stable public source reference while omitting GitHub account identity, reactions, labels, app metadata, source/network metadata, and other provider state. Offline candidate validation passed before any remote action.

The steward deliberately executed the guarded admission command with `--confirm-admission`. Post-write verification reported the record present in remote D1 as `state: draft`; no publication projection changed and no governance status was granted.

A separate guarded publication decision then changed the canonical record to `state: published` with public-release metadata without deploying it. The read-only staging tool reconstructed that non-draft record from remote D1 into the ignored local staging area, where the steward inspected the exact canonical JSON.

After review, the same staged canonical representation was promoted into the derived Git publication projection and passed protected-main build/tests. Cloudflare Pages deployed the generated static read model.

The production plain-HTTP healthcheck then successfully retrieved all of the following without authentication, cookies, JavaScript execution, or an interactive challenge:

```text
/records
/records/contribution-visible-consequence
/records/contribution-visible-consequence.json
```

The HTML routes returned the expected canonical title and the JSON route returned the expected canonical ID with `application/json`. Public reads are static at request time and do not query D1.

The projection was created from a read-only reconstruction of canonical D1 state rather than hand-authored institutional meaning. Because the deployable copy is derived from that reconstruction and can be regenerated by the same staging/promotion path, deletion of the derived copy does not destroy canonical institutional meaning.

## Rollback and correction

A bad projection is not repaired by hand-editing the generated public copy. Correct canonical state first, rebuild the projection, and redeploy.

A record that has already been published should normally transition through the existing canonical lifecycle (`corrected`, `superseded`, `withdrawn`, or `archived`) rather than disappearing silently. Phase 2C preserves public historical meaning while still allowing security/legal emergencies to use the incident process when needed.

## Exit criteria

All Phase 2C exit criteria were satisfied on 2026-09-11:

- an external-source → explicit-admission path is documented;
- the admitted record is durable canonical D1 state;
- publication is a separate explicit action;
- public HTML and JSON projections are rebuildable from canonical state;
- public readers do not query D1 directly;
- a plain HTTP client retrieved and traversed the published record;
- provider identity/reaction/thread metadata was not automatically ingested;
- the derived projection can be regenerated without losing institutional meaning.

Phase 2C is closed. The next Phase 2 milestone is **Phase 2D — Publication buffer, backup, and recovery**.

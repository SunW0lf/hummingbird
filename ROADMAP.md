# Roadmap

Phases are sequential by design. Later phases are not commitments — they are planned or experimental until actually underway.

## Phase 0 — Foundation (complete)

Status: **complete** — verified against this checklist and closed out; see [CHANGELOG.md](CHANGELOG.md).

- Local and GitHub repository
- Documentation skeleton
- Minimal static application skeleton
- CI (consistency checks, tests, build, dependency audit)
- Deployment scripts and server/DNS connection
- HTTPS on `datum.quest`
- Backup/restore process (trivial until a database exists)
- Health checks

## Phase 1 — Public Charter Site (complete)

Status: **complete** — public surfaces are live and the public-repository security baseline has been activated and verified to the extent exposed by GitHub, with remaining repository-setting controls explicitly confirmed by the steward on 2026-09-10 (Pacific Time).

Publishing a Charter Candidate (C1) is a distinct governance action, not automatic upon phase completion — see [GOVERNANCE.md](GOVERNANCE.md).

The repository is public. `main` is protected with required `Checks, test, build` and enforcement for everyone including the steward/admin. Repository Actions are restricted and full-length SHA pinning is required. GitHub private vulnerability reporting, secret scanning/push protection, Dependabot security controls, and CodeQL default setup are enabled.

No Hummingbird-owned participant accounts, voting, application-managed payments, financial-governance workflows, reputation, moderation, AI orchestration, feeds, or chat were added in Phase 1. An interim personal-steward voluntary support address remains a narrowly scoped exception to "no payments" — it confers no standing and is not Phase 5.

## Phase 2 — Read-Only Commons

Status: **in progress**

The Phase 2 data-model, workflow-state, retention, and operational-transparency entry gates are resolved in [DATA_MODEL.md](DATA_MODEL.md), [SECURITY.md](SECURITY.md), [TRANSPARENCY.md](TRANSPARENCY.md), and [ADR 0010](docs/decisions/0010-phase2-read-only-commons-contract.md).

Phase 2 implements public read-only representations of contributions, proposals, needs, relationships, minimal events, statuses, and transparency records. Cloudflare D1 is the first persistence engine, while canonical record meaning remains portable and storage-independent.

Phase 2 does **not** accept Hummingbird-owned public offers through an application write surface. A narrow interim exception is the **Seed Bank**, defined by [ADR 0011](docs/decisions/0011-interim-seed-bank.md), using GitHub as external provider-hosted discussion transport without automatically creating canonical records or governance weight.

### Phase 2A — Canonical contract and reference corpus

Status: **complete**

Completed in PR #26. See [ADR 0012](docs/decisions/0012-reference-corpus-before-persistence.md).

- Machine-readable v1 canonical-object schema exists.
- Deterministic reference corpus covers contribution, proposal, need, event, lifecycle state, typed relationships, provenance, and publication metadata.
- CI validates the corpus without participant identity/origin or database-provider fields.
- Portable `{type, target_ref}` relationships are defined and local fixture references resolve.

**Exit satisfied:** the reference corpus passes CI and is the required round-trip input for persistence work.

### Phase 2B — Persistence and deterministic import

Status: **complete**

Phase 2B proved the same portable canonical contract through both isolated local D1 and the real remote Cloudflare D1 database.

Completed evidence:

- the first versioned D1 migration is repository-controlled;
- deterministic seed generation uses the storage-independent reference corpus;
- the local Wrangler D1 test reconstructs all four reference records and deep-compares them without semantic loss;
- the remote D1 database was provisioned separately from the public Pages deployment credential and bound by provider ID without making that ID canonical meaning;
- `0001_canonical_v1.sql` was applied through Wrangler migration history rather than dashboard-only schema edits;
- the remote verifier loaded the bounded four-record corpus, reconstructed canonical JSON, deep-compared it with the source fixtures, and cleaned the verification records back to an empty canonical database;
- ordinary pull-request CI remains local/deterministic and does not depend on remote Cloudflare credentials or state.

See [docs/protocols/PHASE_2B_REMOTE_D1.md](docs/protocols/PHASE_2B_REMOTE_D1.md) for the execution protocol and recorded evidence.

The broader persistence architecture and dated cost envelope are documented in [PERSISTENCE.md](PERSISTENCE.md). Future Durable Objects/R2 use remains out of scope until a later capability actually requires it.

**Exit satisfied:** an empty database can be migrated and populated deterministically from storage-independent input, and canonical records can be exported without loss of institutional meaning. Remote-provider configuration is reproducible without making undocumented dashboard state part of canonical correctness.

### Phase 2C — Public read model and admission boundary

Status: **complete**

Completed on 2026-09-11 under [ADR 0014](docs/decisions/0014-progressive-capability-rollout.md) and the [Phase 2C protocol](docs/protocols/PHASE_2C_ADMISSION_PUBLICATION.md).

Phase 2C proved the complete boundary rather than merely implementing static pages:

- public reading remains open while admission/publication/control remain explicit and narrow;
- the Seed Bank remains external ingress rather than automatic canonical ingestion;
- `contribution-visible-consequence` was synthesized from a public Seed Bank contribution with only minimal provenance and without provider account identity, reactions, labels, app metadata, or network/device metadata;
- the record was deliberately admitted to remote D1 as `draft` without publication or governance status;
- a separate guarded action changed canonical state to `published` without deploying it;
- the read-only staging tool reconstructed the record from canonical D1 state into ignored local staging;
- the steward inspected the staged record before promotion;
- the derived Git projection was promoted through protected `main`, CI, and Cloudflare Pages deployment;
- `/records`, the clean record-detail route, and the canonical JSON route are now tested by the production plain-HTTP healthcheck;
- public page views are static at request time and do not query D1;
- the derived projection is disposable and can be regenerated from canonical state.

**Exit satisfied:** public projections are rebuildable from canonical records and the deliberate offer/source → admission → publication path is traceable without treating ingress as publication or governance approval.

### Phase 2D — Publication buffer, backup, and recovery

Status: **in progress**

Phase 2D now focuses on durability and safe operational transparency rather than adding new participation features.

Completed foundation in the current slice:

- replaced the original Phase 0 backup/restore no-ops with a portable canonical backup bundle and guarded restore tooling;
- defined the backup format as storage-independent canonical JSON plus SHA-256 record/bundle verification rather than a provider-only database snapshot;
- added local CI recovery proof: export from one migrated local D1, verify the bundle, restore into a separately migrated empty D1, reconstruct canonical state, and deep-compare semantic equality;
- restore refuses non-empty targets and remote restore remains deliberately disabled until a disposable recovery database is provisioned;
- documented the recovery order, independent-storage requirement, and low-write recovery-point rule in [docs/protocols/PHASE_2D_RECOVERY.md](docs/protocols/PHASE_2D_RECOVERY.md);
- corrected stale operational/transparency documentation that still described Hummingbird as having no production database.

Remaining work:

- run the read-only portable backup exporter against current production D1 and independently retain/verify the resulting bundle;
- provision an empty disposable replacement D1 database and apply repository-controlled migrations;
- restore the verified production bundle there and prove semantic equivalence;
- rebuild the public read projection from restored state and compare it with expected publication output;
- define and exercise publication-buffer boundaries for delayed/coarsened public operational records, using the recovery drill as a candidate material event;
- document failure behavior, recovery observations, and the smallest acceptable recovery point;
- extend health/operational checks only where they prove real recovery properties rather than accumulating telemetry.

**Exit:** backup and restore have been exercised successfully against current production canonical state through an isolated replacement database, canonical/read-model equivalence is demonstrated after recovery, and public transparency does not expose security-sensitive or unnecessary correlation metadata.

### Phase 2E — Phase review and Phase 3 gate

Status: **planned**

- Review the Seed Bank experiment and document what it taught about participation, moderation, provider dependence, and abuse controls.
- Resolve or deliberately defer the Phase 2 review-gate questions for steward scope, non-technical decision process, steward succession, incident response, monitoring cadence, and deployment-token rotation.
- Confirm every Phase 3 blocking question has a substantive decision rather than an implementation accident.
- Review [ADR 0016](docs/decisions/0016-offers-and-the-offer-buffer.md) and the [Phase 3 Offer Buffer working design](docs/protocols/PHASE_3_OFFER_BUFFER_DESIGN.md) against the resolved Phase 3 rights, governance, security, and runtime decisions before implementation begins.

**Phase 2 completion requires all of the following:**

1. migrations reproduce the persistence layer from empty state;
2. canonical reference/import data round-trips without loss of meaning;
3. public projections are rebuildable and require no participant origin classification;
4. the external-ingress → deliberate-admission boundary is demonstrated;
5. publication-buffer behavior is tested;
6. backup and restore are documented and exercised;
7. no secret/security-sensitive fields are exposed by the public read model;
8. Phase 2 review-gate decisions are recorded or explicitly deferred with rationale.

## Phase 3 — Controlled Participation

Status: **planned — offer architecture documented, gate not yet open**

Phase 3 begins with a narrow capability pilot rather than a private read beta or broad account registration. Public reading remains open.

The participant-facing concept is an **offer**, defined by [ADR 0016](docs/decisions/0016-offers-and-the-offer-buffer.md). An offer may be small or foundational: it may correct a sentence, add evidence, challenge an ADR, propose a space, recommend a governance change through the appropriate process, or argue that Hummingbird itself should substantially change. Broad possible consequence does not grant authority merely because the offer was made.

The intended boundary is:

```text
make an offer
    ↓
choose an offer delivery option
    ↓
Offer Buffer (bounded, operational, non-canonical)
    ↓
consideration / synthesis
    ↓
optional explicit admission
    ↓
canonical memory
    ↓
optional publication
```

The first Hummingbird-owned write pilot should grant only a bounded, revocable **offer-making capability** with payload bounds, rate/resource limits, schema validation, replay/duplicate controls, and no implied publication, canonical admission, moderation, treasury, or governance authority. See [ADR 0014](docs/decisions/0014-progressive-capability-rollout.md) and the [Offer Buffer working design](docs/protocols/PHASE_3_OFFER_BUFFER_DESIGN.md).

Future broader access may offer multiple **offer delivery options**. Those options may regulate throughput or resource cost, but they must not be assigned to presumed participant-origin categories and must not become hidden content priority, trust/reputation, or governance weight. An accessible uncredentialed path should remain part of the broader design once participation expands beyond the initial controlled pilot.

The Seed Bank concept will be reviewed and may be replaced or supplemented by Hummingbird-owned offer-making once the controlled write path is ready.

Entry into Phase 3 remains blocked by the constitutional, governance, architecture, and security questions listed in the Open Questions Registry. A working Phase 2 database or accepted Offer Buffer design is not permission to bypass those decisions.

### Future participatory-space track — after basic controlled participation

The ideas in [SPACES.md](SPACES.md) are preserved now so Phase 3 does not accidentally design itself into an account/feed model, but they are **not** a promise to build all of them during Phase 3.

Candidate experiments, in increasing order of governance/security complexity, include:

1. optional presence pads and a simple public activity with bounded actions;
2. a persistent/sealed mosaic wall and one persistent turn-based game such as chess;
3. public mutual pad connections and temporary joined work surfaces;
4. scheduled spaces that open/close and execute bounded declarative local rules;
5. durable guild formation;
6. scoped, expiring guild capability grants such as extended shared-space retention.

A game/wall experiment should favor visible explanation, uncertainty, prediction, revision, coordination, and other consequential interaction rather than global participant scores or leaderboards.

Self-governed spaces and resource-amplifying guild capabilities remain blocked by their specifically registered open questions even if simpler Phase 3 offer-making already exists.

## Phase 4 — Governance Workflows

Status: **deferred**

Proposals, reviews, validated needs, disputes, decisions, fulfillment tracking.

Future guild-grant review may eventually reuse Phase 4 governance primitives, but a guild is not a higher participant class and a grant is not transferable personal standing.

## Phase 5 — Financial Support

Status: **deferred**

Donations, validated expenditures, steward compensation where appropriate, public aggregate financial transparency. Donation must never automatically grant influence. Only begins after the needs process (Phase 4) is functioning.

The infrastructure cost analysis in [PERSISTENCE.md](PERSISTENCE.md) is planning information only; it does not create a treasury, authorize spending, or move financial governance forward in the roadmap.

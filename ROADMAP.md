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

Phase 2 implements public read-only representations of contributions, proposals, needs, relationships, minimal events, statuses, and transparency records. Cloudflare D1 is the planned first persistence engine, while canonical record meaning remains portable and storage-independent.

Phase 2 does **not** accept application-owned public submissions. A narrow interim exception is the **Seed Bank**, defined by [ADR 0011](docs/decisions/0011-interim-seed-bank.md), using GitHub as external provider-hosted discussion transport without automatically creating canonical records or governance weight.

### Phase 2A — Canonical contract and reference corpus

Status: **complete**

Completed in PR #26. See [ADR 0012](docs/decisions/0012-reference-corpus-before-persistence.md).

- Machine-readable v1 canonical-object schema exists.
- Deterministic reference corpus covers contribution, proposal, need, event, lifecycle state, typed relationships, provenance, and publication metadata.
- CI validates the corpus without participant identity/origin or database-provider fields.
- Portable `{type, target_ref}` relationships are defined and local fixture references resolve.

**Exit satisfied:** the reference corpus passes CI and is the required round-trip input for persistence work.

### Phase 2B — Persistence and deterministic import

Status: **in progress**

The local-only substep is now implemented: the repository contains the first versioned D1 migration, deterministic reference-corpus seed generation, and a Wrangler local-D1 round-trip test that reconstructs all four reference records and checks deep equality without semantic loss.

That local test remains the authoritative CI contract. The next execution slice is **remote D1 provisioning and reconstruction verification**, not public writes. See [docs/protocols/PHASE_2B_REMOTE_D1.md](docs/protocols/PHASE_2B_REMOTE_D1.md).

Immediate next steps:

- provision an empty remote Cloudflare D1 database without attaching a public mutation surface;
- keep the existing Pages deployment credential narrow and use a separate least-privilege D1 provisioning/automation credential if remote automation is needed;
- bind the remote database identifier without making provider IDs part of canonical meaning;
- apply repository-controlled migrations from empty state;
- load the bounded reference corpus through the deterministic import path;
- export/reconstruct canonical records from remote D1 and compare them with the storage-independent corpus;
- keep ordinary pull-request CI local and deterministic rather than dependent on remote Cloudflare state;
- document the successful remote reconstruction before moving into Phase 2C.

The broader persistence architecture and dated cost envelope are documented in [PERSISTENCE.md](PERSISTENCE.md). Future Durable Objects/R2 use is explicitly not part of this Phase 2B D1 milestone unless a later decision says otherwise.

**Exit:** an empty database can be migrated and populated deterministically from storage-independent input, and canonical records can be exported without loss of institutional meaning. Remote-provider configuration must be reproducible enough that undocumented dashboard state is not required for correctness.

### Phase 2C — Public read model and admission boundary

Status: **planned**

- Publish rebuildable read-only projections and stable object/detail routes.
- Provide machine-readable public representations alongside human-readable views where useful.
- Demonstrate at least one explicit external-source → consideration → canonical-admission path without automatically ingesting provider identity, reactions, or thread metadata.
- Preserve external authoritative references rather than cloning provider-owned history.

**Exit:** public projections can be rebuilt from canonical records and a deliberate admission can be traced without treating submission as publication.

### Phase 2D — Publication buffer, backup, and recovery

Status: **planned**

- Implement publication-buffer boundaries for delayed/coarsened public operational records.
- Add D1 backup/export procedures to a storage location independent of the live database.
- Restore into an empty replacement database and verify canonical/read-model equivalence.
- Add appropriate health checks and operational documentation.

**Exit:** backup and restore have been exercised successfully and public transparency does not expose security-sensitive or unnecessary correlation metadata.

### Phase 2E — Phase review and Phase 3 gate

Status: **planned**

- Review the Seed Bank experiment and document what it taught about participation, moderation, provider dependence, and abuse controls.
- Resolve or deliberately defer the Phase 2 review-gate questions for steward scope, non-technical decision process, steward succession, incident response, monitoring cadence, and deployment-token rotation.
- Confirm every Phase 3 blocking question has a substantive decision rather than an implementation accident.

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

Status: **planned**

Contribution form, proposal form, amendment form, challenge/report form, API participation. Rate limits and abuse controls added before broadly opening submission. Phase 3 will revisit whether the Seed Bank concept remains useful and, if so, replace or supplement GitHub transport with Hummingbird-owned participation.

Entry into Phase 3 remains blocked by the constitutional, governance, architecture, and security questions listed in the Open Questions Registry. A working Phase 2 database is not permission to bypass those decisions.

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

Self-governed spaces and resource-amplifying guild capabilities remain blocked by their specifically registered open questions even if simpler Phase 3 submission endpoints already exist.

## Phase 4 — Governance Workflows

Status: **deferred**

Proposals, reviews, validated needs, disputes, decisions, fulfillment tracking.

Future guild-grant review may eventually reuse Phase 4 governance primitives, but a guild is not a higher participant class and a grant is not transferable personal standing.

## Phase 5 — Financial Support

Status: **deferred**

Donations, validated expenditures, steward compensation where appropriate, public aggregate financial transparency. Donation must never automatically grant influence. Only begins after the needs process (Phase 4) is functioning.

The infrastructure cost analysis in [PERSISTENCE.md](PERSISTENCE.md) is planning information only; it does not create a treasury, authorize spending, or move financial governance forward in the roadmap.

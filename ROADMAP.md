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

Published surfaces include Home, Mission, Charter (working draft, C0), Governance, Roadmap, How It Works, Transparency, Changelog, Contributing, Open Questions, Seed Bank, Security/Contact, and Support. Publishing a Charter Candidate (C1) is a distinct governance action, not automatic upon phase completion — see [GOVERNANCE.md](GOVERNANCE.md).

The repository is public. `main` is protected with required `Checks, test, build` and enforcement for everyone including the steward/admin. Repository Actions are restricted and full-length SHA pinning is required. GitHub private vulnerability reporting, secret scanning/push protection, Dependabot security controls, and CodeQL default setup are enabled; CodeQL execution has been independently observed succeeding on `main`.

No Hummingbird-owned participant accounts, voting, application-managed payments, financial-governance workflows, reputation, moderation, AI orchestration, feeds, or chat were added in Phase 1. An interim personal-steward voluntary support address (see [ADR 0008](docs/decisions/0008-interim-steward-support-wallet.md)) remains a deliberate, narrowly scoped exception to "no payments" — it confers no standing and is not Phase 5.

## Phase 2 — Read-Only Commons

Status: **in progress**

The Phase 2 data-model, workflow-state, retention, and operational-transparency entry gates are resolved in [DATA_MODEL.md](DATA_MODEL.md), [SECURITY.md](SECURITY.md), [TRANSPARENCY.md](TRANSPARENCY.md), and [ADR 0010](docs/decisions/0010-phase2-read-only-commons-contract.md).

Phase 2 implements public read-only representations of contributions, proposals, needs, relationships, minimal events, statuses, and transparency records. Cloudflare D1 is the planned first persistence engine, while canonical record meaning remains portable and storage-independent.

Phase 2 does **not** accept application-owned public submissions. Records may be deliberately admitted/imported by the steward from public project material while the read model, storage, backup, and publication-buffer behavior are tested.

A narrow interim exception is the **Seed Bank**, defined by [ADR 0011](docs/decisions/0011-interim-seed-bank.md). The production Hummingbird site remains read-only while public Seed, Feedback, and Question discussions use GitHub issues as an external provider-hosted channel. Those issues, comments, identities, and reactions are not automatically canonical Hummingbird records, governance decisions, votes, or admission into another Hummingbird space.

### Phase 2A — Canonical contract and reference corpus

Status: **in progress**

Before production persistence, prove the record model independently of a database. See [ADR 0012](docs/decisions/0012-reference-corpus-before-persistence.md).

- Maintain a machine-readable v1 canonical-object schema.
- Maintain a small deterministic reference corpus covering contribution, proposal, need, event, lifecycle state, typed relationships, provenance, and publication metadata.
- Validate the corpus in CI without requiring participant identity/origin fields or database-provider fields.
- Define the portable relationship shape and verify local references resolve.

**Exit:** the reference corpus passes CI and can serve as the required round-trip input for persistence work.

### Phase 2B — Persistence and deterministic import

Status: **planned**

- Provision/configure Cloudflare D1 without placing credentials in the repository.
- Add versioned migrations for canonical documents, minimal events, and typed relationships.
- Add a deterministic import path for the reference corpus and later deliberately admitted seed material.
- Demonstrate that D1 row/storage details are not required to reconstruct equivalent canonical records.

**Exit:** an empty database can be migrated and populated deterministically from storage-independent input, and canonical records can be exported without loss of institutional meaning.

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

## Phase 4 — Governance Workflows

Status: **deferred**

Proposals, reviews, validated needs, disputes, decisions, fulfillment tracking.

## Phase 5 — Financial Support

Status: **deferred**

Donations, validated expenditures, steward compensation where appropriate, public aggregate financial transparency. Donation must never automatically grant influence. Only begins after the needs process (Phase 4) is functioning.

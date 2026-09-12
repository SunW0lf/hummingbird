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

Phase 2 generally keeps public mutation authority outside the Hummingbird application. The **Seed Bank**, defined by [ADR 0011](docs/decisions/0011-interim-seed-bank.md), remains an external provider-hosted discussion path without automatically creating canonical records or governance weight. During Phase 2E, [ADR 0017](docs/decisions/0017-phase2e-experimental-ingress.md) authorizes one narrower first-party exception: temporary, non-canonical experimental ingress whose authority ends at evidence gathering and does not open Phase 3.

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

Status: **in progress — recovery and publication-buffer proof complete; ordinary independent-backup checkpoint remains**

Phase 2D focuses on durability and safe operational transparency rather than adding new participation features.

Completed evidence:

- replaced the original Phase 0 backup/restore no-ops with a portable canonical backup bundle and guarded restore tooling;
- defined the backup format as storage-independent canonical JSON plus SHA-256 record/bundle verification rather than a provider-only database snapshot;
- added local CI recovery proof: export from one migrated local D1, verify the bundle, restore into a separately migrated empty D1, reconstruct canonical state, and deep-compare semantic equality;
- restore refuses non-empty targets and the general-purpose restore command does not write to remote D1;
- documented the recovery order, independent-storage requirement, and low-write recovery-point rule in [docs/protocols/PHASE_2D_RECOVERY.md](docs/protocols/PHASE_2D_RECOVERY.md);
- corrected stale operational/transparency documentation that still described Hummingbird as having no production database;
- executed the guarded production-state recovery drill against current remote D1 using read-only production access and a separate account-owned recovery credential;
- created and migrated a disposable replacement D1 database, restored the verified portable canonical bundle, and proved deep semantic equality after restore;
- rebuilt the public canonical projection from recovered state and byte-compared the machine-readable projection with the expected publication output;
- cleaned up the disposable recovery database after the exercise;
- retained the pre-success failure observations because they demonstrate fail-closed behavior before production mutation;
- emitted the narrowly permitted 30-day public-equivalent backup artifact only after proving the production canonical set exactly matched already-public `publication/canonical` state;
- released the compact material operational record of the recovery exercise in [TRANSPARENCY.md](TRANSPARENCY.md), preserving the consequential outcome while omitting credentials, provider database identifiers, exact request timing, source/network metadata, raw telemetry, and unnecessary infrastructure detail.

Remaining work:

- confirm the ordinary independent-storage path for future backups when canonical state includes drafts or otherwise non-public records, since public GitHub artifacts are only allowed for the bounded public-equivalent exercise;
- mark the milestone complete only after that ordinary independent-backup checkpoint is steward-confirmed;
- hand off cleanly to Phase 2E review rather than using recovery success as an implicit Phase 3 authorization.

**Exit:** backup and restore have been exercised successfully against current production canonical state through an isolated replacement database, canonical/read-model equivalence has been demonstrated after recovery, and the minimized recovery outcome has crossed the publication-buffer/transparency boundary. Phase 2D remains open only until the normal independent-backup rule is operationally clear.

### Phase 2E — Phase review and Phase 3 gate

Status: **in progress — review/gate plus bounded experimental ingress; Phase 3 remains blocked**

The evidence review, complete open-question inventory, recommended decision order, and Offer Buffer assumption audit are prepared in [docs/reviews/PHASE_2_EVIDENCE_AND_GATE_REVIEW.md](docs/reviews/PHASE_2_EVIDENCE_AND_GATE_REVIEW.md). That review records evidence and dependencies; it does not itself answer an open question or authorize Phase 3.

Phase 2E also includes a deliberately narrow evidence-gathering ingress track under [ADR 0017](docs/decisions/0017-phase2e-experimental-ingress.md). The purpose is to learn from real participation before attempting to settle every unresolved question in the abstract. This track does not create durable participant authority and is not Phase 3.

#### Phase 2E.1 — Evidence and Phase 2 review

- Verify Phase 2A–2D evidence and close factual documentation gaps.
- Complete the Phase 2D ordinary independent-backup checkpoint.
- Review the Seed Bank experiment and document what it taught—and did not establish—about participation, moderation, provider dependence, abuse, metadata, and friction.
- Resolve or deliberately defer with rationale the remaining Phase 2 review-gate questions for steward succession, incident response, monitoring cadence, and deployment-token rotation. The C0 non-technical decision process and steward scope are already resolved in [GOVERNANCE.md](GOVERNANCE.md).

#### Phase 2E.P — Experimental ingress pilot

Status: **authorized design — not yet deployed**

The [Phase 2E experimental ingress protocol](docs/protocols/PHASE_2E_EXPERIMENTAL_INGRESS.md) defines the authority ceiling and pre-deployment requirements.

The pilot may proceed before all Phase 3 blockers are resolved because its authority ends at temporary non-canonical evidence gathering. It must not be expanded into durable controlled participation by implementation drift.

The intended participant surface is deliberately low-friction:

- one primary text field plus an optional reference;
- no account or required handle;
- no origin declaration;
- no CAPTCHA or proof-of-human requirement;
- no JavaScript requirement for basic use;
- a clear acknowledgement/receipt whose semantics do not imply identity, canonical status, or standing.

Before the pilot goes live, publish and test its concrete handling contract, including payload limits, retention, minimal abuse/rate-limit state, duplicate/replay handling, overload behavior, acknowledgement semantics, correction/withdrawal behavior if any, incident/shutdown behavior, buffer recovery expectations, and runtime/storage boundary.

Once live, the public front door should act as a truthful funnel:

1. **the project** — what exists and what principles already apply;
2. **the plan** — where Hummingbird is headed and what remains intentionally unresolved;
3. **open now** — the specific interaction available for input and testing.

Public status labels should distinguish **exists now**, **open for testing**, and **planned**. The first-party offer surface becomes the primary participation call to action only after it is actually deployed. The Seed Bank may remain as a higher-friction durable public discussion/archive path.

Evidence from the pilot may inform unresolved questions. Volume or repetition is evidence of salience, not a vote or automatic governance weight.

#### Phase 2E.2 — Constitutional and governance decisions

- Resolve only the participant-rights, exclusion, participation-conditions, emergency-authority, and governance-proposal questions necessary to authorize Phase 3; bounded Phase 2E experiments may gather evidence relevant to those questions without silently resolving them.
- Reconcile those decisions with steward scope, decision process, and the authority to consider, decline, admit, or publish offers.
- Record each substantive decision in its authoritative Charter/Governance source and preserve ADR discipline where architectural consequences follow.

#### Phase 2E.3 — Security, ingress, and runtime decisions

- Resolve the Phase 3 authentication/authorization, abuse-state retention, and application framework/runtime blockers after the relevant rights and governance constraints are known, using Phase 2E pilot evidence where useful.
- Define Phase 3 ingress, overload, receipt, correction/withdrawal, incident, shutdown, and recovery behavior without treating pilot-scoped rules as automatic precedent.
- Review [ADR 0016](docs/decisions/0016-offers-and-the-offer-buffer.md) and the [Phase 3 Offer Buffer working design](docs/protocols/PHASE_3_OFFER_BUFFER_DESIGN.md) against all resolved Phase 3 rights, governance, security, and runtime decisions.

#### Explicit Phase 3 authorization

Phase 3 may begin only after Phase 2E.1–2E.3 are complete, all Phase 3 blockers are substantively resolved, the Offer Buffer design is reconciled with those decisions, and the then-authorized governance process records an explicit Phase 3 entry decision. A successful Phase 2E experimental-ingress pilot does not itself satisfy or bypass that gate.

**Phase 2 completion requires all of the following:**

1. migrations reproduce the persistence layer from empty state;
2. canonical reference/import data round-trips without loss of meaning;
3. public projections are rebuildable and require no participant origin classification;
4. the external-ingress → deliberate-admission boundary is demonstrated;
5. publication-buffer behavior is tested;
6. backup and restore are documented and exercised;
7. no secret/security-sensitive fields are exposed by the public read model;
8. Phase 2 review-gate decisions are recorded or explicitly deferred with rationale;
9. if the Phase 2E experimental ingress pilot is deployed, its handling contract and material evidence/limits are documented before Phase 2 closes.

## Phase 3 — Controlled Participation

Status: **planned — offer architecture documented, gate not yet open**

Phase 3 begins with a narrow **durable capability** pilot rather than a private read beta or broad account registration. Public reading remains open. The temporary evidence-only Phase 2E ingress pilot does not count as entry into Phase 3.

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

The first Phase 3 Hummingbird-owned durable participation pilot should grant only a bounded, revocable **offer-making capability** with payload bounds, rate/resource limits, schema validation, replay/duplicate controls, and no implied publication, canonical admission, moderation, treasury, or governance authority. See [ADR 0014](docs/decisions/0014-progressive-capability-rollout.md) and the [Offer Buffer working design](docs/protocols/PHASE_3_OFFER_BUFFER_DESIGN.md).

Future broader access may offer multiple **offer delivery options**. Those options may regulate throughput or resource cost, but they must not be assigned to presumed participant-origin categories and must not become hidden content priority, trust/reputation, or governance weight. An accessible uncredentialed path should remain part of the broader design once participation expands beyond the initial controlled pilot.

The Phase 2E first-party ingress experiment may replace the Seed Bank as the primary low-friction entrance if it proves workable. The Seed Bank may remain as a durable public discussion/archive path rather than the default front door.

Entry into Phase 3 remains blocked by the constitutional, governance, architecture, and security questions listed in the Open Questions Registry. A successful Phase 2E experiment, working Phase 2 database, or accepted Offer Buffer design is not permission to bypass those decisions.

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

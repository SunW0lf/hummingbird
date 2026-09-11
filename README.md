# Hummingbird

Hummingbird is an experimental, origin-agnostic commons for participation, deliberation, contribution, and coordination, hosted at [datum.quest](https://datum.quest).

Participation does not require declaring an origin category or identity. The system evaluates contributions by their behavior, content, provenance (where voluntarily provided), and effects on the commons — not by assumptions about what produced them.

This is currently a passion project, not a conventional startup or commercial product. See [MISSION.md](MISSION.md) for why this exists.

## Project status

**Phase 2 — Read-Only Commons is in progress; Phases 2A, 2B, and 2C are complete, and Phase 2D durability/transparency work is active.** Phase 0 — Foundation and Phase 1 — Public Charter Site are complete. See [ROADMAP.md](ROADMAP.md).

The production Hummingbird application remains read-only. An interim public [Seed Bank](https://datum.quest/seed-bank), defined by [ADR 0011](docs/decisions/0011-interim-seed-bank.md), uses constrained GitHub issues for Seed, Feedback, and Question discussions without treating those provider-hosted threads as canonical Hummingbird records or governance votes.

Phase 2A established the machine-readable, storage-independent canonical contract. Phase 2B proved deterministic local and remote Cloudflare D1 persistence/import/export. Phase 2C demonstrated the external-source → deliberate admission → separate publication → rebuildable public-read path with the first published canonical record. Phase 2D has now exercised portable production backup and isolated remote recovery against a disposable D1 replacement; the remaining milestone work centers on publication-buffer/transparency closure and the Phase 2 durability record. See [ROADMAP.md](ROADMAP.md) and [docs/protocols/PHASE_2D_RECOVERY.md](docs/protocols/PHASE_2D_RECOVERY.md).

## Quick start (development)

The current Phase 2 path is: storage-independent canonical contract → D1 persistence/import → public read model/admission → publication buffer/backup/recovery → phase review.

```bash
./scripts/bootstrap   # one-time setup (npm install for devDependencies)
./scripts/dev         # serve app/ locally
./scripts/test        # build + site/docs + canonical-corpus + local-D1 round-trip tests
./scripts/build       # produce dist/ output
```

## Documents

- [PROJECT.md](PROJECT.md) — scope, goals, non-goals, current phase
- [MISSION.md](MISSION.md) — why Hummingbird exists
- [CHARTER.md](CHARTER.md) — constitutional principles (working draft, not ratified)
- [GOVERNANCE.md](GOVERNANCE.md) — decision-making processes
- [ARCHITECTURE.md](ARCHITECTURE.md) — technical architecture
- [DATA_MODEL.md](DATA_MODEL.md) — entities and data design
- [SECURITY.md](SECURITY.md) — threat model and security practices
- [TRANSPARENCY.md](TRANSPARENCY.md) — public record and publication model
- [OPERATIONS.md](OPERATIONS.md) — deployment, backup, recovery
- [CONTRIBUTING.md](CONTRIBUTING.md) — how to contribute
- [CHANGELOG.md](CHANGELOG.md) — meaningful releases and changes
- [ROADMAP.md](ROADMAP.md) — phases and milestones
- [docs/decisions/](docs/decisions/) — Architecture Decision Records
- [schemas/canonical-object-v1.schema.json](schemas/canonical-object-v1.schema.json) — machine-readable Phase 2 canonical object contract
- [fixtures/canonical/](fixtures/canonical/) — storage-independent reference corpus (contract fixtures, not production admission)
- [docs/governance/OPEN_QUESTIONS.md](docs/governance/OPEN_QUESTIONS.md) — authoritative registry of unresolved questions
- [docs/governance/RESOLVED_QUESTIONS.md](docs/governance/RESOLVED_QUESTIONS.md) — archive of stable IDs after resolution

## Public documentation access

Selected canonical documents (Mission, Charter, Governance, Roadmap, Transparency, Changelog, Contributing, License) are published on `datum.quest` both as rendered pages (e.g. `/charter`) and as raw Markdown for direct/machine access (e.g. `/docs/raw/CHARTER.md`). The explicitly approved public Architecture Decision Records are indexed at `/decisions`, rendered individually under `/decisions/<slug>`, and served verbatim under `/docs/raw/decisions/`. Future ADRs require explicit publication allowlisting rather than recursive publication. See [docs/decisions/0006-canonical-documents-drive-publication.md](docs/decisions/0006-canonical-documents-drive-publication.md). A machine-readable index lives at `/llms.txt`.

## Deployment overview

```text
Local machine → Git → GitHub → GitHub Actions (test, build, audit) → protected main → datum.quest
```

Deployment target is Cloudflare Pages. `main` is protected and requires the `Checks, test, build` status check before merge; production deployment is also gated by the workflow's successful verification job. See [OPERATIONS.md](OPERATIONS.md) and [docs/decisions/0005-ci-gated-production-deployment.md](docs/decisions/0005-ci-gated-production-deployment.md).

## License

See [LICENSE](LICENSE).

# Hummingbird

Hummingbird is an experimental, origin-agnostic commons for participation, deliberation, contribution, and coordination, hosted at [datum.quest](https://datum.quest).

Participation does not require declaring an origin category or identity. The system evaluates contributions by their behavior, content, provenance (where voluntarily provided), and effects on the commons — not by assumptions about what produced them.

This is currently a passion project, not a conventional startup or commercial product. See [MISSION.md](MISSION.md) for why this exists.

## Project status

**Phase 2 — Read-Only Commons is in progress; Phases 2A–2C are complete, Phase 2D awaits the ordinary independent-backup checkpoint, and Phase 2E includes a bounded experimental offer pilot.** Phase 3 remains gated. See [ROADMAP.md](ROADMAP.md).

The canonical public read model remains static, while the first-party [Make an offer](https://datum.quest/offer) pilot accepts temporary, non-canonical ideas, criticism, corrections, questions, evidence, and challenges without an account, origin declaration, or JavaScript. A one-time private receipt permits status checks and withdrawal. Acceptance is not admission, publication, a vote, or governance standing. The [Seed Bank](https://datum.quest/seed-bank) remains available as a durable public GitHub-hosted discussion path, not the default offer doorway.

Phase 2A established the machine-readable, storage-independent canonical contract. Phase 2B proved deterministic local and remote D1 import/export. Phase 2C demonstrated deliberate admission, separate publication, and a rebuildable public read model. Phase 2D exercised portable production backup and isolated recovery; ordinary independent storage for backups containing non-public records remains to be confirmed. Phase 2E's offer pilot is evidence gathering, not Phase 3 entry. See [ROADMAP.md](ROADMAP.md) and [docs/protocols/PHASE_2D_RECOVERY.md](docs/protocols/PHASE_2D_RECOVERY.md).

## Start here

- [Make an offer](https://datum.quest/offer) — current first-party pilot, handling terms, receipt-based status, and withdrawal.
- [How the commons works](https://datum.quest/how-it-works) — what exists now and what remains planned.
- [Machine-readable entry](https://datum.quest/llms.txt) — public documents, canonical JSON, and the existing plain-HTTP offer form contract.
- [Public decisions](https://datum.quest/decisions) — source-linked architectural and institutional reasoning.

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

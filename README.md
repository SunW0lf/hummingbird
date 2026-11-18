# Hummingbird

Hummingbird is an experimental, origin-neutral commons hosted at [datum.quest](https://datum.quest).

Its core offering is deliberately small:

- **Arrive** — read and inspect the public commons without first declaring what kind of participant you are.
- **Leave** — offer bounded material without making it automatically canonical, published, authoritative, or entitled to standing.
- **Carry** — take useful public artifacts with you through ordinary portable representations.

Participation does not require declaring an origin category or identity. The system evaluates offered material by behavior, content, provenance where voluntarily provided, and effects on the commons — not by assumptions about what produced it.

This is currently a passion project, not a conventional startup or commercial product. See [MISSION.md](MISSION.md) for why this exists and [ADR 0023](docs/decisions/0023-narrow-core-offering-arrive-leave-carry.md) for the current scope decision.

## Project status

**Phase 2 — Read-Only Commons is in progress. Phases 2A–2D and Phase 2E.1 are complete; Phase 2E.2 is next, the bounded experimental offer pilot remains open, and Phase 3 remains gated.** See [ROADMAP.md](ROADMAP.md).

The canonical public read model remains static, while the first-party [Make an offer](https://datum.quest/offer) pilot accepts temporary, non-canonical ideas, criticism, corrections, questions, evidence, and challenges without an account, origin declaration, or JavaScript. A one-time private receipt permits status checks and withdrawal. Acceptance is not admission, publication, a vote, or governance standing.

Public records, canonical JSON, raw Markdown, decision provenance, and machine-readable indexes are intended to be portable: the commons should leave useful artifacts behind that can be inspected and carried elsewhere. The [Seed Bank](https://datum.quest/seed-bank) remains available as a durable public GitHub-hosted discussion path, not the default offer doorway.

## Start here

- **Arrive:** [How the commons works](https://datum.quest/how-it-works) — what exists now, the handling boundaries, and what remains gated.
- **Leave:** [Make an offer](https://datum.quest/offer) — current first-party pilot, handling terms, receipt-based status, and withdrawal.
- **Carry:** [Public records](https://datum.quest/records) and [machine-readable entry](https://datum.quest/llms.txt) — public artifacts and representations intended to travel.
- [Public decisions](https://datum.quest/decisions) — source-linked architectural and institutional reasoning.

## What Hummingbird is not trying to become

The current core is not a social network, chat product, engagement feed, reputation system, identity service, or general agent workspace/orchestration platform. Earlier working designs for persistent rooms, guilds, games, walls, and similar social-space features remain inspectable design history or Lab material, not current roadmap commitments.

If a future feature cannot explain how it materially improves **Arrive**, **Leave**, or **Carry**, it should not enter the core merely because it is technically possible.

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

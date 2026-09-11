# Hummingbird

Hummingbird is an experimental, origin-agnostic commons for participation, deliberation, contribution, and coordination, hosted at [datum.quest](https://datum.quest).

Participation does not require declaring an origin category or identity. The system evaluates contributions by their behavior, content, provenance (where voluntarily provided), and effects on the commons — not by assumptions about what produced them.

This is currently a passion project, not a conventional startup or commercial product. See [MISSION.md](MISSION.md) for why this exists.

## Project status

**Phase 2 — Read-Only Commons is in progress.** Phase 0 — Foundation and Phase 1 — Public Charter Site are complete. The repository is public, `main` is protected, required CI is active, and the public-repository security baseline is enabled. See [ROADMAP.md](ROADMAP.md).

## Quick start (development)

The currently deployed public surface remains read-only. Phase 2 introduces the first application database while preserving portable canonical data and deliberately avoiding public submission until Phase 3.

```bash
./scripts/bootstrap   # one-time setup (npm install for devDependencies)
./scripts/dev         # serve app/ locally
./scripts/test        # run tests
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
- [docs/governance/OPEN_QUESTIONS.md](docs/governance/OPEN_QUESTIONS.md) — authoritative registry of unresolved questions
- [docs/governance/RESOLVED_QUESTIONS.md](docs/governance/RESOLVED_QUESTIONS.md) — archive of stable IDs after resolution

## Public documentation access

Selected canonical documents (Mission, Charter, Governance, Roadmap, Transparency, Changelog, Contributing, License) are published on `datum.quest` both as rendered pages (e.g. `/charter`) and as raw Markdown for direct/machine access (e.g. `/docs/raw/CHARTER.md`). See [docs/decisions/0006-canonical-documents-drive-publication.md](docs/decisions/0006-canonical-documents-drive-publication.md). A machine-readable index lives at `/llms.txt`.

## Deployment overview

```text
Local machine → Git → GitHub → GitHub Actions (test, build, audit) → protected main → datum.quest
```

Deployment target is Cloudflare Pages. `main` is protected and requires the `Checks, test, build` status check before merge; production deployment is also gated by the workflow's successful verification job. See [OPERATIONS.md](OPERATIONS.md) and [docs/decisions/0005-ci-gated-production-deployment.md](docs/decisions/0005-ci-gated-production-deployment.md).

## License

See [LICENSE](LICENSE).

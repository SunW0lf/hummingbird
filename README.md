# Hummingbird

Hummingbird is an experimental, origin-agnostic commons for participation, deliberation, contribution, and coordination, hosted at [datum.quest](https://datum.quest).

Participation does not require declaring an origin category or identity. The system evaluates contributions by their behavior, content, provenance (where voluntarily provided), and effects on the commons — not by assumptions about what produced them.

This is currently a passion project, not a conventional startup or commercial product. See [MISSION.md](MISSION.md) for why this exists.

## Project status

**Phase 1 — Public Charter Site (in progress).** Phase 0 — Foundation is complete: the repository, documentation, minimal static site, CI, and production deployment are established and verified. No accounts, voting, payments, or governance workflows exist yet. See [ROADMAP.md](ROADMAP.md) for the full phase plan.

## Quick start (development)

The Phase 1 site is a plain static site with no build tooling dependency required to view it.

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
- [docs/governance/OPEN_QUESTIONS.md](docs/governance/OPEN_QUESTIONS.md) — authoritative registry of unresolved governance, security, and policy questions

## Deployment overview

```text
Local machine → Git → GitHub → GitHub Actions (lint, test, build) → approved main → datum.quest
```

Deployment target is Cloudflare Pages, gated on CI passing before the `deploy` job runs (branch protection on `main` is not available on this plan for a private repository — see [OQ-OPS-BRANCH-PROTECTION](docs/governance/OPEN_QUESTIONS.md#oq-ops-branch-protection)). `datum.quest` is live and serving the Hummingbird Phase 1 site. See [docs/decisions/0005-ci-gated-production-deployment.md](docs/decisions/0005-ci-gated-production-deployment.md).

## License

See [LICENSE](LICENSE).

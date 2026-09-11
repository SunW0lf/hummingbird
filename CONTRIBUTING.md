# Contributing

Hummingbird welcomes contributions from any participant, with no origin category or identity declaration required, evaluated on content and behavior, consistent with [MISSION.md](MISSION.md) and [CHARTER.md](CHARTER.md).

**The repository is currently private** (see [TRANSPARENCY.md](TRANSPARENCY.md)), so the fork/PR workflow below is not yet usable by outside participants — it describes the intended workflow once the repository is public, so it is documented correctly in advance rather than invented later. Until then, there is no interim public contribution channel; this is tracked, not hidden, as part of [OQ-TRANSPARENCY-REPO-VISIBILITY](docs/governance/OPEN_QUESTIONS.md#oq-transparency-repo-visibility).

## Code

- Fork or branch, make changes, open a pull request against `main`.
- CI (lint, test, build) must pass before merge.
- Keep changes small and understandable; prefer boring solutions.

## Documentation

- Documentation changes follow the same PR process as code.
- Do not resolve an `OPEN QUESTION` marker by quietly implementing a decision — either update the relevant document explicitly with the decision and rationale, or raise it for discussion first.

## Proposals

A formal proposal process does not exist yet (see [GOVERNANCE.md](GOVERNANCE.md), [OQ-GOVERNANCE-PROPOSALS](docs/governance/OPEN_QUESTIONS.md#oq-governance-proposals)). The intended interim channel is a GitHub issue, but the repository is currently private, so this is not yet usable by outside participants either — see the note above.

## Architectural changes

Significant architectural changes should include a new Architecture Decision Record in [docs/decisions/](docs/decisions/) following the existing numbering and format (status, context, decision, rationale, alternatives considered, consequences, date).

## Security issues

Do not open a public issue for a security vulnerability. See [SECURITY.md](SECURITY.md) for reporting guidance — a dedicated contact channel does not exist yet ([OQ-SECURITY-VULN-REPORTING](docs/governance/OPEN_QUESTIONS.md#oq-security-vuln-reporting)).

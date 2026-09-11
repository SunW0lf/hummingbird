# Contributing

Hummingbird welcomes contributions from any participant, with no origin category or identity declaration required, evaluated on content and behavior, consistent with [MISSION.md](MISSION.md) and [CHARTER.md](CHARTER.md).

The repository is public. Outside participants can inspect, fork, propose changes, and open pull requests now. External fork workflows require steward approval before GitHub Actions run.

## Code

- Fork or branch, make changes, open a pull request against `main`.
- CI checks, tests, build, and dependency audit must pass before merge.
- `main` is protected; routine changes do not land by direct push.
- Keep changes small and understandable; prefer boring solutions.

## Documentation

- Documentation changes follow the same PR process as code.
- Do not resolve an `OPEN QUESTION` by quietly implementing a decision — update the relevant substantive document explicitly with the decision and rationale.
- Resolved stable `OQ-*` IDs are preserved in [docs/governance/RESOLVED_QUESTIONS.md](docs/governance/RESOLVED_QUESTIONS.md) so historical ADRs and discussion remain intelligible.

## Proposals

A formal proposal process does not exist yet (see [GOVERNANCE.md](GOVERNANCE.md), [OQ-GOVERNANCE-PROPOSALS](docs/governance/OPEN_QUESTIONS.md#oq-governance-proposals)). Until Phase 3 defines an in-application process, a GitHub issue may be used to raise a project proposal or question, but doing so does not itself grant the issue governance status or approval.

## Architectural changes

Significant architectural changes should include a new Architecture Decision Record in [docs/decisions/](docs/decisions/) following the existing numbering and format (status, context, decision, rationale, consequences, date).

## Security issues

Do **not** open a public issue containing security-vulnerability details. GitHub private vulnerability reporting is enabled for this repository; use **Security → Report a vulnerability** to submit details privately to the maintainer. See [SECURITY.md](SECURITY.md) for the authoritative reporting and security guidance.

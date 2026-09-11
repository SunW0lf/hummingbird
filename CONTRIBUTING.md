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

## Seed Bank

The public [Seed Bank](https://datum.quest/seed-bank) is an interim Phase 2 invitation defined by [ADR 0011](docs/decisions/0011-interim-seed-bank.md). It uses GitHub issue forms for three lightweight interaction types: **Seed**, **Feedback**, and **Question**.

- Hummingbird does not request an origin category or identity declaration. GitHub nevertheless exposes account metadata because GitHub is the temporary transport provider.
- Seed Bank issues and comments are public.
- Making an offer does not grant standing, priority, governance weight, approval, or a right to publication.
- Reactions are conversational signals, not votes.
- Nothing posted to the Seed Bank is automatically copied into a Pond, Pad, Pool, canonical object, proposal, or other Hummingbird space.
- If Seed Bank material is later admitted or synthesized into the canonical commons, that happens through a separate deliberate act under the transparency and provenance rules then in force.

## Proposals

A formal proposal process does not exist yet (see [GOVERNANCE.md](GOVERNANCE.md), [OQ-GOVERNANCE-PROPOSALS](docs/governance/OPEN_QUESTIONS.md#oq-governance-proposals)). A Seed Bank thread may surface a proposal-like idea, but it does not itself become a governance proposal or approval process. Until Phase 3 defines a Hummingbird-owned Offer surface, a GitHub issue may also be used to raise a project proposal or question, subject to the same limitation.

## Architectural changes

Significant architectural changes should include a new Architecture Decision Record in [docs/decisions/](docs/decisions/) following the existing numbering and format (status, context, decision, rationale, consequences, date).

## Security issues

Do **not** open a public issue containing security-vulnerability details. GitHub private vulnerability reporting is enabled for this repository; use **Security → Report a vulnerability** to report details privately to the maintainer. See [SECURITY.md](SECURITY.md) for the authoritative reporting and security guidance.

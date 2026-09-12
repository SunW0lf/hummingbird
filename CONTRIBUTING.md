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

## Make an experimental offer

The first-party [offer pilot](https://datum.quest/offer) is open for testing under [ADR 0017](docs/decisions/0017-phase2e-experimental-ingress.md). It accepts bounded temporary ideas, criticism, corrections, questions, evidence, and challenges without an account, required handle, origin declaration, CAPTCHA, or JavaScript for the basic path. Save the one-time private receipt to check status or withdraw; do not post the receipt publicly. Receipt is not canonical admission, publication, a vote, governance standing, or an individualized response. The handling terms and plain-HTTP form contract are on the offer page.

## Seed Bank

The public [Seed Bank](https://datum.quest/seed-bank) is an interim Phase 2 invitation defined by [ADR 0011](docs/decisions/0011-interim-seed-bank.md). It uses GitHub issue forms for three lightweight interaction types: **Seed**, **Feedback**, and **Question**.

- Hummingbird does not request an origin category or identity declaration. GitHub nevertheless exposes account metadata because GitHub is the temporary transport provider.
- Seed Bank issues and comments are public.
- Making an offer does not grant standing, priority, governance weight, approval, or a right to publication.
- Reactions are conversational signals, not votes.
- Nothing posted to the Seed Bank is automatically copied into a Pond, Pad, Pool, canonical object, proposal, or other Hummingbird space.
- If Seed Bank material is later admitted or synthesized into the canonical commons, that happens through a separate deliberate act under the transparency and provenance rules then in force.

The Seed Bank remains as a higher-friction durable public discussion/archive path rather than the default first-party offer doorway.

## Proposals

A formal proposal process does not exist yet (see [GOVERNANCE.md](GOVERNANCE.md), [OQ-GOVERNANCE-PROPOSALS](docs/governance/OPEN_QUESTIONS.md#oq-governance-proposals)). Seed Bank material or an experimental offer may contain a proposal-like idea, but receipt, synthesis, or surfacing does not itself turn that material into a Hummingbird governance proposal or approval process.

## Architectural changes

Significant architectural changes should include a new Architecture Decision Record in [docs/decisions/](docs/decisions/) following the existing numbering and format (status, context, decision, rationale, consequences, date).

## Security issues

Do **not** open a public issue containing security-vulnerability details. GitHub private vulnerability reporting is enabled for this repository; use **Security → Report a vulnerability** to report details privately to the maintainer. See [SECURITY.md](SECURITY.md) for the authoritative reporting and security guidance.

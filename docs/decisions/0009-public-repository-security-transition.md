# ADR 0009 — Public repository security transition

Status: **Accepted**

Date: 2026-09-10 (Pacific Time)

## Context

Hummingbird's repository has remained private through Phase 0 and early Phase 1. On the current GitHub plan, that prevents use of the desired branch-protection controls. The repository has already been treated as a future transparency record, and the Phase 0 history review found no committed secrets.

Making the repository public improves transparency and unlocks useful public-repository security features, but it also expands the trust boundary: source and history become visible, public forks become possible, and repository/Actions activity should be assumed visible to outside observers.

## Decision

The steward authorizes Hummingbird's repository to become public, but the visibility change is a **security transition**, not a standalone administrative toggle.

Publication is contingent on activating and verifying the public-mode baseline documented in `OPERATIONS.md` and `SECURITY.md`:

- protected `main` with pull-request flow and required CI;
- no force pushes or branch deletion on `main`;
- restricted GitHub Actions policy while keeping external actions pinned to immutable SHAs;
- private vulnerability reporting enabled and verified;
- secret scanning and push protection enabled;
- Dependabot alerts/security updates enabled, with version monitoring committed in `.github/dependabot.yml`;
- CodeQL/default code scanning enabled where available;
- current steward ownership recorded in `.github/CODEOWNERS`.

The prior Phase-1-only risk acceptances for missing branch protection and unrestricted Actions **expire at publication**. They are not carried forward into public mode.

## Rationale

Public visibility aligns the repository with its intended role as Hummingbird's inspectable project record and unlocks security controls that are unavailable to this private repository on the current plan. Coupling publication to security activation avoids creating a window where the repository is public but still operating under assumptions that were accepted only for a private, single-steward trust boundary.

GitHub's built-in private vulnerability reporting is preferred over inventing a separate disclosure system for this phase because it provides a structured private channel directly attached to the public repository. A dedicated project email can still be added later if useful.

## Consequences

- Repository publication is now authorized in principle, subject to the activation gate.
- `OQ-TRANSPARENCY-REPO-VISIBILITY` moves from undecided to implementation-in-progress until the visibility change and post-change verification are complete.
- `OQ-OPS-BRANCH-PROTECTION`, `OQ-SECURITY-ACTIONS-HARDENING`, and `OQ-SECURITY-VULN-REPORTING` must receive public-mode implementation/verification; private-mode risk acceptance is insufficient for publication.
- Public visibility does not resolve the separate content-license question. Until a distinct content license is adopted, the repository's existing licensing text remains authoritative.

# Hummingbird agent instructions

These instructions apply to coding agents working in this repository.

## Project orientation

Hummingbird is an experimental commons for participation, deliberation, contribution, and coordination. The repository is the source of truth; production is built from GitHub and deployed through CI/CD to `datum.quest`.

Before making changes, read the smallest relevant set of canonical documents:

- Product/purpose: `README.md`, `PROJECT.md`, `MISSION.md`
- Governance/participant rules: `CHARTER.md`, `GOVERNANCE.md`, `docs/governance/OPEN_QUESTIONS.md`
- Architecture/data: `ARCHITECTURE.md`, `DATA_MODEL.md`
- Security/deployment: `SECURITY.md`, `OPERATIONS.md`, `.github/workflows/ci.yml`
- Public accountability: `TRANSPARENCY.md`, `CHANGELOG.md`, `ROADMAP.md`, `CONTRIBUTING.md`

Do not duplicate canonical policy or architecture text into implementation comments when a reference is enough.

## Non-negotiable boundaries

- Never commit secrets, private keys, seed phrases, signing credentials, access tokens, or recovery material.
- The configured Hummingbird wallet is a public receive address only. Blockchain activity is authoritative on-chain; do not create an internal transaction ledger unless a future approved design explicitly requires one.
- Do not collect supporter identity merely to accept voluntary support.
- Keep unsolicited inbound support logically distinct from any future project-authorized expenditure workflow.
- Do not mutate production manually. Changes flow through repository commits, CI verification, and the deployment workflow.
- Do not edit generated `dist/` output as a source change. Edit canonical source files or build scripts and rebuild.
- Do not silently resolve an `OQ-*` open question by implementation. If a task depends on resolving one, update the authoritative open-question record and relevant governance/decision documentation explicitly.
- Significant architectural or governance changes require an ADR in `docs/decisions/` following the existing format and numbering.
- Preserve Hummingbird's origin-neutral participation model. Do not introduce identity/origin verification, privileged participant categories, or CAPTCHA-style origin tests unless an approved design explicitly calls for them.
- Prefer minimal data collection, portable representations, derived/rebuildable projections, and boring infrastructure over unnecessary state or vendor lock-in.

## Current phase assumptions

The current public surface is intentionally simple and mostly static. Do not add accounts, a database, application-managed payments, or a general-purpose backend merely because they might be useful later. If a requested feature crosses a phase boundary, make that explicit in the change and update the relevant roadmap/architecture/governance material.

Public canonical documents are rendered from repository Markdown at build time. Keep the Markdown authoritative; do not create separately maintained web copies.

## Development workflow

Work on a branch and keep changes reviewable. Before proposing a change:

1. Install dependencies with `npm ci`.
2. Run `./scripts/test`.
3. Run `./scripts/build`.
4. Run `npm audit --audit-level=high`.
5. Inspect the full diff for generated-file churn, secrets, accidental private-document publication, and unresolved placeholders.

For changes to document publishing, verify that intentionally private/internal documents remain unpublished and that public links do not leak internal paths.

## Change quality

- Prefer small, understandable patches.
- Add or update tests when behavior changes.
- Update canonical documentation when implementation behavior or public claims change.
- Keep comments focused on why a decision exists, not on narrating obvious code.
- Do not claim a control, channel, process, or capability exists unless it actually works in the repository/deployment today.

When finished, summarize what changed, what was tested, any open questions touched, and any follow-up risk or maintenance item.
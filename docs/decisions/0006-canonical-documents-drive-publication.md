# 0006 — Canonical Documents Drive Public Publication

- Status: Accepted
- Date: 2026-09-11

## Context

The public site previously explained or referenced repository Markdown documents (Mission, Charter, Governance, etc.) through hand-authored HTML summaries. Visitors had no way to inspect the actual governing text without private repository access, and every summary was a second, manually-maintained copy of institutional text that could silently drift from the source.

## Decision

Publish an explicit allowlist of canonical Markdown documents (`MISSION.md`, `CHARTER.md`, `GOVERNANCE.md`, `ROADMAP.md`, `TRANSPARENCY.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `LICENSE`) at build time, in two forms: a rendered human-readable HTML page at a stable route (e.g. `/charter`), and a verbatim raw copy at a predictable URL (e.g. `/docs/raw/CHARTER.md`). The Markdown file remains the sole authoritative copy; the website never hand-duplicates institutional text. A lightweight `/llms.txt` index points machine readers at both forms. Adding a document to the allowlist is a deliberate, reviewable change, not an automatic recursive publish of the repository.

## Rationale

Rendering the canonical source at build time (rather than hand-authoring HTML) makes drift structurally impossible: the published page is always exactly the current Markdown, and updating the institutional text only requires editing one file. Publishing a `docs/raw/` path additionally gives machine consumers (and future documentation tooling) a stable, unstyled entry point without building an API.

## Alternatives considered

- Keep hand-authored HTML summaries — rejected as the source of the drift problem this decision fixes.
- Publish the entire repository recursively — rejected; security-sensitive and operational documents (ARCHITECTURE.md, SECURITY.md, OPERATIONS.md, the internal Open Questions Registry) are not ready for public exposure and should be added deliberately, if ever.
- Build a documentation API/search service now — rejected as premature; a static build-time render satisfies the current need without new backend surface area.

## Consequences

- The build step (`scripts/build`) now includes a Markdown-rendering pass (`scripts/render-docs.js`) using `marked`, a build-time-only devDependency; no client-side framework or runtime dependency is introduced.
- Cross-document links inside canonical Markdown (e.g. `GOVERNANCE.md`) are rewritten to their published routes at render time so the rendered pages remain navigable; links to non-published documents are left as-is and will not resolve until (if ever) those documents are added to the allowlist.
- Local development (`scripts/dev`) now builds before serving, so the local preview matches production instead of showing stale hand-authored content.
- A curated, non-canonical `/open-questions` page and `/llms.txt` index were added alongside this pipeline; they are hand-authored precisely because they are deliberately-redacted or purely-navigational, not literal renders of a single canonical file.

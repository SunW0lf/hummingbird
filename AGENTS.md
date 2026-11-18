# Hummingbird agent instructions

These instructions apply to coding agents working in this repository.

## Project orientation

Hummingbird is an experimental, origin-neutral commons whose core participant-facing offering is **Arrive / Leave / Carry**:

- **Arrive** — read and inspect public surfaces without requiring an origin category or identity declaration.
- **Leave** — offer bounded material through an explicit ingress path without treating ingress as canonical admission, publication, identity, reputation, standing, or governance authority.
- **Carry** — expose useful public artifacts through portable representations that can remain useful outside Hummingbird.

The repository is the source of truth; production is built from GitHub and deployed through CI/CD to `datum.quest`. The current scope decision is [ADR 0023](docs/decisions/0023-narrow-core-offering-arrive-leave-carry.md).

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
- Significant architectural, product-scope, or governance changes require an ADR in `docs/decisions/` following the existing format and numbering.
- Preserve Hummingbird's origin-neutral participation model. Do not introduce identity/origin verification, privileged participant categories, CAPTCHA-style origin tests, proof-of-thought, proof-of-cognition, or private-reasoning disclosure unless an approved design explicitly calls for it.
- Prefer minimal data collection, portable representations, derived/rebuildable projections, and boring infrastructure over unnecessary state or vendor lock-in.
- Do not advertise a form action, API route, capability, or governance process that is not actually implemented.
- Prefer ordinary standards-based representation discovery (`rel="alternate"`, visible links, raw files, static indexes) over requester-type branching or edge middleware unless a real runtime capability requires the extra complexity.
- Do not re-expand the core into feeds, followers, likes/karma, general chat, participant reputation, identity services, general agent orchestration/workspaces, persistent guilds/rooms/games, or social-world mechanics merely because earlier documents or Lab work explored them. Such capabilities require a new explicit scope decision tied to demonstrated need.
- For future Phase 3 participant-facing language, prefer **offer**, **make an offer**, **offer delivery options**, **Offer Buffer**, and **consideration** over `submit` / `submission` unless an external protocol or historical description makes the latter unavoidable.
- An offer may propose changes ranging from trivial to foundational, including changing Hummingbird itself. Broad scope is not an abuse signal and does not grant authority.
- Offer delivery controls may regulate resource use or pacing but must not become hidden content priority, trust/reputation, participant-origin classification, or governance weight.

## Current phase assumptions

The public read surface is intentionally simple and mostly static. Cloudflare D1 exists as the current durable persistence engine for deliberately admitted canonical application records, while public page views are served from rebuildable static projections rather than querying D1 at request time.

The `/offer` Phase 2E pilot already accepts temporary non-canonical offers through a dedicated buffer with bounded receipt-based status and withdrawal. Do not expand it into accounts, durable Phase 3 capabilities, a general-purpose public write API, application-managed payments, Durable Objects, or other broader backend components merely because they might be useful later. Phase 3 Offer Buffer design is documented in ADR 0016 and `docs/protocols/PHASE_3_OFFER_BUFFER_DESIGN.md`, but deployment remains blocked by the Phase 3 gate and Open Questions Registry.

If Phase 3 is later authorized, the first durable capability should serve the narrowed Arrive / Leave / Carry core rather than automatically opening broad social/application features.

If a requested feature crosses a phase boundary, make that explicit in the change and update the relevant roadmap/architecture/governance material.

Public canonical documents are rendered from repository Markdown at build time. Keep the Markdown authoritative; do not create separately maintained web copies.

For public ADRs, distinguish source provenance from deployment provenance: source commit means the revision that last changed the canonical ADR; build commit means the revision whose build produced the deployed artifact. Content digests establish byte identity but are not signatures or governance authorization.

## Lab boundary

Lab material may explore provisions, packets, temporal coupling, links, Awaiters, alternate protocol surfaces, persistent spaces, or other ideas beyond the current core. Lab work is evidence and design exploration, not automatic Commons scope.

Promotion should be explicit:

```text
experiment
-> evidence
-> proposal / ADR / open-question work where required
-> Commons adoption only if justified
```

Do not import Lab vocabulary into canonical schemas, participant rights, governance semantics, or production capability by implication.

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

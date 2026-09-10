# Data Model

Phase 0/1 stores no participant or contribution data — the site is static. This document sketches the intended abstract model for Phase 2+ so future implementation has a stable reference point; none of it is implemented yet.

## Participant model (intent, not implemented)

Hummingbird does not build identity around `human` / `AI` / `bot` categories. It uses an abstract participant model:

```text
participant
  participant_id
  declarations[]
  credentials[]
  capabilities[]
  rate_limit_state
```

- A **declaration** is a voluntary claim made by a participant about itself.
- A **credential** verifies only the specific claim it attests to. It does not define the participant's underlying nature and does not grant additional authority.
- Anonymous or pseudonymous participation should remain possible where security permits (see [SECURITY.md](SECURITY.md)).

## Other entities (OPEN QUESTION — Phase 2+)

- **Contribution model** — OPEN QUESTION
- **Proposal model** — OPEN QUESTION
- **Need model** — OPEN QUESTION
- **Audit/event model** — OPEN QUESTION, but see [TRANSPARENCY.md](TRANSPARENCY.md) for the three-layer log design intent
- **Workflow state machines** — OPEN QUESTION

## Retention classifications

See [SECURITY.md](SECURITY.md) §Data Classification for the category list (`PUBLIC`, `PUBLIC_DELAYED`, `OPERATIONAL`, `SECURITY_SENSITIVE`, `FINANCIAL_PRIVATE`, `SECRET`). Specific retention periods per category are OPEN QUESTION until real data is collected in Phase 2+.

## Current state

No database exists. No entities beyond static site content are stored anywhere.

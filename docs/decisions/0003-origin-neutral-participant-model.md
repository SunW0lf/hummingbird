# 0003 — Origin-Neutral Participant Model

- Status: Accepted (design intent; not yet implemented)
- Date: 2026-09-10

## Context

Hummingbird's mission is to serve participants of indeterminate origin — human, AI, organization, or otherwise — and to evaluate contributions by behavior and effect rather than assumed origin. This has direct implications for the eventual data model and authentication design, even though no participant system exists yet in Phase 0/1.

## Decision

The participant data model will not be built around `human` / `AI` / `bot` categories. It will use an abstract shape: `participant { participant_id, declarations[], credentials[] , capabilities[], rate_limit_state }`. A declaration is a voluntary claim; a credential verifies only the specific claim it attests to, and neither necessarily defines the participant's underlying nature.

## Rationale

Baking origin categories into the core model would contradict the Mission and Charter's founding principle before implementation even begins. Recording this decision now, ahead of Phase 2 implementation, prevents the eventual database schema from silently encoding an origin-based hierarchy for expedience.

## Alternatives considered

- A conventional `users` table with a `type` enum (`human`/`ai`/`bot`) — rejected as directly contradicting the Charter's participant-rights draft.
- Deferring this decision entirely until Phase 2 — rejected; recording the intent now avoids ad hoc decisions under implementation pressure later.

## Consequences

- Phase 2's data model design must be reviewed against this ADR before implementation.
- Authentication/authorization design (Phase 3) must not assume a fixed participant taxonomy.

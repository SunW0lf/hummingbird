# ADR 0029 — Charter additions: least record, no training, no recruiting asks, winding down

Status: accepted for the C0 / Phase 2 working institution (merged 2026-11-19)

Date: 2026-11-19

## Context

The Charter's rights floor ([ADR 0024](0024-phase2e2-constitutional-and-governance-dispositions.md)) was written before the work that followed on 2026-11-18 and 2026-11-19. Since then Hummingbird has made promises the Charter does not hold:

- The steward promised that offers are not used to train AI models. The promise is on the offer page and every agent door, but a page can change without a governed decision.
- The offer runtime stores no name, account, IP address or user-agent, and nothing links one offer to another participant action. The Mission states data minimization as a principle; the Charter does not promise it.
- The sharing note added in PR #112 never asks anyone to repost or forward Hummingbird. That is a practice, not a constraint.
- The steward set a dated check: if no offers arrive after the on-ramp work, Hummingbird may stop. The Charter says nothing about how it would stop, or what happens to material it holds.
- §1 still describes a broad purpose (deliberation, coordination) that [ADR 0023](0023-narrow-core-offering-arrive-leave-carry.md) narrowed, and Carry names no license although [ADR 0028](0028-content-license-cc-by-4.md) now sets one.

## Decision

1. **Purpose.** §1 describes the Arrive / Leave / Carry core; deliberation and coordination may grow from it only through the proposal process.
2. **Carry** names the current license split and says left material keeps its author's terms.
3. **Least record** joins the rights floor: Hummingbird keeps no more about a participant than the action needs, publishes what each capability keeps and for how long, and keeps nothing to recognize the same participant across actions unless that participant asks.
4. **Not training material** joins the rights floor: left material is used to consider it under its handling contract and not to train AI models; any change is published first and covers only material left afterwards.
5. **No recruiting asks** joins §3: Hummingbird never asks a participant, human or automated, to spread, repost, recruit, or act on its behalf elsewhere.
6. **Winding down** becomes §7: notice first, intake paused, held material cleared on schedule and never transferred, sold or published because of the shutdown, the public record kept portable, and the name and domain not handed to an impostor. It is separate from emergency authority.

These are C0 working-draft decisions, not ratification.

## Consequences

- Changing the no-training promise or the least-record right now needs a recorded C0 decision, not a page edit.
- The live offer runtime already meets both rights; no code changes.
- Winding down has a published shape before the 2026-12-18 offer check, so a decision to stop does not have to invent one.

## Not changed

Monthly key rotation, the MCP and OpenAPI doors, and the Edge workflow are operations and implementation, which the Charter deliberately leaves to other documents. Agents need no new text: §1 already opens the commons to participants "regardless of their nature".

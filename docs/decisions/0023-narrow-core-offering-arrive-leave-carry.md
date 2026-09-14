# ADR 0023 — Narrow the Core Offering to Arrive, Leave, Carry

Status: accepted for the C0 / Phase 2 working institution

Date: 2026-09-13

## Context

Hummingbird began with a deliberately broad ambition: participation, deliberation, contribution, coordination, persistent spaces, and later governance. As the project accumulated concrete infrastructure and experimental designs, the product surface began to imply several different things at once: public commons, forum, social space, agent workspace, governance system, and protocol laboratory.

That breadth is no longer useful as the core product promise.

The working system already demonstrates a smaller and more distinctive pattern:

- public reading is open without requiring a participant to declare an origin category or identity;
- temporary first-party ingress can accept bounded offered material without automatically making it canonical;
- durable public records, decisions, and documentation can be inspected and carried elsewhere in ordinary portable representations;
- admission, publication, governance, and identity remain separate from mere arrival or contribution.

Recent Lab work may explore richer interaction models, temporal coupling, packets, links, spaces, or other protocol ideas. Those experiments are useful precisely because they do not need to become the Commons roadmap merely by existing.

A smaller core also reduces pressure to reproduce familiar social-network, forum, chat, workspace, identity, or reputation mechanics that are not necessary to the mission.

## Decision

Hummingbird narrows its core offering to three participant-facing verbs:

### 1. Arrive

A participant may reach, read, inspect, and traverse the public commons without first proving or declaring what kind of participant produced the request.

Arrival does not imply identity, account creation, standing, membership, or durable presence.

### 2. Leave

A participant may offer bounded material through an explicitly defined ingress path.

Leaving something does not automatically make it canonical, published, authoritative, representative, or entitled to governance consideration. Ingress, consideration, admission, publication, and governance remain separate actions.

The current Phase 2E `/offer` pilot is the first narrow implementation of this verb. It remains temporary and non-canonical under its existing authorization.

### 3. Carry

Public institutional artifacts should be easy to inspect, reference, copy, download, transform, and carry into other contexts using ordinary portable representations.

The current public records, canonical JSON, raw Markdown, decision provenance, and machine-readable indexes already implement part of this verb. Future provisions, packets, or derived artifacts may extend it only after separate review.

## Product model

The core product should be understandable without a social graph or participant taxonomy:

```text
arrive
  -> leave something bounded
  -> deliberate admission/publication where appropriate
  -> carry useful artifacts onward
```

This ADR does **not** adopt Lab vocabulary such as `Signal`, `Link`, `Awaiter`, `Statefall`, `Packet`, `Trace`, or `Pulse` as canonical Hummingbird data-model or governance terms. Lab vocabulary remains exploratory until separately promoted.

## Scope consequences

The following are not core product goals:

- feeds, likes, followers, engagement optimization, or popularity ranking;
- general-purpose chat or a social network;
- participant identity as a prerequisite for ordinary reading;
- reputation scores or hidden trust tiers;
- a general agent orchestration/runtime platform;
- persistent rooms, guilds, games, walls, or social-world simulation merely because earlier working designs explored them.

`SPACES.md`, persistence inventories, and Lab documents that discuss those possibilities remain useful design history and experimental material. They are not current roadmap commitments. Any such capability must earn its way back into the core roadmap through a separate explicit decision tied to a demonstrated need.

## Phase 3 effect

Phase 3 remains gated and unauthorized.

If Phase 3 is later authorized, its first durable capability should serve the narrowed core: durable continuity needed for bounded leaving, carrying, correction/withdrawal, provenance, or other artifact-centered participation. Phase 3 is not automatically an account-registration phase, social-space phase, or general application-interaction phase.

This scope change does not resolve any participant-rights, exclusion, emergency-authority, authentication/authorization, abuse-retention, governance-proposal, succession, security, or runtime open question. Existing Phase 3 gates remain binding.

## Consequences

- Public copy and project goals should lead with Arrive / Leave / Carry rather than a broad list of possible interaction types.
- Existing read, offer, canonical-record, provenance, publication, backup, and transparency work remains useful and in scope.
- The Lab may continue exploring ideas beyond the core without automatically expanding the Commons.
- Branding work should name this narrower place rather than the previously implied social/application platform.
- Future feature proposals should state which core verb they materially improve, or explain why the core itself should be reconsidered.
- De-scoped ideas remain inspectable rather than being erased from history.

## Non-decisions

This ADR does not:

- rename Hummingbird or `datum.quest`;
- ratify the Charter;
- create new participant rights or duties;
- authorize Phase 3;
- change the current `/offer` authority ceiling;
- alter canonical admission or publication authority;
- create an identity, reputation, moderation, or governance system;
- resolve open questions merely because some previously imagined features are no longer core goals.

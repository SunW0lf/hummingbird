# ADR 0011 — Interim Seed Bank

Status: Accepted

Date: 2026-09-10 (Pacific)

## Context

Phase 2 has begun, but Hummingbird does not yet have the application-owned submission, rate-limit, abuse-control, identity/authorization, or moderation machinery planned for Phase 3. The project nevertheless benefits from a narrow public invitation while the read-only commons is being built.

The invitation must not quietly redefine Phase 2 as an interactive application, turn GitHub reactions into governance, or make public issue activity canonical Hummingbird data by default.

## Decision

Hummingbird will operate an interim **Seed Bank** as a public invitation and demonstration surface.

- `datum.quest/seed-bank` explains the experiment and links to a deliberately small set of starter seeds.
- Starter seeds are public GitHub issue threads. Participants may read them without a GitHub account; GitHub requires an account to comment, react, or open a new issue.
- New Seed, Feedback, and Question issue forms are constrained by repository issue templates.
- Hummingbird does not request or require an origin category or identity declaration. GitHub account attribution is an external-provider constraint and must not be interpreted as Hummingbird identity verification.
- Issue submission, comments, and reactions are **not** votes, standing, approval, canonical publication, or governance decisions.
- A Seed Bank item is not automatically copied into a Pond, Pad, Pool, canonical record, proposal, or any other Hummingbird surface. Admission or synthesis is a separate deliberate act.
- The Seed Bank may use emerging space names such as **Pond** or **Pad** to demonstrate possible concepts, but those names do not acquire constitutional or workflow meaning through this ADR.
- Public issue threads must not be used for secrets, private personal information, or vulnerability details. Security reports use GitHub private vulnerability reporting.
- Hummingbird may summarize, combine, reference, defer, close, or decline seeds. Any later promotion into the canonical commons must preserve the project's transparency and attribution rules then in force.

## Rationale

Using GitHub provides an immediately available public discussion surface with existing anti-abuse, moderation, account, and audit mechanisms without adding a new production write path during Phase 2. It also provides a useful prototype of the separation between **offering material** and **admitting material into the commons**.

The tradeoff is that GitHub is not origin-neutral infrastructure: an account is required to participate and account metadata is visible. The Seed Bank therefore cannot be treated as Hummingbird's final participation model.

## Consequences

- Hummingbird can listen during the Phase 2 build without deploying application-owned public forms.
- The production site remains read-only.
- Seed Bank activity is public and provider-hosted; it is not silently ingested into Hummingbird's future database.
- Reactions can help conversation but have no governance weight.
- The interim channel can be retired, replaced, or imported selectively once Phase 3 participation exists.

## Supersession

This ADR should be revisited when Phase 3 defines Hummingbird-owned participation and abuse controls. A later decision may preserve the Seed Bank concept while replacing GitHub as its transport.

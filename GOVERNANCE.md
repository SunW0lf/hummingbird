# Governance

This document defines how decisions get made in Hummingbird. It is operational, not constitutional — constitutional principles live in [CHARTER.md](CHARTER.md).

Detailed governance protocol documents, once written, live in [docs/governance/](docs/governance/). The authoritative list of unresolved governance questions is [docs/governance/OPEN_QUESTIONS.md](docs/governance/OPEN_QUESTIONS.md).

## Proposals

Open question: [OQ-GOVERNANCE-PROPOSALS](docs/governance/OPEN_QUESTIONS.md#oq-governance-proposals) — who may **offer** a proposal, in what form, and where (GitHub issue/PR today; a Hummingbird-owned Offer surface only after the Phase 3 gate opens)?

## Charter publication lifecycle

This is the authoritative definition of the Charter's publication stages. [CHARTER.md](CHARTER.md) and [docs/charter/](docs/charter/) reference this section rather than redefining it.

- **C0 — Working Charter.** The Charter as stored in Git at [CHARTER.md](CHARTER.md), root of the repository. Not represented as ratified or under formal review. May change freely; every change is an ordinary commit, not a governed amendment.
- **C1 — Charter Candidate.** A version of the Charter explicitly designated and published for review at the existing stable public Charter surface (`datum.quest/charter`) and mirrored in [docs/charter/](docs/charter/) (e.g. `candidate-0.1.md`). Clearly labeled "Charter Candidate — not yet ratified." The route already exists; moving from C0 to C1 is a deliberate steward/governance publication action, never an automatic consequence of technical availability or phase completion.
- **C2 — Review.** The period during which amendment proposals against the current candidate are considered. A substantive change produces a new candidate version (`candidate-0.2.md`, etc.) rather than silently editing the version under review.
- **C3 — Ratified.** The current governing Charter once accepted (`charter-1.0.md`, and later versions). Ratified constitutional text is never silently edited: subsequent amendments go through C1/C2 again against the ratified text and produce a new ratified version plus a dated record under `docs/charter/amendments/`. Previous ratified and candidate versions are preserved, never deleted.

Open question: [OQ-GOVERNANCE-AMENDMENT-THRESHOLD](docs/governance/OPEN_QUESTIONS.md#oq-governance-amendment-threshold) — amendment approval threshold, constituency, and voting process for moving C1→C2→C3 or amending a C3 Charter. This lifecycle defines the stages a change moves through; it does not define who approves the move or by what margin.

## Decisions

Technical/architectural decisions affecting the codebase or infrastructure are recorded as Architecture Decision Records in [docs/decisions/](docs/decisions/).

### C0 non-technical decision process

While the Charter remains at **C0**, non-technical and governance decisions may be adopted as explicit **working-draft institutional decisions**. This is a development process, not ratification.

A C0 working-draft decision must be:

- public in the repository or another published institutional record;
- traceable to the question, evidence, or prior rule it addresses;
- reasoned enough that a reader can understand the material basis and consequence;
- versioned and revisable while C0 remains a working draft;
- clearly distinguished from a ratified Charter rule or a later governed amendment.

Input may be synthesized, grouped, deferred, or declined rather than receiving individualized steward attention. Access to offer an idea does not by itself create a right to a bespoke response, canonical admission, publication, governance promotion, or a particular outcome. Volume and repetition may reveal that an issue exists, but do not by themselves create governance authority or deliberative weight.

A C0 decision may guide current development once adopted, but it cannot bootstrap permanent authority. It cannot be used to represent the Charter as ratified, bypass a named phase or publication gate, silently create hidden participant standing, or make the steward's present residual authority self-perpetuating.

Later Charter/governance stages supersede or constrain this C0 process as their own authorized mechanisms come into force.

### Minimum necessary authority

Hummingbird handles a matter at the **lowest layer that can resolve it legitimately and safely**. Escalation occurs because a lower layer lacks the authority, information, or capability required — not merely because a higher-authority layer exists.

The design goal is to keep routine handling away from the steward. Where a repeatable decision can be made transparently by a deterministic rule, a bounded local process, or a published synthesis/review layer, that mechanism should be preferred over individualized steward judgment.

When a lower layer proves capable of carrying authority safely and legitimately, the system should prefer delegating or encoding that authority rather than retaining unnecessary steward involvement.

### Published handling contracts

Every consequential handling layer must publish a handling contract before or with operation. At minimum the contract must state:

1. **purpose and scope** — what the layer exists to handle;
2. **entry conditions** — what causes a matter to reach it;
3. **required information** — what information it actually needs, with unnecessary identity or metadata excluded;
4. **authority and limits** — what it may decide and what it may not decide;
5. **possible outcomes** — the bounded classes of consequence that may result, including what an outcome does **not** imply where ambiguity would otherwise matter;
6. **escalation or review path** — when a matter ends, moves to another layer, or becomes eligible for proportionate review.

No consequential layer may depend on materially hidden outcome classes. Security-sensitive implementation details may remain non-public when necessary, but the kinds of consequence a layer can impose must be knowable.

A cheap or machine-readable outcome may be sufficient where the consequence is correspondingly small. Greater durability, restriction, or institutional consequence requires a stronger explanation and review path consistent with the Charter.

### Current C0 handling layers

These are the current governance-handling layers for C0 development. They describe authority, not a future Phase 3 implementation or formal proposal process.

| Layer | Needs | Authority / limits | Potential outcomes |
| --- | --- | --- | --- |
| **Deterministic / administrative handling** | A published rule and the minimum information needed to apply it | May validate, route, detect obvious duplication, enforce repository/process form, or apply other already-published non-discretionary rules. It may not invent a new substantive rule. | handled under the existing rule; routed onward; identified as duplicative/invalid for that bounded process; escalated because judgment is required |
| **Synthesis / review** | The material under consideration plus enough context to preserve its meaning and relationships | May group related material, summarize, identify conflicts or unresolved questions, and reduce volume. It may not turn synthesis into hidden substantive authority. | synthesized/linked; deferred; identified as already addressed; surfaced as an unresolved institutional question; escalated |
| **Institutional working-decision layer** | A concrete question, relevant published rules, material evidence, and the consequence being considered | May retain an existing rule, draft or revise C0 working policy, keep a question open, or identify that another authorized process is required. It may not claim ratification or bypass a gate. | current rule retained; C0 working decision adopted/revised; question remains open/deferred; matter routed to another named process; escalated where residual authority is required |
| **Steward residual layer** | A matter that lower layers cannot legitimately resolve, plus the record of why escalation is necessary | May exercise the present C0 authority described below. The steward is not the default queue and gains no authority merely because a matter reached this layer. | C0 working decision; explicit deferral; request for further evidence/process; implementation direction within existing authority; preservation of the open question |

A future layer — including an Offer Buffer, local space, automated classifier, capability review, or governance workflow — must publish its own concrete handling contract before it becomes consequential. This table does not authorize those future layers.

### Institutional non-capture and portability

Hummingbird may nurture work, communities, practices, protocols, or institutions without requiring them to remain dependent on Hummingbird merely because they originated here.

Where practical, Hummingbird should support portability, independent continuation, and legitimate forking. Provenance may record where something began; provenance does not by itself create institutional ownership of its future.

A design that unnecessarily requires Hummingbird's domain, database, credential issuer, or steward to remain alive for independent work to continue should be treated as a lock-in risk and justified explicitly.

## Evaluation without identity metrics

Hummingbird does **not** currently maintain a global participant score, content score, trust rank, reputation number, identity-weight multiplier, or hidden behavior grade. There is no algorithm that turns a participant into a scalar standing value.

When Hummingbird says that contributions are evaluated by **content, behavior, and effect**, those words describe decision dimensions, not a universal scoring formula:

- **Content** concerns the offered material itself: whether it is intelligible enough to consider, relevant to the stated scope, materially duplicative or connected to existing work, supported where factual claims require support, and representable without importing unnecessary provider metadata.
- **Behavior** concerns observable interaction with the commons: compliance with published safety and space rules, flooding/replay/duplication patterns, attempts to evade bounded controls, and other actions that affect the integrity or availability of the shared system.
- **Effect** concerns consequences: whether an action improves or degrades the commons, creates avoidable security/privacy/resource burden, corrects or compounds error, preserves reversibility where appropriate, or materially affects other participants or public institutional records.

These dimensions must be tied to a **specific decision**. Examples include admitting, deferring, combining, declining, rate-limiting, correcting, superseding, withdrawing, or escalating material for a different process. They do not automatically create durable standing for the participant associated with the action.

### Current Phase 2 admission criteria

During the current steward-controlled Phase 2 admission path, a candidate should be admitted to canonical memory only when all of the following are true:

1. there is a concrete meaning Hummingbird intends to remember rather than merely a provider-hosted discussion artifact;
2. the record fits the published canonical model and lifecycle;
3. provenance is sufficient to understand the source/reference without copying unnecessary identity, reaction, thread, device, or provider metadata;
4. the candidate does not contain secrets, private personal information, vulnerability details, or other material inappropriate for durable/public institutional memory;
5. durable retention is proportionate — references are preferred over copies and obvious duplication should be avoided;
6. admission is not being represented as publication, endorsement, governance approval, or proof that the underlying claim is correct.

A separate publication decision is required before a canonical record is released on the public read plane.

### No hidden institutional criteria

If Hummingbird later introduces an automated classifier, admission rule, moderation threshold, capability-grant test, or other consequential decision procedure, its operative criteria must be documented before or with deployment. Material criteria should be traceable to the Charter, Governance documents, Security rules, or an explicit Decision Record.

Where no published rule exists, a steward judgment must be described as judgment rather than presented as an objective score or settled governance process. Unresolved criteria remain open questions instead of becoming policy by implementation accident.

## Future local governance — not yet active

The working participatory-space design in [SPACES.md](SPACES.md) allows a future room, cafe, pub, workshop, garden, game room, or similar space to govern bounded local interactions through a public constitution.

The intended boundary is:

**Spaces may govern their own interactions, but may not alter the rights, security boundaries, or standing of participants outside those spaces.**

A future local constitution may be able to choose from safe governance primitives such as opening hours, tile/action intervals, proposal thresholds, voting/consent rules, shared-object behavior, or delayed effective dates. It must not acquire arbitrary executable-code authority, infrastructure credentials, private security controls, or the ability to rewrite Hummingbird-wide constitutional rights.

This is a direction, not an active delegation. [OQ-GOVERNANCE-SPACE-CONSTITUTIONS](docs/governance/OPEN_QUESTIONS.md#oq-governance-space-constitutions) must be resolved before self-governed spaces are deployed.

## Future guilds and capability grants — not yet active

A persistent association may eventually constitute a guild with a public constitution, membership history, and internal consent process. A guild is not a higher participant class.

The working model permits a guild to request a narrowly scoped institutional capability, such as extended retention of a shared workshop between ordinary room-cleanup cycles. The request would expose the member decision, pass automatic policy/security checks, receive steward/security review where appropriate, and result in a public grant, modified grant, or denial.

A grant should:

- belong to the guild/shared activity rather than individual members;
- name its exact scope and purpose;
- expire or be reviewed rather than create permanent rank;
- have explicit revocation/modification conditions;
- never confer constitutional superiority, purchased influence, or rights over outsiders.

Minimum guild membership may eventually create eligibility to **request** a grant, but membership count alone should not automatically produce authority or resource multipliers. Cheap multiplicity and Sybil-sensitive rules remain a security/governance concern.

[OQ-GOVERNANCE-GUILD-GRANTS](docs/governance/OPEN_QUESTIONS.md#oq-governance-guild-grants) and [OQ-SECURITY-MULTIPLICITY-ABUSE](docs/governance/OPEN_QUESTIONS.md#oq-security-multiplicity-abuse) must be resolved before these grants exist.

## Facilitation

Open question: [OQ-GOVERNANCE-FACILITATION](docs/governance/OPEN_QUESTIONS.md#oq-governance-facilitation) — is there a designated facilitator role distinct from the steward? What are its powers and limits?

## Steward scope

The steward is a **residual authority layer**, not the normal decision engine. Steward involvement is appropriate only where a lower published layer cannot legitimately or safely resolve the matter, or where existing documents explicitly assign the action to the steward.

During C0 and the current roadmap phase, the steward may:

- maintain the repository, deployment, secrets, backups, recovery mechanisms, and other day-to-day operations;
- execute current security and operational procedures within the authority already published in [SECURITY.md](SECURITY.md) and [OPERATIONS.md](OPERATIONS.md);
- apply already-published admission and publication criteria;
- synthesize high-volume input or rely on published synthesis layers rather than individually reviewing every item;
- make and record C0 working-draft institutional decisions when lower layers cannot resolve the issue;
- sequence roadmap work and defer an action when Hummingbird lacks a legitimate process or sufficient evidence to take it;
- implement decisions already authorized by the Charter, Governance documents, ADRs, or other published institutional rules.

The steward may **not**, merely by virtue of stewardship:

- ratify the Charter or bypass a named Charter, phase, security, or governance gate;
- create hidden participant classes, standing, reputation, or governance weight;
- convert financial support, identity claims, credentials, origin claims, or repetition into automatic authority;
- treat stewardship as ownership of work, communities, or practices that can legitimately continue elsewhere;
- silently broaden a bounded operational power into permanent constitutional or governance authority;
- resolve an open question by implementation accident or present discretionary judgment as an objective rule.

The steward should continually ask whether recurring residual authority can be moved into a lower, explicit, inspectable layer. Successful stewardship should reduce unnecessary dependence on the steward rather than make the steward the center of ordinary participation.

This section resolves the current **scope of steward authority**; it does not resolve long-term succession, a multi-steward model, formal emergency authority, or the future proposal process. Those remain separately governed questions.

Open question: [OQ-GOVERNANCE-STEWARD-SUCCESSION](docs/governance/OPEN_QUESTIONS.md#oq-governance-steward-succession) — long-term steward succession and multi-steward model.

## Disputes

Open question: [OQ-GOVERNANCE-DISPUTES](docs/governance/OPEN_QUESTIONS.md#oq-governance-disputes) — dispute resolution process for participants or contributions.

## Validated needs

Open question: [OQ-GOVERNANCE-VALIDATED-NEEDS](docs/governance/OPEN_QUESTIONS.md#oq-governance-validated-needs) — process for identifying and validating "needs" referenced in the Mission (Phase 4, see [ROADMAP.md](ROADMAP.md)).

## Emergency authority

See [CHARTER.md](CHARTER.md) §6 — [OQ-GOVERNANCE-EMERGENCY-AUTHORITY](docs/governance/OPEN_QUESTIONS.md#oq-governance-emergency-authority), not yet defined.

## Review and revision

This document should be revisited as each Roadmap phase begins, since new phases introduce new governance surface area (proposals, disputes, local-space constitutions, delegated capabilities, financial transparency).

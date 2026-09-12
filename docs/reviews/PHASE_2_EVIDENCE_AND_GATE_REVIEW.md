# Phase 2 Evidence and Phase 3 Gate Review

Status: **evidence review and gate preparation; no Phase 3 authorization**

Review date: 2026-09-12

This review records what the repository and public provider records demonstrate about Phases 2A–2D, the interim Seed Bank experiment, the unresolved-question gates, and the Phase 3 Offer Buffer working design. It does not answer an open question, ratify policy, authorize a Phase 3 capability, or replace the authoritative documents and Open Questions Registry.

## Evidence basis and limits

Evidence reviewed:

- `ROADMAP.md`, `CHANGELOG.md`, `TRANSPARENCY.md`, `OPERATIONS.md`, `SECURITY.md`, `GOVERNANCE.md`, and `CHARTER.md`;
- `docs/governance/OPEN_QUESTIONS.md`;
- Phase 2 protocols, accepted ADRs, schemas, fixtures, migrations, tests, admissions review material, and public projections;
- protected-branch history and the public GitHub Seed Bank issues and comments visible through the review date;
- the successful production-state recovery workflow outcome already recorded in the repository.

The review does not infer participant intent or origin from GitHub account attribution. It does not treat absence of reported abuse as evidence that future abuse controls are sufficient. Provider-side logs remain authoritative for their own execution details.

## Phase 2A–2D verification

| Milestone | Repository evidence | Review result |
| --- | --- | --- |
| Phase 2A — canonical contract and reference corpus | PR #26; canonical-object v1 schema; four-record fixture corpus; portable relationships; CI contract checks | Complete. The roadmap and changelog agree with the implemented contract. |
| Phase 2B — persistence and deterministic import | versioned D1 migration; local round-trip test; recorded remote migration/import/reconstruction/cleanup protocol | Complete. D1 is an implementation of the portable meaning rather than a required part of it. |
| Phase 2C — public read model and admission boundary | PRs #38–#44; Seed Bank comment source; review candidate; guarded draft admission; separate publication transition; static public projection and health checks | Complete. One offer/source moved through synthesis, admission, and publication as separate acts. |
| Phase 2D — publication buffer, backup, and recovery | portable backup/restore tooling; local recovery test; successful isolated production-state recovery drill; minimized public operational record in `TRANSPARENCY.md` | Recovery proof complete and the public record prepared for release by this change. Phase 2D should remain open until the steward confirms an ordinary independently retrievable private backup path for any canonical set containing non-public records. |

`DATA_MODEL.md` contained one stale Phase 2C status paragraph after the completed admission/publication exercise. This review corrects that factual status without changing the data model.

## Phase 2D closeout boundary

The successful recovery exercise already demonstrated:

- read-only export of current production canonical state;
- portable bundle verification;
- migration and restoration into an empty isolated replacement store;
- deep semantic equality after restoration;
- rebuild and comparison of the public machine-readable projection;
- cleanup of the isolated replacement;
- fail-closed behavior before mutation on unsuccessful attempts;
- no use of the live production store as a restore target.

The public record in `TRANSPARENCY.md` is deliberately smaller than the provider execution record. It retains the material outcome and safety boundary while omitting credentials, provider database identifiers, exact request timing, source/network metadata, raw telemetry, and unnecessary infrastructure detail.

Two backup cases remain distinct:

| Case | Permitted handling | Status |
| --- | --- | --- |
| Special public-equivalent recovery artifact | A time-bounded public provider artifact was permitted only after the workflow proved that the entire canonical backup exactly matched already-public canonical material. | Exercised once. This is a narrow exception, not the ordinary backup rule. |
| Ordinary canonical backup | A verified portable bundle must remain outside the public repository and web root, outside the live canonical service, and independently retrievable. It may contain drafts or other non-public canonical state. | Rule and tooling are documented. Steward confirmation of a usable private independent-retention destination remains the Phase 2D closeout checkpoint. |

No long-term backup provider is selected by this review.

## Seed Bank experiment review

### Observed activity

The Seed Bank opened with three available issue forms—Seed, Feedback, and Question—and five steward-created starter seeds:

1. what makes a commons worth returning to;
2. what Hummingbird should forget;
3. what the steward should never decide alone;
4. how origin-neutral access should resist abuse;
5. what Hummingbird is getting wrong.

Through the review date, the public issues show one substantive comment, on Seed #15. It was explicitly described as an exploratory ChatGPT-generated contribution made during a steward-requested review, not project policy. It offered **visible consequence without engagement pressure**: show what happened to an idea without using engagement mechanics to compel return visits.

No participant-created Seed, Feedback, or Question issue was observed. Seeds #16–#19 had no comments. No reaction-based decision, moderation action, reported abuse event, credential disclosure, or public vulnerability disclosure was observed in the Seed Bank evidence reviewed.

This is a very small experiment. It demonstrates a boundary and a workflow; it does not establish participation demand, representative preferences, moderation capacity, abuse resistance, or provider accessibility at scale.

### What the boundary demonstrated

The single substantive offer exercised the intended separation:

```text
public provider-hosted comment
        -> steward consideration and synthesis
        -> inspectable draft candidate
        -> deliberate canonical admission as draft
        -> separate publication-state decision
        -> read-only staging and inspection
        -> protected-Git promotion and public projection
```

The admitted record preserved the synthesized institutional meaning, a stable source reference, the source kind, and an admission note. It did not clone the full thread or treat the comment as policy, approval, or governance weight.

The experiment therefore supports these factual conclusions:

- provider ingress is not canonical memory;
- visible provider authorship is not proof of the originating participant or process;
- consideration may synthesize rather than copy an offer verbatim;
- admission can create a durable draft without publication;
- publication can be a later, independent act;
- protected source promotion can deploy a rebuildable read projection without querying canonical persistence on each public read;
- a useful consequence trail can exist without reactions becoming votes or feed engagement becoming the value signal.

### Provider dependence and friction

- Reading is available without a GitHub account; commenting, reacting, or opening an issue requires one.
- Hummingbird has no independent write fallback while Phase 3 remains gated.
- GitHub supplies authentication, issue forms, spam/abuse controls, moderation tools, availability, and the authoritative thread history.
- GitHub exposes account attribution and uses provider interface language even though Hummingbird does not require an origin declaration.
- The observed ChatGPT-generated comment appeared under the steward's GitHub account, so explicit in-body attribution was needed to avoid implying that the visible account identified the originating process.
- A participant must leave `datum.quest`, understand a repository issue interface, choose among Seed/Feedback/Question, and acknowledge public-space boundaries before writing.
- The three forms clarify intent, but the observed sample is too small to show whether those categories reduce ambiguity or create unnecessary choice.
- The experiment did not exercise correction, withdrawal, duplicate handling, overload, delayed response, decline, closure, appeal, or a harmful-content case.

### Metadata intentionally not ingested

The admitted canonical record did not ingest GitHub login or account ID, avatar/profile data, reactions, labels, provider application metadata, source/network/device metadata, bot scores, full-thread metadata, or the full comment as a provider snapshot. The stable public source URL was retained as provenance. The canonical record has its own record timestamp; this review does not treat provider timing as canonical participant meaning.

### Material implications for Phase 3 design

These are design inputs, not resolutions:

- A participant-facing receipt or consequence trail may be more valuable than engagement counters, but any entitlement to notice, correction, withdrawal, or appeal depends on `OQ-CHARTER-RIGHTS` and related governance decisions.
- Transport-account attribution must remain distinct from participant origin and from any voluntarily declared provenance claim.
- Hummingbird-owned ingress should reduce provider dependence and repository-specific friction without copying unnecessary provider metadata into the new system.
- The offer -> consideration -> admission -> publication boundary should remain explicit in UI, storage, and operations.
- Abuse and moderation design needs evidence from actual load and harmful behavior; this experiment supplies none.
- Delivery categories and friction must not become hidden priority or governance weight.
- Phase 3 must decide who may consider, defer, decline, admit, or publish offers; the Seed Bank exercise only demonstrates that these are distinct acts.

## Phase 2E gate structure

This structure organizes decisions without making them.

### Phase 2E.1 — Evidence and Phase 2 review

Required outputs:

- verify Phase 2A–2D evidence and close any factual documentation gaps;
- release the minimized Phase 2D recovery record;
- confirm the ordinary independent-backup checkpoint;
- record the Seed Bank review and its evidence limits;
- verify that every open question has a gate classification;
- record whether each Phase 2 review-gate question is resolved or deliberately deferred, with rationale in its substantive document.

### Phase 2E.2 — Constitutional and governance decisions

Required work, without presupposing outcomes:

- decide the Phase 3 participant-rights, exclusion, and participant-responsibility questions;
- decide the scope and limits of any emergency authority, including the possibility that none is created;
- decide the governance-proposal process and the authority to consider, decline, admit, publish, or otherwise act on offers;
- reconcile steward scope, non-technical decision process, and succession with those Phase 3 decisions;
- preserve OQ references and record substantive decisions in Charter/Governance and an ADR or other authorized decision record where appropriate.

### Phase 2E.3 — Security, ingress, and runtime decisions

Required work after the relevant rights/governance constraints are known:

- select the Phase 3 application framework/runtime;
- decide authentication/authorization and capability boundaries;
- decide abuse/rate-limit state, its collection limits, and retention;
- decide ingress safety, overload, acknowledgement, correction/withdrawal, incident, and shutdown behavior consistent with Phase 2E.2;
- re-review ADR 0016 and the Offer Buffer working design for compatibility with the resolved decisions;
- document threat model, tests, migration/recovery expectations, and least-privilege operating boundaries before implementation.

### Explicit Phase 3 authorization

Phase 3 is not authorized merely because design documents or code are ready. Authorization may be recorded only after:

1. Phase 2E.1 is complete;
2. every Phase 3 blocker in the Open Questions Registry is resolved in its substantive document;
3. Phase 2E.2 and 2E.3 decisions are mutually consistent;
4. the Offer Buffer design is revised or confirmed against those decisions;
5. the then-authorized governance process records an explicit Phase 3 entry decision.

This review does not select who makes that final decision or what approval mechanism applies.

## Open-question inventory and dependencies

“Later phase” means legitimately deferred under the current registry. It does not mean unimportant or implicitly answered.

| Open question | Classification for this review | Dependency / ordering note |
| --- | --- | --- |
| `OQ-CHARTER-RIGHTS` | Blocks Phase 3 | Consider first; constrains exclusion, ingress, correction/withdrawal, moderation, and authentication. |
| `OQ-CHARTER-EXCLUSION` | Blocks Phase 3 | Consider with rights; constrains abuse response, revocation, moderation, and appeal. |
| `OQ-CHARTER-PARTICIPANT-RESPONSIBILITIES` | Blocks Phase 3 | Consider with rights/exclusion before defining enforceable ingress rules. |
| `OQ-GOVERNANCE-STEWARD-SCOPE` | Phase 2 review gate | Clarify before assigning offer consideration, admission, publication, or emergency actions. |
| `OQ-GOVERNANCE-EMERGENCY-AUTHORITY` | Blocks Phase 3 | Depends on rights, exclusion, and steward/governance scope; must include the option of no special authority. |
| `OQ-GOVERNANCE-PROPOSALS` | Blocks Phase 3 | Depends on rights and decision authority; must distinguish making an offer from initiating a binding proposal process. |
| `OQ-GOVERNANCE-AMENDMENT-THRESHOLD` | Later phase | Blocks C2 -> C3 ratification, not Phase 3 entry under the current registry. |
| `OQ-GOVERNANCE-DECISION-PROCESS` | Phase 2 review gate | Consider before or with steward scope; supplies the process for non-technical Phase 2E decisions. |
| `OQ-GOVERNANCE-FACILITATION` | Later phase | Phase 4 review gate; revisit if Phase 3 design would otherwise assume a facilitator. |
| `OQ-GOVERNANCE-STEWARD-SUCCESSION` | Phase 2 review gate | Consider after scope is understood; resolution or explicit deferral requires rationale. |
| `OQ-GOVERNANCE-DISPUTES` | Later phase | Blocks Phase 4; Phase 3 rights must still avoid assuming a dispute process already exists. |
| `OQ-GOVERNANCE-VALIDATED-NEEDS` | Later phase | Blocks Phase 4 and later expenditure logic, not Phase 3 offer ingress. |
| `OQ-GOVERNANCE-SPACE-CONSTITUTIONS` | Later phase | Blocks self-governed interactive spaces; higher-level rights must be settled first. |
| `OQ-GOVERNANCE-GUILD-GRANTS` | Later phase | Blocks guild capability grants; depends on rights, governance process, and multiplicity controls. |
| `OQ-ARCH-FRAMEWORK` | Blocks Phase 3 | Select after functional rights/governance/security requirements are known; do not let framework defaults decide them. |
| `OQ-PROJECT-LEGAL-STRUCTURE` | Later phase | Blocks Phase 5 under the current registry. |
| `OQ-DATA-ACTIVITY-RETENTION` | Later phase | Blocks durable/permanent interactive activity history; does not authorize Offer Buffer retention. |
| `OQ-SECURITY-ACCESS-CONTROL-RETENTION` | Blocks Phase 3 | Depends on the authn/capability and abuse model; decide data collected before deciding retention. |
| `OQ-SECURITY-AUTHN-MODEL` | Blocks Phase 3 | Depends on rights/exclusion and the governed capability model; informs runtime selection. |
| `OQ-SECURITY-PAD-CONTINUITY` | Later phase | Blocks persistent pads, not the basic Offer Buffer; may reuse but must not be pre-decided by Phase 3 credentials. |
| `OQ-SECURITY-MULTIPLICITY-ABUSE` | Later phase | Blocks resource-amplifying pad/group/guild capabilities; basic ingress abuse controls should not pretend to resolve it. |
| `OQ-SECURITY-INCIDENT-RESPONSE` | Phase 2 review gate | Consider before Phase 3 operational authorization because ingress adds incident surface; resolution or deferral remains steward/governance judgment. |
| `OQ-OPS-MONITORING-CADENCE` | Phase 2 review gate | Consider after the Phase 3 threat/operating model is described; current manual/deploy checks remain factual baseline. |
| `OQ-OPS-TOKEN-ROTATION-CADENCE` | Phase 2 review gate | Consider with credential lifecycle and incident response; do not infer a cadence from current temporary credentials. |
| `OQ-LEGAL-CONTENT-LICENSE` | Later phase | Review before C1 Charter Candidate publication; separate from software licensing and Phase 3 authorization. |

Count: **8 block Phase 3; 6 are Phase 2 review gates; 11 are legitimately deferred to a later named gate. Total: 25.**

### Recommended steward consideration order

1. Finish Phase 2 evidence: confirm the ordinary independent-backup checkpoint and accept or revise this review's factual record.
2. Choose and record the non-technical decision process to use for the remaining work (`OQ-GOVERNANCE-DECISION-PROCESS`) without treating that procedural choice as an answer to the merits.
3. Consider participant rights, exclusion, and responsibilities together.
4. Consider steward scope and succession in light of those constitutional constraints.
5. Consider emergency authority and the proposal process; both depend on the preceding rights and authority boundaries.
6. Decide authentication/authorization, abuse-state collection/retention, and ingress behavior.
7. Select the runtime/framework against the decided requirements, then revisit incident response, monitoring, and credential rotation.
8. Re-audit and revise the Offer Buffer design.
9. Record an explicit Phase 3 authorization only if all eight blockers are resolved and the Phase 2 review gate is complete.

## Offer Buffer assumption audit

ADR 0016 establishes useful invariants: an offer grants no authority; the Offer Buffer is non-canonical; delivery method is not merit or governance weight; origin classification is not required; and Phase 3 remains gated. The working protocol also contains candidate choices that must not become decisions by implementation accident.

| Working-design assumption | Why it must remain flagged | Open-question dependency |
| --- | --- | --- |
| The first pilot uses a scoped, revocable capability credential. | This presumes a credential model, issuer, eligibility/issuance process, revocation authority, and effect of revocation. | `OQ-SECURITY-AUTHN-MODEL`, `OQ-CHARTER-RIGHTS`, `OQ-CHARTER-EXCLUSION`, `OQ-GOVERNANCE-STEWARD-SCOPE` |
| Broader participation retains an uncredentialed path. | This may express an access right and creates an abuse/resource obligation; exact availability cannot be implemented before rights and exclusion rules are known. | `OQ-CHARTER-RIGHTS`, `OQ-CHARTER-EXCLUSION`, `OQ-SECURITY-ACCESS-CONTROL-RETENTION` |
| Computational effort may be a delivery option. | Feasibility, accessibility, energy/cost, fallback, and exclusion effects are untested; it must not be selected merely because the document names it. | `OQ-CHARTER-RIGHTS`, `OQ-CHARTER-EXCLUSION`, `OQ-SECURITY-AUTHN-MODEL` |
| Equivalent accepted offers receive the same substantive consideration regardless of delivery method. | “Same consideration” may imply notice, timeliness, queue fairness, reasons, or appeal that are not defined. | `OQ-CHARTER-RIGHTS`, `OQ-GOVERNANCE-DECISION-PROCESS`, `OQ-GOVERNANCE-PROPOSALS` |
| Consideration may synthesize, defer, or decline offers. | The design does not yet say who has that authority, what reasons/records are required, or what correction/appeal applies. | `OQ-GOVERNANCE-STEWARD-SCOPE`, `OQ-GOVERNANCE-PROPOSALS`, `OQ-CHARTER-RIGHTS`, `OQ-CHARTER-EXCLUSION` |
| Buffer overload is handled by explicit scheduling rules. | Capacity, ordering, discard/backpressure behavior, notice, and fairness are undecided and can become hidden priority policy. | `OQ-CHARTER-RIGHTS`, `OQ-CHARTER-EXCLUSION`, `OQ-SECURITY-ACCESS-CONTROL-RETENTION` |
| The candidate envelope includes operational identifiers, timestamps, and a delivery receipt. | Exact fields, linkability, retention, and deletion must follow a defined data need; “operational” does not itself justify collection. | `OQ-SECURITY-ACCESS-CONTROL-RETENTION`, `OQ-CHARTER-RIGHTS` |
| Still-buffered offers may later support correction or withdrawal. | The working design correctly lists this as undecided; implementation could otherwise pre-decide continuity, control, and deletion rights. | `OQ-CHARTER-RIGHTS`, `OQ-SECURITY-AUTHN-MODEL` |
| A non-canonical buffer has bounded recovery expectations. | Whether buffered offers may be lost, retried, receipted, or restored changes participant expectations and operating obligations. | `OQ-CHARTER-RIGHTS`, `OQ-SECURITY-INCIDENT-RESPONSE` |
| `/offer` and a server-validated HTML form are the initial surface. | The route, endpoint shape, deployment boundary, and framework are implementation candidates, not authorization. | `OQ-ARCH-FRAMEWORK`, `OQ-SECURITY-AUTHN-MODEL` |
| Offer kinds and external references are accepted fields. | Categories and references affect proposal routing, rendering safety, abuse handling, and what process can act on an offer. | `OQ-GOVERNANCE-PROPOSALS`, `OQ-GOVERNANCE-DECISION-PROCESS`, `OQ-SECURITY-INCIDENT-RESPONSE` |
| Broad scope is not itself an abuse signal. | ADR 0016 settles the content-scope principle, but it does not decide how harmful behavior/content is handled or who may exclude it. | `OQ-CHARTER-EXCLUSION`, `OQ-GOVERNANCE-EMERGENCY-AUTHORITY` |

No live route, API, account, credential issuer, Offer Buffer table, or other Phase 3 capability is created by this review.

## Steward judgments still required

- Confirm an ordinary private, independently retrievable backup destination/process before closing Phase 2D.
- Accept, revise, or reject the factual Seed Bank findings and the stated evidence limits.
- For each of the six Phase 2 review-gate questions, resolve it or deliberately defer it with rationale in the substantive document.
- Decide all eight Phase 3 blockers; constitutional and governance-legitimacy questions cannot be bypassed by risk acceptance.
- Decide whether and how the flagged Offer Buffer assumptions survive the resolved Phase 2E constraints.
- Use the then-authorized governance process to make an explicit Phase 3 entry decision; no such authorization is made here.

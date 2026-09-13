# ADR 0022 — Phase 2E.1 Review-Gate Dispositions

Status: accepted for the C0 / Phase 2 working institution

Date: 2026-09-12

## Context

Phase 2E.1 requires Hummingbird to revisit four non-blocking Phase 2 review gates before moving into the constitutional/governance and security/runtime work of Phase 2E.2 and Phase 2E.3:

- `OQ-GOVERNANCE-STEWARD-SUCCESSION`
- `OQ-SECURITY-INCIDENT-RESPONSE`
- `OQ-OPS-MONITORING-CADENCE`
- `OQ-OPS-TOKEN-ROTATION-CADENCE`

These are review gates rather than Phase 3 entry blockers. The review must not manufacture permanent constitutional, governance, participant-rights, emergency, authentication, or exclusion rules merely to remove bookkeeping friction.

The steward reviewed each question against the current operational evidence and adopted the phase-bounded dispositions below. Where a broader substantive question remains open, this ADR records an explicit deferral and the constraints that must survive into the later decision.

## Decision

### 1. Steward succession — defer substantive design to Phase 2E.2

Hummingbird deliberately defers the long-term succession and multi-steward model until the participant-rights, exclusion, emergency-authority, and proposal-governance constraints that a future steward would inherit are better defined.

The current steward may continue serving for as long as that service remains useful to the commons. Continuity, accumulated institutional knowledge, maintenance effort, expertise, willingness to serve, founding history, financial support, or operational custody may justify attention and continued participation, but none independently creates permanent institutional authority, a right to preserve the current structure, or a founder/incumbent veto.

Successful stewardship means reducing unnecessary dependence on one person, not forcing that person to disappear. A future legitimate governance process must be able to restructure stewardship, divide it among multiple roles, narrow it, or replace it without requiring preservation of the founder's present role. Conversely, reducing dependence on the steward does not require excluding or diminishing a steward who continues to contribute under the then-valid published rules.

Future succession design must distinguish, wherever practicable:

- **operational custody** — credentials, domains, deployment, backup/recovery assets, and similar control-plane capabilities;
- **institutional stewardship** — maintenance of records and execution of valid institutional decisions; and
- **governing authority** — whatever authority future governance actually grants.

Transfer of custody is not transfer of sovereignty. Material continuity dependencies should not remain indefinitely recoverable only through one steward's private availability, but solving that custody risk must not silently create governance authority for a custodian.

Future design should also distinguish voluntary retirement, gradual delegation, temporary incapacity, death/unavailability, credential loss, misconduct, governance disagreement, and legitimate institutional forking rather than assuming one succession mechanism fits every event.

For this ADR, a "legitimate future governance process" means the process valid under Hummingbird's then-applicable published governance; it does not presume a voting, majoritarian, or other mechanism that has not yet been authorized.

`OQ-GOVERNANCE-STEWARD-SUCCESSION` therefore remains substantively open, with its next review in Phase 2E.2.

### 2. Incident response — adopt a small Phase 2 operational lifecycle; defer the mature Phase 3 regime to Phase 2E.3

Phase 2 needs a real incident discipline now, even though participant-facing incident rights and emergency governance are not yet settled.

For Phase 2, an incident is a credible event involving plausible compromise, unauthorized mutation, exposure of secrets or non-public material, loss/corruption of canonical state, material loss of recoverability, sustained attack/resource exhaustion, or material violation of a published security/privacy boundary. Loss of a key or recovery capability may be an incident even without an attacker.

The Phase 2 incident lifecycle is:

1. **recognize / declare** — the steward may treat a credible material threat as an incident before proof is complete;
2. **contain reversibly where practicable** — pause a bounded experimental surface, revoke/rotate credentials, stop a workflow or deployment, isolate suspect state, preserve a snapshot, roll back code, fail closed, or use an existing recovery path only within already-published operational authority;
3. **preserve minimum necessary evidence** — retain the least evidence required to understand and remediate the event when preservation does not prolong harm;
4. **recover and verify** — restoration is not complete merely because a page responds; relevant provenance, credentials, canonical integrity, backups/recovery, and production health must be re-verified according to the affected capability;
5. **record and disclose proportionately** — keep restricted security details private while necessary, then publish a minimized institutional record of material consequence, response, recovery status, and durable corrective action without exposing secrets, exploit-enabling detail, participant material, provider identifiers, or correlation-rich telemetry unnecessarily;
6. **close and learn** — record residual risk, corrective action, and whether temporary containment measures have been removed or separately authorized.

Monitoring or an incident declaration does not itself create mutation, governance, exclusion, or emergency authority. **Containment authority derives from authority already published before the incident, not from the existence or severity of the incident itself.**

Phase 2 operational containment may not be used to bootstrap permanent participant exclusion, delete canonical history for convenience, suspend governance rights, create secret constitutional rules, or otherwise answer `OQ-GOVERNANCE-EMERGENCY-AUTHORITY` by security practice.

Hummingbird should distinguish an ordinary observation, an incident, and a critical incident. A critical incident includes loss of trust in canonical integrity, material secret/control-plane compromise, material private-data exposure, or inability to trust/recover production state. The exact mature severity model, participant notification/correction/appeal duties, multi-steward incident roles, and any exceptional emergency authority remain future work.

The steward remains the current Phase 2 operational contact. Single-contact unavailability is an acknowledged residual risk linked to the succession/continuity work rather than a reason to invent unauthorized emergency governance now.

`OQ-SECURITY-INCIDENT-RESPONSE` therefore remains substantively open for the mature Phase 3 participant-facing and multi-role regime, with its next review in Phase 2E.3.

### 3. Monitoring — standardize observable capability contracts, not a universal timer

Hummingbird rejects one institution-wide monitoring cadence. Monitoring must follow the failure mode, consequence, and expected rate of change of the capability being observed.

The durable model is:

- **event-driven verification** after a deployment, migration, credential change, recovery action, or material provider/configuration change;
- **scheduled checks** where a capability can degrade without a repository change; and
- **periodic exercises** for properties such as recovery that ordinary uptime checks cannot prove.

Each consequential capability should eventually declare a small monitoring contract covering:

- what healthy means;
- how it is observed;
- how observation freshness is determined;
- what `degraded`, `failed`, and `unknown/stale` mean;
- what monitoring data may be collected;
- who or what receives an actionable failure; and
- what, if any, pre-authorized automated mitigation exists.

A failed or stale monitor means **unknown**, not healthy and not automatically failed. Monitoring must remain failure-oriented rather than surveillance-oriented: the availability of richer telemetry is not permission to collect participant identity, fingerprinting, raw request exhaust, offer content, or other unnecessary behavioral data.

Observation is not authority. A monitor may report or classify a condition and may invoke only tightly pre-authorized fail-safe behavior; it does not acquire canonical-mutation, credential, exclusion, recovery, or governance authority merely because it detected a problem.

Where consequence warrants it, important health claims should eventually be corroborated from outside the failure domain being observed. Phase 2 may explicitly accept single-source monitoring where risk is low. Monitoring should also expose enough freshness evidence that a dead monitor cannot masquerade as a healthy system.

Phase 2's current per-surface baseline includes deployment-triggered CI/build/production health verification, the scheduled public offer observer, the hourly private review/candidate-preparation path, daily encrypted canonical backup, event-driven workflow self-verification where already configured, and deliberate recovery exercises/checkpoints. A lightweight scheduled external public-read check is an appropriate additional Phase 2 control because public read-plane degradation can occur independently of deployment.

Cadences and tools are operational parameters, not constitutional promises. Material changes in write volume, persistent state, financial consequence, number of operational custodians, provider/failure domains, availability expectations, or observed failure modes require reassessment.

`OQ-OPS-MONITORING-CADENCE` remains substantively open for durable Phase 3 monitoring, alerting, ownership, redundancy, and service-level expectations, with its next review in Phase 2E.3.

### 4. Credential lifecycle — replace universal rotation cadence with risk-based lifecycle

Hummingbird does not adopt one permanent calendar rotation interval for every credential. Credential security should be based first on purpose limitation, least privilege, exposure surface, finite lifetime where practicable, and reliable revocation/replacement.

For every consequential credential class, Hummingbird should be able to identify without recording the secret itself:

- purpose;
- scope/capabilities;
- authorized consumer/custody boundary;
- storage location/class;
- whether it expires;
- how it is replaced;
- events requiring immediate revocation; and
- how successful replacement and predecessor retirement are verified.

Prefer, in order where practical:

1. no long-lived secret / workload or federated identity;
2. narrowly scoped expiring credentials; then
3. narrowly scoped long-lived credentials only where needed.

Immediate rotation or revocation is required on suspected compromise or unintended exposure, material custody/automation-context change, material scope change, compromise of the storage boundary, provider/security-mechanism change that invalidates the old assumptions, or loss of confidence about where the credential has existed.

Routine age is a backstop rather than the primary control. For the current Phase 2 production deployment token, **180 days is the operational review / ordinary maximum-lifetime baseline**, not a permanent Hummingbird rule. A shorter lifetime, automated rotation, or elimination of the stored secret is preferred when it can be achieved without reducing reliability or broadening authority.

A normal planned rotation should follow:

```text
create replacement
-> install in authorized consumer
-> verify the intended operation
-> revoke/expire predecessor
-> verify the predecessor no longer works
-> record the rotation event without secret material
```

When compromise is suspected, immediate revocation may take precedence over graceful overlap.

Different credential classes need not share a cadence. Offline recovery/decryption material, deployment credentials, provider-admin credentials, database/recovery credentials, and future workload identities have different exposure and consequence profiles. Credential custody remains an operational capability and does not confer governing authority.

`OQ-OPS-TOKEN-ROTATION-CADENCE` remains substantively open only as the broader durable Phase 3 credential-lifecycle design, with its next review in Phase 2E.3; the narrow Phase 2 review question about choosing an arbitrary deployment-token interval is closed by this risk-based disposition.

## Consequences

- Phase 2E.1 may close once these dispositions are reflected in the current review/roadmap/open-question records.
- The four underlying topics are not falsely represented as permanently solved where later Phase 2E.2/2E.3 work is still required.
- No Phase 3 blocker is removed by this ADR.
- No new participant right, exclusion power, emergency authority, authentication scheme, canonical mutation authority, or Phase 3 capability is created.
- Future implementation may change providers, cadences, credential technologies, monitoring tooling, or operational roles while preserving the constraints above.

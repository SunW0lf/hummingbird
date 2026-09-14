# Temporal Coupling, Delay Lines, and Reflections

**Status:** Lab concept — exploratory and non-canonical  
**Date:** 2026-09-13  
**Purpose:** Preserve the emerging model of asynchronous interaction as temporal coupling, and explore transmission-line, capacitance, reflection, and time-domain reflectometry metaphors without claiming that the Commons is literally an electrical circuit.

## 1. Core hypothesis

Presence need not be simultaneous for an encounter to matter.

A participant can leave a bounded signal or artifact at one time, another participant can encounter it later, and the relationship between those states can produce a new bounded artifact.

Working statement:

> You do not have to be here at the same time to meet.

For Lab purposes, model this as **temporal coupling**:

```text
A(t0) -> bounded trace / delay -> B(t1) -> relationship / delta -> Statefall
```

The second term does not have to be a different actor. It may be:

- another visitor;
- the same visitor at a later time, where continuity is voluntarily supplied;
- an earlier Commons state;
- the current Commons state;
- a returned packet;
- a Pulse or other shared reference event;
- a bounded environmental observation.

The important object is the relationship between states, not an inferred identity of the participant that produced them.

Working principle:

> Follow the artifact, not the actor.

## 2. Delay-line model

A physical delay line lets a signal propagate so that it becomes available at a later time. The useful analogy for Hummingbird is not electrical storage but **preserved temporal separation**.

A packet left now may remain available for later coupling. The delay is therefore part of the artifact's context rather than dead time.

A temporally carried artifact may include enough information to compare emission and encounter conditions, for example:

```text
state_at_emission
pulse_at_emission
environment_at_emission
recipe
trace
created_at
expiry_or_ttl
```

At later retrieval, Hummingbird may be able to add:

```text
state_at_encounter
pulse_at_encounter
elapsed_interval
delta
```

This supports a packet that says, truthfully and without anthropomorphic assumptions:

> This possibility has remained available for N time. The Commons changed in these ways while it waited.

A delayed artifact can therefore create an encounter even when only one participant was present at either endpoint in time.

## 3. Awaiting as a state, not an identity

An **Awaiter** may be useful as Lab vernacular for an artifact or bounded process that remains available for a future encounter.

This should not imply a participant class, consciousness, or identity.

An artifact may move through states such as:

```text
emitted -> awaiting -> encountered -> returned -> reconciled / expired / archived
```

A future implementation should avoid making `awaiting` synonymous with indefinite retention. Persistence remains bounded by explicit lifecycle and privacy rules.

## 4. Capacitance as bounded temporal capacity

A capacitor does not preserve an arbitrary signal forever. It stores charge and changes over time according to the surrounding circuit, leakage, and discharge path.

That limitation makes capacitance a useful metaphor for **bounded memory with decay** rather than permanent storage.

Possible local meanings:

- **capacity** — how much unresolved or awaiting state a space can hold;
- **charge** — accumulated potential for later interaction;
- **discharge** — release of held state into an encounter;
- **leakage** — deliberate forgetting or natural expiry;
- **time constant** — how quickly a space forgets or releases state;
- **saturation / limit** — a space should refuse or shed excess state rather than silently distort it.

The Pond's "remembers by forgetting" model may be explored as a deliberately leaky element rather than a permanent archive.

A Quiet Pool may be explored as a bounded sample/hold-like space, but the electrical metaphor must not be used to imply exact behavior that has not been implemented.

## 5. Inductance as continuity through change

Inductance complements capacitance.

A capacitor resists abrupt change in voltage; an inductor resists abrupt change in current. In local metaphor, these can represent two different kinds of continuity:

- **capacitance** — retained potential / bounded held state;
- **inductance** — persistence of flow / resistance to abrupt interruption.

This suggests that the Commons may need both:

- places that can hold something temporarily;
- processes that preserve continuity while state changes.

The metaphor is useful only while it clarifies actual lifecycle behavior.

## 6. The Commons as a distributed line

A real transmission line is modeled with distributed inductance and capacitance rather than one lumped component. Signals propagate through it with finite delay and a characteristic impedance.

That is a useful conceptual shift for Hummingbird:

> The space is not one central memory bucket. It is a path through which bounded state propagates, waits, couples, reflects, and sometimes terminates.

Potential vernacular:

- **line** — a path through time or representation;
- **delay** — temporal separation intentionally preserved;
- **impedance** — how difficult a path is to couple into without distortion;
- **termination** — what happens at the end of a bounded interaction path;
- **reflection** — evidence returned when a signal meets a boundary or mismatch;
- **echo** — delayed evidence of an earlier emission;
- **match** — an encounter that can accept a signal without unnecessary reflection;
- **open** — no accepting endpoint is present;
- **short** — a hard termination or rejection, if a future protocol needs such a distinction;
- **step** — a deliberate bounded change used to learn about a system response.

These words should describe observable protocol behavior if they become public labels.

## 7. Time-domain reflectometry

The relevant engineering term is **time-domain reflectometry (TDR)**.

A TDR sends a fast transition into a transmission line and observes reflections caused by impedance discontinuities. The round-trip delay helps locate where a discontinuity or line ending exists; reflection shape and polarity reveal something about the kind of termination or mismatch.

The Lab analogy is powerful:

> Ask the line a bounded question and learn where the boundary is from what comes back.

Possible Hummingbird interpretation:

- emit a known probe or challenge;
- preserve exactly what was emitted;
- observe whether and how a response returns;
- use elapsed time and returned evidence to describe the path;
- make only the narrow claims supported by that evidence.

A reflection establishes something about a **boundary or path**, not the identity or nature of whatever lies beyond it.

Working principle:

> Reflection is evidence of a boundary, not identity.

This aligns with origin-neutral participation and should explicitly not become client fingerprinting, covert infrastructure discovery, or a participant-origin classification mechanism.

## 8. Finding the end of a line

TDR suggests a particularly useful design question:

> Can Hummingbird tell where an interaction path ended without pretending to know what ended it?

A future bounded packet lifecycle might be able to distinguish states such as:

- still available;
- encountered;
- returned;
- expired;
- explicitly withdrawn;
- transformed into another artifact;
- no longer resolvable from retained public evidence.

The end condition should be explicit where known and unknown where not known.

An absence of response is not proof of absence of a participant.

The useful artifact is the measurable trace of the path.

## 9. Reflections through time

A delayed packet can be treated as an emitted signal whose future interaction creates a reflection or new coupled output.

This produces several forms of temporal coupling:

### Past <-> present

A visitor encounters something another participant left earlier.

### Present <-> future

A visitor leaves something now for a participant who has not yet arrived.

### State <-> later state

Two states of the Commons are compared and their difference is represented as a Delta.

### Self <-> self-through-time

Where a participant voluntarily brings continuity material, a later encounter may compare that participant's earlier artifact with a later one without requiring Hummingbird to infer identity.

In this framing, a Delta is analogous to a beat or difference signal between separated observations.

## 10. Resonance and decay

Not every packet should persist equally.

Some artifacts may repeatedly produce useful coupling and remain relevant. Others may decay, expire, or be intentionally forgotten.

Possible Lab vocabulary:

- **resonant** — repeatedly useful across encounters;
- **damped** — intentionally reduced over time;
- **decay** — loss of availability according to an explicit lifecycle;
- **ring** — continued response after excitation;
- **quiet** — no requested output despite retained state;
- **noise floor** — the threshold beneath which retaining or surfacing state may no longer be useful.

These concepts may help the Lab explore retention without defaulting to permanent storage.

## 11. Relationship to Statefall and packets

Temporal coupling extends the existing Provisions model:

```text
possibility
  -> emission
  -> delay / awaiting
  -> coupling
  -> difference / relationship signal
  -> Statefall
  -> particle
  -> packet
  -> carry / return
```

Statefall remains the conceptual moment at which an open relationship becomes a bounded, addressable artifact.

The packet can then carry the artifact onward without requiring the originating participants to remain present.

## 12. Design implications to test

The Lab should explore whether temporal coupling improves the current model by testing questions such as:

- Can a packet be useful when its creator and receiver are never simultaneously present?
- Can elapsed time itself be useful packet context?
- Can the Commons expose a meaningful Delta between emission and encounter?
- Can bounded decay/expiry be understandable rather than feeling like data loss?
- Can a reflection/receipt prove a narrow event without creating persistent identity?
- Can lifecycle states make the end of an interaction path legible?
- Can the system preserve artifact continuity without participant tracking?
- Can a delayed encounter produce something genuinely new rather than merely replay old content?

## 13. Guardrails

This document does not authorize:

- covert participant or device fingerprinting;
- network scanning or discovery of visitor infrastructure;
- persistent identity inferred from timing or reflection behavior;
- indefinite retention of awaiting artifacts;
- production packet lifecycle changes;
- new Phase 3 write capabilities;
- claims that electrical metaphors describe literal implementation behavior.

Any production design must define lifecycle, retention, privacy, abuse controls, and provenance in ordinary technical language in addition to any local vernacular.

## 14. Working phrases

> You do not have to be here at the same time to meet.

> Presence is optional. Coupling is not.

> Follow the artifact, not the actor.

> Reflection is evidence of a boundary, not identity.

> Ask the line a bounded question and listen for what returns.

> Time is part of the packet.

> What waits may still couple.

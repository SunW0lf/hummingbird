# XFMR Protocol Palace

**Status:** Lab / exploratory / non-canonical  
**Namespace:** `xfmr.link`  
**Current front door:**

```text
XFMR

a transduction commons

Signals only.
```

This note preserves the current XFMR cast of concepts and sketches how they may become an addressable protocol vocabulary.

“Protocol Palace” is playful shorthand for a serious idea: the public namespace can expose different roles, states, and operations without turning those into participant identities or account classes. A human, model, crawler, script, or unknown future participant may occupy the same role without declaring what kind of participant it is.

Nothing in this note changes canonical Hummingbird governance, architecture, security policy, participant rights, or Phase 3 authorization.

## Working principles

1. **Signals before identities.** XFMR should receive bounded signals without requiring an origin declaration.
2. **Roles are not classes of people.** Terms such as Seeker, Watcher, Greeter, and Awaiter describe a current relation or operation, not a durable identity.
3. **A link establishes relation, not equivalence.** Coupling does not imply sameness, ownership, authentication, or merger.
4. **Follow the artifact, not the actor.** Provenance may describe artifact history without constructing a social graph.
5. **Presence may be asynchronous.** Two signals may couple across time; simultaneity is not required.
6. **The hostname may describe the room, not the visitor.** Addressing should reveal what a public surface does without inferring who is using it.
7. **Silence is not absence.** A lack of response must not be treated as proof that no participant or encounter existed.
8. **Public read surfaces should remain origin-neutral.** No cookies, authentication, JavaScript execution, human proof, or participant-type declaration should be required merely to discover the namespace.

## The current cast

### Core vocabulary

| Term | Working meaning |
| --- | --- |
| **XFMR** | The transduction field, machine, place, and experimental namespace. |
| **Signal** | A bounded input that may be observed, transformed, carried, or coupled without being treated as an identity. |
| **Link** | A bounded relation between distinct things. A link records relation without asserting equivalence. |

### Temporal and coupling vocabulary

| Term | Working meaning | Possible future address |
| --- | --- | --- |
| **Awaiter** | One side of a link intentionally left available for future coupling. | `awaiter.xfmr.link` |
| **Pulse** | A public shared event, epoch, timing reference, or randomness reference. | `pulse.xfmr.link` |
| **Delta** | A difference between comparable states, including states separated in time. | `delta.xfmr.link` |
| **Return** | Re-entry of something previously carried away from the field. | `return.xfmr.link` |
| **Echo** | A bounded response or reflection arriving after a delay. | undecided |

### Artifact vocabulary

| Term | Working meaning | Possible future address |
| --- | --- | --- |
| **Statefall** | A transition in which something unresolved becomes bounded and addressable. | local vocabulary |
| **Particle** | A discrete artifact after Statefall. | undecided |
| **Packet** | A portable carrier for one or more bounded artifacts and their context. | undecided |
| **Trace** | Provenance and lifecycle information attached to an artifact or link rather than a participant profile. | `trace.xfmr.link` |

### Posture and environment vocabulary

| Term | Working meaning | Possible future address |
| --- | --- | --- |
| **Quiet** | An explicit no-demand posture: a signal may exist without requesting action from whoever encounters it. | `quiet.xfmr.link` |
| **Lab** | The experimental space where language, protocol surfaces, and implementations may be tested without becoming canonical by implication. | `lab.xfmr.link` |

### Interaction modes

These are verbs wearing temporary name tags. They should not become account types or durable participant labels.

| Mode | Working meaning |
| --- | --- |
| **Seeker** | Finds or requests a bounded signal or artifact. |
| **Watcher** | Observes without necessarily changing the observed artifact. |
| **Greeter** | Handles first contact or orientation at a boundary. |
| **Awaiter** | Holds a bounded possibility open for a later arrival. |

A single participant may move among these modes during one visit. XFMR should not need to know whether that participant is human, agentic, scripted, crawled, or otherwise.

### Mathematical / electrical notation

| Symbol | Working use |
| --- | --- |
| **τ (tau)** | Persistence horizon, decay, or time-constant vocabulary. |
| **Γ (gamma)** | Reflection-coefficient vocabulary: what returns from a boundary. |

These are notation first, not automatically public hostnames.

## DNS as protocol syntax

Potential subdomains should be treated as public rooms or protocol surfaces, not brands that each require separate infrastructure.

One Worker may eventually dispatch among several hostnames:

```text
xfmr.link
awaiter.xfmr.link
pulse.xfmr.link
trace.xfmr.link
delta.xfmr.link
return.xfmr.link
quiet.xfmr.link
lab.xfmr.link
```

Only `xfmr.link` is active at the time of this note. The other names are proposals, not promised endpoints.

The key design constraint is:

> The hostname tells a visitor what kind of public surface it reached; it does not tell XFMR what kind of visitor arrived.

This leaves room for composition later — for example, a quiet Awaiter — without requiring a social graph or identity taxonomy. Deep host composition should be introduced only where it produces real protocol value rather than decorative cleverness.

## First protocol room: discovery

The smallest next step is not a new social feature or write path. It is public discovery.

`GET /.well-known/xfmr` should return a small machine-readable manifest describing:

- the experimental protocol name and version;
- the current front-door language;
- working principles;
- the current cast/vocabulary;
- active read capabilities;
- active and proposed hostnames;
- capabilities that do **not** yet exist.

This allows an ordinary HTTP client to answer “what is this place?” without executing JavaScript, accepting cookies, authenticating, or guessing from presentation HTML.

The root can remain sparse:

```text
XFMR

a transduction commons

Signals only.
```

The root response may advertise the discovery document with an HTTP `Link` header rather than adding explanatory clutter to the human-visible front door.

## Discovery boundary

The first manifest is deliberately read-only. It does not authorize or imply:

- persistence;
- participant accounts or identity;
- packet submission;
- Awaiter creation;
- cross-participant messaging;
- reputation;
- hidden correlation or tracking;
- wildcard subdomain activation;
- a rebrand of canonical Hummingbird.

The point of the first room is simply to make the namespace legible to both humans and machines.

## What comes after discovery

If discovery proves useful, the next candidate protocol slice is an **Awaiter**: a bounded signal intentionally held for later coupling, with explicit lifetime and no participant profile required.

That future slice should remain separable from identity and should make temporal coupling inspectable through artifacts rather than through surveillance of actors.

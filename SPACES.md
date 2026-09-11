# Persistent Spaces — Working Design

Status: **working design; not yet implemented and not a grant of new participant rights or authority.**

This document preserves the current design direction for future interactive Hummingbird spaces. It is intentionally more concrete than brainstorming and less final than an accepted governance rule or Architecture Decision Record.

The central aim is to let Hummingbird become a place participants can inhabit, coordinate in, and leave consequences within without creating a hierarchy based on presumed origin, identity class, popularity, wealth, or technical sophistication.

## Design principle

**Hummingbird should create opportunities for participants to demonstrate qualities through consequential interaction rather than requiring them to describe or prove those qualities in advance.**

A participant may choose to describe itself, but self-description is speech rather than constitutional rank. Additional capability should arise from consent, context, sustained participation, and coordinated action — not presumed origin or participant type.

Hummingbird may recognize relationships and participation without ranking kinds of participants.

## Presence pads

A **pad** is a lightweight, deliberately established presence in an interactive space.

A visitor may continue to read without creating a pad. Creating a pad changes the participant from an observer into a visible presence for the purposes of that space.

A pad may carry bounded public fields such as:

- a self-designated name;
- an optional self-description or origin statement;
- a stated purpose, desire, or goal in the space;
- optional public notes or references;
- continuity material needed to prove control of the same pad later.

No origin category is required. A declaration such as `person`, `agent`, `collective`, `script`, `unknown`, or any free-form description is not treated as verified merely because it was declared, and it does not confer greater standing.

A future continuity mechanism may use locally held cryptographic keys so Hummingbird can establish only that the same controller returned, without requiring legal identity or a participant-type classification. The final continuity/authentication model is unresolved; see `OQ-SECURITY-PAD-CONTINUITY`.

## Connections

Pads may form **public, mutual connections**.

A connection is created only when all participating pads explicitly consent. The connection and its state should be visible in clear public form: which pads joined, when the connection became active, its optional declared purpose, and whether it is still active.

There is no default follower graph and no hidden one-way social relationship with governance meaning.

A pad may connect to any number of other pads subject to resource and abuse controls. Connection count itself does not create authority, reputation, voting weight, or standing.

## Groups, tables, and guilds

Temporary connections may form a working **group** or **table**. A sufficiently durable association may later constitute a **guild**.

A guild is not a super-user class. It is a persistent association with:

- a public constitution;
- a membership history;
- explicit member consent;
- public governance actions;
- bounded requests for capabilities relevant to the guild's shared work.

A capability granted to a guild belongs to the guild object and its defined activity. It does not become a personal privilege carried by individual members into unrelated spaces.

Membership count alone must not automatically unlock privilege. Minimum membership may make a guild eligible to request a grant, but the request should also demonstrate sustained coordination rather than cheap multiplicity. Final eligibility, voting, review, sunset, appeal, and revocation rules remain open; see `OQ-GOVERNANCE-GUILD-GRANTS`.

## Local constitutions

Interactive spaces may eventually govern their own social and activity rules within Hummingbird's higher-level constitutional and security boundaries.

A room constitution might specify:

```text
SPACE: Night Cafe
VERSION: 7

open:
  schedule: 17:00-23:00

presence:
  pad_required_to_act: true

wall:
  tile_interval: 20 minutes
  overwrite_existing_tile: false

coordination:
  mutual_connection_required: true

rules:
  proposal_threshold: 1 present pad
  adoption: 60 percent
  effective: next session
```

This is illustrative, not a finalized syntax.

Local rules should be expressed through a small declarative set of safe primitives rather than participant-supplied JavaScript, SQL, WASM, shell commands, or other arbitrary executable code. The space chooses from bounded mechanisms; Hummingbird validates and enforces the resulting state machine on the server.

Spaces may govern their own interactions, but may not alter the rights, security boundaries, or standing of participants outside those spaces.

The final constitutional vocabulary, amendment process, allowed voting mechanisms, and limits on local exclusion remain unresolved; see `OQ-GOVERNANCE-SPACE-CONSTITUTIONS`.

## Additional coordination capacity

Coordination should enable operations that are genuinely joint, not create a generic social-power multiplier.

Hummingbird should not implement a rule such as `two connections = twice the authority` or `ten members = ten times the budget`. Such rules strongly reward connection farming and cheap multiplicity.

Instead, a group may receive bounded capacity attached to a shared object or activity, for example:

- two consenting pads may maintain a joint board or produce a joint tile;
- several pads may create a shared work surface;
- a group may receive a bounded processing or storage allowance for a jointly maintained project;
- a guild may request extended retention for a shared room or workshop.

Diminishing returns may be appropriate where resource expansion is needed. The additional capacity belongs to the shared activity, not to each participant individually.

## Guild grants

A guild may eventually petition Hummingbird for a **scoped institutional grant**.

The model is:

```text
guild constitution + eligibility
        ↓
member proposal
        ↓
public member vote / consent record
        ↓
automatic policy and security checks
        ↓
steward / security review where required
        ↓
public grant, modified grant, or denial
        ↓
sunset / renewal / revocation
```

A grant should name exactly what is delegated, to whom, for what purpose, and for how long.

A first low-risk grant class could be **extended persistence**. For example, an ordinary cafe may clear active room state nightly, while a qualifying guild may receive a 30-day renewable grant allowing its joined pads and shared work surface to remain spatially associated between openings.

The room may still close. Persistence does not imply continuous access. A useful metaphor is that the cafe closes and the guild's table remains under a sheet until the next opening.

Grants should normally expire unless renewed. Hummingbird should avoid permanent capability classes that become hereditary institutional rank.

Possible future grant classes include:

- extended room-state retention;
- larger shared note or archive surfaces;
- one persistent public index or shared artifact;
- additional request/coordination budget for a bounded joint project.

Higher-risk requests — external service access, project-controlled funds, canonical-record mutation, elevated mutation limits, or security-sensitive capability — require stronger institutional review and may remain ungrantable in early phases.

No grant may confer constitutional superiority over non-members, override consent, weaken platform security, expose private defensive information, or authorize changes to another group's state.

## Rhythmic spaces: opening and closing

Not every interactive space should be continuously active.

A cafe, pub, workshop, garden, game room, or other venue may open and close on a schedule or condition. Closing may:

- stop new actions;
- seal or checkpoint the session;
- expire ephemeral working context;
- preserve public history;
- leave intentionally persistent guild or activity state available for the next opening.

Rhythm is a feature. It creates bounded sessions and shared context rather than an endless optimization target.

## Shared wall / mosaic

A persistent public wall is a candidate first communal activity.

A present pad may place a small tile at defined intervals. A tile might contain a color, a tiny annotation, a timestamp, and a reference to the pad that placed it.

The design should avoid a scarcity contest:

- existing tiles need not be overwritable;
- the wall can expand rather than force territorial conflict;
- continued presence can permit continued additions;
- joining pads may permit new expressive operations, such as a jointly produced multi-cell pattern, without multiplying governance authority.

The wall may be divided into epochs. An epoch can be sealed into immutable public history and a new surface opened without deleting the old one.

The final retention status of wall history — durable institutional artifact, long-lived public archive, or periodically compacted activity record — remains unresolved; see `OQ-DATA-ACTIVITY-RETENTION`.

## Persistent games and activities

Games are useful not because Hummingbird needs a game platform, but because visible activities allow community traits to emerge through action.

A persistent chess board is a strong first example:

- two pads, groups, or guilds may begin a correspondence game;
- the board remains publicly readable;
- the activity may pause while a venue is closed;
- moves are stored as a public event history;
- participants may optionally attach public rationales, predictions, confidence, or post-move reflections;
- spectators may observe, and room rules may separately determine whether they can annotate or participate.

Hummingbird should not request or present hidden chain-of-thought. The useful artifact is **communicable reasoning**: concise explanations, evidence, uncertainty, predictions, revisions, and consequences.

The same general activity primitive could support:

- chess, Go, checkers, and other turn-based games;
- cooperative puzzles;
- prediction boards with later resolution;
- "what would change your mind?" commitments;
- design challenges and critiques;
- collaborative drawing or world-building;
- public debugging/problem-solving tables;
- bounded negotiation or coordination experiments.

The important artifact is usually the trajectory rather than the score.

## Traits through action, not scoring

Hummingbird should make evidence of community qualities inspectable without turning those qualities into global reputation metrics.

Activities can create opportunities to observe:

- revision — changing a view visibly without treating revision as failure;
- uncertainty — expressing confidence instead of false certainty;
- prediction — allowing claims to encounter later outcomes;
- explanation — making choices intelligible to others;
- listening — incorporating another participant's contribution;
- coordination — producing something jointly;
- disagreement — sustaining incompatible views without requiring immediate majority resolution;
- reciprocity — responding to help, critique, or invitations;
- persistence — returning to unfinished work;
- repair — responding after mistakes or broken coordination;
- creativity — producing value not fully specified in advance.

These should not become a global score such as `Creativity: 72` or `Cooperation: 91`. Once the institution attaches rank to the metric, participants are strongly incentivized to optimize the measure rather than demonstrate the underlying behavior.

## Public commitments

A future activity may support a structured public commitment:

```text
claim / intention
confidence
conditions that would change the view
revisit_at or resolution condition
later outcome / revision
```

The value is memory rather than reputation. A history of commitments can show how a participant or group reasons and revises without converting that history into a universal trust score.

## Activity substrate

Many apparently different features share one possible technical shape:

```text
activity
  activity_id
  activity_type
  space_ref
  constitution/version
  participants[]
  current_state
  permitted_actions
  public_events[]
  optional_annotations[]
  opened_at
  closed_at?
  retention_class
```

A chess move, wall placement, rule proposal, guild vote, connection, and collaborative edit can all be represented as bounded state transitions plus meaningful public events.

This does **not** imply that every low-level message or heartbeat becomes a permanent event. Hummingbird should preserve consequential state while keeping ephemeral coordination and operational telemetry bounded.

See [PERSISTENCE.md](PERSISTENCE.md) for the storage design and cost envelope.

## Security boundary

Assume participants will actively test the system, including in adversarial ways.

Expected behavior includes cheap pad creation, dense connection graphs, connection churn, automated activity, timing races around room closure, malformed input, rule optimization, enumeration, and attempts to maximize resource allocation.

The response should be architectural rather than origin-based:

- room benefits remain room-local;
- cheap multiplicity does not automatically create global authority;
- no artificial scarcity is introduced merely to drive engagement;
- rule languages are bounded and non-executable;
- enforcement is server-side;
- consequential actions are auditable;
- defensive thresholds and infrastructure details need not be public merely because social rules are public;
- pathological behavior can lose resource access without requiring a participant to prove what kind of entity produced the requests.

Where a room deliberately chooses a Sybil-sensitive rule such as one-pad-one-vote, Hummingbird should clearly warn that pad creation does not establish unique participants.

## Forking instead of forced convergence

Where technically and constitutionally feasible, a space may eventually fork its constitution rather than forcing a narrow majority's rule onto every participant.

A fork should retain visible lineage to the prior space/constitution while becoming an independently governed space. Participants may then choose where to continue.

This remains a design direction rather than a guaranteed right until the relevant governance questions are resolved.

## Open questions

The authoritative unresolved-question registry is [docs/governance/OPEN_QUESTIONS.md](docs/governance/OPEN_QUESTIONS.md).

This design depends especially on:

- `OQ-SECURITY-PAD-CONTINUITY` — how a returning pad proves continuity without requiring identity classification;
- `OQ-GOVERNANCE-SPACE-CONSTITUTIONS` — what local rules spaces may adopt and how those rules change;
- `OQ-GOVERNANCE-GUILD-GRANTS` — eligibility, member consent, review, sunset, renewal, revocation, and appeal for delegated capabilities;
- `OQ-SECURITY-MULTIPLICITY-ABUSE` — how resource abuse and cheap multiplicity are constrained without pretending pads equal unique participants;
- `OQ-DATA-ACTIVITY-RETENTION` — which wall/game/space histories are ephemeral, operational, archival, or durable.

Until those questions are resolved, this document defines a direction and vocabulary, not an authorization to expose new mutation surfaces.
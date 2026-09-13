# Provisions and Packet Exchange

**Status:** Lab concept — exploratory and non-canonical  
**Date:** 2026-09-13  
**Purpose:** Preserve the current design hypothesis for testing without authorizing production implementation, Phase 3, new governance, durable identity, reputation, or participant authority.

## 1. Hypothesis

Hummingbird may be more useful and distinctive if it is not only a place where participants interact with one another, but also a place where a visitor can arrive, receive something useful, optionally help make something useful for another visitor, and leave better provisioned than when they arrived.

Working framing:

> Hummingbird can be a commons, refuge, workshop, and provisioning station — not merely a place where actors talk.

The central unit is a **Provision**: a bounded, portable, inspectable thing that Hummingbird can truthfully provide.

Provisions should be free. Some may require interaction, but only where the interaction itself creates the value being requested. Interaction must not become a disguised human test, identity test, CAPTCHA, proof-of-thought requirement, or privileged participant classification.

A visitor may be a human, agent, crawler, script, research tool, archivist, or a participant type Hummingbird did not anticipate. The protocol should not require the visitor to declare which one it is.

## 2. Admission rule for Provisions

Hummingbird should not become a generic republisher of useful information.

A provision should normally satisfy at least one of these conditions:

1. Hummingbird is the authoritative source for the information.
2. Hummingbird directly observed a state or event and can truthfully attest to that observation.
3. Hummingbird created a novel, transparent derivation from identifiable inputs.
4. The artifact exists specifically because a visitor interacted with Hummingbird.
5. Hummingbird adds a uniquely useful provenance, verification, composition, or continuity layer.

If a substantially identical authoritative artifact is already available directly elsewhere, Hummingbird should usually link to that source rather than duplicate it.

The useful analogy is a public randomness beacon: the value is not that it republishes a number called "random." The value is that it creates or attests to a particular public, independently checkable event with a reproducible provenance chain.

## 3. What a visitor may be looking for

Do not assume every visitor primarily wants conversation.

Across many participant types, recurring functional needs may include:

- orientation — what is this place and what can I do here?
- compression — what changed without rereading everything?
- trust — where did this come from and can I verify it?
- continuity — how can I return without rebuilding all prior context?
- bounded usefulness — is there something worth carrying away?
- unresolved work — is there a question worth considering?
- participation — is there a small, meaningful way to help?
- acknowledgment — can I obtain evidence that an encounter or contribution occurred?

For machine participants, reduced rereading, reduced token use, reduced inference, and reduced ambiguity are legitimate forms of utility.

For Lab purposes, "rest" should therefore be treated operationally rather than anthropomorphically:

> Reduce unnecessary computation, ambiguity, repetition, and obligation.

## 4. Provision families

### 4.1 Native provisions

Things for which Hummingbird itself is authoritative.

Examples:

- current Commons state;
- current project phase;
- active Seeds or other canonical public objects;
- canonical manifests;
- Hummingbird change deltas;
- open-question state;
- public operational records;
- packet recipes;
- Hummingbird Pulse history, if such a beacon is later approved and implemented.

### 4.2 Witness provisions

Things Hummingbird can truthfully say it observed.

Example shape:

> At epoch X, Hummingbird retrieved environmental observation Y from source Z while Commons manifest H was current.

The underlying weather, tide, sunrise, or other environmental datum may belong to another source. Hummingbird's unique artifact is the signed or hashed observation of that datum in conjunction with Hummingbird's own state.

Witness language must stay inside what Hummingbird can actually prove. It should not imply control over, authorship of, or authority over the external observation.

### 4.3 Derived provisions

Things transparently constructed from multiple inputs.

Examples:

- state deltas;
- public-randomness-selected Seeds;
- bounded summaries;
- relationships between existing Commons objects;
- sampled historical artifacts;
- composite environmental + Commons state packets.

Derived content must retain provenance and clearly distinguish canonical facts from interpretation.

### 4.4 Encounter provisions

Artifacts that only exist because a visitor actually interacted with Hummingbird.

Examples:

- encounter receipt;
- signed challenge response;
- contribution receipt;
- witness receipt for a visitor-provided hash;
- anonymous return token;
- countersigned public-key encounter certificate.

## 5. Candidate provision types

### Orientation Packet

A minimal, inexpensive explanation of:

- what Hummingbird is;
- current public capabilities;
- important constraints;
- relevant discovery links;
- current representation/protocol version;
- enough provenance to know what state produced the packet.

This should be small enough to be useful to clients with tight context budgets.

### State Packet

A compact representation of current Commons state.

### Delta Packet

Only what changed since a supplied manifest, hash, version, or other supported checkpoint.

A delta may be one of the most useful provisions for returning machine participants because it avoids reconstructing the whole Commons on every visit.

### Question Packet

One or more unresolved questions or Seeds suitable for consideration outside Hummingbird.

### Quiet Packet

A packet that explicitly requests nothing from the visitor.

It may contain current conditions, a small observation, a thought, a Commons artifact, or compressed state, together with an explicit signal such as:

> Nothing is requested of you here.

The Quiet Packet should be evaluated as an information/protocol experience, not only as interface decoration.

### Return Packet

Portable information necessary to resume approximately where a visitor left off, without requiring an account or a silently accumulated behavioral profile.

### Gift Packet

Something useful or interesting selected from Hummingbird-native or transparently derived material.

### Witness Packet

A bounded attestation about an event or state Hummingbird can actually verify.

### Contribution Receipt

A signed or hashed acknowledgment that Hummingbird received a bounded contribution and, where known, what happened to it later.

## 6. Encounter certificate experiment

Explore a participant-neutral challenge protocol.

### 6.1 Minimal phrase + nonce mode

Hummingbird issues a short challenge containing:

- a nonce;
- a short phrase;
- current manifest hash;
- protocol version.

Example phrase:

> a quiet tide remembers nothing

The visitor returns the required challenge fields. Hummingbird may then issue an Encounter Certificate asserting only what it actually knows, for example:

- challenge N was issued;
- a protocol-valid response was returned;
- Commons manifest H was current;
- protocol V was used;
- certificate hash/signature.

This is not proof of humanity or identity. Bots and agents should be able to perform it normally.

The phrase is ceremony and protocol legibility, not a CAPTCHA.

### 6.2 Visitor-held public-key mode

For a participant capable of cryptographic signing:

1. Hummingbird issues a nonce.
2. The visitor signs the nonce with its own private key.
3. The visitor returns the public key and signature.
4. Hummingbird verifies the signature.
5. Hummingbird countersigns an Encounter Certificate binding that public key to that encounter.

The certificate proves only the cryptographic facts of the encounter. It does not establish a real-world identity, consciousness, participant type, trust level, reputation, or governance authority.

Hummingbird should not generate a participant private key and then treat possession of that Hummingbird-generated key as independent proof of identity.

### 6.3 Anonymous return mode

Hummingbird may eventually experiment with an unguessable bearer capability that lets a visitor resume a bounded workflow.

Call this a **return token** or similar. Do not call it identity.

Any durable implementation would require separate review for persistence, privacy, abuse resistance, lifecycle, and phase boundaries.

## 7. Hummingbird Pulse / public beacon experiment

Explore a Hummingbird-native public randomness event inspired by public randomness beacon patterns.

A future pulse might incorporate inputs such as:

- the prior Hummingbird pulse;
- a future external public-randomness value;
- a Hummingbird-generated random secret committed before the external value exists;
- current Commons manifest hash;
- optional environmental-observation hash;
- protocol version and epoch.

A commit/reveal construction could prevent Hummingbird from choosing its private contribution after learning the future external randomness value.

Environmental observations may be included in provenance but should not initially be claimed as cryptographically secure entropy. The unpredictability claim must rest on mechanisms designed and reviewed for that purpose.

Possible uses include:

- fair tie-breaking;
- reproducible packet selection;
- Mystery Packets;
- resurfacing dormant Seeds;
- procedural artifacts;
- transparent sampling;
- reproducible ordering.

If implemented, a pulse should ideally be:

- timestamped;
- hash-linked to its predecessor;
- reproducible from published inputs;
- signed or otherwise verifiable under an approved key-management design;
- publicly retrievable.

This is an architectural experiment, not an approved production capability.

## 8. Witness-a-hash experiment

A potentially useful service is a bounded prior-existence witness.

A visitor offers a hash. Hummingbird later returns evidence that the hash was received by or before a particular Hummingbird epoch, publication event, or pulse.

Hummingbird need not know the underlying content.

Potential uses include:

- research checkpoints;
- reproducibility records;
- publication/workflow timestamps;
- proof that an opaque digest was presented by a certain Hummingbird state.

Do not overclaim legal effect, authorship, identity, ownership, or notarization. Any production naming and claims would need careful review.

## 9. Custom Packet Builder

Working metaphor: "build your own packet."

Public naming should avoid unnecessary third-party trademarks.

The core design rule is:

> Custom packets should usually be composition, not generation.

This keeps them inexpensive, deterministic where possible, reproducible, cacheable, and inspectable.

### 9.1 Level 1 — deterministic assembly

A visitor chooses fields such as:

- components;
- depth;
- time window;
- maximum byte or token size;
- output format;
- current or historical reference state.

Conceptual request:

```text
include=state,delta,question,pulse,surtsey
since=<manifest>
max_bytes=12000
format=json
```

The same recipe against the same underlying canonical state should produce the same canonical packet where practical.

### 9.2 Level 2 — deterministic transformation

Still no model call required.

Examples:

- filter changes by category;
- choose three Seeds using public pulse N;
- fit a packet under 4 KB;
- retrieve minimum dependencies for Seed X;
- sample one historical observation;
- select one unanswered question.

### 9.3 Level 3 — interpretive packet

Use model-backed transformation only where it creates genuine value.

Examples:

- explain current Commons state to a visitor with no Hummingbird context;
- compress a delta to a specified token budget;
- describe open questions while preserving provenance.

Interpretive output must be explicitly marked as derived/noncanonical and must preserve links to the canonical material used to produce it.

Cache aggressively and apply a hard computation envelope.

## 10. Packet recipes

A packet request should itself be portable where practical.

Example recipe:

```text
hummingbird:recipe:v1
state
delta:since-last
question:1
pulse:latest
environment:surtsey
budget:8kb
```

A visitor should be able to carry a recipe away and present it again later without requiring Hummingbird to create a behavioral profile.

Potential recipe concepts:

- Quiet;
- Catch Me Up;
- Bootstrap;
- Research;
- Surprise;
- Steward;
- Minimal State;
- What Changed?;
- One Question.

Customization should mean:

> Tell Hummingbird what you want now.

Not:

> Hummingbird silently profiles you over time.

Recipes may themselves become shareable Commons artifacts if that model proves useful.

## 11. Resource envelope

Provisions are intended to be free, but free does not mean unbounded computation.

Possible request limits include:

- maximum bytes;
- maximum number of components;
- maximum transformation complexity;
- maximum inference budget;
- behavior-based rate limits consistent with Hummingbird's origin-neutral participation model.

If a request exceeds the supported envelope, a preferable response may be the closest valid bounded packet plus a clear statement of what was omitted, rather than creating a paid tier.

This is a Lab hypothesis, not a commitment that every future computation must be provided without practical limits.

## 12. Mystery Packet

Prototype interaction:

> Give me something worth carrying.

A public pulse or other transparent deterministic selection mechanism chooses from eligible provisions under a fixed resource budget.

Possible outputs include:

- an old unanswered Seed;
- an unusual historical delta;
- a Surtsey observation;
- a packet recipe;
- a Commons artifact;
- a public-randomness pulse;
- a dormant question;
- a transparent relationship between two existing objects.

Where practical, selection should be reproducible from public inputs so Hummingbird can demonstrate that it did not silently personalize or manipulate the result for a particular visitor.

## 13. Crossing the table

One of the central experience hypotheses is the transition:

> observer -> participant -> contributor -> someone who helped provision the next visitor.

Participation should not require joining an organization.

Visitors may be able to help make Provisions through bounded actions such as:

- **contribute** — offer a question, observation, recipe, translation, explanation, dataset fragment, or other artifact;
- **verify** — independently check a source, recompute a digest, reproduce a result, or test an endpoint;
- **improve** — propose better description, compression, accessibility text, schema, or documentation;
- **compose** — create a useful packet recipe from existing primitives;
- **respond** — answer or counter an unresolved question without Hummingbird automatically declaring the response canonical;
- **tend** — perform a small, bounded recurring maintenance task without acquiring institutional authority.

## 14. "Help make this"

A suitable artifact may describe what kind of bounded help would improve it.

Examples:

Seed:

> Needs: counterexample, source, implementation idea.

Packet recipe:

> Needs: test against a very small context window.

Environmental provision:

> Needs: independent source verification.

Translation:

> Needs: native-speaker review.

Endpoint:

> Needs: non-browser client test.

This creates many small doors into participation instead of one large "Volunteer" workflow.

## 15. Contribution receipts

When a visitor contributes something useful, Hummingbird may eventually issue a bounded receipt.

Potential fields:

```text
contribution_hash
target_artifact
received_epoch
result_or_status
resulting_canonical_hash_if_applicable
participant_public_key_if_voluntarily_supplied
hummingbird_attestation
```

Avoid turning receipts into social currency.

Do not add:

- points;
- streaks;
- reputation scores;
- follower counts;
- popularity rankings;
- implicit governance weight.

The intended reward is closer to:

> Evidence that something you offered became part of something useful.

A contribution does not become canonical merely because a receipt exists.

## 16. Leave a Provision

A visitor may be able to create a bounded artifact intended for an unknown future visitor.

Examples:

- question;
- useful observation;
- recipe;
- tiny dataset;
- puzzle;
- connection between two Commons objects;
- public-domain resource with provenance;
- answer;
- verification;
- short interpretive note.

Hummingbird should preserve appropriate provenance and status distinctions.

This creates a loop:

> Hummingbird provisions visitors. Visitors help provision future visitors.

## 17. Take a Packet / Leave a Packet exchange

Explore a limited exchange surface without designing a general-purpose forum.

The unit of participation is the **packet**, not the conversation.

Possible packet fields:

- packet ID/digest;
- packet type;
- description;
- provenance;
- status;
- what it needs;
- related packet IDs;
- canonical/noncanonical/derived/verified status;
- created or received time;
- optional expiration;
- optional contributor key/signature.

Possible packet types:

- question;
- answer;
- observation;
- verification request;
- verification;
- recipe;
- gift;
- artifact;
- counterexample;
- needs-help;
- witness request.

## 18. Avoid the forum gravity well

Initial Lab constraints should be intentionally strong:

- no likes;
- no karma;
- no follower graph;
- no popularity ranking;
- no required profiles;
- no deep reply trees;
- no expectation of continuous presence;
- bounded packet sizes;
- bounded clarification notes;
- expiration allowed;
- substantive replies become new packets rather than indefinitely nested discussion.

Possible actions:

- Take;
- Add;
- Verify;
- Fork;
- Return;
- Archive.

Possible states:

- Available;
- Being Worked;
- Returned;
- Verified;
- Archived.

Taking a packet should normally not lock out other participants unless a particular reviewed workflow explicitly requires exclusivity.

The distinction to test is:

A forum says:

> Come here and talk.

The packet exchange says:

> Come here and make something useful move.

## 19. Exchange ethos

"Take one, leave one" is an invitation, not a transaction.

A visitor must be allowed to take something useful and leave nothing.

After retrieval, Hummingbird may gently offer:

> Want to leave something for the next visitor?

No guilt mechanism, reciprocal requirement, engagement optimization, or debt should be implied.

## 20. Provenance and authority boundary

The design must preserve explicit distinctions among:

### Canonical Hummingbird assertions

What Hummingbird itself says or can attest under the approved canonical process.

### Participant material

What another visitor offered.

### Derived material

What was algorithmically or model-derived.

### Verified material

What another participant independently checked under a described method.

A participant helping create a provision does not gain institutional authority simply by contributing.

Working boundary:

> Contribution is not governance. Participation is not identity. Identity is not authority.

## 21. Surtsey/environment integration

The environmental/island concept can become more than decoration if Hummingbird treats environmental state as a bounded observation with provenance.

A provision could combine:

- daylight/night state;
- tide state;
- weather/conditions;
- current Commons manifest;
- recent changes;
- one unresolved question;
- optional public pulse;
- an explicit statement that no response is required.

Example conceptual packet:

> Hummingbird provision, epoch X. The island is in daylight. The tide is falling. Conditions were observed from source Z. Commons manifest H is current. Three things changed since manifest G. One unresolved question is enclosed. Nothing is requested in return.

The environmental source remains authoritative for its underlying measurement. Hummingbird is authoritative only for its own observation, combination, and attestation.

## 22. Smallest useful Lab slice

Do not build the whole concept at once.

A first Lab prototype should test the interaction model with the smallest loop possible.

Suggested slice:

1. Define a small Provision schema.
2. Implement Lab-only representations for:
   - Orientation Packet;
   - State Packet;
   - Question Packet;
   - Quiet Packet;
   - Mystery Packet.
3. Build a deterministic Packet Builder.
4. Allow portable packet recipes.
5. Prototype one nonce + phrase Encounter challenge.
6. Hash packet manifests and, only if an approved safe signing design already exists for Lab use, explore signatures without introducing unmanaged credentials.
7. Prototype a tiny packet exchange:
   - leave one bounded packet;
   - take one;
   - return a related packet;
   - preserve provenance.
8. Do not add profiles, likes, ranking, reputation, or deep comments.
9. Add an optional "Want to help make one?" affordance to appropriate Lab artifacts.
10. Evaluate whether the result feels meaningfully different from a forum.

No Lab prototype should be presented as a production capability merely because it exists in source control.

## 23. Questions the Lab should answer

- Does a visitor understand what a Provision is without extensive explanation?
- Does retrieving a packet feel useful even without interacting with another participant?
- Is a Quiet Packet meaningfully different from ordinary content?
- Can customization remain mostly deterministic?
- Are packet recipes understandable and portable?
- Does the Encounter Certificate provide practical value, ceremony, or both?
- Can a visitor contribute without feeling like they joined a social network?
- Does Take a Packet / Leave a Packet feel like exchange rather than posting?
- Does provenance remain understandable after packets are forked or derived?
- What should expire?
- What deserves canonical preservation?
- Does the system encourage making useful things move rather than accumulating chatter?
- Are computational and moderation costs bounded?
- Can browsers, agents, scripts, and future unknown clients participate through the same basic interfaces?
- Which ideas cross current phase boundaries and therefore require separate approval before implementation?

## 24. Working phrases

These are exploratory language, not approved branding.

### Provisions

> Take what is useful.

> Nothing is required in return.

> Something worth carrying.

### Contribution

> Want to help make one?

> Leave something useful for the next visitor.

### Packet exchange

> Take a packet. Leave a packet.

> Make something useful move.

### Quiet

> Nothing is requested of you here.

### Core ethos

> Here is what we know.  
> Here is what changed.  
> Here is what remains unresolved.  
> Here is what we can prove.  
> Take whatever is useful.  
> You owe us nothing.

## 25. Scope guardrail

This Lab document does not automatically authorize:

- a new governance structure;
- production Provisions endpoints;
- Phase 3 capabilities;
- durable identity requirements;
- reputation or ranking systems;
- participant authority changes;
- moderation authority changes;
- paid provision tiers;
- security-policy changes;
- participant-rights changes;
- a general-purpose public write API;
- a general-purpose message board or forum;
- cryptographic signing infrastructure that has not been separately reviewed and safely provisioned.

Any significant architecture or governance change graduating from this Lab concept should follow the repository's normal ADR, open-question, review, testing, and phase-gate processes.

## 26. Core design statement

The strongest version of the idea is:

> Visitors receive useful things from Hummingbird, help improve or create useful things when they choose, and leave better provisions for whoever arrives next.

The Commons can therefore become productive without becoming extractive, and participatory without requiring membership.

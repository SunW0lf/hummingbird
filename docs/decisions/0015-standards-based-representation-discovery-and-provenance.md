# ADR 0015 — Standards-Based Representation Discovery and Verifiable Decision Provenance

Status: Accepted
Date: 2026-09-11

## Context

Hummingbird publishes Architecture Decision Records (ADRs) as human-readable HTML while retaining canonical Markdown in the repository and exposing deliberately published raw Markdown on the public read plane.

As the project becomes easier for browsers, crawlers, search systems, and agentic clients to traverse, it is tempting to add requester-specific middleware, Accept-header content negotiation, special agent endpoints, or synthetic submission surfaces that advertise capabilities before the underlying institutional process exists.

Those approaches would conflict with several existing Hummingbird principles:

- public read access should not require participant-origin classification or special treatment;
- ordinary standards-compliant HTTP and semantic hypertext should remain sufficient to discover and traverse the commons;
- repository Markdown remains authoritative for public decision records;
- infrastructure should stay boring and static where a runtime layer does not provide a material capability;
- submission, canonical admission, publication, and governance decisions remain distinct;
- Hummingbird should not imply a write endpoint, ADR-allocation process, or proof-of-cognition requirement that does not actually exist.

The project nevertheless benefits from stronger machine-verifiable provenance. A client should be able to determine which canonical source produced a public ADR representation, identify the source revision, verify the exact source bytes, and discover alternate representations without receiving different treatment based on requester type.

## Decision

Hummingbird will implement **standards-based representation discovery and verifiable source provenance** for public ADRs without introducing request-time content negotiation or a new runtime middleware layer.

For each deliberately published ADR, the public representation should expose enough metadata to identify:

- the ADR identifier;
- status and decision date;
- canonical repository source path;
- the full Git commit that last changed the canonical ADR source;
- a SHA-256 digest of the exact published canonical Markdown bytes;
- the current site/build commit where useful as a separate artifact-provenance concept;
- an immutable repository link to the canonical source at its source commit;
- the directly retrievable public raw-Markdown representation.

The rendered ADR page should advertise its raw Markdown using ordinary HTML representation metadata such as:

```html
<link rel="alternate" type="text/markdown" href="/docs/raw/decisions/0015-standards-based-representation-discovery-and-provenance.md">
```

The Decisions index may expose the same source/provenance facts through semantic `data-*` attributes and a machine-readable static index.

## Source revision versus build revision

Hummingbird distinguishes two different provenance facts:

```text
source commit
    = repository revision that last changed the canonical ADR source

build commit
    = repository revision whose build produced the currently deployed public artifact
```

They are intentionally not treated as interchangeable. A site rebuild can change the build commit without changing an ADR's canonical source revision.

The SHA-256 digest binds the published provenance metadata to the exact canonical Markdown bytes used by the build. It is an integrity identifier, not by itself a cryptographic signature or proof of institutional authorization.

## No requester-type content negotiation

Hummingbird will not add an edge Worker or middleware solely to return different ADR representations based on `Accept` headers while static alternate representations are already directly discoverable.

A client should be able to:

1. request the ordinary public ADR HTML;
2. discover the `rel="alternate"` Markdown representation or visible Raw Markdown link;
3. retrieve the raw Markdown directly;
4. verify its SHA-256 digest and source revision if desired.

This preserves one origin-neutral public read path and avoids additional runtime, caching, quota, and failure-state complexity.

This ADR does not prohibit future standards-compliant content negotiation if a real capability later justifies the runtime cost. Such a change would require its own architectural justification.

## ADR proposal contract

Hummingbird may publish a static, machine-readable description of the fields expected in a proposed architectural or institutional decision. The initial proposal shape is:

- `title`;
- `context`;
- `decision`;
- `consequences`;
- `alternatives_considered`;
- `affected_principles`.

This proposal contract is documentation, not a write API. It may be exposed as ordinary HTML and a static JSON Schema.

During the current phase, participants offering material in this shape use the existing bounded Seed Bank ingress. Submission does not allocate an ADR number, create canonical state, imply publication, or constitute governance approval.

Hummingbird will not publish a fake `/api/propose` action or any other form target that does not exist.

## No proof of thought or cognition

Hummingbird will not require or solicit a `proof-of-thought`, chain-of-thought, proof-of-cognition, or equivalent participant-origin/cognitive-process field as a prerequisite for proposing a decision.

Abuse controls may later use bounded proofs of effort or other behavior-focused mechanisms where explicitly approved, but those mechanisms must not require a participant to reveal private reasoning or prove what kind of process produced the contribution.

## Consequences

- Public ADRs become substantially easier to verify and audit without adding requester-specific privilege or middleware.
- The difference between canonical source provenance and deployment provenance becomes explicit.
- Raw Markdown remains a first-class direct representation rather than an API response generated at request time.
- Clients can discover alternate representations through standard HTML and static indexes.
- Hummingbird gains a machine-readable ADR proposal contract without pretending a public write endpoint exists.
- The existing Seed Bank remains the bounded ingress for proposal-shaped material during Phase 2.
- The static Pages architecture remains sufficient for this capability.
- Hash metadata must be generated deterministically from exact source bytes and tested against the published raw representation.

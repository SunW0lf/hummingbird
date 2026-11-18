# Canonical Candidate Preparation Protocol

Status: **implemented for deterministic Phase 2E preparation; canonical admission remains explicit**

This protocol defines the automation layer between temporary/external source material and Hummingbird's existing guarded canonical draft-admission boundary.

The purpose is to remove clerical friction without moving institutional authority into a script, model, database trigger, or source-provider signal.

## Core rule

A **candidate** is prepared material, not Hummingbird memory.

```text
external / temporary material
        ↓
review packet
        ↓
deterministic or advisory preparation
        ↓
canonical-candidate-v1 envelope
        ↓
validation
        ↓
consideration
        ↓
separate explicit admission, if authorized
        ↓
canonical draft
```

Candidate validity does not imply truth, acceptance, priority, publication, governance weight, participant standing, or canonical admission.

## Candidate envelope

The machine-readable contract is [`schemas/canonical-candidate-v1.schema.json`](../../schemas/canonical-candidate-v1.schema.json).

A v1 envelope contains:

- a candidate ID and generation time;
- one proposed v1 draft canonical record;
- one or more source references;
- derivation metadata describing how the candidate was prepared;
- an admission marker fixed to `candidate_only` and `requires_explicit_admission: true`.

The envelope is deliberately separate from the proposed record. Source coverage and preparation notes can therefore support consideration without becoming canonical fields merely because they were useful during review.

Candidate envelopes must not carry receipt secrets/hashes, source IPs, browser fingerprints, provider database identifiers, provider account identifiers, or similar request exhaust.

## Validate a candidate

```bash
node scripts/validate-canonical-candidate.js path/to/candidate.json
```

Validation is local-only. The validator:

1. checks the candidate-envelope boundary;
2. rejects forbidden request/provider/receipt fields;
3. requires explicit-admission semantics;
4. extracts the proposed record into a temporary file;
5. passes that record through the existing `admit-draft-d1.js --validate-only` contract;
6. removes the temporary record;
7. performs no remote access.

A validated candidate therefore satisfies the current draft-record shape but still has no admission authority.

To extract the proposed record for deliberate review:

```bash
node scripts/validate-canonical-candidate.js path/to/candidate.json \
  --emit-record /private/review/proposed-record.json
```

The output file is created exclusively and is still non-canonical. It is not an admission receipt.

## Prepare candidates from the Phase 2E private review packet

The existing private review exporter emits a bounded v2 packet containing unresolved exact-text groups.

Run:

```bash
node scripts/prepare-offer-candidates.mjs /private/review/offer-review.json \
  --output-dir /private/review/candidates
```

The preparer:

- accepts at most the existing 250-offer pilot bound;
- creates one candidate envelope for each exact-text group;
- preserves every group member as a separate `offer:<opaque-id>` source reference;
- uses the offer body directly as a draft textual contribution;
- assigns deterministic IDs derived from a SHA-256 content digest;
- marks the derivation as `deterministic_transform`, not semantic synthesis;
- validates every generated candidate before completing;
- writes a manifest recording candidate count and `candidate_only` authority;
- performs no network access and no D1 write.

Two identical offers therefore create one review candidate with two source references. That count is evidence of repeated submission only. It is not a vote, priority score, trust signal, or governance weight.

## Semantic synthesis

Exact-text preparation is intentionally simple. Future machine-assisted thematic grouping or synthesis may produce additional candidate envelopes, but it must remain advisory and explainable.

A synthesis step must preserve enough source coverage to recover:

- corrections;
- disagreement;
- materially different qualifications;
- singleton ideas;
- outliers that do not fit a dominant theme.

A synthesis system must not silently replace temporary source material with only its summary while the source remains within its promised retention/withdrawal window.

Machine assistance must be declared in `derivation.machine_assisted` and must not gain authority merely because a model produced a fluent result.

## Admission remains separate

The current guarded canonical admission tool remains:

```bash
node scripts/admit-draft-d1.js proposed-record.json --confirm-admission
```

That tool is intentionally separate from candidate preparation and requires a deliberate confirmation path. Candidate preparation must never call it with `--confirm-admission`.

The boundary is therefore:

```text
prepare automatically
validate automatically
summarize/group advisory material automatically where bounded
        ↓
stop
        ↓
explicit institutional admission decision
```

This protocol does not define who may make future admission decisions, create an automatic admission rule, open Phase 3, or resolve any participant-rights/governance question. Those remain governed by the relevant phase gates and authoritative project documents.

## Publication remains separate

Canonical admission creates draft institutional memory under the current Phase 2 contract. Publication is still an independent transition. Candidate preparation cannot mark a canonical record published and cannot update `publication/canonical/`.

## Failure behavior

Candidate preparation should fail closed when:

- the private review packet is malformed or exceeds the pilot bound;
- group counts do not match member coverage;
- a body violates the current offer bound;
- a generated candidate fails the envelope validator;
- the proposed record fails the existing draft-admission validation contract;
- the output path would overwrite an existing candidate or manifest.

Failure leaves canonical D1 unchanged.

## Why this exists now

Hummingbird should automate clerical work before automating authority. This layer allows intake review, exact-duplicate compression, record shaping, validation, and deterministic identifiers to become routine machinery while retaining the existing admission/publication boundary.

That distinction is the current operational meaning of **frictionless without silent canonical mutation**.

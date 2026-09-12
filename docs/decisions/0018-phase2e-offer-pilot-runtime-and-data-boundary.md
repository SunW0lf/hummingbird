# ADR 0018 — Phase 2E Offer Pilot Runtime and Data Boundary

Status: Accepted
Date: 2026-09-12

## Context

ADR 0017 authorizes a narrow Phase 2E experimental-ingress pilot whose authority ends at temporary, non-canonical evidence gathering. Before that surface can go live, Hummingbird must publish the concrete runtime, storage, retention, receipt, withdrawal, overload, and recovery boundary.

The existing production D1 database is canonical institutional persistence. Mixing temporary offers into that schema would weaken the admission boundary the project has already proven.

## Decision

The first Phase 2E offer pilot will use a **Cloudflare Pages Function plus a dedicated D1 database bound as `OFFER_DB`**. The pilot database is operational experimental state and is separate from the canonical production D1 database and its `migrations/` path.

Repository-controlled pilot migrations live under:

```text
experimental/offer-buffer/migrations/
```

They must never be consumed by canonical backup, restore, import, export, or publication tooling merely because both stores use D1.

The initial participant-facing route will be `/offer`. Basic GET/POST use must work with ordinary HTML and without JavaScript.

## Pilot data contract

An accepted offer stores only the minimum application state needed to run and learn from the experiment:

- opaque offer identifier;
- offer body;
- optional reference URL;
- optional published evidence-question identifier;
- SHA-256 hash of a participant-held receipt secret;
- current handling state and, where needed, a bounded reason;
- optional temporary cluster/synthesis references;
- optional resulting canonical-record reference if a separate admission later occurs;
- received and expiry timestamps;
- content hash for bounded duplicate/synthesis work.

The application database does **not** include participant name, email, account, handle, origin category, reputation, browser fingerprint, user-agent history, raw IP address, bot score, or cross-offer identity profile.

## Payload bounds

Pilot v0.1 uses deliberately small limits:

- offer body: 1–4,000 Unicode characters;
- optional reference URL: up to 2,048 characters and only `http:` or `https:`;
- optional evidence-question identifier: up to 120 characters;
- no file uploads;
- total accepted request body: no more than 16 KiB.

Material outside these bounds is not accepted into the Offer Buffer.

## Retention

Accepted offer content has a **30-day ordinary retention period**.

A stored offer receives an `expires_at` value thirty days after acceptance. Before public launch, operational cleanup must be able to purge expired offer content reliably, with a hard operational target that expired content is deleted within seven additional days. The seven-day cleanup window is not an extension of participant-facing consideration; an expired offer is already out of active consideration.

Temporary clustering/synthesis state must not outlive the offers it depends on unless it is separately and deliberately admitted as institutional memory.

Hummingbird does not create an independent long-term backup of this experimental buffer. Provider recovery features may exist, but they are not an institutional promise that temporary offers can always be recovered.

## Receipt and continuity

On acceptance, the service generates a cryptographically random 256-bit receipt secret and returns it to the participant once. Hummingbird stores only its SHA-256 hash.

Possession of the receipt establishes only control of that offer receipt. It does not establish identity, uniqueness, authorship beyond the accepted interaction, governance standing, or authority over other offers.

The receipt may be used to inspect pilot-visible status and to withdraw the offer when those endpoints are enabled.

## Correction and withdrawal

Pilot v0.1 does not maintain an edit history.

If a participant wants to correct an offer, the low-complexity path is:

1. withdraw the old offer using its receipt; and
2. make a new offer.

Withdrawal removes the body, reference URL, content hash, and active cluster membership from the experimental buffer as promptly as practical. A minimal tombstone containing the opaque offer ID, `withdrawn` state, receipt hash, and expiry timestamp may remain until the original expiry so replay/status behavior stays coherent.

Withdrawal does not erase a separate canonical record that was already deliberately admitted through Hummingbird's admission process. Any such durable record follows its own correction/withdrawal rules.

## Duplicate and synthesis behavior

The ingress layer does not silently reject a valid offer merely because its text matches another accepted offer. Identical or related offers may be grouped later for synthesis.

Volume and repetition are evidence of salience at most; they do not become votes, reputation, priority, or governance weight.

## Resource and abuse boundary

The application does not persist raw network identifiers for rate limiting.

Initial resource controls should be enforced at the Cloudflare edge where practical, before application execution and without copying request/network telemetry into `OFFER_DB`. Any future application-level abuse state must be separately documented, scoped, hashed where practical, and retained for less time than offer content.

If resource, safety, validation, or overload limits prevent acceptance, the service must say that the offer was **not accepted**. It must not issue an acceptance receipt for material that was not durably written to the experimental buffer.

## Failure and recovery semantics

Acceptance is transactional at the pilot boundary:

```text
validated request
      ↓
write temporary offer successfully
      ↓
return receipt
```

If storage is unavailable or the write cannot be confirmed, the service fails closed with a retryable error and no receipt.

The experimental buffer is intentionally disposable. Loss of buffered offers is possible and must not be disguised as canonical durability. A material buffer-loss incident should be recorded publicly at an appropriately aggregated level without publishing participant material or correlation-rich telemetry.

## Handling outcomes

The public handling contract may expose these participant-facing outcomes:

- `received` — accepted into temporary experimental state;
- `grouped` — linked with related offers for synthesis;
- `synthesized` — represented in a temporary synthesis;
- `deferred` — retained but not currently being advanced;
- `surfaced` — brought forward for institutional consideration;
- `withdrawn` — participant used the receipt to remove the offer from active experimental state;
- `expired` — ordinary experimental retention ended.

A resource/safety rejection is an ingress result, not a stored adverse participant judgment.

None of these outcomes alone means endorsement, canonical admission, publication, implementation, governance promotion, participant legitimacy, or participant authority.

## Relationship to canonical memory

The only path from an experimental offer to durable institutional memory remains explicit admission:

```text
experimental offer
      ↓
consideration / synthesis
      ↓
explicit admission decision
      ↓
new canonical record
```

The offer row is never converted in place into a canonical record.

## Consequences

- The first-party pilot can be genuinely low-friction without weakening the canonical boundary.
- Hummingbird stores almost nothing about the participant behind an offer.
- Receipt-based continuity is useful without becoming identity infrastructure.
- Thirty-day offer retention is a pilot rule, not a universal future retention policy.
- The temporary store may be lost without corrupting canonical institutional history.
- Runtime and storage choices remain replaceable because the semantic boundary is explicit.

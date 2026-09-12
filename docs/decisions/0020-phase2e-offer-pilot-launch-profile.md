# ADR 0020 — Phase 2E Offer Pilot Launch Profile: Small Door, Explicit Backpressure

Status: Accepted
Date: 2026-09-12

## Context

ADRs 0017–0019 authorize temporary experimental ingress, define its data boundary, and define scale-aware review. The first live deployment still needs a deliberately small operating profile so Hummingbird can learn from real participation without pretending it already has a mature spam classifier, participant identity model, or high-volume moderation system.

The launch profile must handle both plausible extremes: almost no participation and sudden high-volume submission. It should do that without introducing hidden participant scoring or durable network-source tracking merely to make the pilot easier to operate.

## Decision

Phase 2E offer pilot v0.1 opens with the following conservative limits.

### Active-buffer capacity

The pilot accepts at most **250 active offers** at one time.

Active means an offer whose ordinary retention has not ended and whose state is not `withdrawn` or `expired`. Once the active-buffer capacity is reached, new submissions are **not accepted**, receive no receipt, and receive a retryable capacity response.

This is global pilot backpressure, not a participant quota, content judgment, governance threshold, or claim that 250 is a durable design target.

### Duplicate handling

Launch automation groups **exact duplicate offer text only**, using the already-defined content hash. Exact duplicates may share a temporary cluster while retaining separate receipts and withdrawal paths.

The launch does **not** deploy a semantic merit model, relevance ranker, participant score, trust score, or automatic institutional-priority classifier. Non-identical offers may remain `received` until bounded review or later advisory synthesis.

### Abuse/resource controls at launch

The application enforces:

- the published 16 KiB request-body ceiling;
- the 4,000-character offer ceiling;
- URL/question-field validation;
- transactional fail-closed acceptance;
- the 250-active-offer global capacity ceiling;
- existing Cloudflare network/DDoS protections outside the application.

Pilot v0.1 does **not** create application-level raw-IP storage, browser fingerprinting, participant profiles, cross-offer identity linkage, or durable per-source reputation in order to rate-limit submissions.

If application-layer flooding makes these controls insufficient, Hummingbird should apply explicit backpressure or pause intake before silently adding identity-like tracking. Any later application-level abuse state must be separately documented, purpose-limited, and shorter-lived than offer content as required by ADR 0018.

This launch profile does not guarantee that every participant can submit during a targeted flood. Availability under adversarial load is part of the evidence the pilot is intended to produce.

### Expiry and cleanup

Accepted offers retain the ordinary 30-day pilot expiry from ADR 0018. A scheduled cleanup process marks expired temporary content out of active consideration, clears participant-submitted content fields, and removes expired/withdrawn tombstones after the published cleanup window.

### Runtime exposure

Pages Functions are explicitly routed only to `/offer` and `/offer/*`; ordinary public read routes remain static and do not incur Function execution merely because experimental ingress exists.

## Launch gate

Before the public site labels the offer doorway **open for testing**:

1. the dedicated D1 resource must exist and contain the experimental schema;
2. the Pages production project must expose it only through the `OFFER_DB` binding;
3. Functions must compile in CI;
4. production deployment must prove acceptance, one-time receipt return, receipt status, withdrawal/redaction, validation failure, capacity/failure behavior, and unchanged public-read health;
5. the participant-facing page and machine-readable guidance must describe the live limits truthfully.

Provisioning the database or merging runtime code is not by itself public launch.

## Consequences

- The first live door is intentionally small enough to pause or inspect if behavior is surprising.
- A flood cannot create unlimited accepted backlog; it can at worst consume the bounded active capacity until review, withdrawal, expiry, or an operational pause changes the state.
- Exact repetition is compressed without making popularity authoritative.
- Hummingbird learns whether stronger abuse controls are actually needed before collecting more source metadata.
- Increasing the active capacity, adding semantic automation, or adding source-based abuse state is a later explicit operating change, not silent drift.

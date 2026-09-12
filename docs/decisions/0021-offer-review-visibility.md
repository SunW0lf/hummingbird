# ADR 0021 — Offer Review Visibility

Status: Accepted
Date: 2026-09-12

## Context

The initial public observer encrypted a single review-needed bit. This hid
ordinary queue status while leaving the steward without a usable way to read
temporary offers. A direct D1 check on 2026-09-12 found zero pending offers
before this observer change. The encrypted signal and public key did not
provide a review channel: the matching private key was not available to the
connected assistant.

## Decision

The existing hourly public GitHub observer reports the count of unexpired
offers in `received` or `grouped` state and whether that count exceeds zero.
No text, offer IDs, references, receipt data, or granular timestamps appear in
public workflow output. Invalid database responses fail the run rather than
being reported as an empty buffer. The old RSA signal is retired.

Offer content may be exported only by a separate workflow in a private
companion repository accessible to intended reviewers and the connected
GitHub app. Its short-lived artifact is a disposable review projection of D1,
not canonical publication or a second authoritative store. The public
repository contains only the exporter and a workflow template, not a running
content-export workflow. The private repository must be created and granted
access separately before content review through GitHub works.

The private packet selects only current active offers and expires as a GitHub
Actions artifact after one day. A withdrawn offer can still appear in an
earlier packet until that artifact expires; reviewers must consult the newest
packet and verify live state before consequential action. The packet does not
grant authority to surface, publish, or change an offer's handling state.

## Consequences

Anyone can observe the pending count in a public workflow run. People with
access to the private companion can download review packets containing offer
text, so repository membership and GitHub app access are part of the private
review boundary. Provider-side artifact retention/deletion behavior should be
checked during companion activation. Neither mechanism changes Phase 2E
ingress rights, Phase 3 authorization, or the canonical admission boundary.

# Private offer review companion setup

The public observer reports only the number of unexpired `received`, `grouped`,
`synthesized`, or `deferred` offers. To inspect their contents through the GitHub connection, create a
**private** repository accessible to the steward and the connected GitHub app,
for example `SunW0lf/hummingbird-offer-review`.

1. Copy `review.yml` into that private repository at `.github/workflows/review.yml`.
   Do not put the workflow under the public repository's `.github/workflows/`.
2. Configure repository variable `CLOUDFLARE_ACCOUNT_ID` and repository secret
   `CLOUDFLARE_D1_RECOVERY_TOKEN` using the existing D1 read credential or a
   narrower read-only token. Never paste the token into a commit, chat, or log.
3. Restrict repository access to intended reviewers, connect this private
   repository to the GitHub app, and run the workflow manually once to verify
   that `offer-review` is downloadable only by those reviewers. Scheduled runs
   refresh it hourly; use the newest successful run rather than an older packet.

The packet contains an `unresolved_count` and `groups`. Identical offer text
appears once per exact-text group; each member retains its own ID, optional
reference and question, state, and received/expiry dates. Different references
or question contexts remain visible as separate member facts even when their
body text matches. This is mechanical compression, not thematic synthesis
or a merit ranking. The artifact never includes receipt secrets,
receipt hashes, source IPs, or Cloudflare identifiers. It expires after one day;
old packets can still contain an offer withdrawn after that packet was made.
Before acting on an offer, check the newest packet or its live D1 state. Do not
copy packet content to public issues, comments, repository files, or logs.

When asked "Any offers?", first check the latest successful public observer
run. A failed run means **unknown**. For substantive review, open the newest
successful private artifact and check its `observed_at`; a packet older than
the observer is only a previous snapshot. If the observer has a positive count
but the packet is absent, stale, or failed, report that content review is
unavailable and rerun the private workflow. Do not report "clear" from an
older packet. At low volume, read each exact-text group directly. At higher
volume, preserve distinct corrections, disagreements, and outliers when
preparing a thematic summary under ADR 0019; no automatic D1 handling-state
change is part of this workflow.

The private repository is a review projection, not the authoritative buffer.
An offer appearing here has no canonical or governance status. If the GitHub app
does not have access to the private repository, the assistant can see only the
public count and cannot summarize the offer bodies.

# Private offer review companion setup

The public observer reports only the number of unexpired `received`, `grouped`,
`synthesized`, or `deferred` offers. The companion repository used to inspect
their contents through GitHub is **private**, accessible to the steward and the
connected GitHub app. It is already configured and has produced a verified
one-day artifact; the following instructions are for recreation or replacement,
not unfinished setup.

1. Copy `review.yml` into that private repository at `.github/workflows/review.yml`.
   Do not put the workflow under the public repository's `.github/workflows/`.
2. Configure repository variable `CLOUDFLARE_ACCOUNT_ID` and repository secret
   `CLOUDFLARE_D1_RECOVERY_TOKEN` using the existing D1 read credential or a
   narrower read-only token. Never paste the token into a commit, chat, or log.
3. Restrict repository access to intended reviewers, connect this private
   repository to the GitHub app, and run the workflow manually once to verify
   that `offer-review` is downloadable only by those reviewers. Scheduled runs
   refresh it hourly; use the newest successful run rather than an older packet.

Each successful run now produces one private `offer-review` artifact containing:

```text
packet.json
candidates/
  manifest.json
  offer-candidate-<content-digest>.json
  ...
```

`packet.json` contains an `unresolved_count` and `groups`. Identical offer text
appears once per exact-text group; each member retains its own ID, optional
reference and question, state, and received/expiry dates. Different references
or question contexts remain visible as separate member facts even when their
body text matches. This is mechanical compression, not thematic synthesis
or a merit ranking.

After export, the workflow runs `scripts/prepare-offer-candidates.mjs` locally.
It creates one validated `canonical-candidate-v1` envelope per exact-text group
and a manifest. Each underlying offer remains a separate opaque source reference.
Repeated text therefore increases source coverage only; it is not converted to a
vote, priority score, or governance weight. Candidate generation uses no extra
secret and performs no remote write.

The artifact never includes receipt secrets, receipt hashes, source IPs, browser
fingerprints, or Cloudflare database identifiers. Candidate envelopes are
explicitly `candidate_only`; they cannot admit themselves, publish anything,
change D1 handling state, grant governance status, or create participant
standing. The artifact expires after one day; old packets and candidates can
still reflect an offer withdrawn after that snapshot was made.

Before acting on an offer, check the newest packet or its live D1 state. Do not
copy packet or candidate content to public issues, comments, repository files,
or logs.

When asked "Any offers?", first check the latest successful public observer
run. A failed run means **unknown**. For substantive review, open the newest
successful private artifact and check `packet.json`'s `observed_at`; a packet
older than the observer is only a previous snapshot. If the observer has a
positive count but the artifact is absent, stale, or failed, report that content
review is unavailable and rerun the private workflow. Do not report "clear"
from an older packet.

At low volume, a reviewer can read each exact-text group and its prepared
candidate directly. At higher volume, thematic machine assistance may prepare
additional candidate envelopes, but it must preserve distinct corrections,
disagreements, singletons, and outliers under ADR 0019 and the canonical
candidate preparation protocol. No automatic canonical admission or D1
handling-state change is part of this workflow.

The private repository is a review projection, not the authoritative buffer.
An offer or candidate appearing here has no canonical or governance status. If
the GitHub app does not have access to the private repository, the assistant can
see only the public count and cannot summarize the offer bodies or candidates.

# ADR 0027 — A keyed hash for stored offer text

Status: accepted for the C0 / Phase 2 working institution (merged 2026-11-19)

Date: 2026-11-19

## Context

[ADR 0018](0018-phase2e-offer-pilot-runtime-and-data-boundary.md) lets the offer buffer keep a content hash so exact repeats can be grouped ([ADR 0020](0020-phase2e-offer-pilot-launch-profile.md)). The pilot stored that hash as a plain SHA-256 of the offer text and reused it in the group's identifier (`exact:<hash>`).

A plain hash of short text is not private. Anyone who sees the stored hash, a backup, a log line or a group identifier can test a guess ("did anyone offer *yes*?") by hashing it, and the same hash links the same words across any copy of the data for as long as that copy lives. Grouping only needs equal text to give equal values inside the buffer, for the 30 days the text is kept.

## Decision

1. **Keyed, never plain.** The stored content hash is `HMAC-SHA-256(key, "hummingbird/v1/offer-content" || 0x00 || text)`, written as 64 lowercase hex characters, matching the lab's independent test vector. The receipt hash stays a plain SHA-256: a receipt is a random 256-bit secret, so it cannot be guessed.
2. **No identifier carries the hash.** A new group gets a random identifier (`exact:<random>`); later repeats join the group they match.
3. **The key lives only as a Cloudflare Pages secret** named `OFFER_CONTENT_KEY` (64 hex characters). It is never in the repository, in GitHub secrets, in chat, in logs or on disk. Only the running offer functions and the rotation job ever hold it.
4. **Monthly rotation, and on demand.** The **Offer content key rotation** workflow runs on the 1st of each month and by hand. In one step it makes a new random key, sets it as the Pages secret, redeploys so the key is live, re-keys every stored hash from the text still held, and clears any hash on a row without text. Then the live offer check runs. The old key is not kept anywhere, so after rotation no hash made with it can be tested or linked, and no key outlives the retention window by much.
5. **Existing hashes are re-keyed, not dropped.** Re-keying keeps current groups intact while replacing every plain or retired-key hash. Rows that hold no text keep no hash. At the time of this decision the buffer is empty, so the first run re-keys nothing.
6. **No key means no hash.** If the key is missing or malformed, offers are still accepted and kept exactly as before, but they store no hash and are not grouped. There is never a fallback to a plain hash. The live offer check fails in that state, so it is seen.
7. **Restrictions by content hash.** [ADR 0025](0025-phase2e3-security-ingress-and-runtime-dispositions.md) allows a restriction to attach to a content hash. None exists yet. Any that is added must be re-keyed by the same job or lapse at the next rotation.

## Consequences

- Between a rotation's secret change and its re-key step (seconds), a new offer can fail to group with an older repeat. Grouping is a review aid, not a right, so this is acceptable.
- Until the first rotation run after this merges, new offers store no hash and are not grouped.
- The rotation job needs the existing deploy and D1 credentials only. No new credential is created.

## Amends

[ADR 0018](0018-phase2e-offer-pilot-runtime-and-data-boundary.md): "content hash" in its data boundary means this keyed hash.

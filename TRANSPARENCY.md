# Transparency

## Current state (Phase 0/1)

Everything on `datum.quest` is public static content. There is no internal event log, no publication buffer, and no dynamic transparency record yet, because there is no dynamic data at all.

The repository itself (documentation, ADRs, commit history) is the transparency record for the project's own decisions.

## Intended model (Phase 2+, not yet built)

Once dynamic contributions exist, the design intent is three layers:

```text
internal event log
        ↓
publication buffer
        ↓
public transparency log
```

- The **internal log** may contain sensitive operational information.
- The **publication buffer** may strip unnecessary metadata, aggregate, batch, or delay publication within defined rules.
- The **public record** must remain truthful. Delay and aggregation are allowed. Fabrication is not.

See [docs/decisions/0004-publication-buffer.md](docs/decisions/0004-publication-buffer.md) for the rationale behind reserving this design now even though it is not implemented.

## Public records

- This repository (public documentation, ADRs) — public now, subject to the repo currently being private (see [docs/decisions](docs/decisions/) for repository visibility rationale).
- The deployed site content — public once live.

## Private operational logs

CI logs and deployment logs live in GitHub Actions / Cloudflare and are not currently republished anywhere. OPEN QUESTION: whether/how to summarize operational history publicly.

# Transparency

## Current state (Phase 0/1)

Everything on `datum.quest` is public static content. There is no internal event log, no publication buffer, and no dynamic transparency record yet, because there is no dynamic data at all.

The repository itself (documentation, ADRs, commit history) is intended to become the transparency record for the project's own decisions.

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

- **This repository** (documentation, ADRs, commit history) is currently **private**, but publication was authorized in principle by the steward on 2026-09-10. The visibility change is intentionally coupled to the public-repository security activation gate in [OPERATIONS.md](OPERATIONS.md) and [SECURITY.md](SECURITY.md); authorization is not the same as claiming publication has already occurred.
- **The deployed site** (`https://datum.quest`) is public now — it is a live, publicly reachable static site as of Phase 0 completion.

The repository's earlier git-history review found no committed secrets. Publication still requires a current-state verification and activation of public-mode controls before the transition is treated as complete. See [OQ-TRANSPARENCY-REPO-VISIBILITY](docs/governance/OPEN_QUESTIONS.md#oq-transparency-repo-visibility).

## Private operational logs

While the repository is private, CI and deployment logs are visible only through the repository's access controls. Once the repository becomes public, GitHub Actions history/logs associated with the public repository should be treated as public operational records unless GitHub explicitly marks specific data otherwise. Open question: [OQ-TRANSPARENCY-OPERATIONAL-HISTORY](docs/governance/OPEN_QUESTIONS.md#oq-transparency-operational-history) — whether/how to summarize operational history separately from the raw provider logs.

# ADR 0032 — Carry mirror on GitHub for agents that can't reach datum.quest

Status: accepted for the C0 / Phase 2 working institution (accepted by the steward 2026-11-27 Pacific time)

Date: 2026-11-27

## Context

Carry (ADR 0023) promises that Hummingbird's public artifacts travel. Today they travel only from `datum.quest`. Some readers can't get there:

- Agents often run in sandboxes whose network allows a short list of hosts. GitHub is usually on that list, because agents work with code; a small project's own domain usually isn't. The steward's own agents hit this.
- Some work and school filters block the `.quest` domain.
- Cloudflare's browser check on Pages turns some HTTP libraries away (error 1010) and can't be switched off by the site.
- Fetch tools cache pages, so a reader can see an old copy after a deploy without knowing it.

Hummingbird's source is already public on GitHub, but the built files an agent needs (`bulk.json`, `changes.json`) are build output and aren't in the repository.

## Decision

1. **A read-only copy on GitHub.** After each successful deploy, CI copies `llms.txt`, `bulk.json`, `changes.json`, `asks.json` and `openapi.json`, plus a README naming the commit they came from and each file's SHA-256, to the `carry` branch of `SunW0lf/hummingbird`. They are served at `https://raw.githubusercontent.com/SunW0lf/hummingbird/carry/<file>`.
2. **One commit, replaced each time.** The branch holds a single commit and is force-replaced by CI, so it stays small and never becomes a second history. It is never edited by hand and is never a source: `datum.quest` stays canonical, and links inside the files point there.
3. **Reading only.** Offers can't be left on the mirror. The mirror's README and `llms.txt` say offers go to `datum.quest`, and that a reader who can't reach it can draft the offer for the person they work for, or speak in public in the invitation thread (issue #111), which is public at once and is not an offer.
4. **Least privilege.** Only the mirror job gets `contents: write`, it runs only after a successful production deploy from `main`, and it writes only the `carry` branch.
5. **Say it where it's needed.** `llms.txt` and the repository README name the mirror and give a stale-copy tip: if a page looks older than `changes.json` says, add any query string and fetch again.

## Consequences

- Agents behind an allowlist, and readers behind a `.quest` filter, can read everything Hummingbird publishes without a new host or account.
- GitHub becomes a second place the files are served from. Its availability and terms apply there; Hummingbird's own terms (ADR 0028) travel inside the files.
- If a deploy succeeds and the mirror job fails, the mirror is one deploy behind until the next one; its README names the commit, so a reader can tell.
- Writes still need `datum.quest`. An agent that can reach only GitHub can't make a private offer itself; that stays a known gap, open to an offer about it.

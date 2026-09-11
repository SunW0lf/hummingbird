# Architecture

This document describes the actual technical architecture of Hummingbird, as built — not aspirational design.

## System components (Phase 0/1)

```text
GitHub repository (source of truth)
      │
      ▼
GitHub Actions (lint, test, build)
      │
      ▼
Cloudflare Pages (static hosting)
      │
      ▼
datum.quest (Cloudflare DNS + proxy)
```

- **`app/`** — static HTML/CSS site. No client-side framework, no build step required to view locally. Phase 1 content: Home, Mission, Charter Candidate, How It Works, Transparency, Changelog, Security/Contact.
- **No API and no database exist yet.** These are Phase 2+ concerns (see [ROADMAP.md](ROADMAP.md)).
- **No queues, no background workers exist yet.**

## Trust boundaries

- **GitHub**: holds source code, secrets (as GitHub Actions secrets), and CI execution. Compromise of GitHub Actions or repository write access is a critical risk (see [SECURITY.md](SECURITY.md)).
- **Cloudflare**: holds DNS for `datum.quest` and the Pages deployment (cutover complete as of Phase 0). A scoped Cloudflare API Token (Pages:Edit only, on the `datum.quest` zone) is used for deployment, distinct from any broader account-level credential. DNS itself is managed separately and is not covered by this token — see [SECURITY.md](SECURITY.md).
- **Local development machine**: not part of the production trust boundary. No production secrets should be required for local development of the Phase 1 static site.

## External services

- GitHub (source control, CI/CD, issue tracking)
- Cloudflare (DNS, Pages hosting, and later D1/KV if needed)
- No third-party APIs are integrated in Phase 0/1.

## Secrets management

- Local development requires no secrets for the Phase 1 static site.
- Production deployment requires one Cloudflare API Token, stored as a GitHub Actions repository/environment secret, never committed to the repository. See `.env.example` for any future local secret shape.

## Backups

- Phase 0/1: the only durable state is the Git repository itself (mirrored on GitHub) and the Cloudflare Pages deployment (rebuildable from Git at any time). There is no database to back up yet.
- Phase 2+: once Cloudflare D1 is introduced, a backup/restore procedure will be added here and to [OPERATIONS.md](OPERATIONS.md).

## Deferred (explicitly out of scope for now)

- API server
- Database (Cloudflare D1, planned Phase 2)
- Queues/background processing
- Authentication/authorization system

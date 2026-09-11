# Operations

## Deployment

Production deployment is triggered from `main` only after the CI verification job (tests, build, canonical-corpus checks, and dependency audit) succeeds. See `.github/workflows/ci.yml` and `scripts/deploy`.

```text
branch → pull request → required CI → protected main → scripts/deploy → Cloudflare Pages → datum.quest
```

The normal production path is repository change → CI → deployment. Manual/local deployment is reserved for steward emergency recovery: `./scripts/deploy`. It requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` to be set locally and refuses to run when either is missing.

## Phase 2 operational sequence

Phase 2 is intentionally staged:

1. **2A — Canonical contract/reference corpus.** No production database required. Schema and fixture contract must pass CI.
2. **2B — Persistence/import.** Provision D1, apply versioned migrations, ingest storage-independent records deterministically, and prove export equivalence.
3. **2C — Public read model/admission.** Build rebuildable projections and demonstrate explicit external-source → canonical-admission behavior.
4. **2D — Publication buffer/backup/recovery.** Implement delayed/coarsened publication where required, export D1 independently, and restore into empty state.
5. **2E — Phase review.** Review the Seed Bank experiment and Phase 2 operational/governance review gates before considering Phase 3.

See [ROADMAP.md](ROADMAP.md).

## Backup

Current durable production state is still primarily the Git repository plus provider-hosted external records. The Phase 2 reference corpus under `fixtures/canonical/` is version-controlled contract material, not the production application database.

Once Cloudflare D1 is introduced in Phase 2B, `./scripts/backup` must be extended to export the canonical database state to a storage location independent of the live database. Backup format must preserve storage-independent canonical records rather than relying solely on provider-specific snapshots.

Before Phase 2 completes, a backup must be restored into an empty replacement database and checked for canonical/read-model equivalence.

## Restore

`./scripts/restore` currently documents source/site restoration from Git. Phase 2D will extend it with database reconstruction:

1. provision an empty compatible database;
2. apply versioned migrations;
3. import the latest verified canonical export;
4. rebuild derived projections/indexes;
5. run canonical and public-read-model verification checks;
6. cut traffic only after verification succeeds.

Derived projections are disposable; loss of a cache/search/read projection must not imply loss of institutional meaning.

## Rollback

Cloudflare Pages retains prior deployments. `./scripts/rollback` lists recent deployments and can redeploy a prior one. See `wrangler pages deployment list` for the underlying mechanism.

Database rollback policy will be defined with the first D1 migrations. Destructive reverse migrations should not be assumed safe merely because code can be rolled back; canonical data compatibility must be considered separately.

## Monitoring

`./scripts/healthcheck` is the plain-HTTP production smoke test for the public read plane. It checks the root with `GET` and `HEAD`, verifies the machine-facing entry points and raw Markdown with their expected media types, requires useful Hummingbird marker content, and rejects obvious challenge/CAPTCHA/browser-interstitial responses. The CI deployment job runs this check after production deployment.

The healthcheck deliberately does not persist cookies, authenticate, execute JavaScript, impersonate a verified crawler, or collect participant identity/fingerprinting data. Cloudflare zone-level bot, WAF, Browser Integrity Check, crawler, rate-limit, and managed-`robots.txt` settings remain steward-managed operational configuration. Settings that cannot be read back using the intentionally narrow Pages deployment credential must be recorded as steward-verified rather than falsely described as independently verified. See [ADR 0013](docs/decisions/0013-public-read-accessibility.md).

### Cloudflare public-read configuration review

The following is a steward dashboard checklist, not repository-controlled configuration. Provider labels may change; preserve the purpose distinction rather than relying on a particular UI name.

- **Managed `robots.txt`:** keep provider-managed replacement/prepending disabled so the repository's `app/robots.txt` remains the deliberate project policy.
- **AI crawler controls / Block AI Bots:** do not use one global AI-bot switch that blocks search/discovery or user-directed/agent retrieval together with training. Search and agent/user-directed categories should remain readable where the provider supports purpose-specific controls. Training remains a separate policy question under `OQ-LEGAL-CONTENT-LICENSE`.
- **Bot Fight Mode:** Cloudflare's basic Bot Fight Mode cannot be bypassed by the public-read WAF Skip rule. If it challenges benign public readers, keep it disabled rather than weakening the read contract. Prefer granular controls that distinguish harmful behavior from automation.
- **Super Bot Fight Mode (where available):** use its granular controls/skip capability so harmless public reads and reputable verified search/user-directed crawlers are not forced through interactive challenges. Do not disable ordinary network/DDoS protection.
- **Browser Integrity Check:** configure it so benign standards-compliant `GET`/`HEAD` requests to the public read plane are not challenged merely for having a non-browser, absent, or unusual user agent.
- **WAF and rate limiting:** retain controls for harmful behavior, attacks, and abusive request patterns, but do not make browser execution, participant classification, or human verification a blanket prerequisite for the public read plane.
- **Challenge/interstitial rules:** no CAPTCHA, JavaScript challenge, login/interstitial, or browser-attestation rule should apply to ordinary harmless public `GET`/`HEAD` requests.

### Active production read-plane rule — 2026-09-11

The steward activated the Cloudflare custom rule **Hummingbird — Public Read Plane** for the current read-only application surface.

Match expression:

```text
(http.host eq "datum.quest" and http.request.method in {"GET" "HEAD"})
```

Action: **Skip**.

The rule is placed ahead of conflicting custom rules and skips the applicable remaining custom/WAF/rate-limit phases plus the additional legacy edge components selected in the dashboard that could block or challenge public reads based on allowlist state, user agent, browser-integrity heuristics, reputation/security level, or hotlink/legacy-rule behavior. The exact dashboard labels are provider-controlled and may change.

Do not interpret this as permission to exempt future expensive, private, administrative, authenticated, or abuse-sensitive `GET` endpoints. Before such endpoints exist, narrow the match to deliberately public routes or separate the read plane from the control/write plane by path or hostname.

Core Cloudflare DDoS/network protection remains enabled outside the Skip rule. Do not use **Pause Cloudflare** or a DNS-only bypass as the normal way to satisfy ADR 0013.

No broad **Cache Everything** rule is part of the current design. Cloudflare Pages' native deployment caching/invalidation plus standard `ETag`/revalidation behavior is retained. Revisit explicit edge caching only when there is an observed read-performance/cost need and a stale-content analysis.

### Production acceptance record — 2026-09-11

Manual plain-HTTP checks after activation confirmed:

- root `HEAD` → `200 OK`, `text/html`;
- `llms.txt` `HEAD` → `200 OK`, `text/plain`;
- `llms.txt` `GET` → expected Hummingbird machine-readable index body;
- `robots.txt` `HEAD` → `200 OK`, `text/plain`;
- raw Charter Markdown `HEAD` → `200 OK`, `text/markdown`;
- deep ADR 0013 route `HEAD` → `200 OK`, `text/html`;
- `llms.txt` with the `User-Agent` header explicitly removed → `200 OK`;
- root with explicit `curl/8.0` user agent → `200 OK`;
- no tested response contained `cf-mitigated: challenge` or returned `403`, `429`, or `503`;
- CSP, frame-denial, referrer, permissions, and content-type-hardening headers remained present.

These checks are acceptance evidence for the external behavior, not proof of every hidden provider toggle. After any material Cloudflare bot/WAF/challenge-policy change, rerun `./scripts/healthcheck` and at least one no-`User-Agent` request.

Open question: [OQ-OPS-MONITORING-CADENCE](docs/governance/OPEN_QUESTIONS.md#oq-ops-monitoring-cadence) — scheduled monitoring beyond the post-deployment smoke test versus additional manual checks only. During Phase 2, monitoring should remain lean: service availability, deployment health, migration/import success, backup success, and restore-test outcome are higher priority than broad behavioral telemetry.

## Upgrades

The current runtime footprint remains intentionally small. DevDependencies support build/deploy tooling and are monitored by Dependabot. Avoid adding a framework or persistence abstraction merely to anticipate Phase 3.

## Database migrations

No production application database exists yet. Phase 2B will introduce Cloudflare D1 after the Phase 2A storage-independent record contract exists.

Migrations will live in `migrations/` and be applied through a documented script. They must satisfy these rules:

- reproducible from empty state;
- versioned and reviewable in Git;
- no secret values embedded in migrations;
- canonical meaning must be recoverable without provider-specific row IDs or triggers;
- migrations/import code must pass the canonical reference corpus as a round-trip test;
- destructive changes require an explicit data-migration/recovery plan.

Canonical record semantics remain defined in [DATA_MODEL.md](DATA_MODEL.md), [ADR 0010](docs/decisions/0010-phase2-read-only-commons-contract.md), and [ADR 0012](docs/decisions/0012-reference-corpus-before-persistence.md).

### Phase 2B remote-D1 guardrails

The local Wrangler D1 round trip is already the authoritative CI contract test. The next remote slice should preserve that boundary:

- provision the remote D1 database only after the local migration/import/export round trip is green;
- do not widen the existing Pages-only deployment credential merely to manage D1; use a separate least-privilege credential or a deliberate steward provisioning step;
- do not store secrets in `wrangler.d1.jsonc`, migrations, source, fixtures, or generated SQL;
- a Cloudflare D1 database ID is provider configuration, not canonical institutional meaning;
- keep ordinary pull-request CI local/deterministic rather than making every build depend on a remote provider database;
- apply the versioned migration set to an empty remote database and verify the migration inventory before loading data;
- exercise deterministic import/export against a bounded verification corpus before treating remote persistence as ready;
- do not expose a public application write endpoint merely because a remote database now exists;
- do not begin Phase 2C until remote persistence can be reconstructed/exported without semantic loss.

The execution checklist lives in [docs/protocols/PHASE_2B_REMOTE_D1.md](docs/protocols/PHASE_2B_REMOTE_D1.md).

## Seed Bank operations

The Seed Bank is external provider-hosted intake, not a Hummingbird application write path.

- GitHub issue bodies/comments/links are untrusted public input.
- Do not copy provider account identity, reactions, or complete thread metadata into canonical storage by default.
- Spam, harassment, phishing, duplicate posting, and unsafe links may be moderated using GitHub's provider controls.
- Security vulnerabilities do not belong in Seed Bank threads; route them to GitHub private vulnerability reporting.
- Any later admission of Seed Bank material into the commons must be a separate deliberate action with provenance/reference as appropriate.

## Recovery

To reconstruct Hummingbird from scratch, someone needs:

1. This GitHub repository (or a verified clone/mirror).
2. The ability to generate appropriate Cloudflare credentials with least privilege.
3. The Cloudflare account/project configuration.
4. A fresh Cloudflare Pages project or equivalent static host.
5. This documentation, schema, migrations, and reference corpus.
6. Once Phase 2 data exists, the most recent verified storage-independent canonical export.

## Repository protection

The repository is public and `main` is protected. The normal and enforced path is branch → pull request → required CI → merge.

Current branch protection requires `Checks, test, build`; the branch-level GitHub API reports protection enabled with enforcement level `everyone`, so the steward/admin is included. Force pushes and branch deletion are disallowed by project policy. A separate approving reviewer is intentionally not required while Hummingbird has only one maintainer, because that would deadlock legitimate maintenance.

## Public repository controls

The public-repository security activation is complete. Repository Actions are restricted; external workflow actions are full-SHA pinned; workflow-token permissions are read-only; private vulnerability reporting, secret scanning/push protection, Dependabot security controls, and CodeQL default setup are enabled. See [SECURITY.md](SECURITY.md) for the authoritative security posture and verification distinctions.

`.github/CODEOWNERS` records the current steward as code owner. `.github/dependabot.yml` monitors npm and GitHub Actions dependencies so pinned action SHAs and package versions can be reviewed through pull requests.

## Routine steward tasks

- Review and merge pull requests only after required CI passes.
- Review Dependabot pull requests and security alerts; do not auto-merge dependency changes without CI.
- Keep canonical schema, reference corpus, migrations, and data-model documentation aligned.
- Review public Seed Bank activity for abuse/safety issues without treating popularity as governance weight.
- Review Cloudflare public-read settings after material provider-policy changes so benign `GET`/`HEAD` access remains consistent with ADR 0013 without weakening network/DDoS or mutation-path protections.
- Revisit the broad public-read Skip expression before any non-public, authenticated, expensive, or abuse-sensitive `GET` endpoint is added.
- Rotate the Cloudflare deployment token periodically. Open question: [OQ-OPS-TOKEN-ROTATION-CADENCE](docs/governance/OPEN_QUESTIONS.md#oq-ops-token-rotation-cadence) — exact cadence.
- Keep the Open Questions Registry honest — resolve questions in substantive documents rather than letting implementation silently answer them.

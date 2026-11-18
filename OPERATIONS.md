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
4. **2D — Publication buffer/backup/recovery — complete.** Independent encrypted retention, restore, semantic equivalence, and publication-buffer behavior have been exercised.
5. **2E — Phase review.** Review the Seed Bank experiment and Phase 2 operational/governance review gates before considering Phase 3.

See [ROADMAP.md](ROADMAP.md).

## Phase 2E offer review

The public hourly [offer observer](.github/workflows/phase2e-offer-observer.yml)
prints `HB_PENDING_COUNT` and `HB_OFFERS_PENDING` for unexpired `received`,
`grouped`, `synthesized`, and `deferred` offers. A successful run is required before treating zero as clear;
an observer failure means unknown, not zero. Its public log never contains
offer text or identifiers. A private, short-lived content review companion is
described in [ADR 0021](docs/decisions/0021-offer-review-visibility.md) and
[its setup guide](ops/offer-review-companion/README.md). The companion is now
configured in a separate private repository. A manual run succeeded, read D1,
and produced the one-day `offer-review` artifact; later runs must still be
checked individually for success and freshness. The workflow is scheduled
hourly and never prints offer bodies or receipts in its logs.

An accepted `/offer` write starts as `received`. A conditional D1 insert enforces
the published capacity; exact duplicate grouping can then mark `received` rows
as `grouped` and populate temporary cluster membership. Failed grouping leaves
the accepted offer `received`, still visible to the observer and review exporter.
Receipt-based withdrawal clears the body and cluster link; scheduled cleanup
expires remaining temporary content. The public signal and private packet are
derived from D1 and do not initiate admission or publication. The private
packet's `observed_at` and `unresolved_count` must be checked against the latest
successful public run before declaring the inbox clear or taking action.

The review packet can now be processed locally/private-side with
`scripts/prepare-offer-candidates.mjs`. The tool deterministically turns each
exact-text review group into a `canonical-candidate-v1` envelope, preserves each
offer as a source reference, validates the proposed draft record against the
existing guarded admission contract, and writes only candidate files plus a
manifest. This step performs no network access and no canonical mutation.
Repeated identical offers remain multiple source references, not votes or
priority weight. Semantic grouping/synthesis beyond exact text remains a later
advisory step and must preserve corrections, disagreement, and singletons.

A candidate envelope is deliberately weaker than admission. It must remain
`candidate_only`, require explicit admission, and cannot carry receipt secrets,
provider database identifiers, participant profiles, source IPs, fingerprints,
or similar request metadata. A reviewed candidate may later be passed through
the existing steward-only admission path, but candidate generation itself never
changes D1, publication state, or governance status.

## Backup

Current durable production state includes the Git repository, deliberately admitted canonical records in Cloudflare D1, and provider-authoritative external records that Hummingbird references rather than clones. The Phase 2 reference corpus under `fixtures/canonical/` is version-controlled contract material, not a backup of production application state.

Phase 2D replaces the original Phase 0 backup no-op with a portable canonical exporter:

```bash
./scripts/backup --remote --output /safe/off-repo/path/backup
```

The exporter is read-only against D1. It reconstructs canonical objects and relationships into storage-independent JSON, writes per-record SHA-256 digests plus a bundle digest, and does not require provider database IDs or row IDs to interpret the result.

Production backup bundles must remain outside the public repository, outside the public web root, and outside the live D1 service as an independently retrievable copy. `.hummingbird-backups/` is ignored only as a local convenience; an ignored directory on the same machine is not sufficient disaster recovery.

The ordinary retention path is the **Phase 2D Private Canonical Backup** workflow. It runs daily on a repository-controlled schedule and retains the manually confirmed trigger for deliberate extra checkpoints. Each run exports canonical production state read-only, validates the portable bundle, public-key encrypts it to the configured `age` recipient, removes runner plaintext, and commits only ciphertext plus its transport checksum to the dedicated private `SunW0lf/hummingbird-backups` repository using a destination-scoped credential. The `age` private identity remains steward-held outside GitHub and Cloudflare.

The ordinary independent-retention checkpoint has been completed: a retained ciphertext bundle was retrieved from the private repository, decrypted with the off-platform steward-held identity, and the recovered portable bundle passed `./scripts/restore ... --validate-only`. This closes Phase 2D's independent-backup requirement while keeping decryption capability outside the hosting and source-control providers.

The daily schedule is the baseline recovery-point cadence during the current low-write phase. Use the retained manual trigger before and after maintenance, migration, or deliberate canonical mutation when a tighter recovery point is materially useful. A provider-native D1 export may supplement this bundle but does not replace the storage-independent canonical backup requirement.

The first remote recovery drill used a narrow exception because the workflow first proved that the complete production canonical set exactly matched already-public `publication/canonical` state. Only then was a short-lived public GitHub Actions artifact permitted. That exception does not authorize public artifact storage for future backups containing drafts or other non-public canonical state.

See [docs/protocols/PHASE_2D_RECOVERY.md](docs/protocols/PHASE_2D_RECOVERY.md).

## Restore

`./scripts/restore` is now a guarded canonical recovery tool rather than a Phase 0 no-op.

Validate a bundle without touching any database:

```bash
./scripts/restore /safe/path/backup --validate-only
```

The general-purpose restore command remains intentionally limited to an explicitly isolated local D1 state directory. Apply migrations first, then restore:

```bash
npx wrangler d1 migrations apply hummingbird \
  --local \
  --persist-to /tmp/hummingbird-recovery \
  --config wrangler.d1.jsonc

./scripts/restore /safe/path/backup \
  --local \
  --persist-to /tmp/hummingbird-recovery \
  --confirm-restore
```

The tool refuses non-empty canonical targets, imports objects/relationships transactionally, reconstructs canonical JSON from restored rows, and deep-compares restored meaning with the backup bundle.

`./scripts/restore --remote` remains deliberately disabled. The first production-state remote recovery exercise used a separate guarded one-shot workflow against a disposable replacement D1 database rather than enabling a general remote restore command or writing to the live production database.

On 2026-09-11 the guarded remote drill completed successfully. It:

1. read current production canonical objects/relationships with `SELECT` only through the D1 REST API;
2. constructed and verified the portable canonical backup bundle;
3. provisioned an empty disposable recovery database with a UUID distinct from production;
4. applied repository-controlled migration SQL;
5. restored the verified canonical bundle into the disposable database;
6. reconstructed and deep-compared canonical meaning;
7. rebuilt the public canonical projection in isolated output;
8. byte-compared the recovered machine-readable public projection with the expected built projection;
9. deleted the disposable recovery database from cleanup.

The exercise used a separate account-owned recovery credential rather than widening the Pages deployment token. Earlier failed attempts are retained in the recovery protocol because they demonstrate fail-closed behavior before production mutation.

Derived projections are disposable; loss of a cache/search/read projection must not imply loss of institutional meaning.

## Rollback

Cloudflare Pages retains prior deployments. `./scripts/rollback` lists recent deployments and can redeploy a prior one. See `wrangler pages deployment list` for the underlying mechanism.

Database rollback is not equivalent to code rollback. Destructive reverse migrations should not be assumed safe merely because application code can be rolled back; canonical compatibility and a verified backup/recovery path must be considered separately.

## Monitoring

`./scripts/healthcheck` is the plain-HTTP production smoke test for the public read plane. It checks the root with `GET` and `HEAD`, verifies the machine-facing entry points and raw Markdown with their expected media types, requires useful Hummingbird marker content, and rejects obvious challenge/CAPTCHA/browser-interstitial responses. The CI deployment job runs this check after production deployment.

The healthcheck deliberately does not persist cookies, authenticate, execute JavaScript, impersonate a verified crawler, or collect participant identity/fingerprinting data. Cloudflare zone-level bot, WAF, Browser Integrity Check, crawler, rate-limit, and managed-`robots.txt` settings remain steward-managed operational configuration. Settings that cannot be read back using the intentionally narrow Pages deployment credential must be recorded as steward-verified rather than falsely described as independently verified. See [ADR 0013](docs/decisions/0013-public-read-accessibility.md).

### Phase 2 monitoring model

The Phase 2 review disposition is recorded in [ADR 0022](docs/decisions/0022-phase2e1-review-gate-dispositions.md). Hummingbird does **not** use one institution-wide monitoring interval. Cadence follows the failure mode, consequence, and expected rate of change of the capability being observed.

The durable monitoring pattern is:

- **event-driven verification** after deployment, migration, credential change, recovery, or material provider/configuration change;
- **scheduled checks** for capabilities that can degrade without a repository change; and
- **periodic exercises** for capabilities such as recovery that a successful uptime probe cannot prove.

Every consequential capability should eventually publish or inherit a small monitoring contract: what healthy means, how it is observed, how freshness is determined, what `degraded`, `failed`, and `unknown/stale` mean, what data may be collected, who or what receives an actionable failure, and what—if any—pre-authorized automated mitigation exists.

A stale or failed monitor means **unknown**. Silence from a dead monitor must never be treated as evidence of health. A failed probe also does not automatically prove the underlying service failed; retry/confirmation should be proportionate to the consequence before escalation.

Monitoring is failure-oriented, not surveillance-oriented. It must collect only what is necessary to establish health, integrity, or recoverability. The availability of richer telemetry does not justify participant identity, fingerprinting, raw request exhaust, offer content, or unnecessary behavioral history.

Observation is not authority. A monitor may report or classify a condition and may invoke only explicitly pre-authorized bounded fail-safe behavior. It does not acquire canonical mutation, credential, recovery, exclusion, or governance authority because it detected a failure.

Where consequence warrants it, important health claims should eventually be corroborated from outside the same failure domain. Phase 2 may accept single-source monitoring for low-consequence surfaces, but multiple green jobs in the same provider are not treated as independent evidence merely because they are separate jobs.

The current Phase 2 baseline is:

- **on change:** CI/build verification and post-deployment production health checks; rerun relevant checks after material provider/public-read configuration changes;
- **scheduled public read plane:** a lightweight repository-controlled external plain-HTTP health run, with no mutation and no participant telemetry;
- **hourly:** public offer pending-state observation and private offer review/candidate preparation;
- **daily:** encrypted storage-independent canonical backup;
- **deliberate/periodic:** backup retrieval/decryption/restore validation, recovery exercises, and tighter backup checkpoints around consequential canonical maintenance.

Cadences are Phase 2 operational parameters, not permanent service promises. Reassess them when write volume, durable participant state, financial consequence, operational custodians, providers/failure domains, availability expectations, or observed failure modes change materially. No uptime SLA is implied by the current schedule.

The broader Phase 3 monitoring/alerting, ownership, redundancy, service-level, and automated-remediation design remains open under [OQ-OPS-MONITORING-CADENCE](docs/governance/OPEN_QUESTIONS.md#oq-ops-monitoring-cadence) for Phase 2E.3.

### Public discovery and source identity

`https://datum.quest/` is the only canonical web origin. Built HTML advertises clean self-canonical URLs; the repository-owned `robots.txt` links the generated `sitemap.xml`; `llms.txt` and the existing `/offer` page describe the ordinary public read and bounded offer paths. Keep the GitHub repository README and About/homepage metadata pointed at the live first-party pilot, not an obsolete read-only-only description. Avoid confusing Hummingbird with similarly named organizations or implying affiliation.

After a material public-entry change:

1. Run `./scripts/healthcheck` against production and inspect `/`, `/offer`, `/robots.txt`, `/sitemap.xml`, `/llms.txt`, and a public canonical JSON/Markdown route using ordinary HTTP. Check clean canonical targets, useful initial HTML, status and content type, and no challenge/interstitial. Do not test participation by posting unsolicited offers.
2. In a **verified** Google Search Console property for `datum.quest`, inspect the live homepage and `/offer`, submit the existing sitemap, and request recrawling of a few materially changed pages. In a verified Bing Webmaster Tools property, inspect the same routes and submit the sitemap. These account-owned indexing and performance views cannot be inferred from a generic search result or a successful curl response; recrawl and inclusion are not guaranteed.
3. The optional `www.datum.quest` alias returned an origin error in a 2026-09-12 external check. If it is retained, configure it at the provider as a TLS-valid, single-hop permanent redirect to `https://datum.quest` preserving path and query, then verify both `GET` and `HEAD` externally. Do not treat a repository-only Pages redirect as proof that an unbound host works. Until provider confirmation, keep all project links on the apex.
4. Track indexed canonical pages, relevant query impressions/clicks, substantive citations or referrals where available, successful offer receipts, public observer health, private review freshness, and unresolved backlog using aggregated provider measurements. Do not add participant identity, fingerprinting, raw request telemetry, or offer content to public analytics. A burst of crawler requests is not participation.

Only after the intake/review path remains healthy under observed demand should external distribution or changed-URL notifications such as IndexNow be considered. A deployment ping should announce genuinely added, changed, or deleted **public** URLs, not private offers or every routine build. This is an operational discovery checklist, not an expansion of the Phase 2E pilot or a decision about training/reuse rights.

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

## Upgrades

The current runtime footprint remains intentionally small. DevDependencies support build/deploy tooling and are monitored by Dependabot. Avoid adding a framework or persistence abstraction merely to anticipate Phase 3.

## Database migrations

Cloudflare D1 is now the production persistence engine for deliberately admitted canonical application records. Repository-controlled migrations live in `migrations/` and are the required way to reconstruct schema from empty state.

They must satisfy these rules:

- reproducible from empty state;
- versioned and reviewable in Git;
- no secret values embedded in migrations;
- canonical meaning must be recoverable without provider-specific row IDs or triggers;
- migrations/import code must pass the canonical reference corpus as a round-trip test;
- destructive changes require an explicit data-migration/recovery plan and a verified backup before execution.

Canonical record semantics remain defined in [DATA_MODEL.md](DATA_MODEL.md), [ADR 0010](docs/decisions/0010-phase2-read-only-commons-contract.md), and [ADR 0012](docs/decisions/0012-reference-corpus-before-persistence.md).

### Phase 2B remote-D1 guardrails — completed persistence baseline

The local Wrangler D1 round trip remains the authoritative CI contract test. The remote Phase 2B exercise established these continuing boundaries:

- remote D1 provisioning and migration use deliberate steward/provider credentials rather than widening the Pages-only deployment credential;
- secrets are not stored in `wrangler.d1.jsonc`, migrations, source, fixtures, or generated SQL;
- the Cloudflare D1 database ID is provider configuration, not canonical institutional meaning;
- ordinary pull-request CI stays local/deterministic rather than depending on remote provider state;
- versioned migrations are applied before data restoration/import;
- remote persistence/import/export was verified with a bounded corpus before Phase 2C;
- existence of a remote database did not create a public write endpoint.

The execution record lives in [docs/protocols/PHASE_2B_REMOTE_D1.md](docs/protocols/PHASE_2B_REMOTE_D1.md).

### Phase 2D recovery guardrails — exercised baseline

The first remote recovery exercise established these additional boundaries:

- production canonical reads used a separate D1 recovery credential rather than the Pages deployment token;
- production access for the drill was read-only `SELECT` against the canonical tables;
- all recovery writes targeted a uniquely created disposable D1 database whose provider ID was checked against production before use;
- repository-controlled migration SQL reconstructed the recovery schema before import;
- restored canonical records had to deep-equal the verified portable backup;
- recovered public projection output had to byte-equal the expected public machine-readable projection;
- cleanup deleted the disposable recovery database even when verification failed;
- public artifact retention was allowed only after proving the production canonical set exactly matched already-public state.

See [docs/protocols/PHASE_2D_RECOVERY.md](docs/protocols/PHASE_2D_RECOVERY.md) for the detailed execution contract and observations.

## Seed Bank operations

The Seed Bank is external provider-hosted offer transport, not a Hummingbird application write path.

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
6. The most recent verified storage-independent canonical backup bundle from independent storage.

Recovery proceeds migrations → canonical restore → semantic verification → derived projection rebuild → public-read verification. Provider telemetry and static projections are not canonical recovery sources.

## Repository protection

The repository is public and `main` is protected. The normal and enforced path is branch → pull request → required CI → merge.

Current branch protection requires `Checks, test, build`; the branch-level GitHub API reports protection enabled with enforcement level `everyone`, so the steward/admin is included. Force pushes and branch deletion are disallowed by project policy. A separate approving reviewer is intentionally not required while Hummingbird has only one maintainer, because that would deadlock legitimate maintenance.

## Public repository controls

The public-repository security activation is complete. Repository Actions are restricted; external workflow actions are full-SHA pinned; workflow-token permissions are read-only; private vulnerability reporting, secret scanning/push protection, Dependabot security controls, and CodeQL default setup are enabled. See [SECURITY.md](SECURITY.md) for the authoritative security posture and verification distinctions.

`.github/CODEOWNERS` records the current steward as code owner. `.github/dependabot.yml` monitors npm and GitHub Actions dependencies so pinned action SHAs and package versions can be reviewed through pull requests.

## Credential lifecycle

The Phase 2 review disposition is recorded in [ADR 0022](docs/decisions/0022-phase2e1-review-gate-dispositions.md). Hummingbird uses a risk-based credential lifecycle rather than one universal calendar interval.

For each consequential credential class, record without recording the secret itself: purpose, scope/capabilities, authorized consumer/custody boundary, storage class, expiration behavior, replacement path, immediate-revocation triggers, and how replacement plus predecessor retirement are verified.

Prefer, where practicable:

1. no long-lived secret / workload or federated identity;
2. narrowly scoped expiring credentials; then
3. narrowly scoped long-lived credentials only where necessary.

Immediate rotation or revocation is required on suspected compromise or unintended exposure, material custody/automation-context change, material scope change, compromise of the storage boundary, provider/security-mechanism change that invalidates the old assumptions, or loss of confidence about where a credential has existed.

For the current Phase 2 production Pages deployment token, **180 days is the ordinary review / maximum-lifetime baseline**, not a permanent institutional cadence. Shorter lifetime, automated rotation, or eliminating the stored secret is preferred when it can be done without reducing reliability or broadening authority.

A normal planned rotation follows:

```text
create replacement
→ install in authorized consumer
→ verify intended operation
→ revoke/expire predecessor
→ verify predecessor no longer works
→ record rotation event without secret material
```

When compromise is suspected, revoke first if graceful overlap would prolong risk. Different credential classes—deployment, provider administration, database/recovery, offline backup decryption, and future workload identities—need not share one age limit because their exposure and consequences differ.

Credential custody is operational capability, not governing authority. The broader Phase 3 credential-lifecycle design remains open under [OQ-OPS-TOKEN-ROTATION-CADENCE](docs/governance/OPEN_QUESTIONS.md#oq-ops-token-rotation-cadence) for Phase 2E.3.

## Routine steward tasks

- Review and merge pull requests only after required CI passes.
- Review Dependabot pull requests and security alerts; do not auto-merge dependency changes without CI.
- Keep canonical schema, reference corpus, migrations, and data-model documentation aligned.
- Check that scheduled encrypted canonical backups remain successful; use the manual backup trigger before/after maintenance, migration, or deliberate canonical mutation when a tighter recovery point is useful.
- Check freshness/success of scheduled monitoring rather than treating absence of alerts as proof of health.
- Review public Seed Bank activity for abuse/safety issues without treating popularity as governance weight.
- Review Cloudflare public-read settings after material provider-policy changes so benign `GET`/`HEAD` access remains consistent with ADR 0013 without weakening network/DDoS or mutation-path protections.
- Revisit the broad public-read Skip expression before any non-public, authenticated, expensive, or abuse-sensitive `GET` endpoint is added.
- Review/replace the current production deployment token before its Phase 2 maximum-lifetime baseline, and rotate/revoke immediately on the trigger conditions above. Do not apply that interval mechanically to unrelated credential classes.
- Keep the Open Questions Registry honest — resolve questions in substantive documents rather than letting implementation silently answer them.
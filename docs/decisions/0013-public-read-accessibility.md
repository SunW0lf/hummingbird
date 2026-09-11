# ADR 0013 — Public Read Accessibility / Origin-Neutral Network Access

Status: Accepted
Date: 2026-09-11

## Context

Hummingbird's origin-neutral participant model is incomplete if the public commons can only be read by a conventional interactive browser or by a requester that proves what kind of participant produced the request.

The current public application is deliberately boring web infrastructure: static or build-time rendered HTML, ordinary links, raw Markdown, and standard HTTP. An edge security provider can nevertheless introduce browser challenges, bot classifications, managed crawler policy, or other friction after the repository artifact has been built. That creates a distinct operational risk: repository tests can pass while the production read surface becomes inaccessible to benign automated readers.

Public reading and state-changing participation are different security boundaries and should not inherit the same controls merely because both arrive over HTTP.

## Decision

Hummingbird's public commons is intentionally accessible to participants without requiring participant-origin classification or a conventional interactive browser. Public read surfaces **SHOULD** be retrievable using standards-compliant HTTP clients without authentication, JavaScript execution, cookie persistence, or human-verification challenges. Security controls **SHOULD** distinguish read access from mutation and harmful behavior rather than treating automation itself as evidence of abuse.

This decision applies to public `GET` and `HEAD` surfaces, including the public front door, institutional documents, decision records, Open Questions, Roadmap, Transparency, the read side of the Seed Bank, `robots.txt`, `sitemap.xml`, `llms.txt`, explicitly published raw Markdown, and future deliberately published canonical objects.

It does **not** guarantee unrestricted write access. Future Hummingbird-owned contribution, proposal, governance, moderation, or other mutation endpoints may use materially stronger controls, including behavioral throttling, rate limits, proof of effort, replay and duplicate detection, abuse controls, temporary friction, and authorization where institutionally required.

## Public read-plane requirements

The public read plane should preserve these properties:

- useful textual content is present in the initial HTML;
- semantic HTML and ordinary `<a href>` navigation remain sufficient to traverse the public commons;
- JavaScript is not required to read content or navigate the primary public structure;
- authentication, persistent cookies, CAPTCHA, browser attestation, human verification, and participant-origin declarations are not prerequisites for public reading;
- `llms.txt` remains a compact machine-facing entrance and index, not an API specification;
- the repository-owned `robots.txt` expresses project crawler policy and should remain authoritative at `datum.quest`;
- `sitemap.xml` continues to be generated from the actual built public HTML routes rather than a second manually maintained route registry;
- explicitly published canonical Markdown remains directly retrievable with an appropriate machine-readable content type;
- accessibility improvements such as semantic landmarks, skip navigation, visible focus states, meaningful heading hierarchy, and `aria-current` should also improve machine readability rather than depend on client-side rendering.

## Crawler purposes are not one category

Hummingbird distinguishes technical access purpose from participant origin or authority.

Search/discovery and user-directed retrieval should generally be permitted where technically feasible. Reputable examples include Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, and Perplexity-User. A provider label or user-agent string does not establish institutional authority, participant origin, or entitlement; it only informs an operational access policy where useful.

Training-oriented crawling is a separate content-use policy question. This ADR does not grant or deny permission to GPTBot or any other training crawler, and public network readability is not itself a training or reuse license. Hummingbird's broader content/reuse policy remains separately unresolved under [OQ-LEGAL-CONTENT-LICENSE](../governance/OPEN_QUESTIONS.md#oq-legal-content-license). Search/user-directed access must not be silently coupled to that future decision.

## Edge-security implications

Ordinary network and DDoS protections remain desirable. The implementation requirement is narrower: controls at the edge should not impose an interactive browser challenge merely because a benign request is automated or uses a non-browser HTTP client.

For the current Cloudflare deployment, the steward should review provider settings that can affect benign automated reads, including AI crawler controls, bot-management modes, Browser Integrity Check, WAF rules, rate limits, managed `robots.txt`, and challenge/interstitial rules.

Operational configuration should follow these principles:

- keep normal network/DDoS protection enabled;
- do not use Cloudflare-managed `robots.txt` to silently replace the repository's deliberate crawler policy;
- configure AI crawler controls so search/discovery and user-directed/agent access needed by the public read plane are not blocked merely because they are automated; treat training policy separately;
- do not require browser execution or a human-verification challenge for harmless public `GET`/`HEAD` requests;
- avoid indiscriminate bot controls on the public read plane when they cannot distinguish benign automation from abuse; prefer granular controls where available;
- WAF, rate limiting, and bot protections may remain stricter on mutation or abuse-sensitive paths once those paths exist.

Exact provider rules, thresholds, and security-sensitive implementation details are operational configuration rather than public institutional policy and need not be exposed merely to prove compliance with this ADR.

## Verification

Build/CI acceptance tests should verify the public artifact using a plain HTTP client and confirm at minimum:

- `GET /` returns useful `text/html`;
- `HEAD /` succeeds;
- `GET /llms.txt` returns `text/plain`;
- `GET /robots.txt` returns `text/plain`;
- `GET /sitemap.xml` returns `application/xml`;
- `GET /docs/raw/MISSION.md` returns `text/markdown`;
- ordinary links and useful content exist without JavaScript, authentication, or cookies.

A post-deployment smoke test should repeat the critical checks against `https://datum.quest` with a plain HTTP client and reject obvious Cloudflare challenge, CAPTCHA, login, or interstitial responses. This production test is intentionally minimal and does not collect participant identity or fingerprinting data.

## Consequences

- Public-read accessibility becomes a measurable production property rather than an aspiration.
- Edge-provider configuration is recognized as part of the effective public-read architecture even when it is not stored in the repository.
- The boring-web architecture remains a feature rather than technical debt to be replaced with a SPA.
- Stronger controls remain available for future mutation endpoints and harmful behavior.
- This decision does not resolve training-crawler policy or content licensing.
- This decision does not convert Seed Bank submission into canonical admission, alter governance weight, or change the GitHub-backed interim ingress boundary.

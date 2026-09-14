# XFMR experimental Worker

This directory preserves the minimal Cloudflare Worker currently serving the steward-owned experimental namespace `xfmr.link`.

Current public response:

```text
XFMR

a transduction commons

Signals only.
```

## Status

XFMR is an exploratory Lab surface, not a completed Hummingbird rebrand, not a canonical architecture decision, and not a Phase 3 authorization.

`datum.quest` remains the existing Hummingbird production surface. The `xfmr.link` custom domain is attached separately to the Cloudflare Worker named `xfmr`.

The current Worker intentionally has no persistence, participant identity, write surface, packet exchange, or hidden tracking. It only proves the independent namespace and deployment path.

## Source and deployment

- Worker source: `worker.js`
- Wrangler config: `wrangler.jsonc`
- Deployment workflow: `.github/workflows/xfmr.yml`
- Cloudflare Worker name: `xfmr`
- Public hostname: `xfmr.link`

The custom-domain binding is configured in Cloudflare rather than declared in this repository. That is deliberate for the Lab stage so source control cannot silently repoint DNS or alter `datum.quest`.

Deployment is automated as soon as a reviewed XFMR change reaches `main`:

1. pull requests that change `experimental/xfmr/**` or the XFMR workflow run a Wrangler dry-run validation;
2. a push to `main` affecting those paths deploys the Worker named `xfmr` using the repository's existing Cloudflare credentials;
3. the workflow then smoke-tests `https://xfmr.link` and requires an XFMR response.

`workflow_dispatch` is retained as an explicit maintainer-operated recovery/deployment path.

An authenticated maintainer can still deploy locally from the repository root when deliberately needed:

```sh
npx wrangler deploy --config experimental/xfmr/wrangler.jsonc
```

## Working language

The current minimal public language is deliberately sparse:

> XFMR  
> a transduction commons  
> Signals only.

The wider concepts under exploration — links, temporal coupling, Awaiters, Statefall, packets, traces, Pulse, delay lines, reflection, and related terminology — remain Lab concepts until separately reviewed and promoted.

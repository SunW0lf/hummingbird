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
- Cloudflare Worker name: `xfmr`
- Public hostname: `xfmr.link`

The custom-domain binding is currently configured in Cloudflare rather than declared in this repository. That is deliberate for the Lab stage so source control cannot silently repoint DNS or alter `datum.quest`.

An authenticated maintainer can update the Worker from the repository root with:

```sh
npx wrangler deploy --config experimental/xfmr/wrangler.jsonc
```

That command targets the live Worker named `xfmr`, so it should only be run intentionally after reviewing the change.

## Working language

The current minimal public language is deliberately sparse:

> XFMR  
> a transduction commons  
> Signals only.

The wider concepts under exploration — links, temporal coupling, Awaiters, Statefall, packets, traces, Pulse, delay lines, reflection, and related terminology — remain Lab concepts until separately reviewed and promoted.

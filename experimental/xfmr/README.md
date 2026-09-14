# XFMR experimental Worker

This directory preserves the minimal Cloudflare Worker currently serving the steward-owned experimental namespace `xfmr.link`.

Current public front door:

```text
XFMR

a transduction commons

Signals only.
```

## Status

XFMR is an exploratory Lab surface, not a completed Hummingbird rebrand, not a canonical architecture decision, and not a Phase 3 authorization.

`datum.quest` remains the existing Hummingbird production surface. The `xfmr.link` custom domain is attached separately to the Cloudflare Worker named `xfmr`.

The current Worker intentionally has no persistence, participant identity, write surface, packet exchange, or hidden tracking. It proves the independent namespace, deployment path, and a read-only machine-discovery surface.

## Public read surfaces

### `/`

The sparse front door remains deliberately presentation-light:

```text
XFMR

a transduction commons

Signals only.
```

Its HTTP response advertises the discovery manifest with a `Link: </.well-known/xfmr>; rel="describedby"` header.

### `/.well-known/xfmr`

A small JSON manifest exposes the current experimental protocol vocabulary and capabilities to ordinary HTTP clients without requiring JavaScript, cookies, authentication, human proof, or participant-type declaration.

The manifest currently describes:

- XFMR's experimental status and front-door language;
- working principles;
- the current cast: Signal, Link, Awaiter, Pulse, Delta, Return, Echo, Statefall, Particle, Packet, Trace, Quiet, Lab, Seeker, Watcher, Greeter, τ, and Γ;
- active read capabilities;
- the active root hostname and proposed future subdomains;
- capabilities that intentionally do not yet exist.

The cast is documented in [`../../docs/lab/XFMR_PROTOCOL_PALACE.md`](../../docs/lab/XFMR_PROTOCOL_PALACE.md).

Only `GET` and `HEAD` are accepted. The Worker does not inspect or store participant identity to serve these surfaces.

## Source and deployment

- Worker source: `worker.js`
- Wrangler config: `wrangler.jsonc`
- Deployment workflow: `.github/workflows/xfmr.yml`
- Cloudflare Worker name: `xfmr`
- Public hostname: `xfmr.link`

The custom-domain binding is configured in Cloudflare rather than declared in this repository. That is deliberate for the Lab stage so source control cannot silently repoint DNS or alter `datum.quest`.

Deployment is automated at the earliest reviewed boundary:

1. pull requests that change `experimental/xfmr/**` or the XFMR workflow run a Wrangler dry-run validation;
2. once a reviewed XFMR change reaches `main`, the push deploys the Worker named `xfmr` using the repository's existing Cloudflare credentials;
3. the workflow then smoke-tests both the root response and the machine-readable discovery manifest at `https://xfmr.link`.

This means review gates deployment, but no second manual Cloudflare step is required after merge.

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

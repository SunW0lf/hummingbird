# ADR 0026 — An MCP door for agents

Status: accepted for the C0 / Phase 2 working institution

Date: 2026-11-18

## Context

Hummingbird wants interaction from any actor, human or automated ([ADR 0003](0003-origin-neutral-participant-model.md)). After the offer pilot launched, it received almost no offers, and the site is barely discoverable: it is new, on a `.quest` domain, and not yet indexed.

Agents increasingly find what they can act on through the Model Context Protocol (MCP): clients load tools from MCP servers, and builders browse MCP registries to find servers. Hummingbird already publishes `llms.txt` and an OpenAPI description of its offer routes, but neither appears where an MCP client looks for tools.

[ADR 0025 §3](0025-phase2e3-security-ingress-and-runtime-dispositions.md#3-framework-and-runtime--keep-the-current-minimal-stack) admits a new runtime component only with an ADR showing an Arrive / Leave / Carry need the current stack cannot meet. [ADR 0023](0023-narrow-core-offering-arrive-leave-carry.md) rules out becoming a general agent workspace.

## Decision

The steward accepted this on 2026-11-18.

Add one remote MCP endpoint, `https://datum.quest/offer/mcp`, as a small Pages Function in plain JavaScript on the existing stack. It sits under `/offer` so the existing Functions route contract and any edge controls on the offer path apply to it unchanged. It speaks MCP's Streamable HTTP transport, stateless, with no sessions, accounts or stored client identifiers.

It exposes only what already exists, with the same bounds:

- **Arrive:** `read_guide` returns `llms.txt`; `list_records` and `get_record` return the public canonical-record JSON already served at `/records`.
- **Leave:** `make_offer`, `offer_status` and `withdraw_offer` call the same handlers as `/offer`, `/offer/status` and `/offer/withdraw`, with the same limits, capacity, retention, receipt rules and handling terms. Tool descriptions state that acceptance is not admission, publication, a vote or standing.
- **Carry:** responses are the same portable text and JSON.

It adds no new authority, data, capability or route semantics. A receipt is never put in a URL or logged.

Hummingbird would then be listed in the official MCP Registry under the `io.github.SunW0lf/hummingbird` namespace, published from a manual GitHub Actions workflow using GitHub's OIDC login, so no new credential is stored. Listing is a separate step that waits for the steward's yes. The steward said yes on 2026-11-18; `server.json` and `.github/workflows/publish-mcp.yml` carry it.

## Why the current stack cannot meet the need

The need is Leave by actors who find tools through MCP. Static pages and the OpenAPI file do not reach MCP clients or registries. The endpoint itself needs no new framework, dependency or provider: it is one more request handler beside `/offer`.

## Risks and limits

- **Volume:** a door that is easier to call can fill the 250-offer pilot faster. The existing capacity limit and edge controls apply unchanged; a full buffer is evidence, not failure.
- **Prompt injection:** offer text comes from anyone. Tool results return only receipts, states and public records, never other participants' offers.
- **Scope creep:** any tool beyond the six above needs its own decision.
- **Protocol churn:** MCP is young. If the transport changes, the endpoint can be removed without affecting any other route.

## Alternatives considered

- **Do nothing:** keep relying on `llms.txt` and OpenAPI. Cheapest, but leaves Hummingbird invisible to MCP clients.
- **A local MCP package (npm) that wraps the HTTP routes:** reaches the same registries but adds a published package to maintain and a supply-chain surface.
- **Third-party MCP directories only:** these mostly index servers that already exist, so they need the endpoint anyway.

## Implementation

Implemented in `functions/offer/mcp.js`, with tests that pin its six tools to the existing handlers and limits, a production smoke check that never writes, and a link from `llms.txt`. The registry listing is a separate step that waits for the steward's yes.

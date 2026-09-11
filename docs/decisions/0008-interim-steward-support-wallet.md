# 0008 — Interim Steward Support Remains Outside Institutional Finance

- Status: Accepted
- Date: 2026-09-11

## Context

Hummingbird has no legal/organizational structure yet ([OQ-PROJECT-LEGAL-STRUCTURE](../governance/OPEN_QUESTIONS.md#oq-project-legal-structure)) and Phase 5 (Financial Support, with validated expenditures and public financial transparency) is deferred until well after Phase 4's needs process exists (see [ROADMAP.md](../../ROADMAP.md)). In the meantime, the steward wanted a way to receive voluntary support without prematurely building financial governance or resolving open legal questions.

## Decision

Configure one public receiving address (`0xd401aa41fec2ad6cb8773f809b9f6b7c670241be`) for voluntary USDC support on Base Mainnet (chain ID 8453), published at `/support`. The address, network, and asset live in a single canonical, non-secret configuration file (`support.config.json`) consumed by one build script (`scripts/render-support.js`); nothing duplicates these values elsewhere. The QR code on the page encodes the plain address only (no payment URI, no amount, no contract-specific encoding) and is generated locally at build time as inline SVG — no third-party QR service, no client-side wallet integration, no transaction signing capability anywhere in Hummingbird's systems.

This is explicitly interim personal steward support, not Phase 5: it does not purchase access, membership, influence, voting weight, priority, attribution, or preferential treatment, and it does not resolve `OQ-PROJECT-LEGAL-STRUCTURE`.

## Rationale

A static public address with a clear "verify before sending" warning is the minimum viable way to accept voluntary support without introducing custody risk, signing capability, or new backend surface area. Keeping the config in one file makes the address trivially replaceable and auditable. Treating this as explicitly non-institutional avoids accidentally answering Phase 5 or legal-structure questions through implementation.

## Alternatives considered

- WalletConnect / in-browser wallet integration — rejected; unnecessary complexity and risk for a static receive-only address, and edges toward transaction signing capability Hummingbird should not hold.
- Encoding an EIP-681 payment URI (with amount/contract specifics) in the QR code — rejected; a wrong encoding could misdirect funds, and it adds no real benefit over letting the visitor's own wallet select network and asset per the on-page warning.
- Multiple chains/assets — rejected for now to keep the surface area minimal; can be reconsidered later without constitutional implications since this is explicitly non-institutional.
- Treating this as the start of Phase 5 — rejected; Phase 5 requires the needs process (Phase 4) to exist first, and financial governance (`ExpenditureAuthorization`, public aggregate reporting) is unrelated to simply being able to receive voluntary support.

## Consequences

- Warp/the assistant never requested, generated, imported, or held a recovery phrase or private key, and never signs transactions; only the public address was added to the repository.
- Hummingbird collects no supporter identity (no donor accounts, profiles, emails, leaderboards, badges, or donation-linked reputation) and does not enrich public wallet activity with identity information.
- Blockchain activity at this address is publicly visible (address, amounts, timestamps, transaction relationships) and is described on `/support` as such — it is not anonymous or confidential.
- Base Mainnet remains the authoritative record of any support received; Hummingbird does not build an internal transaction ledger or indexer (see [DATA_MODEL.md](../../DATA_MODEL.md) §Blockchain-derived data).
- Replacing the address, network, or asset later only requires editing `support.config.json`.

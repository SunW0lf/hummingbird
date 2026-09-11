# Canonical Reference Corpus

This directory contains deterministic Phase 2 contract fixtures for Hummingbird's portable canonical record model.

These files are **not production institutional memory**. Their presence in Git does not publish, admit, approve, validate, or grant governance status to the represented content. See [ADR 0012](../../docs/decisions/0012-reference-corpus-before-persistence.md).

The corpus exists to prove that canonical meaning is representable independently of Cloudflare D1 or any future persistence engine. Database migration/import/export work must preserve the canonical fields and relationships represented here.

Current fixtures deliberately cover each Phase 2 record family:

- `contribution-origin-neutral.json`
- `proposal-storage-independent-contract.json`
- `need-publication-buffer.json`
- `event-phase2-entry.json`

The fixtures intentionally contain no required participant identity, origin category, wallet, device identifier, source address, or provider account ID.

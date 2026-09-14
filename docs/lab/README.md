# Hummingbird Lab

This directory holds **exploratory, non-canonical design work** that is useful enough to preserve in the repository but is not yet an approved architecture, governance decision, roadmap commitment, public capability, or Phase 3 authorization.

Lab documents may describe prototypes, interaction models, schemas, or implementation slices that should be tested before they are promoted into canonical project documents.

## Guardrails

- A Lab document does **not** authorize production deployment.
- A Lab document does **not** resolve an open governance question.
- A Lab document does **not** create participant rights, duties, identity requirements, authority, or reputation.
- A Lab document does **not** supersede `CHARTER.md`, `GOVERNANCE.md`, `ARCHITECTURE.md`, `DATA_MODEL.md`, `SECURITY.md`, `OPERATIONS.md`, `ROADMAP.md`, or an accepted ADR.
- If a Lab idea becomes a significant architectural or governance change, it must go through the repository's normal review and ADR/open-question process before implementation.
- Lab prototypes should preserve origin-neutral participation, minimal data collection, portable representations, bounded resource use, and the separation between canonical Hummingbird assertions and participant-supplied material.

## Current experiments

- [`PROVISIONS_PACKET_EXCHANGE.md`](./PROVISIONS_PACKET_EXCHANGE.md) — provisions, custom packet composition, encounter/witness artifacts, contribution receipts, and a bounded take-a-packet / leave-a-packet exchange.
- [`TEMPORAL_COUPLING.md`](./TEMPORAL_COUPLING.md) — asynchronous encounters, delay-line and bounded-memory metaphors, reflection/TDR concepts, artifact continuity, and time as packet context.
- [`../../experimental/xfmr/README.md`](../../experimental/xfmr/README.md) — the minimal XFMR Worker serving `xfmr.link`; PRs validate it, and reviewed changes reaching `main` deploy automatically.

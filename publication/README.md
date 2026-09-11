# Publication Projection

This directory contains **derived deployment input**, not canonical institutional truth.

Canonical Hummingbird records live in the persistence layer defined by `DATA_MODEL.md` and `PERSISTENCE.md`. Phase 2C may copy deliberately publishable canonical records into `publication/canonical/` so the static build can render the public commons without querying D1 for every page view.

Rules:

- never place `state: draft` records in the public projection;
- never hand-edit a projected record to repair canonical meaning — correct canonical state, then rebuild;
- do not copy provider identity, reactions, thread metadata, source IPs, device data, bot scores, or other non-canonical metadata into this directory;
- deleting this directory's generated record files must not destroy institutional meaning; the projection must be rebuildable from canonical persistence;
- publication through this directory is still subject to protected-main review/CI/deployment.

`publication/canonical/` is intentionally absent until the first real record is deliberately staged for publication.

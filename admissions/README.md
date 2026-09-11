# Admission Candidates

Files under `admissions/candidates/` are **review material, not canonical Hummingbird records merely because they are in Git**.

They exist to make a steward-controlled admission decision inspectable before a remote D1 write. A candidate becomes durable canonical memory only when the guarded admission tool is deliberately executed with `--confirm-admission` and post-write verification succeeds.

Admission rules for this Phase 2C slice:

- candidates must be `state: draft`;
- the draft admission tool currently accepts only `contribution`, `proposal`, and `need` v1 records;
- a candidate must not contain publication metadata, provider identity fields, source IP/device data, bot scores, wallet/account identity, or database-provider IDs;
- provenance should retain only the source/reference necessary to understand the admitted meaning;
- admission does not publish the record and does not grant governance approval;
- candidate files may be removed later as operational/review material after their evidentiary purpose is satisfied; D1 remains canonical persistence.

Validate a candidate locally/CI without remote access:

```powershell
node scripts/admit-draft-d1.js admissions/candidates/<file>.json --validate-only
```

After inspecting the candidate, deliberately admit it as durable **draft** canonical memory:

```powershell
node scripts/admit-draft-d1.js admissions/candidates/<file>.json --confirm-admission
```

The second command is a remote state-changing operation. It still does **not** publish the record. Publication requires a later independent decision and the separate staging/promotion path documented in the Phase 2C protocol.

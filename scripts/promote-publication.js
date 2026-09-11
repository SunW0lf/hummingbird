#!/usr/bin/env node
"use strict";

// Explicit Phase 2C publication switch. Copies steward-reviewed staged
// canonical records into the deployable derived projection. This changes the
// Git working tree only; protected-main review/CI/deploy still controls public
// release.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const STAGE = path.join(ROOT, ".hummingbird-stage", "canonical");
const PUBLICATION = path.join(ROOT, "publication", "canonical");
const confirm = process.argv.includes("--confirm-publication");

function loadDirectory(dir) {
  const result = new Map();
  if (!fs.existsSync(dir)) return result;
  for (const name of fs.readdirSync(dir).filter((entry) => entry.endsWith(".json")).sort()) {
    const full = path.join(dir, name);
    const record = JSON.parse(fs.readFileSync(full, "utf8"));
    if (!record || typeof record !== "object" || Array.isArray(record)) throw new Error(`${name}: expected one JSON object`);
    if (typeof record.id !== "string" || record.id === "") throw new Error(`${name}: missing canonical id`);
    if (record.state === "draft") throw new Error(`${name}: draft records cannot be promoted`);
    if (result.has(record.id)) throw new Error(`${name}: duplicate canonical id ${record.id}`);
    result.set(record.id, { name, full, record });
  }
  return result;
}

try {
  if (!confirm) {
    console.error("error: publication requires explicit --confirm-publication");
    console.error("Run scripts/stage-public-d1.js, inspect .hummingbird-stage/, then retry with confirmation.");
    process.exit(2);
  }
  if (!fs.existsSync(STAGE)) throw new Error("no staged projection found; run node scripts/stage-public-d1.js first");

  const staged = loadDirectory(STAGE);
  const existing = loadDirectory(PUBLICATION);

  const missing = [...existing.keys()].filter((id) => !staged.has(id));
  if (missing.length) {
    throw new Error(
      "refusing to silently remove already-projected canonical records: " + missing.join(", ") +
      ". Correct canonical lifecycle state or handle removal deliberately."
    );
  }

  fs.mkdirSync(PUBLICATION, { recursive: true });
  for (const { name, full } of staged.values()) {
    fs.copyFileSync(full, path.join(PUBLICATION, name));
  }

  console.log(`PROMOTED: ${staged.size} reviewed canonical record(s) into publication/canonical/`);
  console.log("This has not bypassed Git: review the diff and publish only through the protected-main workflow.");
} catch (error) {
  console.error(`error: ${error.message}`);
  process.exit(1);
}

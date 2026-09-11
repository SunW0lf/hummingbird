#!/usr/bin/env node
"use strict";

// Steward-only Phase 2C publication-decision tool.
// Changes exactly one canonical record from draft -> published in remote D1.
// It does NOT stage, promote, commit, deploy, or otherwise expose the record.

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const CONFIG = path.join(ROOT, "wrangler.d1.jsonc");
const WRANGLER = path.join(ROOT, "node_modules", "wrangler", "bin", "wrangler.js");

function usage() {
  console.error("usage: node scripts/mark-published-d1.js <canonical-id> --confirm-publication-decision");
}

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function runWrangler(args) {
  return execFileSync(process.execPath, [WRANGLER, ...args], {
    cwd: ROOT,
    encoding: "utf8",
    env: { ...process.env, NO_D1_WARNING: "true" },
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function query(sql) {
  const parsed = JSON.parse(runWrangler([
    "d1", "execute", "hummingbird", "--remote", "--config", CONFIG,
    "--json", "--command", sql,
  ]));
  if (!Array.isArray(parsed) || parsed.length !== 1 || parsed[0].success !== true) {
    throw new Error("remote D1 query did not return a successful result set");
  }
  return parsed[0].results || [];
}

const id = process.argv[2];
const confirmed = process.argv.includes("--confirm-publication-decision");

if (!id || id.startsWith("--")) {
  usage();
  process.exit(2);
}
if (!confirmed) {
  usage();
  console.error("error: canonical publication state requires explicit --confirm-publication-decision");
  process.exit(2);
}
if (!fs.existsSync(WRANGLER)) {
  console.error("error: Wrangler is not installed. Run npm ci first.");
  process.exit(1);
}

try {
  const current = query(
    `SELECT id, type, state, publication_json FROM canonical_objects WHERE id = ${sqlString(id)} LIMIT 1`
  );
  if (current.length !== 1) throw new Error(`canonical record ${id} does not exist`);
  const record = current[0];
  if (record.state !== "draft") {
    throw new Error(`refusing transition: ${id} is ${record.state}, expected draft`);
  }
  if (record.publication_json !== null) {
    throw new Error(`refusing transition: ${id} already has publication metadata while still draft`);
  }

  const publication = JSON.stringify({ visibility: "PUBLIC", released: true });
  const result = query(
    "UPDATE canonical_objects " +
    `SET state = 'published', publication_json = ${sqlString(publication)} ` +
    `WHERE id = ${sqlString(id)} AND state = 'draft' ` +
    "RETURNING id, type, state, publication_json"
  );

  if (result.length !== 1 || result[0].state !== "published") {
    throw new Error("publication-state transition did not update exactly one draft record");
  }

  const metadata = JSON.parse(result[0].publication_json);
  if (metadata.visibility !== "PUBLIC" || metadata.released !== true) {
    throw new Error("post-transition publication metadata verification failed");
  }

  console.log(`PUBLICATION DECISION RECORDED: ${id} is now canonical state=published`);
  console.log("NOT DEPLOYED: no staging, publication projection, Git commit, or public route was changed");
  console.log("NEXT: run node scripts/stage-public-d1.js and inspect .hummingbird-stage/ before promotion");
} catch (error) {
  console.error(`error: ${error.message}`);
  process.exit(1);
}

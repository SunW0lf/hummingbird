#!/usr/bin/env node
// Convert a private Phase 2E review packet into deterministic, non-canonical
// candidate envelopes. This tool performs no remote access and grants no
// admission, publication, governance, or participant authority.

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const VALIDATOR = path.join(ROOT, "scripts", "validate-canonical-candidate.js");
const MAX_GROUPS = 250;
const MAX_BODY = 4000;

function fail(message) {
  throw new Error(message);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function safeIdFragment(body) {
  return crypto.createHash("sha256").update(body, "utf8").digest("hex").slice(0, 20);
}

function validatePacket(packet) {
  if (!isObject(packet) || packet.version !== 2) fail("review packet version must be 2");
  if (typeof packet.observed_at !== "string" || Number.isNaN(Date.parse(packet.observed_at))) {
    fail("review packet observed_at must be a date-time");
  }
  if (!Number.isInteger(packet.unresolved_count) || packet.unresolved_count < 0 || packet.unresolved_count > 250) {
    fail("review packet unresolved_count is invalid");
  }
  if (!Array.isArray(packet.groups) || packet.groups.length > MAX_GROUPS) fail("review packet groups are invalid");

  let membersSeen = 0;
  for (const [groupIndex, group] of packet.groups.entries()) {
    if (!isObject(group)) fail(`group ${groupIndex} must be an object`);
    if (typeof group.body !== "string" || group.body.trim() === "" || group.body.length > MAX_BODY) {
      fail(`group ${groupIndex} body is invalid`);
    }
    if (!Number.isInteger(group.count) || group.count < 1) fail(`group ${groupIndex} count is invalid`);
    if (!Array.isArray(group.members) || group.members.length !== group.count) {
      fail(`group ${groupIndex} members must match count`);
    }
    for (const [memberIndex, member] of group.members.entries()) {
      if (!isObject(member) || typeof member.id !== "string" || member.id.trim() === "") {
        fail(`group ${groupIndex} member ${memberIndex} is invalid`);
      }
      if (typeof member.state !== "string") fail(`group ${groupIndex} member ${memberIndex} state is invalid`);
      membersSeen += 1;
    }
  }
  if (membersSeen !== packet.unresolved_count) fail("review packet unresolved_count does not match group membership");
}

function candidateFor(group, observedAt) {
  const fragment = safeIdFragment(group.body);
  const sources = group.members.map((member) => ({
    source_ref: `offer:${member.id}`,
    kind: "offer",
  }));
  return {
    candidate_version: 1,
    candidate_id: `offer-candidate-${fragment}`,
    generated_at: observedAt,
    record: {
      id: `contribution-offer-${fragment}`,
      type: "contribution",
      schema_version: 1,
      created_at: observedAt,
      state: "draft",
      content: {
        body: group.body,
        format: "text/plain",
      },
      relationships: [],
    },
    sources,
    derivation: {
      method: "deterministic_transform",
      source_count: sources.length,
      machine_assisted: false,
      note: group.count > 1
        ? "Prepared from an exact-text offer group; repetition is preserved as source coverage, not voting weight."
        : "Prepared from one unresolved offer without semantic synthesis.",
    },
    admission: {
      status: "candidate_only",
      requires_explicit_admission: true,
    },
  };
}

function validateCandidate(file) {
  const result = spawnSync(process.execPath, [VALIDATOR, file], {
    cwd: ROOT,
    encoding: "utf8",
  });
  if (result.status !== 0) fail(`generated candidate failed validation: ${result.stderr || result.stdout}`);
}

const input = process.argv[2];
const outIndex = process.argv.indexOf("--output-dir");
if (!input || input.startsWith("--") || outIndex === -1 || !process.argv[outIndex + 1]) {
  console.error("usage: node scripts/prepare-offer-candidates.mjs <review-packet.json> --output-dir <directory>");
  process.exit(2);
}

try {
  const packet = JSON.parse(fs.readFileSync(path.resolve(input), "utf8"));
  validatePacket(packet);
  const outputDir = path.resolve(process.argv[outIndex + 1]);
  fs.mkdirSync(outputDir, { recursive: true, mode: 0o700 });

  const written = [];
  for (const group of packet.groups) {
    const candidate = candidateFor(group, packet.observed_at);
    const filename = `${candidate.candidate_id}.json`;
    const target = path.join(outputDir, filename);
    fs.writeFileSync(target, JSON.stringify(candidate, null, 2) + "\n", { flag: "wx", mode: 0o600 });
    validateCandidate(target);
    written.push(filename);
  }

  const manifest = {
    version: 1,
    generated_at: packet.observed_at,
    source_packet_version: packet.version,
    unresolved_count: packet.unresolved_count,
    candidate_count: written.length,
    candidates: written,
    authority: "candidate_only",
  };
  fs.writeFileSync(path.join(outputDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n", {
    flag: "wx",
    mode: 0o600,
  });

  console.log(`Prepared ${written.length} validated non-canonical candidate envelope(s).`);
  console.log("NO CANONICAL MUTATION: output requires separate explicit admission before durable Hummingbird memory changes.");
} catch (error) {
  console.error(`error: ${error.message}`);
  process.exit(1);
}

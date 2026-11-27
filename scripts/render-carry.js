#!/usr/bin/env node
// Carry surfaces for agents that want everything, or only what changed:
//   dist/bulk.json    every public record, decision and document in one file
//   dist/changes.json every public item with when it last changed, newest first
// Both are built from the outputs and sources the earlier build steps already
// publish; nothing new is published here, only gathered. Change dates are the
// dates of the Git commits that last changed each item's source, the same
// provenance the decision index uses (ADR 0015).
"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { CANONICAL_DOCS, RAW_ONLY_DOCS } = require("./lib/canonical-docs");
const { REUSE, itemReuse } = require("./lib/reuse-terms");

const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const ORIGIN = "https://datum.quest";
const RECORD_SOURCE = path.join(ROOT, "publication", "canonical");

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function git(args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
}

function utc(iso) {
  const time = new Date(iso);
  if (Number.isNaN(time.getTime())) throw new Error(`not a date: ${iso}`);
  return time.toISOString().replace(/\.\d{3}Z$/, "Z");
}

function lastChange(sourcePath) {
  const line = git(["log", "-1", "--format=%H%x09%cI", "--", sourcePath]);
  const [commit, date] = line.split("\t");
  if (!/^[0-9a-f]{40}$/i.test(commit || "")) {
    throw new Error(`cannot determine the last commit for ${sourcePath}; build requires Git history`);
  }
  return { source_commit: commit.toLowerCase(), changed_at: utc(date) };
}

function commitDate(commit) {
  return utc(git(["show", "-s", "--format=%cI", commit]));
}

function buildCommit() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
  return git(["rev-parse", "HEAD"]);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function routeUrl(route) {
  return `${ORIGIN}/${route.replace(/\.html$/, "")}`;
}

function recordSources() {
  const byId = new Map();
  if (!fs.existsSync(RECORD_SOURCE)) return byId;
  for (const file of fs.readdirSync(RECORD_SOURCE).filter((name) => name.endsWith(".json")).sort()) {
    const record = readJson(path.join(RECORD_SOURCE, file));
    byId.set(record.id, path.posix.join("publication", "canonical", file));
  }
  return byId;
}

function gatherRecords() {
  const index = readJson(path.join(DIST, "records", "index.json"));
  const sources = recordSources();
  return index.records.map((entry) => {
    const source = sources.get(entry.id);
    if (!source) throw new Error(`record ${entry.id} has no source in publication/canonical`);
    const served = fs.readFileSync(path.join(DIST, "records", `${encodeURIComponent(entry.id)}.json`));
    if (sha256(served) !== entry.sha256) throw new Error(`record ${entry.id}: index digest differs from the served file`);
    const record = JSON.parse(served.toString("utf8"));
    return {
      kind: "record",
      id: entry.id,
      title: (record.content && record.content.title) || entry.id,
      type: entry.type,
      state: entry.state,
      created_at: entry.created_at,
      ...lastChange(source),
      html: entry.html,
      json: entry.json,
      sha256: entry.sha256,
      ...itemReuse(),
      body: { record },
    };
  });
}

function gatherDecisions() {
  const index = readJson(path.join(DIST, "decisions", "index.json"));
  return index.decisions.map((entry) => {
    const bytes = fs.readFileSync(path.join(ROOT, entry.source_path));
    if (sha256(bytes) !== entry.source_sha256) throw new Error(`decision ${entry.adr_id}: digest differs from its source`);
    return {
      kind: "decision",
      id: `adr-${entry.adr_id}`,
      title: entry.title,
      status: entry.status,
      source_path: entry.source_path,
      source_commit: entry.source_commit,
      changed_at: commitDate(entry.source_commit),
      html: `${ORIGIN}${entry.html}`,
      markdown: `${ORIGIN}${entry.markdown}`,
      sha256: entry.source_sha256,
      ...itemReuse(),
      body: { text: bytes.toString("utf8") },
    };
  });
}

function gatherDocuments() {
  const docs = [
    ...CANONICAL_DOCS.map((doc) => ({ file: doc.file, source: doc.file, title: doc.title, html: routeUrl(doc.route), raw: `${ORIGIN}/docs/raw/${doc.file}` })),
    ...RAW_ONLY_DOCS.map((file) => ({ file, source: file, title: file, html: null, raw: `${ORIGIN}/docs/raw/${file}` })),
    { file: "llms.txt", source: "app/llms.txt", title: "llms.txt (guide for agents)", html: null, raw: `${ORIGIN}/llms.txt` },
  ];
  return docs.map((doc) => {
    const bytes = fs.readFileSync(path.join(ROOT, doc.source));
    const served = doc.source === "app/llms.txt" ? path.join(DIST, "llms.txt") : path.join(DIST, "docs", "raw", doc.file);
    if (!fs.readFileSync(served).equals(bytes)) throw new Error(`document ${doc.file}: served copy differs from its source`);
    return {
      kind: "document",
      id: doc.file,
      title: doc.title,
      source_path: doc.source,
      ...lastChange(doc.source),
      ...(doc.html ? { html: doc.html } : {}),
      raw: doc.raw,
      sha256: sha256(bytes),
      ...itemReuse(),
      body: { text: bytes.toString("utf8") },
    };
  });
}

function withoutBody({ body, ...rest }) {
  return rest;
}

function main() {
  if (!fs.existsSync(DIST)) throw new Error("dist/ does not exist; run the earlier build steps first");
  // A shallow clone would date every item at the clone's one commit.
  if (git(["rev-parse", "--is-shallow-repository"]) === "true") {
    throw new Error("build needs full Git history for change dates; check out with fetch-depth: 0");
  }
  const commit = buildCommit();
  const records = gatherRecords();
  const decisions = gatherDecisions();
  const documents = gatherDocuments();

  // No build commit in bulk.json, so its digest changes only when its content does.
  const bulk = {
    schema_version: 1,
    about: "Everything Hummingbird publishes as text, in one file: every public canonical record, every public decision record and every published document, each with its SHA-256 digest, the commit that last changed it and its reuse terms. Offers are not here: an offer is never published by being accepted.",
    changes: `${ORIGIN}/changes.json`,
    digest_note: "Each sha256 is of the item's bytes exactly as served at its own URL (a record's JSON file, a decision's or document's raw text). It verifies byte identity; it is not a signature or governance authorization.",
    reuse: REUSE,
    records: records.map((item) => ({ ...withoutBody(item), record: item.body.record })),
    decisions: decisions.map((item) => ({ ...withoutBody(item), text: item.body.text })),
    documents: documents.map((item) => ({ ...withoutBody(item), text: item.body.text })),
  };
  const bulkText = `${JSON.stringify(bulk, null, 2)}\n`;
  fs.writeFileSync(path.join(DIST, "bulk.json"), bulkText);

  const changes = [...records, ...decisions, ...documents]
    .map(withoutBody)
    .sort((a, b) => b.changed_at.localeCompare(a.changed_at) || a.kind.localeCompare(b.kind) || a.id.localeCompare(b.id));
  const listing = {
    schema_version: 1,
    about: "Every item Hummingbird publishes as text, with when it last changed, newest first. To stay current without crawling, keep the latest changed_at you have read; next time, read entries until you reach one at or before it, and fetch only those (or fetch bulk.json again when its sha256 changes). An item that is no longer listed is no longer published.",
    generated_from_build_commit: commit,
    latest_change_at: changes.length ? changes[0].changed_at : null,
    changed_at_note: "changed_at is the commit time, in UTC, of the Git commit that last changed the item's source. The item is live once that commit is deployed.",
    bulk: { url: `${ORIGIN}/bulk.json`, sha256: sha256(Buffer.from(bulkText, "utf8")), bytes: Buffer.byteLength(bulkText, "utf8") },
    reuse: REUSE,
    changes,
  };
  fs.writeFileSync(path.join(DIST, "changes.json"), `${JSON.stringify(listing, null, 2)}\n`);

  console.log(`carry: bulk.json (${records.length} records, ${decisions.length} decisions, ${documents.length} documents, ${bulkText.length} bytes)`);
  console.log(`carry: changes.json (${changes.length} items, latest ${listing.latest_change_at})`);
}

try {
  main();
} catch (error) {
  console.error(`error: ${error.message}`);
  process.exit(1);
}

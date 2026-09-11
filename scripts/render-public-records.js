#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { renderPage, escapeHtml } = require("./lib/page-shell");

const ROOT = path.join(__dirname, "..");
const DIST = process.env.HUMMINGBIRD_DIST_DIR
  ? path.resolve(process.env.HUMMINGBIRD_DIST_DIR)
  : path.join(ROOT, "dist");
const SOURCE = process.env.HUMMINGBIRD_PUBLICATION_SOURCE
  ? path.resolve(process.env.HUMMINGBIRD_PUBLICATION_SOURCE)
  : path.join(ROOT, "publication", "canonical");
const OUT = path.join(DIST, "records");

const ALLOWED_TYPES = new Set(["contribution", "proposal", "need", "event"]);
const ALLOWED_STATES = new Set(["published", "corrected", "superseded", "withdrawn", "archived"]);

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function routeId(id) {
  return encodeURIComponent(id);
}

function requireRecordShape(record, file) {
  if (!isObject(record)) throw new Error(`${file}: expected one JSON object`);
  for (const field of ["id", "type", "schema_version", "created_at", "state", "content", "relationships"]) {
    if (!Object.prototype.hasOwnProperty.call(record, field)) throw new Error(`${file}: missing ${field}`);
  }
  if (typeof record.id !== "string" || record.id.trim() === "") throw new Error(`${file}: id must be non-empty`);
  if (!ALLOWED_TYPES.has(record.type)) throw new Error(`${file}: unsupported v1 type ${record.type}`);
  if (record.schema_version !== 1) throw new Error(`${file}: schema_version must be 1`);
  if (record.state === "draft") throw new Error(`${file}: draft records must never enter the public projection`);
  if (!ALLOWED_STATES.has(record.state)) throw new Error(`${file}: unsupported public state ${record.state}`);
  if (!isObject(record.content)) throw new Error(`${file}: content must be an object`);
  if (!Array.isArray(record.relationships)) throw new Error(`${file}: relationships must be an array`);
  for (const [index, relationship] of record.relationships.entries()) {
    if (!isObject(relationship) || typeof relationship.type !== "string" || typeof relationship.target_ref !== "string" || relationship.target_ref === "") {
      throw new Error(`${file}: malformed relationship ${index}`);
    }
  }
}

function loadRecords() {
  if (!fs.existsSync(SOURCE)) return [];
  const files = fs.readdirSync(SOURCE).filter((name) => name.endsWith(".json")).sort();
  const seen = new Set();
  return files.map((file) => {
    const record = JSON.parse(fs.readFileSync(path.join(SOURCE, file), "utf8"));
    requireRecordShape(record, file);
    if (seen.has(record.id)) throw new Error(`${file}: duplicate canonical id ${record.id}`);
    seen.add(record.id);
    return record;
  }).sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id));
}

function displayTitle(record) {
  if (record.content && typeof record.content.title === "string" && record.content.title.trim()) return record.content.title.trim();
  if (record.type === "event" && record.event_type) return `${record.event_type}: ${record.subject_ref || record.id}`;
  return `${record.type}: ${record.id}`;
}

function renderText(value) {
  if (typeof value !== "string" || value === "") return "";
  return `<pre>${escapeHtml(value)}</pre>`;
}

function renderContent(record) {
  const pieces = [];
  if (record.type === "contribution") {
    if (record.content.title) pieces.push(`<h2>${escapeHtml(record.content.title)}</h2>`);
    pieces.push(renderText(record.content.body));
    pieces.push(`<p class="doc-meta">Format: <code>${escapeHtml(record.content.format)}</code></p>`);
  } else if (record.type === "proposal") {
    pieces.push(`<h2>${escapeHtml(record.content.title)}</h2>`);
    pieces.push(`<p>${escapeHtml(record.content.summary)}</p>`);
    pieces.push(renderText(record.content.body));
  } else if (record.type === "need") {
    pieces.push(`<h2>${escapeHtml(record.content.title)}</h2>`);
    pieces.push(renderText(record.content.description));
    if (record.content.scope) pieces.push(`<p class="doc-meta">Scope: ${escapeHtml(record.content.scope)}</p>`);
  } else if (record.type === "event") {
    pieces.push(`<p><strong>Event:</strong> ${escapeHtml(record.event_type || "unspecified")}</p>`);
    pieces.push(`<p><strong>Subject:</strong> <code>${escapeHtml(record.subject_ref || "")}</code></p>`);
    if (Object.keys(record.content).length) pieces.push(`<pre>${escapeHtml(JSON.stringify(record.content, null, 2))}</pre>`);
  }
  return pieces.filter(Boolean).join("\n");
}

function renderRelationships(record, knownIds) {
  if (!record.relationships.length) return "";
  const items = record.relationships.map((rel) => {
    const target = knownIds.has(rel.target_ref)
      ? `<a href="${routeId(rel.target_ref)}.html"><code>${escapeHtml(rel.target_ref)}</code></a>`
      : `<code>${escapeHtml(rel.target_ref)}</code>`;
    return `<li><strong>${escapeHtml(rel.type)}</strong> ${target}</li>`;
  }).join("\n");
  return `<h2>Relationships</h2>\n<ul>${items}</ul>`;
}

function renderOptionalJson(record, field) {
  if (!Object.prototype.hasOwnProperty.call(record, field)) return "";
  return `<details><summary>${escapeHtml(field)}</summary><pre>${escapeHtml(JSON.stringify(record[field], null, 2))}</pre></details>`;
}

function main() {
  if (!fs.existsSync(DIST)) throw new Error("dist/ does not exist; create the output directory before rendering");
  const records = loadRecords();
  fs.mkdirSync(OUT, { recursive: true });
  const knownIds = new Set(records.map((record) => record.id));

  const index = [];
  for (const record of records) {
    const slug = routeId(record.id);
    const title = displayTitle(record);
    const body = [
      `<p class="badge">Canonical ${escapeHtml(record.type)}</p>`,
      `<h1>${escapeHtml(title)}</h1>`,
      `<p class="doc-meta">ID: <code>${escapeHtml(record.id)}</code> · state: <code>${escapeHtml(record.state)}</code> · created: ${escapeHtml(record.created_at)}</p>`,
      `<p><a href="${slug}.json">Machine-readable JSON</a> · <a href="../records.html">All public records</a></p>`,
      renderContent(record),
      renderRelationships(record, knownIds),
      renderOptionalJson(record, "attribution"),
      renderOptionalJson(record, "provenance"),
      renderOptionalJson(record, "publication"),
    ].filter(Boolean).join("\n");

    fs.writeFileSync(path.join(OUT, `${slug}.html`), renderPage({
      title,
      description: `Public Hummingbird ${record.type} ${record.id}.`,
      bodyHtml: body,
      prefix: "../",
      canonicalPath: `records/${slug}.html`,
    }));
    fs.writeFileSync(path.join(OUT, `${slug}.json`), JSON.stringify(record, null, 2) + "\n");
    index.push({
      id: record.id,
      type: record.type,
      state: record.state,
      created_at: record.created_at,
      html: `https://datum.quest/records/${slug}.html`,
      json: `https://datum.quest/records/${slug}.json`,
    });
    console.log(`record: records/${slug}.html`);
  }

  fs.writeFileSync(path.join(OUT, "index.json"), JSON.stringify({
    schema_version: 1,
    generated_from: "derived publication projection",
    records: index,
  }, null, 2) + "\n");

  const cards = records.length
    ? records.map((record) => {
        const slug = routeId(record.id);
        return `<article class="seed-card">\n` +
          `  <p class="seed-meta">${escapeHtml(record.type)} · ${escapeHtml(record.state)} · ${escapeHtml(record.created_at)}</p>\n` +
          `  <h3><a href="records/${slug}.html">${escapeHtml(displayTitle(record))}</a></h3>\n` +
          `  <p><code>${escapeHtml(record.id)}</code> · <a href="records/${slug}.json">JSON</a></p>\n` +
          `</article>`;
      }).join("\n")
    : `<div class="callout"><strong>No canonical records have been published through the Phase 2C pipeline yet.</strong><p>The public read model is live in empty-state form. Seed Bank material is not canonical automatically; the first record will appear here only after explicit admission and publication.</p></div>`;

  const indexBody = `<p class="badge">Phase 2C — Public read model</p>\n` +
    `<h1>Public canonical records</h1>\n` +
    `<p>This is Hummingbird's rebuildable public projection of deliberately published canonical records. It is static at request time: reading this page does not query the canonical database.</p>\n` +
    `<p><a href="records/index.json">Machine-readable record index</a> · <a href="seed-bank.html">Seed Bank</a></p>\n` +
    `<div class="seed-grid">${cards}</div>\n` +
    `<p class="doc-meta">${records.length} public canonical record(s). An offer is not admission; admission is not governance approval.</p>`;

  fs.writeFileSync(path.join(DIST, "records.html"), renderPage({
    title: "Public canonical records",
    description: "Hummingbird's rebuildable public projection of deliberately published canonical records.",
    bodyHtml: indexBody,
    canonicalPath: "records.html",
  }));
  console.log(`page: records.html (${records.length} public canonical record(s))`);
}

try {
  main();
} catch (error) {
  console.error(`error: ${error.message}`);
  process.exit(1);
}

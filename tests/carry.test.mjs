// /bulk.json, /changes.json and the record index let an agent carry everything
// without crawling. These checks keep their digests true to the served bytes,
// their reuse terms tied to ADR 0028, and the agent doors pointing at them.
import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { REUSE, LICENSE_URL } = require("../scripts/lib/reuse-terms.js");

const dist = (rel) => new URL(`../dist/${rel}`, import.meta.url);
const read = (rel) => fs.readFileSync(new URL(`../${rel}`, import.meta.url), "utf8");
const readDist = (rel) => fs.readFileSync(dist(rel));
const json = (rel) => JSON.parse(readDist(rel).toString("utf8"));
const sha256 = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const contains = (text, needle) => text.split(needle).length > 1;
const SITE = "https://datum.quest/";
const servedPath = (url) => {
  assert.ok(url.startsWith(SITE), `not a datum.quest URL: ${url}`);
  return url.slice(SITE.length);
};

const index = json("records/index.json");
const bulkBytes = readDist("bulk.json");
const bulk = JSON.parse(bulkBytes.toString("utf8"));
const changes = json("changes.json");
const decisionIndex = json("decisions/index.json");

test("the reuse terms restate ADR 0028", () => {
  const adr = read("docs/decisions/0028-content-license-cc-by-4.md");
  assert.equal(REUSE.license, "CC-BY-4.0");
  assert.equal(REUSE.credit, "Hummingbird (datum.quest)");
  assert.ok(contains(adr, "https://creativecommons.org/licenses/by/4.0/"));
  assert.ok(contains(adr, REUSE.contributed_material), "contributed-material wording drifted from ADR 0028");
  assert.ok(contains(adr, "A link to the source page or document satisfies the credit."));
});

test("every record index entry has a digest of the served file and its terms", () => {
  assert.deepEqual(index.reuse, REUSE);
  assert.ok(index.records.length >= 1);
  for (const entry of index.records) {
    const bytes = readDist(servedPath(entry.json));
    assert.equal(entry.sha256, sha256(bytes), `${entry.id}: digest differs from the served JSON`);
    assert.equal(entry.license, "CC-BY-4.0");
    assert.equal(entry.license_url, LICENSE_URL);
    assert.equal(entry.credit, "Hummingbird (datum.quest)");
    const page = readDist(servedPath(entry.html)).toString("utf8");
    assert.ok(contains(page, entry.sha256), `${entry.id}: page does not show its digest`);
    assert.ok(contains(page, `<link rel="license" href="${LICENSE_URL}">`), `${entry.id}: page has no license link`);
  }
});

test("a record's JSON stays the canonical record, unchanged", () => {
  for (const entry of index.records) {
    const served = JSON.parse(readDist(servedPath(entry.json)).toString("utf8"));
    const source = JSON.parse(read(`publication/canonical/${encodeURIComponent(entry.id)}.json`));
    assert.deepEqual(served, source);
  }
});

test("the record index carries no Git-derived dates, so recovery rebuilds it exactly", () => {
  const text = readDist("records/index.json").toString("utf8");
  assert.doesNotMatch(text, /changed_at|source_commit|build_commit/);
});

test("bulk.json holds every published item with a true digest", () => {
  assert.equal(bulk.records.length, index.records.length);
  assert.equal(bulk.decisions.length, decisionIndex.decisions.length);
  assert.doesNotMatch(bulkBytes.toString("utf8"), /generated_from_build_commit/, "a build commit would change the digest on every deploy");
  for (const item of bulk.records) {
    assert.equal(sha256(readDist(servedPath(item.json))), item.sha256, item.id);
    assert.ok(item.record && item.record.id === item.id, item.id);
  }
  for (const item of [...bulk.decisions, ...bulk.documents]) {
    const served = item.kind === "decision" ? item.markdown : item.raw;
    const bytes = readDist(servedPath(served));
    assert.equal(sha256(bytes), item.sha256, item.id);
    assert.equal(item.text, bytes.toString("utf8"), item.id);
    assert.match(item.source_commit, /^[0-9a-f]{40}$/);
    assert.match(item.changed_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  }
  for (const item of [...bulk.records, ...bulk.decisions, ...bulk.documents]) {
    assert.equal(item.license, "CC-BY-4.0", item.id);
    assert.equal(item.credit, "Hummingbird (datum.quest)", item.id);
  }
  const ids = bulk.documents.map((d) => d.id);
  for (const doc of ["CHARTER.md", "GOVERNANCE.md", "MISSION.md", "LICENSE", "llms.txt"]) assert.ok(ids.includes(doc), `bulk.json is missing ${doc}`);
});

test("changes.json lists every bulk item newest first, with bulk's digest", () => {
  const total = bulk.records.length + bulk.decisions.length + bulk.documents.length;
  assert.equal(changes.changes.length, total);
  assert.equal(changes.bulk.sha256, sha256(bulkBytes));
  assert.equal(changes.bulk.bytes, bulkBytes.length);
  assert.equal(changes.latest_change_at, changes.changes[0].changed_at);
  for (let i = 1; i < changes.changes.length; i += 1) {
    assert.ok(changes.changes[i - 1].changed_at >= changes.changes[i].changed_at, "changes are not newest first");
  }
  for (const item of changes.changes) {
    assert.ok(!("text" in item) && !("record" in item), `${item.id}: changes.json should not carry text`);
    assert.ok(item.sha256 && item.changed_at && item.source_commit, item.id);
  }
});

test("both files are served as JSON, and record files carry a license header", () => {
  const headers = read("app/_headers");
  assert.match(headers, /\/bulk\.json\n  Content-Type: application\/json; charset=utf-8/);
  assert.match(headers, /\/changes\.json\n  Content-Type: application\/json; charset=utf-8/);
  assert.match(headers, /\/records\/\*\n  Link: <https:\/\/creativecommons\.org\/licenses\/by\/4\.0\/>; rel="license"/);
});

test("the agent doors point to both files", () => {
  for (const file of ["app/llms.txt", "app/openapi.json", "app/connect.html"]) {
    const text = read(file);
    assert.ok(contains(text, "bulk.json") && contains(text, "changes.json"), `${file} does not name both files`);
  }
  const page = readDist("records.html").toString("utf8");
  assert.ok(contains(page, 'href="bulk.json"') && contains(page, 'href="changes.json"'));
});

// Publishes the canonical reference documents to dist/ at build time.
//
// The Markdown files at the repository root remain the single authoritative
// copy of institutional text. This script never hand-duplicates their
// content — it reads each file fresh on every build and:
//   1. Renders it to a human-readable HTML page (dist/<route>) using the
//      shared site shell, with a "View raw Markdown" link and a
//      source-file + commit stamp.
//   2. Copies it verbatim into dist/docs/raw/<file> for direct/machine
//      access.
//
// Only the documents explicitly listed in CANONICAL_DOCS are published.
// Adding a document to this allowlist is a deliberate, reviewable change,
// not an automatic recursive publish of the whole repository.
"use strict";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { marked } = require("marked");
const { renderPage, escapeHtml } = require("./lib/page-shell");

const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");

// Rendered as a full human-readable page at dist/<route>.
const CANONICAL_DOCS = [
  { file: "MISSION.md", route: "mission.html", title: "Mission" },
  { file: "CHARTER.md", route: "charter.html", title: "Charter", badge: "C0 — Working Draft — Not Ratified" },
  { file: "GOVERNANCE.md", route: "governance.html", title: "Governance" },
  { file: "ROADMAP.md", route: "roadmap.html", title: "Roadmap" },
  { file: "TRANSPARENCY.md", route: "transparency.html", title: "Transparency" },
  { file: "CHANGELOG.md", route: "changelog.html", title: "Changelog" },
  { file: "CONTRIBUTING.md", route: "contributing.html", title: "Contributing" },
];

// Copied verbatim to dist/docs/raw/ but with no dedicated rendered HTML page.
const RAW_ONLY_DOCS = ["LICENSE"];

function getCommitSha() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD", { cwd: ROOT }).toString().trim();
  } catch (e) {
    return "unknown";
  }
}

// Canonical Markdown cross-links each other by repo-root-relative filename
// (e.g. "GOVERNANCE.md"), which is correct in Git but does not resolve once
// rendered into dist/. Rewrite links to documents we actually publish so the
// rendered page is navigable. Public ADR links are also rewritten to their
// generated /decisions/<slug> pages. Other unpublished repo references are
// de-linked rather than allowed to fall through to a misleading route.
const LINK_REWRITES = new Map([
  ...CANONICAL_DOCS.map((d) => [d.file, d.route]),
  ["LICENSE", "docs/raw/LICENSE"],
]);

function isInternalUnpublishedPath(base) {
  if (/^[a-z]+:\/\//i.test(base)) return false; // external URL
  if (base.startsWith("docs/raw/")) return false; // already a working raw path
  if (/^[A-Z0-9_]+\.md$/i.test(base) || base === "LICENSE") return true; // unlisted repo-root doc
  if (base.startsWith("docs/")) return true; // unpublished docs subpaths
  return false;
}

function rewriteInternalLinks(html) {
  return html.replace(/<a href="([^"#]+)(#[^"]*)?">([^<]*)<\/a>/g, (match, base, anchor, text) => {
    if (LINK_REWRITES.has(base)) {
      return `<a href="${LINK_REWRITES.get(base)}${anchor || ""}">${text}</a>`;
    }

    const decision = base.match(/^docs\/decisions\/(\d{4}-.+)\.md$/);
    if (decision) {
      return `<a href="decisions/${decision[1]}.html${anchor || ""}">${text}</a>`;
    }

    if (isInternalUnpublishedPath(base)) {
      return `${text} <span class="unpublished-note">(internal reference, not yet public)</span>`;
    }
    return match;
  });
}

function main() {
  if (!fs.existsSync(DIST)) {
    console.error("error: dist/ does not exist. Run the copy-app step before render-docs.js.");
    process.exit(1);
  }

  const sha = getCommitSha();
  const rawDir = path.join(DIST, "docs", "raw");
  fs.mkdirSync(rawDir, { recursive: true });

  for (const doc of [...CANONICAL_DOCS, ...RAW_ONLY_DOCS.map((file) => ({ file }))]) {
    const sourcePath = path.join(ROOT, doc.file);
    if (!fs.existsSync(sourcePath)) {
      console.error(`error: canonical source ${doc.file} not found at repository root`);
      process.exit(1);
    }
    // 1. Raw, verbatim copy for direct/machine access.
    fs.copyFileSync(sourcePath, path.join(rawDir, doc.file));
    console.log(`raw:  docs/raw/${doc.file}`);
  }

  for (const doc of CANONICAL_DOCS) {
    const sourcePath = path.join(ROOT, doc.file);
    const markdown = fs.readFileSync(sourcePath, "utf8");
    const renderedBody = rewriteInternalLinks(marked.parse(markdown));

    const badgeHtml = doc.badge ? `<p class="badge">${escapeHtml(doc.badge)}</p>\n` : "";
    const metaHtml = `<p class="doc-meta">Canonical source: <code>${escapeHtml(doc.file)}</code> ` +
      `(commit <code>${escapeHtml(sha)}</code>) — <a href="docs/raw/${doc.file}">View raw Markdown</a></p>`;

    const bodyHtml = `${metaHtml}\n${badgeHtml}${renderedBody}`;

    const html = renderPage({
      title: doc.title,
      description: `Hummingbird ${doc.title}, rendered from the project's canonical ${doc.file}.`,
      bodyHtml,
    });

    fs.writeFileSync(path.join(DIST, doc.route), html);
    console.log(`page: ${doc.route} (from ${doc.file})`);
  }

  console.log(`\nPublished ${CANONICAL_DOCS.length} rendered page(s) and ${CANONICAL_DOCS.length + RAW_ONLY_DOCS.length} raw document(s) at commit ${sha}.`);
}

main();

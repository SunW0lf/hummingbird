// Publishes explicitly approved Architecture Decision Records (ADRs) to dist/.
//
// docs/decisions/*.md remains authoritative. Publication is allowlisted so a
// future ADR is not automatically exposed by the website merely because it
// exists in the repository. Each public ADR is rendered as a human-readable
// page and copied verbatim for machine/raw access.
"use strict";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { marked } = require("marked");
const { renderPage, escapeHtml } = require("./lib/page-shell");

const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const ADR_DIR = path.join(ROOT, "docs", "decisions");

// Deliberate publication allowlist. Add future ADRs here only after reviewing
// them for public release. A sensitive/internal decision should not be added.
const PUBLIC_DECISIONS = [
  "0001-single-production-domain.md",
  "0002-github-source-of-truth.md",
  "0003-origin-neutral-participant-model.md",
  "0004-publication-buffer.md",
  "0005-ci-gated-production-deployment.md",
  "0006-canonical-documents-drive-publication.md",
  "0007-portable-canonical-data-model.md",
  "0008-interim-steward-support-wallet.md",
  "0009-public-repository-security-transition.md",
  "0010-phase2-read-only-commons-contract.md",
  "0011-interim-seed-bank.md",
  "0012-reference-corpus-before-persistence.md",
  "0013-public-read-accessibility.md",
  "0014-progressive-capability-rollout.md",
];

const ROOT_PUBLIC_ROUTES = new Map([
  ["MISSION.md", "../mission.html"],
  ["CHARTER.md", "../charter.html"],
  ["GOVERNANCE.md", "../governance.html"],
  ["ROADMAP.md", "../roadmap.html"],
  ["TRANSPARENCY.md", "../transparency.html"],
  ["CHANGELOG.md", "../changelog.html"],
  ["CONTRIBUTING.md", "../contributing.html"],
]);

function getCommitSha() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD", { cwd: ROOT }).toString().trim();
  } catch (e) {
    return "unknown";
  }
}

function parseDecision(file) {
  const sourcePath = path.join(ADR_DIR, file);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`public decision allowlist entry does not exist: ${file}`);
  }
  const markdown = fs.readFileSync(sourcePath, "utf8");
  const heading = markdown.match(/^#\s+(.+)$/m);
  const status = markdown.match(/^Status:\s*(.+)$/m);
  const date = markdown.match(/^Date:\s*(.+)$/m);
  const slug = file.replace(/\.md$/, "");
  return {
    file,
    slug,
    markdown,
    title: heading ? heading[1].trim() : slug,
    status: status ? status[1].trim() : "Unspecified",
    date: date ? date[1].trim() : "Unspecified",
  };
}

function rewriteDecisionLinks(html, publicSlugs) {
  return html.replace(/<a href="([^"]+)">([^<]*)<\/a>/g, (match, href, text) => {
    const [base, anchor = ""] = href.split(/(?=#)/, 2);

    // Sibling ADR links in source Markdown.
    const sibling = base.match(/^(?:\.\/)?(\d{4}-.+)\.md$/);
    if (sibling && publicSlugs.has(sibling[1])) {
      return `<a href="${sibling[1]}.html${anchor}">${text}</a>`;
    }

    // Repository-root documents referenced from docs/decisions/ as ../../X.md.
    const rootDoc = base.match(/^(?:\.\.\/\.\.\/)?([A-Z0-9_]+\.md)$/i);
    if (rootDoc && ROOT_PUBLIC_ROUTES.has(rootDoc[1])) {
      return `<a href="${ROOT_PUBLIC_ROUTES.get(rootDoc[1])}${anchor}">${text}</a>`;
    }

    // Keep external and fragment links unchanged.
    if (/^[a-z]+:\/\//i.test(base) || base.startsWith("#")) return match;

    // Do not manufacture a public path for an internal/unpublished repo file.
    if (base.endsWith(".md") || base.startsWith("../") || base.startsWith("docs/")) {
      return `${text} <span class="unpublished-note">(repository reference)</span>`;
    }
    return match;
  });
}

function main() {
  if (!fs.existsSync(DIST)) {
    console.error("error: dist/ does not exist. Run the copy-app step first.");
    process.exit(1);
  }

  let decisions;
  try {
    decisions = PUBLIC_DECISIONS.map(parseDecision);
  } catch (error) {
    console.error(`error: ${error.message}`);
    process.exit(1);
  }

  const sha = getCommitSha();
  const pageDir = path.join(DIST, "decisions");
  const rawDir = path.join(DIST, "docs", "raw", "decisions");
  fs.mkdirSync(pageDir, { recursive: true });
  fs.mkdirSync(rawDir, { recursive: true });

  const publicSlugs = new Set(decisions.map((d) => d.slug));

  for (const decision of decisions) {
    fs.copyFileSync(path.join(ADR_DIR, decision.file), path.join(rawDir, decision.file));

    const rendered = rewriteDecisionLinks(marked.parse(decision.markdown), publicSlugs);
    const meta = `<p class="doc-meta">Canonical source: <code>docs/decisions/${escapeHtml(decision.file)}</code> ` +
      `(commit <code>${escapeHtml(sha)}</code>) — ` +
      `<a href="../docs/raw/decisions/${escapeHtml(decision.file)}">View raw Markdown</a> — ` +
      `<a href="../decisions.html">All decisions</a></p>`;

    const html = renderPage({
      title: decision.title,
      description: `${decision.title}. Public Hummingbird decision record.`,
      bodyHtml: `${meta}\n${rendered}`,
      prefix: "../",
      canonicalPath: `decisions/${decision.slug}.html`,
    });

    fs.writeFileSync(path.join(pageDir, `${decision.slug}.html`), html);
    console.log(`decision: decisions/${decision.slug}.html`);
  }

  const items = decisions.map((decision) => {
    const displayTitle = decision.title.replace(/^ADR\s+\d{4}\s+[—-]\s*/i, "");
    const number = decision.file.slice(0, 4);
    return `<article class="seed-card">\n` +
      `  <p class="seed-meta">ADR ${number} · ${escapeHtml(decision.status)} · ${escapeHtml(decision.date)}</p>\n` +
      `  <h3><a href="decisions/${escapeHtml(decision.slug)}.html">${escapeHtml(displayTitle)}</a></h3>\n` +
      `  <p><a href="docs/raw/decisions/${escapeHtml(decision.file)}">Raw Markdown</a></p>\n` +
      `</article>`;
  }).join("\n");

  const indexBody = `<p class="badge">Public decision record</p>\n` +
    `<h1>Decisions</h1>\n` +
    `<p>Hummingbird publishes the decisions that explain <em>why</em> the project took a particular architectural, operational, or institutional path. These Architecture Decision Records (ADRs) are rendered from their canonical Markdown sources; the website does not maintain a second copy.</p>\n` +
    `<div class="callout"><strong>Decision records are history, not scripture.</strong><p>An accepted ADR records the reasoning and consequences of a decision at the time it was made. Later ADRs may supersede earlier ones. Public publication does not make an ADR constitutional text; the Charter and Governance documents retain their own authority.</p></div>\n` +
    `<div class="seed-grid">\n${items}\n</div>\n` +
    `<p class="doc-meta">${decisions.length} public decision record(s), generated from <code>docs/decisions/</code> at commit <code>${escapeHtml(sha)}</code>. Future ADRs require explicit publication allowlisting.</p>`;

  fs.writeFileSync(path.join(DIST, "decisions.html"), renderPage({
    title: "Decisions",
    description: "Hummingbird's public Architecture Decision Record index: why the project took the paths it did.",
    bodyHtml: indexBody,
    canonicalPath: "decisions.html",
  }));

  console.log(`page: decisions.html (${decisions.length} public ADRs)`);
}

main();

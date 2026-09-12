// Publishes explicitly approved Architecture Decision Records (ADRs) to dist/.
//
// docs/decisions/*.md remains authoritative. Publication is allowlisted so a
// future ADR is not automatically exposed by the website merely because it
// exists in the repository. Each public ADR is rendered as a human-readable
// page and copied verbatim for machine/raw access.
"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { marked } = require("marked");
const { renderPage, escapeHtml } = require("./lib/page-shell");

const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const ADR_DIR = path.join(ROOT, "docs", "decisions");
const PROPOSAL_SCHEMA = path.join(ROOT, "schemas", "adr-proposal-v1.schema.json");
const REPOSITORY_URL = "https://github.com/SunW0lf/hummingbird";

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
  "0015-standards-based-representation-discovery-and-provenance.md",
  "0016-offers-and-the-offer-buffer.md",
  "0017-phase2e-experimental-ingress.md",
  "0018-phase2e-offer-pilot-runtime-and-data-boundary.md",
  "0019-phase2e-offer-triage-and-review.md",
  "0020-phase2e-offer-pilot-launch-profile.md",
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

function git(args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
}

function getBuildCommitSha() {
  const candidate = process.env.GITHUB_SHA || git(["rev-parse", "HEAD"]);
  if (!/^[0-9a-f]{40}$/i.test(candidate)) {
    throw new Error(`cannot determine full build commit SHA: ${candidate || "empty"}`);
  }
  return candidate.toLowerCase();
}

function getSourceCommit(sourcePath) {
  const candidate = git(["log", "-1", "--format=%H", "--", sourcePath]);
  if (!/^[0-9a-f]{40}$/i.test(candidate)) {
    throw new Error(`cannot determine source commit for ${sourcePath}; build requires Git history`);
  }
  return candidate.toLowerCase();
}

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function normalizeStatus(status) {
  return status.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function parseDecision(file) {
  const sourcePath = path.join("docs", "decisions", file).replace(/\\/g, "/");
  const absoluteSourcePath = path.join(ROOT, sourcePath);
  if (!fs.existsSync(absoluteSourcePath)) {
    throw new Error(`public decision allowlist entry does not exist: ${file}`);
  }

  const sourceBytes = fs.readFileSync(absoluteSourcePath);
  const markdown = sourceBytes.toString("utf8");
  const heading = markdown.match(/^#\s+(.+)$/m);
  const status = markdown.match(/^Status:\s*(.+)$/m);
  const date = markdown.match(/^Date:\s*(.+)$/m);
  const slug = file.replace(/\.md$/, "");
  const adrId = file.slice(0, 4);
  const sourceCommit = getSourceCommit(sourcePath);
  const sourceSha256 = sha256(sourceBytes);

  return {
    file,
    slug,
    adrId,
    sourcePath,
    sourceBytes,
    sourceSha256,
    sourceCommit,
    sourceUrl: `${REPOSITORY_URL}/blob/${sourceCommit}/${sourcePath}`,
    markdown,
    title: heading ? heading[1].trim() : slug,
    status: status ? status[1].trim() : "Unspecified",
    statusKey: normalizeStatus(status ? status[1] : "Unspecified"),
    date: date ? date[1].trim() : "Unspecified",
  };
}

function rewriteDecisionLinks(html, publicSlugs) {
  return html.replace(/<a href="([^"]+)">([^<]*)<\/a>/g, (match, href, text) => {
    const [base, anchor = ""] = href.split(/(?=#)/, 2);

    const sibling = base.match(/^(?:\.\/)?(\d{4}-.+)\.md$/);
    if (sibling && publicSlugs.has(sibling[1])) {
      return `<a href="${sibling[1]}.html${anchor}">${text}</a>`;
    }

    const rootDoc = base.match(/^(?:\.\.\/\.\.\/)?([A-Z0-9_]+\.md)$/i);
    if (rootDoc && ROOT_PUBLIC_ROUTES.has(rootDoc[1])) {
      return `<a href="${ROOT_PUBLIC_ROUTES.get(rootDoc[1])}${anchor}">${text}</a>`;
    }

    if (/^[a-z]+:\/\//i.test(base) || base.startsWith("#")) return match;

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
  if (!fs.existsSync(PROPOSAL_SCHEMA)) {
    console.error("error: schemas/adr-proposal-v1.schema.json does not exist.");
    process.exit(1);
  }

  let decisions;
  let buildCommit;
  try {
    buildCommit = getBuildCommitSha();
    decisions = PUBLIC_DECISIONS.map(parseDecision);
  } catch (error) {
    console.error(`error: ${error.message}`);
    process.exit(1);
  }

  const pageDir = path.join(DIST, "decisions");
  const rawDir = path.join(DIST, "docs", "raw", "decisions");
  fs.mkdirSync(pageDir, { recursive: true });
  fs.mkdirSync(rawDir, { recursive: true });

  const publicSlugs = new Set(decisions.map((d) => d.slug));

  for (const decision of decisions) {
    fs.writeFileSync(path.join(rawDir, decision.file), decision.sourceBytes);

    const rendered = rewriteDecisionLinks(marked.parse(decision.markdown), publicSlugs);
    const rawHref = `/docs/raw/decisions/${decision.file}`;
    const meta = `<p class="doc-meta">Canonical source: <code>${escapeHtml(decision.sourcePath)}</code> · ` +
      `source commit <a href="${escapeHtml(decision.sourceUrl)}"><code>${escapeHtml(decision.sourceCommit.slice(0, 12))}</code></a> · ` +
      `SHA-256 <code>${escapeHtml(decision.sourceSha256)}</code> · ` +
      `build <code>${escapeHtml(buildCommit.slice(0, 12))}</code> — ` +
      `<a href="${escapeHtml(rawHref)}">View raw Markdown</a> — ` +
      `<a href="../decisions.html">All decisions</a></p>`;

    const extraHead = `<link rel="alternate" type="text/markdown" href="${escapeHtml(rawHref)}" title="Canonical Markdown">\n` +
      `<meta name="hummingbird-source-path" content="${escapeHtml(decision.sourcePath)}">\n` +
      `<meta name="hummingbird-source-commit" content="${escapeHtml(decision.sourceCommit)}">\n` +
      `<meta name="hummingbird-source-sha256" content="${escapeHtml(decision.sourceSha256)}">`;

    const html = renderPage({
      title: decision.title,
      description: `${decision.title}. Public Hummingbird decision record.`,
      bodyHtml: `${meta}\n${rendered}`,
      extraHead,
      prefix: "../",
      canonicalPath: `decisions/${decision.slug}.html`,
    });

    fs.writeFileSync(path.join(pageDir, `${decision.slug}.html`), html);
    console.log(`decision: decisions/${decision.slug}.html`);
  }

  const items = decisions.map((decision) => {
    const displayTitle = decision.title.replace(/^ADR\s+\d{4}\s+[—-]\s*/i, "");
    return `<article class="seed-card adr-entry" ` +
      `data-adr-id="${escapeHtml(decision.adrId)}" ` +
      `data-status="${escapeHtml(decision.statusKey)}" ` +
      `data-source-path="${escapeHtml(decision.sourcePath)}" ` +
      `data-source-commit="${escapeHtml(decision.sourceCommit)}" ` +
      `data-source-sha256="${escapeHtml(decision.sourceSha256)}" ` +
      `data-build-commit="${escapeHtml(buildCommit)}" ` +
      `data-date="${escapeHtml(decision.date)}">\n` +
      `  <p class="seed-meta">ADR ${escapeHtml(decision.adrId)} · ${escapeHtml(decision.status)} · ${escapeHtml(decision.date)}</p>\n` +
      `  <h3><a href="decisions/${escapeHtml(decision.slug)}.html">${escapeHtml(displayTitle)}</a></h3>\n` +
      `  <p class="adr-provenance">Source <a href="${escapeHtml(decision.sourceUrl)}"><code>${escapeHtml(decision.sourceCommit.slice(0, 12))}</code></a> · SHA-256 <code>${escapeHtml(decision.sourceSha256.slice(0, 16))}…</code></p>\n` +
      `  <p><a href="docs/raw/decisions/${escapeHtml(decision.file)}">Raw Markdown</a></p>\n` +
      `</article>`;
  }).join("\n");

  const proposalFields = [
    ["title", "Short descriptive title."],
    ["context", "Why an architectural or institutional decision is needed."],
    ["decision", "The specific change or rule being proposed."],
    ["consequences", "Benefits, costs, tradeoffs, failure modes, and constraints."],
    ["alternatives_considered", "Material alternatives, including keeping the current state where relevant."],
    ["affected_principles", "Hummingbird principles, ADRs, Charter sections, or governance boundaries affected."],
  ].map(([name, description]) => `  <dt><code>${name}</code></dt><dd>${description}</dd>`).join("\n");

  const proposalSection = `<section id="propose-adr" aria-labelledby="propose-adr-heading" class="proposal-contract">\n` +
    `<h2 id="propose-adr-heading">Offer a decision proposal</h2>\n` +
    `<p>Any participant may offer material shaped like an ADR. This is a documentation contract, not a write API: Hummingbird does not allocate an ADR number, create canonical state, publish a decision, or grant governance approval merely because material matches this shape.</p>\n` +
    `<dl class="proposal-fields">\n${proposalFields}\n</dl>\n` +
    `<p><a href="decisions/proposal-schema.json">Machine-readable proposal schema (JSON Schema)</a></p>\n` +
    `<p>A low-friction first-party Phase 2E offer experiment is authorized by <a href="decisions/0017-phase2e-experimental-ingress.html">ADR 0017</a> and its runtime/data boundary is published in <a href="decisions/0018-phase2e-offer-pilot-runtime-and-data-boundary.html">ADR 0018</a>, but the write path is not yet deployed. Until that surface is genuinely live, the bounded <a href="seed-bank.html">Seed Bank</a> remains the available public write path. There is no <code>/api/propose</code> endpoint and no proof-of-thought, proof-of-cognition, or private-reasoning requirement.</p>\n` +
    `<p><a class="button" href="https://github.com/SunW0lf/hummingbird/issues/new?template=seed.yml">Offer an ADR-shaped seed</a></p>\n` +
    `</section>`;

  const indexBody = `<p class="badge">Public decision record</p>\n` +
    `<h1>Decisions</h1>\n` +
    `<p>Hummingbird publishes the decisions that explain <em>why</em> the project took a particular architectural, operational, or institutional path. These Architecture Decision Records (ADRs) are rendered from their canonical Markdown sources; the website does not maintain a second copy.</p>\n` +
    `<div class="callout"><strong>Decision records are history, not scripture.</strong><p>An accepted ADR records the reasoning and consequences of a decision at the time it was made. Later ADRs may supersede earlier ones. Public publication does not make an ADR constitutional text; the Charter and Governance documents retain their own authority.</p></div>\n` +
    `<div class="callout"><strong>Verifiable source provenance.</strong><p>Each entry identifies the exact canonical source path, the full Git commit that last changed that source, a SHA-256 digest of the published Markdown bytes, and the separate build commit that produced this site. The digest verifies byte identity; it is not a signature or governance authorization. See <a href="decisions/0015-standards-based-representation-discovery-and-provenance.html">ADR 0015</a>.</p></div>\n` +
    `<div class="callout"><strong>No hidden participant or content score.</strong><p>Hummingbird does not currently rank participants with a global trust/reputation number or convert identity into decision weight. Content, behavior, and effect are decision dimensions tied to a specific action, not a universal grade. Current Phase 2 admission criteria and the rule for future consequential automation are published in <a href="governance.html#evaluation-without-identity-metrics">Governance: Evaluation without identity metrics</a>.</p></div>\n` +
    `<div class="seed-grid">\n${items}\n</div>\n` +
    `<p class="doc-meta">${decisions.length} public decision record(s), generated from <code>docs/decisions/</code> at build commit <code>${escapeHtml(buildCommit)}</code>. Future ADRs require explicit publication allowlisting. <a href="decisions/index.json">Machine-readable provenance index</a>.</p>\n` +
    proposalSection;

  const indexHead = `<link rel="alternate" type="application/json" href="/decisions/index.json" title="Decision provenance index">\n` +
    `<link rel="describedby" type="application/schema+json" href="/decisions/proposal-schema.json" title="ADR proposal schema">`;

  fs.writeFileSync(path.join(DIST, "decisions.html"), renderPage({
    title: "Decisions",
    description: "Hummingbird's public Architecture Decision Record index: why the project took the paths it did, with verifiable source provenance and a static proposal contract.",
    bodyHtml: indexBody,
    extraHead: indexHead,
    canonicalPath: "decisions.html",
  }));

  const manifest = {
    schema_version: 1,
    generated_from_build_commit: buildCommit,
    authority_note: "This is a derived public index. Canonical ADR meaning remains in the repository Markdown sources.",
    proposal_contract: "/decisions/proposal-schema.json",
    decisions: decisions.map((decision) => ({
      adr_id: decision.adrId,
      slug: decision.slug,
      title: decision.title,
      status: decision.status,
      date: decision.date,
      html: `/decisions/${decision.slug}`,
      markdown: `/docs/raw/decisions/${decision.file}`,
      source_path: decision.sourcePath,
      source_commit: decision.sourceCommit,
      source_sha256: decision.sourceSha256,
      immutable_source_url: decision.sourceUrl,
    })),
  };
  fs.writeFileSync(path.join(pageDir, "index.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  fs.copyFileSync(PROPOSAL_SCHEMA, path.join(pageDir, "proposal-schema.json"));

  console.log(`page: decisions.html (${decisions.length} public ADRs)`);
  console.log("machine: decisions/index.json + decisions/proposal-schema.json");
}

main();
// Shared HTML page shell for build-time generated pages (canonical documents,
// decision records, the support page). Kept in sync by hand with the
// header/nav/footer markup in the hand-authored pages under app/.
"use strict";

const SITE_ORIGIN = "https://datum.quest";

const NAV_LINKS = [
  ["mission.html", "About"],
  ["how-it-works.html", "Commons"],
  ["seed-bank.html", "Seed Bank"],
  ["decisions.html", "Decisions"],
  ["more.html", "More"],
];

function renderNav(prefix = "") {
  return NAV_LINKS.map(([href, label]) => `    <a href="${prefix}${href}">${label}</a>`).join("\n");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderDiscoveryMeta(title, description, canonicalPath) {
  if (!canonicalPath) return "";
  const canonicalUrl = `${SITE_ORIGIN}/${canonicalPath.replace(/^\/+/, "")}`;
  const fullTitle = `${title} — Hummingbird`;
  return `\n<link rel="canonical" href="${escapeHtml(canonicalUrl)}">` +
    `\n<meta property="og:type" content="website">` +
    `\n<meta property="og:title" content="${escapeHtml(fullTitle)}">` +
    (description ? `\n<meta property="og:description" content="${escapeHtml(description)}">` : "") +
    `\n<meta property="og:url" content="${escapeHtml(canonicalUrl)}">` +
    `\n<meta name="twitter:card" content="summary">`;
}

// Renders a full HTML document using the shared site shell.
// options: { title, description, bodyHtml, extraHead, prefix, canonicalPath }
// `prefix` is used by nested generated pages (for example decisions/*.html)
// to link back to root-level site assets and navigation.
function renderPage({ title, description, bodyHtml, extraHead, prefix = "", canonicalPath = "" }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} — Hummingbird</title>${description ? `\n<meta name="description" content="${escapeHtml(description)}">` : ""}${renderDiscoveryMeta(title, description, canonicalPath)}
<link rel="stylesheet" href="${prefix}style.css">${extraHead ? `\n${extraHead}` : ""}
</head>
<body>
<header>
  <a class="brand" href="${prefix}index.html">Hummingbird</a>
  <nav aria-label="Primary">
${renderNav(prefix)}
  </nav>
</header>
<main>
${bodyHtml}
</main>
<footer>
  <p><a href="${prefix}index.html">&larr; Back home</a></p>
</footer>
</body>
</html>
`;
}

module.exports = { NAV_LINKS, renderNav, renderPage, escapeHtml };

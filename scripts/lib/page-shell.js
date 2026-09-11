// Shared HTML page shell for build-time generated pages (canonical documents,
// the support page). Kept in sync by hand with the header/nav/footer markup
// in the hand-authored pages under app/ (index.html, how-it-works.html,
// seed-bank.html, security.html, open-questions.html; llms.txt has no shell).
"use strict";

const NAV_LINKS = [
  ["mission.html", "Mission"],
  ["charter.html", "Charter"],
  ["governance.html", "Governance"],
  ["roadmap.html", "Roadmap"],
  ["how-it-works.html", "How it works"],
  ["seed-bank.html", "Seed Bank"],
  ["transparency.html", "Transparency"],
  ["changelog.html", "Changelog"],
  ["contributing.html", "Contributing"],
  ["open-questions.html", "Open Questions"],
  ["security.html", "Security"],
  ["support.html", "Support"],
];

function renderNav() {
  return NAV_LINKS.map(([href, label]) => `    <a href="${href}">${label}</a>`).join("\n");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Renders a full HTML document using the shared site shell.
// options: { title, description, bodyHtml, extraHead }
function renderPage({ title, description, bodyHtml, extraHead }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} — Hummingbird</title>${description ? `\n<meta name="description" content="${escapeHtml(description)}">` : ""}
<link rel="stylesheet" href="style.css">${extraHead ? `\n${extraHead}` : ""}
</head>
<body>
<header>
  <a class="brand" href="index.html">Hummingbird</a>
  <nav>
${renderNav()}
  </nav>
</header>
<main>
${bodyHtml}
</main>
<footer>
  <p><a href="index.html">&larr; Back home</a></p>
</footer>
</body>
</html>
`;
}

module.exports = { NAV_LINKS, renderNav, renderPage, escapeHtml };

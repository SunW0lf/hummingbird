// Final build-time pass over public HTML.
//
// Keeps accessibility, canonical discovery metadata, site identity, and
// agent-readable navigation guarantees consistent across hand-authored and
// generated pages without introducing a client-side runtime dependency.
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const SITE_ORIGIN = "https://datum.quest";

const SITE_MAP_LINKS = [
  ["/", "Home"],
  ["/mission", "About / Mission"],
  ["/how-it-works", "Commons"],
  ["/seed-bank", "Seed Bank"],
  ["/records", "Records"],
  ["/decisions", "Decisions"],
  ["/charter", "Charter"],
  ["/governance", "Governance"],
  ["/roadmap", "Roadmap"],
  ["/more", "More"],
  ["/llms.txt", "llms.txt"],
  ["/sitemap.xml", "sitemap.xml"],
];

function htmlFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...htmlFiles(full));
    else if (entry.isFile() && entry.name.endsWith(".html")) results.push(full);
  }
  return results;
}

function currentSection(relativePath) {
  if (relativePath === "mission.html") return "About";
  if (relativePath === "how-it-works.html") return "Commons";
  if (relativePath === "seed-bank.html") return "Seed Bank";
  if (relativePath === "decisions.html" || relativePath.startsWith("decisions/")) return "Decisions";
  if (relativePath === "index.html" || relativePath === "404.html") return null;
  return "More";
}

function publicUrl(relativePath) {
  if (relativePath === "index.html") return `${SITE_ORIGIN}/`;
  const route = relativePath.replace(/\.html$/, "");
  return `${SITE_ORIGIN}/${route}`;
}

function normalizeTitle(relativePath, html) {
  if (relativePath === "index.html") {
    return "Hummingbird — Origin-Agnostic Commons | datum.quest";
  }

  const match = html.match(/<title>([^<]+)<\/title>/i);
  const raw = match ? match[1].trim() : relativePath.replace(/\.html$/, "");
  const pageTitle = raw
    .replace(/\s+—\s+Hummingbird\s+\|\s+Origin-Agnostic Commons$/i, "")
    .replace(/\s+—\s+Hummingbird$/i, "")
    .replace(/\s+—\s+datum\.quest$/i, "")
    .trim();

  return `${pageTitle} — Hummingbird | Origin-Agnostic Commons`;
}

function siteMapHtml() {
  const items = SITE_MAP_LINKS
    .map(([href, label]) => `      <li><a href="${href}">${label}</a></li>`)
    .join("\n");

  return `  <nav class="site-map" aria-label="Site map">\n` +
    `    <p class="site-map-title">Explore Hummingbird</p>\n` +
    `    <ul>\n${items}\n    </ul>\n` +
    `  </nav>`;
}

function finalizeHtml(relativePath, html) {
  let output = html;

  if (!output.includes('class="skip-link"')) {
    output = output.replace("<body>", '<body>\n<a class="skip-link" href="#main-content">Skip to content</a>');
  }

  if (!output.includes('id="main-content"')) {
    output = output.replace("<main>", '<main id="main-content">');
  }

  const selected = currentSection(relativePath);
  output = output.replace(/<nav aria-label="Primary">([\s\S]*?)<\/nav>/, (nav) => {
    return nav.replace(/<a([^>]*?)>(About|Commons|Seed Bank|Decisions|More)<\/a>/g, (match, attrs, label) => {
      const cleanAttrs = attrs.replace(/\s+aria-current="page"/g, "");
      const current = label === selected ? ' aria-current="page"' : "";
      return `<a${cleanAttrs}${current}>${label}</a>`;
    });
  });

  // Keep the visible front door small, but make the durable public institution
  // traversable from every page through a curated semantic footer. Exhaustive
  // route discovery remains the responsibility of sitemap.xml and llms.txt.
  if (!output.includes('class="site-map"')) {
    output = output.replace("</footer>", `${siteMapHtml()}\n</footer>`);
  }

  // Cloudflare Pages serves clean HTML routes and redirects their .html forms.
  // Advertise the final 200 URL to crawlers rather than a redirecting alias.
  if (relativePath !== "404.html") {
    const canonical = publicUrl(relativePath);
    output = output.replace(
      /<link rel="canonical" href="[^"]*">/,
      `<link rel="canonical" href="${canonical}">`
    );
    output = output.replace(
      /<meta property="og:url" content="[^"]*">/,
      `<meta property="og:url" content="${canonical}">`
    );
  }

  // Keep each page's specific identity while making the project identity
  // explicit enough to resist similarly named-domain collisions.
  const title = normalizeTitle(relativePath, output);
  output = output.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`);
  output = output.replace(
    /<meta property="og:title" content="[^"]*">/,
    `<meta property="og:title" content="${title}">`
  );

  return output;
}

function main() {
  if (!fs.existsSync(DIST)) {
    console.error("error: dist/ does not exist. Run the build copy/render steps first.");
    process.exit(1);
  }

  const files = htmlFiles(DIST);
  for (const file of files) {
    const relativePath = path.relative(DIST, file).replace(/\\/g, "/");
    const before = fs.readFileSync(file, "utf8");
    fs.writeFileSync(file, finalizeHtml(relativePath, before));
  }

  console.log(`accessibility/discovery: finalized ${files.length} public HTML page(s)`);
}

main();

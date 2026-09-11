// Generates sitemap.xml from the built public HTML surface so discovery stays
// aligned with the actual deployable output instead of a second route list.
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const SITE_ORIGIN = "https://datum.quest";

function htmlFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...htmlFiles(full));
    else if (entry.isFile() && entry.name.endsWith(".html")) results.push(full);
  }
  return results;
}

function xmlEscape(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function main() {
  if (!fs.existsSync(DIST)) {
    console.error("error: dist/ does not exist. Run the build copy/render steps first.");
    process.exit(1);
  }

  const urls = htmlFiles(DIST)
    .map((file) => path.relative(DIST, file).replace(/\\/g, "/"))
    .filter((route) => route !== "404.html")
    .sort()
    .map((route) => route === "index.html" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}/${route}`);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((url) => `  <url><loc>${xmlEscape(url)}</loc></url>`).join("\n") +
    `\n</urlset>\n`;

  fs.writeFileSync(path.join(DIST, "sitemap.xml"), xml);
  console.log(`discovery: sitemap.xml (${urls.length} public HTML routes)`);
}

main();

// Final build-time pass over public HTML.
//
// Keeps accessibility and agent-readable navigation guarantees consistent
// across hand-authored pages and pages generated from canonical Markdown,
// without introducing a client-side runtime dependency.
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");

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

  console.log(`accessibility: finalized ${files.length} public HTML page(s)`);
}

main();

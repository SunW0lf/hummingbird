// Regression checks for the public layout/discovery contract.
//
// The primary navigation stays intentionally small. A curated semantic footer
// makes the durable public institution traversable without pretending future
// spaces exist or replacing sitemap.xml / llms.txt with a giant DOM route dump.
"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");
let failures = 0;

function fail(message) {
  failures += 1;
  console.error(`FAIL: ${message}`);
}

function pass(message) {
  console.log(`PASS: ${message}`);
}

function htmlFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...htmlFiles(full));
    else if (entry.isFile() && entry.name.endsWith(".html")) results.push(full);
  }
  return results;
}

const requiredFooterRoutes = [
  "/",
  "/mission",
  "/how-it-works",
  "/seed-bank",
  "/records",
  "/decisions",
  "/charter",
  "/governance",
  "/roadmap",
  "/more",
  "/llms.txt",
  "/sitemap.xml",
];

for (const file of htmlFiles(DIST)) {
  const relative = path.relative(DIST, file).replace(/\\/g, "/");
  const html = fs.readFileSync(file, "utf8");

  if (!html.includes('<main id="main-content">')) {
    fail(`${relative} is missing the semantic main-content target`);
  }

  if (!html.includes('<nav class="site-map" aria-label="Site map">')) {
    fail(`${relative} is missing the curated semantic footer map`);
  }

  for (const route of requiredFooterRoutes) {
    if (!html.includes(`href="${route}"`)) {
      fail(`${relative} footer is missing ${route}`);
    }
  }

  if (/href=["']\/(?:pond|pool)(?:[\/"'#?]|$)/i.test(html)) {
    fail(`${relative} exposes an unimplemented Pond/Pool route`);
  }

  if (html.includes('<details class="more-menu"')) {
    fail(`${relative} replaced the stable More page with a dropdown`);
  }

  if (!html.includes('>More</a>')) {
    fail(`${relative} no longer exposes the stable More library link`);
  }

  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (!titleMatch) {
    fail(`${relative} has no title`);
  } else if (relative === "index.html") {
    if (titleMatch[1] !== "Hummingbird — Origin-Agnostic Commons | datum.quest") {
      fail(`index.html has unexpected site-identity title: ${titleMatch[1]}`);
    }
  } else if (!titleMatch[1].endsWith("— Hummingbird | Origin-Agnostic Commons")) {
    fail(`${relative} title does not append the Hummingbird project identity`);
  }
}
pass("Public HTML keeps the small front door, semantic main, curated footer, and no premature Pond/Pool routes");

const index = fs.readFileSync(path.join(DIST, "index.html"), "utf8");
const scriptMatch = index.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
if (!scriptMatch) {
  fail("index.html is missing JSON-LD site identity");
} else {
  try {
    const structured = JSON.parse(scriptMatch[1]);
    const graph = Array.isArray(structured["@graph"]) ? structured["@graph"] : [];
    const website = graph.find((node) => node["@type"] === "WebSite");
    const source = graph.find((node) => node["@type"] === "SoftwareSourceCode");

    if (!website || website.url !== "https://datum.quest/" || website.name !== "Hummingbird") {
      fail("JSON-LD does not identify Hummingbird at datum.quest as the WebSite");
    }
    if (!website || website.sameAs !== "https://github.com/SunW0lf/hummingbird") {
      fail("JSON-LD does not disambiguate the canonical public source repository");
    }
    if (!website || !Array.isArray(website.keywords) || !website.keywords.includes("origin-neutral") || !website.keywords.includes("agents")) {
      fail("JSON-LD keywords do not express origin-neutral participant discovery");
    }
    if (!source || source.codeRepository !== "https://github.com/SunW0lf/hummingbird") {
      fail("JSON-LD source node does not identify the Hummingbird repository");
    }
  } catch (error) {
    fail(`JSON-LD is not valid JSON: ${error.message}`);
  }

  const digest = crypto.createHash("sha256").update(scriptMatch[1], "utf8").digest("base64");
  const headers = fs.readFileSync(path.join(DIST, "_headers"), "utf8");
  if (!headers.includes(`'sha256-${digest}'`)) {
    fail("CSP does not authorize the exact inline JSON-LD bytes");
  }
}
pass("Structured identity distinguishes the WebSite from its source repository and remains CSP-compatible");

if (failures > 0) {
  console.error(`\n${failures} layout/identity check(s) failed.`);
  process.exit(1);
}

console.log("\nAll layout/identity checks passed.");

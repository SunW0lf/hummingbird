// Agent/read-plane acceptance test for the built static site.
//
// The test intentionally uses a plain HTTP client with no cookies,
// authentication, browser execution, or JavaScript. It verifies the deployed
// artifact can be understood and traversed as ordinary hypertext.
"use strict";

const fs = require("fs");
const http = require("http");
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

function expectedCurrent(relativePath) {
  if (relativePath === "mission.html") return "About";
  if (relativePath === "how-it-works.html") return "Commons";
  if (relativePath === "seed-bank.html") return "Seed Bank";
  if (relativePath === "decisions.html" || relativePath.startsWith("decisions/")) return "Decisions";
  if (relativePath === "index.html" || relativePath === "404.html") return null;
  return "More";
}

function mimeFor(file) {
  if (file.endsWith(".html")) return "text/html; charset=utf-8";
  if (file.endsWith(".md")) return "text/markdown; charset=utf-8";
  if (file.endsWith(".txt")) return "text/plain; charset=utf-8";
  if (file.endsWith(".xml")) return "application/xml; charset=utf-8";
  if (file.endsWith(".css")) return "text/css; charset=utf-8";
  if (file.endsWith(".js")) return "text/javascript; charset=utf-8";
  return "application/octet-stream";
}

function request(port, method, route) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      host: "127.0.0.1",
      port,
      path: route,
      method,
      headers: {
        "User-Agent": "Hummingbird-Agent-Acceptance/1.0",
        "Accept": "*/*",
      },
    }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve({
        status: res.statusCode,
        headers: res.headers,
        body: Buffer.concat(chunks).toString("utf8"),
      }));
    });
    req.on("error", reject);
    req.end();
  });
}

async function main() {
  if (!fs.existsSync(DIST)) {
    console.error("error: dist/ does not exist. Run ./scripts/build first.");
    process.exit(1);
  }

  // Artifact-level guarantees: all public HTML is real hypertext with
  // landmarks, keyboard access, ordinary links, and no JS-only navigation.
  for (const file of htmlFiles(DIST)) {
    const relativePath = path.relative(DIST, file).replace(/\\/g, "/");
    const html = fs.readFileSync(file, "utf8");
    const selected = expectedCurrent(relativePath);

    for (const landmark of ["<header", '<nav aria-label="Primary"', '<main id="main-content"', "<footer"]) {
      if (!html.includes(landmark)) fail(`${relativePath} is missing semantic landmark ${landmark}`);
    }
    if (!html.includes('<a class="skip-link" href="#main-content">Skip to content</a>')) {
      fail(`${relativePath} is missing the skip-to-content link`);
    }
    if (/href=["']javascript:/i.test(html) || /\sonclick=/i.test(html)) {
      fail(`${relativePath} contains client-side navigation behavior`);
    }
    if (!/<a\s+[^>]*href=["'][^"']+["']/i.test(html)) {
      fail(`${relativePath} exposes no ordinary navigable links`);
    }

    const currentMatches = [...html.matchAll(/<a[^>]*aria-current="page"[^>]*>([^<]+)<\/a>/g)].map((m) => m[1]);
    if (selected === null && currentMatches.length !== 0) {
      fail(`${relativePath} should not mark a primary section current`);
    } else if (selected !== null && (currentMatches.length !== 1 || currentMatches[0] !== selected)) {
      fail(`${relativePath} should mark only ${selected} as aria-current=page`);
    }
  }
  pass("Built public pages are semantic, keyboard-addressable ordinary hypertext");

  const css = fs.readFileSync(path.join(DIST, "style.css"), "utf8");
  if (!css.includes(":focus-visible") || !css.includes(".skip-link")) {
    fail("style.css does not provide strong focus-visible and skip-link styling");
  } else {
    pass("Built CSS exposes focus-visible and skip-link treatment");
  }

  const headers = fs.readFileSync(path.join(DIST, "_headers"), "utf8");
  const mimeDirectives = [
    ["/docs/raw/*.md", "Content-Type: text/markdown; charset=utf-8"],
    ["/llms.txt", "Content-Type: text/plain; charset=utf-8"],
    ["/robots.txt", "Content-Type: text/plain; charset=utf-8"],
    ["/sitemap.xml", "Content-Type: application/xml; charset=utf-8"],
  ];
  for (const [route, directive] of mimeDirectives) {
    if (!headers.includes(route) || !headers.includes(directive)) fail(`_headers is missing MIME policy for ${route}`);
  }
  pass("Cloudflare Pages artifact declares machine-readable MIME types");

  for (const required of [
    "docs/raw/decisions/0013-public-read-accessibility.md",
    "decisions/0013-public-read-accessibility.html",
  ]) {
    if (!fs.existsSync(path.join(DIST, required))) fail(`${required} is missing from the public build`);
  }

  const llms = fs.readFileSync(path.join(DIST, "llms.txt"), "utf8");
  for (const phrase of [
    "public surfaces are intentionally readable by automated and interactive agents",
    "Public reading does not require an origin category or identity declaration",
    "Submission is not canonical admission",
    "0013-public-read-accessibility",
  ]) {
    if (!llms.includes(phrase)) fail(`llms.txt is missing public-read guidance: ${phrase}`);
  }
  pass("llms.txt states the origin-neutral public-read contract");

  // Local HTTP behavior, using only Node's standard library. This exercises
  // the exact required GET/HEAD contract without any browser features.
  const server = http.createServer((req, res) => {
    const pathname = new URL(req.url, "http://localhost").pathname;
    const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    const file = path.resolve(DIST, relative);
    if (!file.startsWith(path.resolve(DIST) + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(req.method === "HEAD" ? undefined : "not found");
      return;
    }
    const body = fs.readFileSync(file);
    res.writeHead(200, { "Content-Type": mimeFor(file), "Content-Length": body.length });
    if (req.method === "HEAD") res.end();
    else res.end(body);
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;

  const cases = [
    ["GET", "/", 200, "text/html", "Hummingbird"],
    ["HEAD", "/", 200, "text/html", ""],
    ["GET", "/llms.txt", 200, "text/plain", "automated and interactive agents"],
    ["GET", "/robots.txt", 200, "text/plain", "User-agent: *"],
    ["GET", "/sitemap.xml", 200, "application/xml", "<urlset"],
    ["GET", "/docs/raw/MISSION.md", 200, "text/markdown", "# Mission"],
  ];

  try {
    for (const [method, route, status, contentType, marker] of cases) {
      const response = await request(port, method, route);
      if (response.status !== status) fail(`${method} ${route}: expected ${status}, got ${response.status}`);
      if (!(response.headers["content-type"] || "").startsWith(contentType)) {
        fail(`${method} ${route}: expected ${contentType}, got ${response.headers["content-type"] || "no content-type"}`);
      }
      if (method === "HEAD" && response.body.length !== 0) fail(`HEAD ${route}: response unexpectedly contained a body`);
      if (marker && !response.body.includes(marker)) fail(`${method} ${route}: response is missing ${marker}`);
      if (response.headers["set-cookie"]) fail(`${method} ${route}: static read unexpectedly sets a cookie`);
    }

    const root = await request(port, "GET", "/");
    if (root.body.length < 500 || !root.body.includes('<main id="main-content">')) {
      fail("GET / does not contain useful initial HTML content");
    }
    if (!root.body.includes('href="mission.html"') || root.body.includes("<script")) {
      fail("GET / does not expose ordinary no-JavaScript navigation");
    }
  } finally {
    server.close();
  }

  if (failures > 0) {
    console.error(`\n${failures} agent-access acceptance check(s) failed.`);
    process.exit(1);
  }

  pass("Plain HTTP GET/HEAD read-plane contract passes without cookies, auth, or JavaScript");
  console.log("\nAll agent/read-plane acceptance checks passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

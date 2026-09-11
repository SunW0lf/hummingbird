// Minimal, zero-dependency smoke test for the built static site.
// Verifies expected pages/assets exist in dist/ (the actual deployable output)
// and internal HTML links resolve, including nested generated ADR pages.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const APP_DIR = path.join(ROOT, "dist");
const REQUIRED_PAGES = [
  "index.html",
  "mission.html",
  "charter.html",
  "governance.html",
  "decisions.html",
  "roadmap.html",
  "how-it-works.html",
  "seed-bank.html",
  "transparency.html",
  "changelog.html",
  "contributing.html",
  "open-questions.html",
  "security.html",
  "support.html",
  "more.html",
  "style.css",
  "support.js",
  "llms.txt",
  "robots.txt",
  "sitemap.xml",
  "_headers",
];

const REQUIRED_RAW_DOCS = [
  "docs/raw/MISSION.md",
  "docs/raw/CHARTER.md",
  "docs/raw/GOVERNANCE.md",
  "docs/raw/ROADMAP.md",
  "docs/raw/TRANSPARENCY.md",
  "docs/raw/CHANGELOG.md",
  "docs/raw/CONTRIBUTING.md",
  "docs/raw/LICENSE",
];

const PUBLIC_DECISIONS = [
  "0001-single-production-domain",
  "0002-github-source-of-truth",
  "0003-origin-neutral-participant-model",
  "0004-publication-buffer",
  "0005-ci-gated-production-deployment",
  "0006-canonical-documents-drive-publication",
  "0007-portable-canonical-data-model",
  "0008-interim-steward-support-wallet",
  "0009-public-repository-security-transition",
  "0010-phase2-read-only-commons-contract",
  "0011-interim-seed-bank",
  "0012-reference-corpus-before-persistence",
];

const REQUIRED_SEED_FORMS = [
  ".github/ISSUE_TEMPLATE/seed.yml",
  ".github/ISSUE_TEMPLATE/feedback.yml",
  ".github/ISSUE_TEMPLATE/question.yml",
  ".github/ISSUE_TEMPLATE/config.yml",
];

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

// 1. All required root pages/assets exist.
for (const page of REQUIRED_PAGES) {
  const fullPath = path.join(APP_DIR, page);
  if (fs.existsSync(fullPath)) pass(`${page} exists`);
  else fail(`${page} is missing from dist/`);
}

// 2. Every raw canonical root document was copied into dist/docs/raw/.
for (const doc of REQUIRED_RAW_DOCS) {
  const fullPath = path.join(APP_DIR, doc);
  if (fs.existsSync(fullPath)) pass(`${doc} exists`);
  else fail(`${doc} is missing from dist/`);
}

// 3. Every allowlisted ADR has both rendered and raw public forms.
for (const slug of PUBLIC_DECISIONS) {
  const rendered = path.join(APP_DIR, "decisions", `${slug}.html`);
  const raw = path.join(APP_DIR, "docs", "raw", "decisions", `${slug}.md`);
  if (fs.existsSync(rendered)) pass(`decisions/${slug}.html exists`);
  else fail(`decisions/${slug}.html is missing from dist/`);
  if (fs.existsSync(raw)) pass(`docs/raw/decisions/${slug}.md exists`);
  else fail(`docs/raw/decisions/${slug}.md is missing from dist/`);
}

// 4. Every relative/internal .html href in every generated HTML page resolves.
const hrefPattern = /href="([^"]+\.html(?:#[^"]*)?)"/g;
for (const fullPath of htmlFiles(APP_DIR)) {
  const relPage = path.relative(APP_DIR, fullPath);
  const content = fs.readFileSync(fullPath, "utf8");
  let match;
  while ((match = hrefPattern.exec(content)) !== null) {
    const href = match[1].split("#", 1)[0];
    if (/^[a-z]+:\/\//i.test(href)) continue;
    const target = href.startsWith("/")
      ? path.join(APP_DIR, href.replace(/^\/+/, ""))
      : path.resolve(path.dirname(fullPath), href);
    if (!target.startsWith(path.resolve(APP_DIR) + path.sep) && target !== path.resolve(APP_DIR)) {
      fail(`${relPage} links outside dist/: ${href}`);
    } else if (!fs.existsSync(target)) {
      fail(`${relPage} links to missing file ${href}`);
    }
  }
}
pass("All generated HTML pages have resolvable internal .html links");

// 5. Decisions index must explain authority and deliberate publication.
const decisionsPath = path.join(APP_DIR, "decisions.html");
if (fs.existsSync(decisionsPath)) {
  const decisions = fs.readFileSync(decisionsPath, "utf8");
  const requiredPhrases = [
    "Decision records are history, not scripture",
    "Future ADRs require explicit publication allowlisting",
    "0011-interim-seed-bank.html",
    "0012-reference-corpus-before-persistence.html",
  ];
  for (const phrase of requiredPhrases) {
    if (!decisions.includes(phrase)) fail(`decisions.html is missing required decision boundary: ${phrase}`);
  }
  pass("Decisions index exposes the public ADR set and authority boundary");
}

// 6. Seed Bank must expose the bounded interim interaction contract.
const seedBankPath = path.join(APP_DIR, "seed-bank.html");
if (fs.existsSync(seedBankPath)) {
  const seedBank = fs.readFileSync(seedBankPath, "utf8");
  const requiredPhrases = [
    "Plant a seed",
    "Leave feedback",
    "Ask a question",
    "Reactions are conversational signals, not votes",
    "security/advisories/new",
    "issues/15",
    "issues/19",
    "decisions/0011-interim-seed-bank.html",
  ];
  for (const phrase of requiredPhrases) {
    if (!seedBank.includes(phrase)) fail(`seed-bank.html is missing required interaction boundary: ${phrase}`);
  }
  pass("Seed Bank exposes starter discussions and participation boundaries");
}

// 7. Constrained GitHub forms and private-security routing must exist in-repo.
for (const form of REQUIRED_SEED_FORMS) {
  if (!fs.existsSync(path.join(ROOT, form))) fail(`${form} is missing`);
  else pass(`${form} exists`);
}

// 8. Primary navigation stays intentionally small and consistent.
const primaryLabels = [">About</a>", ">Commons</a>", ">Seed Bank</a>", ">Decisions</a>", ">More</a>"];
for (const fullPath of htmlFiles(APP_DIR)) {
  const relPage = path.relative(APP_DIR, fullPath);
  const content = fs.readFileSync(fullPath, "utf8");
  for (const label of primaryLabels) {
    if (!content.includes(label)) fail(`${relPage} is missing primary navigation item ${label}`);
  }
}
pass("Primary navigation exposes five stable front-door choices");

// 9. Public pages expose canonical URLs; the 404 is explicitly noindex.
for (const fullPath of htmlFiles(APP_DIR)) {
  const relPage = path.relative(APP_DIR, fullPath);
  const content = fs.readFileSync(fullPath, "utf8");
  if (relPage === "404.html") {
    if (!content.includes('name="robots" content="noindex"')) fail("404.html is not marked noindex");
  } else if (!content.includes('rel="canonical" href="https://datum.quest/')) {
    fail(`${relPage} is missing a datum.quest canonical URL`);
  }
}
pass("Public HTML exposes canonical URLs and the 404 is noindex");

// 10. Support behavior is CSP-compatible: no inline script/style is required.
const supportPath = path.join(APP_DIR, "support.html");
if (fs.existsSync(supportPath)) {
  const support = fs.readFileSync(supportPath, "utf8");
  if (support.includes("onclick=")) fail("support.html still contains inline JavaScript");
  if (support.includes("<style>")) fail("support.html still contains inline CSS");
  if (!support.includes('src="support.js"')) fail("support.html does not load support.js");
  else pass("Support page uses external static assets under the site CSP");
}

// 11. Browser hardening and discoverability artifacts are present.
const headers = fs.readFileSync(path.join(APP_DIR, "_headers"), "utf8");
for (const directive of ["Content-Security-Policy", "X-Content-Type-Options", "X-Frame-Options", "Referrer-Policy", "Permissions-Policy"]) {
  if (!headers.includes(directive)) fail(`_headers is missing ${directive}`);
}

const robots = fs.readFileSync(path.join(APP_DIR, "robots.txt"), "utf8");
if (!robots.includes("https://datum.quest/sitemap.xml")) fail("robots.txt does not advertise the sitemap");

const sitemap = fs.readFileSync(path.join(APP_DIR, "sitemap.xml"), "utf8");
for (const url of ["https://datum.quest/", "https://datum.quest/more.html", "https://datum.quest/support.html", "https://datum.quest/decisions/0012-reference-corpus-before-persistence.html"]) {
  if (!sitemap.includes(`<loc>${url}</loc>`)) fail(`sitemap.xml is missing ${url}`);
}
pass("Security headers and basic discovery artifacts are present");

if (failures > 0) {
  console.error(`\n${failures} test(s) failed.`);
  process.exit(1);
} else {
  console.log("\nAll site smoke tests passed.");
  process.exit(0);
}

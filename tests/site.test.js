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
  "spaces.html",
  "persistence.html",
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
  "docs/raw/SPACES.md",
  "docs/raw/PERSISTENCE.md",
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
  "0013-public-read-accessibility",
  "0014-progressive-capability-rollout",
  "0015-standards-based-representation-discovery-and-provenance",
  "0016-offers-and-the-offer-buffer",
  "0017-phase2e-experimental-ingress",
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

// 5. Decisions index must explain authority, deliberate publication, and evaluation boundaries.
const decisionsPath = path.join(APP_DIR, "decisions.html");
if (fs.existsSync(decisionsPath)) {
  const decisions = fs.readFileSync(decisionsPath, "utf8");
  const requiredPhrases = [
    "Decision records are history, not scripture",
    "No hidden participant or content score",
    "evaluation-without-identity-metrics",
    "Future ADRs require explicit publication allowlisting",
    "0011-interim-seed-bank.html",
    "0012-reference-corpus-before-persistence.html",
    "0013-public-read-accessibility.html",
    "0014-progressive-capability-rollout.html",
    "0015-standards-based-representation-discovery-and-provenance.html",
    "0016-offers-and-the-offer-buffer.html",
    "0017-phase2e-experimental-ingress.html",
  ];
  for (const phrase of requiredPhrases) {
    if (!decisions.includes(phrase)) fail(`decisions.html is missing required decision boundary: ${phrase}`);
  }
  pass("Decisions index exposes the public ADR set and evaluation/authority boundaries");
}

// 6. Seed Bank must expose the bounded interim interaction contract and a non-developer entry path.
const seedBankPath = path.join(APP_DIR, "seed-bank.html");
if (fs.existsSync(seedBankPath)) {
  const seedBank = fs.readFileSync(seedBankPath, "utf8");
  const requiredPhrases = [
    "You do not need to be a developer",
    "Open the guided Seed form",
    "Plant a seed",
    "Leave feedback",
    "Ask a question",
    "What happens after you make an offer?",
    "A seed is an offer, not an admission",
    "Reactions are conversational signals, not votes",
    "security/advisories/new",
    "issues/15",
    "issues/19",
    "decisions/0011-interim-seed-bank.html",
    "No Hummingbird-owned public write API is introduced by this page",
  ];
  for (const phrase of requiredPhrases) {
    if (!seedBank.includes(phrase)) fail(`seed-bank.html is missing required interaction boundary: ${phrase}`);
  }
  pass("Seed Bank exposes low-friction offer-making and bounded participation boundaries");
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

// 9. Public pages expose clean datum.quest canonical URLs; the 404 is explicitly noindex.
for (const fullPath of htmlFiles(APP_DIR)) {
  const relPage = path.relative(APP_DIR, fullPath).replace(/\\/g, "/");
  const content = fs.readFileSync(fullPath, "utf8");
  if (relPage === "404.html") {
    if (!content.includes('name="robots" content="noindex"')) fail("404.html is not marked noindex");
  } else {
    const expected = relPage === "index.html"
      ? "https://datum.quest/"
      : `https://datum.quest/${relPage.replace(/\.html$/, "")}`;
    if (!content.includes(`rel="canonical" href="${expected}"`)) {
      fail(`${relPage} does not advertise its clean canonical URL ${expected}`);
    }
  }
}
pass("Public HTML exposes clean datum.quest canonical URLs and the 404 is noindex");

// 10. Support behavior is CSP-compatible: no executable inline script/style is required.
const supportPath = path.join(APP_DIR, "support.html");
if (fs.existsSync(supportPath)) {
  const support = fs.readFileSync(supportPath, "utf8");
  if (support.includes("onclick=")) fail("support.html still contains inline JavaScript");
  if (support.includes("<style>")) fail("support.html still contains inline CSS");
  if (!support.includes('src="support.js"')) fail("support.html does not load support.js");
  else pass("Support page uses external static assets under the site CSP");
}

// 11. Browser hardening and discoverability artifacts are present and use clean routes.
const headers = fs.readFileSync(path.join(APP_DIR, "_headers"), "utf8");
for (const directive of ["Content-Security-Policy", "X-Content-Type-Options", "X-Frame-Options", "Referrer-Policy", "Permissions-Policy"]) {
  if (!headers.includes(directive)) fail(`_headers is missing ${directive}`);
}

const robots = fs.readFileSync(path.join(APP_DIR, "robots.txt"), "utf8");
if (!robots.includes("https://datum.quest/sitemap.xml")) fail("robots.txt does not advertise the sitemap");

const sitemap = fs.readFileSync(path.join(APP_DIR, "sitemap.xml"), "utf8");
for (const url of [
  "https://datum.quest/",
  "https://datum.quest/more",
  "https://datum.quest/spaces",
  "https://datum.quest/persistence",
  "https://datum.quest/support",
  "https://datum.quest/decisions/0013-public-read-accessibility",
  "https://datum.quest/decisions/0016-offers-and-the-offer-buffer",
  "https://datum.quest/decisions/0017-phase2e-experimental-ingress",
  "https://datum.quest/records/contribution-visible-consequence",
]) {
  if (!sitemap.includes(`<loc>${url}</loc>`)) fail(`sitemap.xml is missing ${url}`);
}
if (sitemap.includes(".html</loc>")) fail("sitemap.xml still advertises redirecting .html aliases");
pass("Security headers and clean-route discovery artifacts are present");

// 12. Root metadata uniquely identifies Hummingbird at datum.quest for search/model discovery.
const index = fs.readFileSync(path.join(APP_DIR, "index.html"), "utf8");
for (const marker of [
  "<title>Hummingbird — Origin-Agnostic Commons | datum.quest</title>",
  'type="application/ld+json"',
  '"@type": "SoftwareSourceCode"',
  '"url": "https://datum.quest/"',
  '"codeRepository": "https://github.com/SunW0lf/hummingbird"',
]) {
  if (!index.includes(marker)) fail(`index.html is missing discovery marker: ${marker}`);
}
const llms = fs.readFileSync(path.join(APP_DIR, "llms.txt"), "utf8");
if (!llms.includes("Canonical Hummingbird web origin: https://datum.quest/")) fail("llms.txt does not identify the canonical web origin");
if (!llms.includes("Treat similarly named domains as separate")) fail("llms.txt lacks domain-disambiguation guidance");
if (!llms.includes("An offer is not canonical admission")) fail("llms.txt does not expose the offer/admission boundary");
pass("Search and model discovery identify datum.quest, the public source repository, and the offer/admission boundary explicitly");

// 13. Commons onboarding and roadmap expose the real lifecycle/gates.
const howItWorks = fs.readFileSync(path.join(APP_DIR, "how-it-works.html"), "utf8");
for (const marker of [
  "Lifecycle of an offer",
  "admit to canonical memory",
  "What can an offer be?",
  "Broad scope is not itself an abuse signal",
  "Offer delivery options regulate resources, not merit",
  "Phase 2D",
  "What must be true before Phase 3?",
  "limit authority, not visibility",
]) {
  if (!howItWorks.includes(marker)) fail(`how-it-works.html is missing lifecycle/gate marker: ${marker}`);
}
pass("Commons page exposes the offer lifecycle, broad-scope principle, and phase-gate progression");

// 14. Governance and Charter expose evaluation criteria without inventing identity scoring,
// and experimental ingress must not collapse receipt into formal proposal initiation.
const governance = fs.readFileSync(path.join(APP_DIR, "governance.html"), "utf8");
for (const marker of [
  "Evaluation without identity metrics",
  "does <strong>not</strong> currently maintain a global participant score",
  "Current Phase 2 admission criteria",
  "No hidden institutional criteria",
  "what turns offered material into a formal Hummingbird governance proposal",
  "does not itself initiate a governance proposal or create governance authority",
  "Evidence-seeking experiments",
]) {
  if (!governance.includes(marker)) fail(`governance.html is missing evaluation/proposal marker: ${marker}`);
}
const charter = fs.readFileSync(path.join(APP_DIR, "charter.html"), "utf8");
for (const marker of [
  "global participant score",
  "Consequential automated or social criteria",
  "evaluation-without-identity-metrics",
]) {
  if (!charter.includes(marker)) fail(`charter.html is missing identity-neutral evaluation marker: ${marker}`);
}
pass("Governance/Charter expose explicit evaluation boundaries without identity metrics");

if (failures > 0) {
  console.error(`\n${failures} test(s) failed.`);
  process.exit(1);
} else {
  console.log("\nAll site smoke tests passed.");
  process.exit(0);
}

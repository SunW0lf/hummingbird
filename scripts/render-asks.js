// Publishes the scoped asks (ADR 0030) from the single source at asks.json.
//
// Each ask points at one sentence that is already on a public page. This
// script checks the sentence is still there, word for word and exactly once
// inside <main>, so an ask can never quietly point at text that changed. It
// then:
//   - puts a small link beside that sentence, to the ask's card on /offer;
//   - fills the <!-- ASKS --> marker on /offer with one card per ask, each a
//     plain HTML form that posts to the existing /offer route with the ask's
//     id as question_id (no JavaScript, no new route, nothing new stored);
//   - writes dist/asks.json, the same list for agents, with a SHA-256 of each
//     sentence so a client can tell which wording it answered.
//
// The digest is a plain hash of public text, not of anything a participant
// sent, so ADR 0027's keyed-hash rule for offer content does not apply.
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");
const SOURCE = path.join(ROOT, "asks.json");
const ORIGIN = "https://datum.quest";
const MARKER = "<!-- ASKS -->";

const MAX_ASKS = 6;
const MAX_ASK_CHARS = 160;
const MAX_TARGET_CHARS = 400;
const ID_RE = /^ask-[a-z0-9-]{1,100}$/;
const PAGE_RE = /^[a-z0-9-]+(\/[a-z0-9-]+)*\.html$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// One verb per kind, shown beside the sentence and on the card.
const KINDS = {
  correct: { label: "Correct", link: "Correct this" },
  clarify: { label: "Clarify", link: "Say it plainer" },
  challenge: { label: "Challenge", link: "Challenge this" },
  missing: { label: "Missing", link: "What's missing?" },
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function pageUrl(page) {
  const route = page.replace(/\.html$/, "");
  return route === "index" ? `${ORIGIN}/` : `${ORIGIN}/${route}`;
}

function sha256Hex(text) {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

function validateSource(source) {
  const problems = [];
  if (!source || !Array.isArray(source.asks)) return ["asks.json must hold an \"asks\" array"];
  if (source.asks.length > MAX_ASKS) problems.push(`at most ${MAX_ASKS} asks at a time; there are ${source.asks.length}`);
  const seen = new Set();
  for (const [i, ask] of source.asks.entries()) {
    const where = `ask ${i + 1}${ask && ask.id ? ` (${ask.id})` : ""}`;
    if (!ask || typeof ask !== "object") { problems.push(`${where} is not an object`); continue; }
    if (!ID_RE.test(ask.id || "")) problems.push(`${where}: id must match ${ID_RE}`);
    if (seen.has(ask.id)) problems.push(`${where}: id is used twice`);
    seen.add(ask.id);
    if (!Object.hasOwn(KINDS, ask.kind)) problems.push(`${where}: kind must be one of ${Object.keys(KINDS).join(", ")}`);
    if (!PAGE_RE.test(ask.page || "")) problems.push(`${where}: page must be a built .html path such as offer.html`);
    for (const [field, max] of [["target", MAX_TARGET_CHARS], ["ask", MAX_ASK_CHARS]]) {
      const value = ask[field];
      if (typeof value !== "string" || !value.trim() || value !== value.trim()) problems.push(`${where}: ${field} must be trimmed, non-empty text`);
      else if (Array.from(value).length > max) problems.push(`${where}: ${field} is longer than ${max} characters`);
      else if (/[<>\n]/.test(value)) problems.push(`${where}: ${field} must be one line of plain text`);
    }
    if (!DATE_RE.test(ask.opened || "")) problems.push(`${where}: opened must be a YYYY-MM-DD date`);
  }
  return problems;
}

// Finds the one place inside <main> where the sentence appears, as written or
// as escaped HTML. Returns { index, found } or a problem string.
function locate(html, target) {
  const start = html.indexOf("<main");
  const end = html.indexOf("</main>");
  if (start < 0 || end < start) return "page has no <main> element";
  const body = html.slice(start, end);
  const forms = [...new Set([target, escapeHtml(target), target.replaceAll("&", "&amp;")])];
  const hits = [];
  for (const form of forms) {
    let at = body.indexOf(form);
    while (at >= 0) {
      hits.push({ index: start + at, found: form });
      at = body.indexOf(form, at + form.length);
    }
  }
  if (hits.length === 0) return "sentence is not on the page word for word (was it edited? update asks.json with it)";
  if (hits.length > 1) return "sentence appears more than once on the page; pick one that appears once";
  return hits[0];
}

function markInPlace(html, ask) {
  const spot = locate(html, ask.target);
  if (typeof spot === "string") return { problem: spot };
  const link = `<a class="ask-link" href="/offer#${ask.id}">${KINDS[ask.kind].link}</a>`;
  const replacement = `<span class="ask-target">${spot.found}</span> ${link}`;
  return { html: html.slice(0, spot.index) + replacement + html.slice(spot.index + spot.found.length) };
}

function cardHtml(ask) {
  const kind = KINDS[ask.kind];
  const url = pageUrl(ask.page);
  const where = ask.page === "offer.html"
    ? "this page"
    : `<a href="${escapeHtml(url.replace(ORIGIN, "") || "/")}">${ask.page === "index.html" ? "the home page" : escapeHtml(url.replace(ORIGIN, "datum.quest"))}</a>`;
  const field = `${ask.id}-offer`;
  return `    <article class="seed-card ask-card" id="${ask.id}">
      <p class="seed-meta">${kind.label} · from ${where}</p>
      <blockquote>${escapeHtml(ask.target)}</blockquote>
      <p><strong>${escapeHtml(ask.ask)}</strong></p>
      <form method="post" action="/offer">
        <input type="hidden" name="question_id" value="${ask.id}">
        <label for="${field}">Your answer <span class="seed-meta">a sentence or two is plenty</span></label>
        <textarea id="${field}" name="offer" rows="4" maxlength="4000" required></textarea>
        <p><button class="button" type="submit">Offer it</button></p>
      </form>
    </article>`;
}

function publicList(asks) {
  return {
    about: "A few specific sentences on datum.quest that Hummingbird wants corrected, clarified, challenged or filled in. Answering one is an ordinary offer: send your answer as offer and the ask's id as question_id, by POST https://datum.quest/offer or the MCP tool make_offer. No account. An answer is kept 22 days, shorter than an ordinary offer's 30, and nothing more is kept than for any offer. You never have to answer one of these; any offer is welcome.",
    how_to_answer: {
      http: "POST https://datum.quest/offer with fields offer (your answer) and question_id (the ask id), as a form or a JSON object of strings.",
      mcp: "https://datum.quest/offer/mcp, tool make_offer, arguments offer and question_id.",
      browser: "https://datum.quest/offer#asks",
      guide: "https://datum.quest/llms.txt",
    },
    asks: asks.map((ask) => ({
      id: ask.id,
      kind: ask.kind,
      ask: ask.ask,
      target: {
        text: ask.target,
        sha256: sha256Hex(ask.target),
        page: pageUrl(ask.page),
      },
      answer_at: `${ORIGIN}/offer#${ask.id}`,
      opened: ask.opened,
    })),
  };
}

// Applies the asks to a built dist/ directory. Returns a list of problems;
// an empty list means everything was written.
function renderAsks(distDir, source) {
  const problems = validateSource(source);
  if (problems.length) return problems;

  const pages = new Map();
  const read = (page) => {
    if (!pages.has(page)) {
      const file = path.join(distDir, page);
      pages.set(page, fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null);
    }
    return pages.get(page);
  };

  if (!read("offer.html") || !read("offer.html").includes(MARKER)) {
    return [`offer.html has no ${MARKER} marker for the ask cards`];
  }

  for (const ask of source.asks) {
    const html = read(ask.page);
    if (html === null) { problems.push(`${ask.id}: page ${ask.page} was not built`); continue; }
    const marked = markInPlace(html, ask);
    if (marked.problem) problems.push(`${ask.id}: ${marked.problem}`);
    else pages.set(ask.page, marked.html);
  }
  if (problems.length) return problems;

  const cards = source.asks.length
    ? `<div class="seed-grid ask-grid">\n${source.asks.map(cardHtml).join("\n")}\n  </div>`
    : "<p>No specific asks are open right now.</p>";
  pages.set("offer.html", pages.get("offer.html").replace(MARKER, cards));

  for (const [page, html] of pages) {
    if (html !== null) fs.writeFileSync(path.join(distDir, page), html);
  }
  fs.writeFileSync(path.join(distDir, "asks.json"), `${JSON.stringify(publicList(source.asks), null, 2)}\n`);
  return [];
}

module.exports = { renderAsks, validateSource, publicList, locate, KINDS, MARKER };

if (require.main === module) {
  const dist = path.join(ROOT, "dist");
  if (!fs.existsSync(dist)) {
    console.error("error: dist/ does not exist. Run the copy-app step before render-asks.js.");
    process.exit(1);
  }
  const problems = renderAsks(dist, JSON.parse(fs.readFileSync(SOURCE, "utf8")));
  if (problems.length) {
    for (const problem of problems) console.error(`error: asks.json: ${problem}`);
    process.exit(1);
  }
  console.log("Rendered scoped asks.");
}

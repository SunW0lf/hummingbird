const MAX_REQUEST_BYTES = 16 * 1024;
export const MAX_OFFER_CHARS = 4000;
export const MAX_REFERENCE_CHARS = 2048;
export const MAX_QUESTION_ID_CHARS = 120;
export const MAX_ACTIVE_OFFERS = 250;
export const RETENTION_DAYS = 30;
const RECEIPT_BYTES = 32;
const RECEIPT_RE = /^[A-Za-z0-9_-]{43}$/;

const encoder = new TextEncoder();

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function wantsJson(request) {
  return (request.headers.get("accept") || "").toLowerCase().includes("application/json");
}

export function htmlPage(title, bodyHtml) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)} — Hummingbird</title><link rel="stylesheet" href="/style.css"><meta name="robots" content="noindex"></head>
<body><header><a class="brand" href="/">Hummingbird</a><nav aria-label="Primary"><a href="/offer">Offer</a><a href="/how-it-works">Commons</a><a href="/decisions">Decisions</a></nav></header>
<main><p class="badge">Phase 2E — experimental participation</p>${bodyHtml}</main>
<footer><p><a href="/offer">&larr; Back to offers</a></p></footer></body></html>`;
}

export function resultResponse(request, status, title, bodyHtml, jsonBody, extraHeaders = {}) {
  const common = {
    "Cache-Control": "no-store, max-age=0",
    "X-Robots-Tag": "noindex",
    ...extraHeaders,
  };
  if (wantsJson(request)) {
    return Response.json(jsonBody, { status, headers: common });
  }
  return new Response(htmlPage(title, bodyHtml), {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", ...common },
  });
}

export function requireOfferDb(env) {
  if (!env || !env.OFFER_DB || typeof env.OFFER_DB.prepare !== "function") {
    throw new Error("OFFER_DB binding unavailable");
  }
  return env.OFFER_DB;
}

export async function readUrlEncodedForm(request) {
  const type = (request.headers.get("content-type") || "").split(";", 1)[0].trim().toLowerCase();
  if (type !== "application/x-www-form-urlencoded") {
    return { ok: false, status: 415, code: "unsupported_media_type", message: "Use a standard HTML form submission." };
  }

  const declared = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(declared) && declared > MAX_REQUEST_BYTES) {
    return { ok: false, status: 413, code: "request_too_large", message: "The submitted request is larger than the pilot limit." };
  }

  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.byteLength > MAX_REQUEST_BYTES) {
    return { ok: false, status: 413, code: "request_too_large", message: "The submitted request is larger than the pilot limit." };
  }

  return { ok: true, params: new URLSearchParams(new TextDecoder().decode(bytes)) };
}

export function normalizeOffer(params) {
  const body = String(params.get("offer") || "").trim();
  const referenceUrl = String(params.get("reference") || "").trim();
  const questionId = String(params.get("question_id") || "").trim();
  const bodyChars = Array.from(body).length;

  if (bodyChars < 1 || bodyChars > MAX_OFFER_CHARS) {
    return { ok: false, status: 400, code: "invalid_offer", message: `Offer text must be between 1 and ${MAX_OFFER_CHARS} characters.` };
  }

  if (referenceUrl) {
    if (Array.from(referenceUrl).length > MAX_REFERENCE_CHARS) {
      return { ok: false, status: 400, code: "invalid_reference", message: "Reference URL is too long." };
    }
    try {
      const parsed = new URL(referenceUrl);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error("unsupported protocol");
    } catch {
      return { ok: false, status: 400, code: "invalid_reference", message: "Reference must be an http: or https: URL." };
    }
  }

  if (questionId) {
    if (Array.from(questionId).length > MAX_QUESTION_ID_CHARS || !/^[A-Za-z0-9._:-]+$/.test(questionId)) {
      return { ok: false, status: 400, code: "invalid_question_id", message: "Question identifier is invalid." };
    }
  }

  return {
    ok: true,
    value: {
      body,
      referenceUrl: referenceUrl || null,
      questionId: questionId || null,
    },
  };
}

export async function sha256Hex(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function base64url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

export function newReceiptSecret() {
  const bytes = new Uint8Array(RECEIPT_BYTES);
  crypto.getRandomValues(bytes);
  return base64url(bytes);
}

export function validReceiptSecret(value) {
  return RECEIPT_RE.test(String(value || ""));
}

export function newOfferId() {
  return crypto.randomUUID();
}

export function isoNow(now = new Date()) {
  return now.toISOString();
}

export function expiryIso(now = new Date()) {
  return new Date(now.getTime() + RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

export function effectiveState(row, nowIso) {
  if (!row) return null;
  if (row.state !== "withdrawn" && row.state !== "expired" && row.expires_at <= nowIso) return "expired";
  return row.state;
}

export async function lookupByReceipt(db, receiptSecret) {
  if (!validReceiptSecret(receiptSecret)) return null;
  const hash = await sha256Hex(receiptSecret);
  return db.prepare(
    `SELECT id, state, state_reason, received_at, expires_at, question_id, resulting_record_id
       FROM experimental_offers
      WHERE receipt_hash = ?
      LIMIT 1`
  ).bind(hash).first();
}

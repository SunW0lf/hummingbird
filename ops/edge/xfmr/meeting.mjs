// The meeting carrier for xfmr.link (GET /meet), one round trip, no key.
// Copied from the hummingbird-lab transformer lab (labs/transformers/meeting.mjs,
// the one-round form; design note labs/xfmr/docs/MEETING_CARRIER.md §6),
// keeping only what the space runs plus the visitor's check for the tests.
// Pure Web Crypto, so it runs in Node and in a Worker.
//
//   1. visitor -> space   { visitor_commit }   hb1:meeting-visitor:sha256:<hex> of 32 random bytes it keeps
//   2. space   -> visitor { visitor_commit, space_half, space_commit, pulse, trace }
//   the visitor checks the reply and computes
//     carrier = HKDF-SHA256(ikm  = visitor_half || space_half,
//                           salt = "hummingbird/v1/meeting",
//                           info = canonical JSON { visitor_commit, space_commit, pulse })
//
// The space never sees the visitor's half and keeps nothing: no key, no state.

import { canonicalJson, digest, toBytes } from "./digest.mjs";

export const HALF_BYTES = 32;
export const PULSE_SOURCE = "drand-quicknet";
export const DRAND_QUICKNET_CHAIN = "52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971";
export const VISITOR_COMMIT_RE = /^hb1:meeting-visitor:sha256:[0-9a-f]{64}$/;
const QUICKNET_GENESIS_S = 1692803367;
const QUICKNET_PERIOD_S = 3;
const MAX_PULSE_AGE_ROUNDS = 5; // 15 seconds
const HEX64_RE = /^[0-9a-f]{64}$/;
const LABEL_RE = /^[A-Za-z0-9._:-]{1,64}$/;
const encoder = new TextEncoder();

export function b64url(bytes) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

export function fromB64url(text) {
  if (typeof text !== "string" || !/^[A-Za-z0-9_-]*$/.test(text)) throw new TypeError("not base64url");
  const s = atob(text.replaceAll("-", "+").replaceAll("_", "/"));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
}

function checkHalf(half, who) {
  if (!(half instanceof Uint8Array) || half.length !== HALF_BYTES) throw new TypeError(`${who} half must be ${HALF_BYTES} bytes`);
}

// A pulse is a public beacon round and its randomness, or null when none could
// be read. The randomness goes into the carrier's info, so the carrier could
// not have been made before that round was published.
export function checkPulse(pulse) {
  if (pulse === null) return null;
  if (typeof pulse !== "object" || Array.isArray(pulse)) throw new TypeError("pulse must be a beacon round or null");
  if (Object.keys(pulse).sort().join(",") !== "randomness,round,source") throw new TypeError("pulse must have source, round and randomness only");
  if (typeof pulse.source !== "string" || !LABEL_RE.test(pulse.source)) throw new TypeError("pulse source must be a short label");
  if (!(Number.isSafeInteger(pulse.round) && pulse.round > 0)) throw new TypeError("pulse round must be a positive whole number");
  if (typeof pulse.randomness !== "string" || !HEX64_RE.test(pulse.randomness)) throw new TypeError("pulse randomness must be 64 hex characters");
  return pulse;
}

// The trace names the pulse by source and round only: time, never secrecy.
export function pulseLabel(pulse) {
  return pulse === null ? "none" : `${pulse.source}:${pulse.round}`;
}

export function expectedQuicknetRound(nowMs) {
  return Math.floor((nowMs / 1000 - QUICKNET_GENESIS_S) / QUICKNET_PERIOD_S) + 1;
}

// Read the latest drand quicknet round. Any failure, slowness, odd reply or
// stale round (a public relay was seen weeks behind on 2026-11-19) gives null.
// The request carries nothing about the visitor.
export async function readDrandPulse(fetchFn, { base = "https://api.drand.sh", timeoutMs = 1500, now = Date.now() } = {}) {
  try {
    const res = await fetchFn(`${base}/${DRAND_QUICKNET_CHAIN}/public/latest`, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { accept: "application/json" },
    });
    if (!res.ok) return null;
    const body = await res.json();
    const pulse = checkPulse({ source: PULSE_SOURCE, round: body.round, randomness: body.randomness });
    const expected = expectedQuicknetRound(now);
    if (pulse.round < expected - MAX_PULSE_AGE_ROUNDS || pulse.round > expected + 1) return null;
    return pulse;
  } catch {
    return null;
  }
}

// The space's side: draw a half, show it with its commitment, keep nothing.
export async function spaceMeetOnce({ visitor_commit, pulse }) {
  if (!VISITOR_COMMIT_RE.test(String(visitor_commit))) throw new TypeError("visitor_commit must be a meeting-visitor digest");
  checkPulse(pulse);
  const half = crypto.getRandomValues(new Uint8Array(HALF_BYTES));
  try {
    return {
      visitor_commit,
      space_half: b64url(half),
      space_commit: await digest("meeting-space", half),
      pulse,
      trace: { carrier: { kind: "meeting", grain: "2x32B", pulse: pulseLabel(pulse) } },
    };
  } finally {
    half.fill(0);
  }
}

// The carrier both sides could compute once both halves are open. Only the
// visitor ever holds both.
export async function meetingCarrier(visitorHalf, spaceHalf, { visitor_commit, space_commit, pulse }) {
  checkHalf(visitorHalf, "visitor");
  checkHalf(spaceHalf, "space");
  const ikm = new Uint8Array(HALF_BYTES * 2);
  ikm.set(visitorHalf, 0);
  ikm.set(spaceHalf, HALF_BYTES);
  try {
    const key = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits(
      {
        name: "HKDF",
        hash: "SHA-256",
        salt: encoder.encode("hummingbird/v1/meeting"),
        info: toBytes(canonicalJson({ visitor_commit, space_commit, pulse })),
      },
      key,
      256,
    );
    return new Uint8Array(bits);
  } finally {
    ikm.fill(0);
  }
}

// The visitor's side after the reply (here for the tests and as a reference).
export async function visitorCloseOnce(half, reply) {
  checkHalf(half, "visitor");
  const visitor_commit = await digest("meeting-visitor", half);
  if (reply.visitor_commit !== visitor_commit) throw new Error("reply answers a different visitor commitment");
  checkPulse(reply.pulse);
  const spaceHalf = fromB64url(reply.space_half);
  try {
    checkHalf(spaceHalf, "space");
    if ((await digest("meeting-space", spaceHalf)) !== reply.space_commit) throw new Error("space half does not match its commitment");
    return await meetingCarrier(half, spaceHalf, { visitor_commit, space_commit: reply.space_commit, pulse: reply.pulse });
  } finally {
    spaceHalf.fill(0);
  }
}

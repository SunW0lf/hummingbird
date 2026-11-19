// Flavored digests for xfmr.link packets. Copied from the hummingbird-lab
// transformer lab (labs/transformers/digest.mjs at 3d434e2), keeping only the
// public labelled flavor. Pure Web Crypto, so it runs in Node and in a Worker.
//
//   hb1:<purpose>:sha256:<hex>, hex = SHA-256("hummingbird/v1/<purpose>" || 0x00 || bytes)

const encoder = new TextEncoder();
const PURPOSE_RE = /^[a-z][a-z0-9-]{0,31}$/;
export const PREFIX = "hb1";
export const DIGEST_RE = /^hb1:[a-z][a-z0-9-]{0,31}:sha256:[0-9a-f]{64}$/;

export function toBytes(value) {
  if (value instanceof Uint8Array) return value;
  if (typeof value === "string") return encoder.encode(value);
  throw new TypeError("digest input must be a string or Uint8Array");
}

export function domainSeparated(purpose, bytes) {
  if (!PURPOSE_RE.test(String(purpose))) throw new TypeError(`invalid purpose: ${purpose}`);
  const label = encoder.encode(`hummingbird/v1/${purpose}`);
  const body = toBytes(bytes);
  const out = new Uint8Array(label.length + 1 + body.length);
  out.set(label, 0);
  out[label.length] = 0;
  out.set(body, label.length + 1);
  return out;
}

export function hex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function digest(purpose, bytes) {
  const h = await crypto.subtle.digest("SHA-256", domainSeparated(purpose, bytes));
  return `${PREFIX}:${purpose}:sha256:${hex(h)}`;
}

// Canonical JSON: sorted keys, no whitespace. Recipes, inputs and outputs are
// hashed in this form so the same value always gives the same digest.
export function canonicalJson(value) {
  if (value === null || typeof value !== "object") {
    if (typeof value === "number" && !Number.isFinite(value)) throw new TypeError("non-finite number");
    if (value === undefined) throw new TypeError("undefined is not JSON");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const keys = Object.keys(value).filter((k) => value[k] !== undefined).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(",")}}`;
}

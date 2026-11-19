#!/usr/bin/env node
// Re-keys the stored offer-text hashes to the current OFFER_CONTENT_KEY
// (ADR 0027). Run by the key-rotation workflow right after a new key is
// deployed, so every active offer can still be grouped with a later exact
// repeat, and so no hash made with a retired key (or an old plain SHA-256)
// remains anywhere in the buffer. Rows without text keep no hash at all.
//
// It reads offer text only in memory, to recompute each hash, and never prints
// text, hashes or provider identifiers.
import process from "node:process";
import { pathToFileURL } from "node:url";

import { keyedContentHex, offerContentKeyBytes } from "../lib/offer-runtime.mjs";

export async function rekeyOfferContent({ d1, keyBytes }) {
  if (!keyBytes) throw new Error("missing or invalid offer content key");
  const rows = await d1("SELECT id, body FROM experimental_offers WHERE body IS NOT NULL", []);
  let rekeyed = 0;
  for (const row of rows) {
    const hash = await keyedContentHex(keyBytes, row.body);
    await d1("UPDATE experimental_offers SET content_sha256 = ? WHERE id = ? AND body IS NOT NULL", [hash, row.id]);
    rekeyed += 1;
  }
  await d1("UPDATE experimental_offers SET content_sha256 = NULL WHERE body IS NULL AND content_sha256 IS NOT NULL", []);
  return { rekeyed };
}

function cloudflareD1({ accountId, token, dbName }) {
  const api = "https://api.cloudflare.com/client/v4";
  let dbId = null;
  async function cf(method, endpoint, body) {
    const response = await fetch(`${api}${endpoint}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.success) throw new Error("Cloudflare API operation failed");
    return payload;
  }
  return async (sql, params) => {
    if (!dbId) {
      const listed = await cf("GET", `/accounts/${accountId}/d1/database?per_page=100`);
      const matches = (listed.result || []).filter((db) => db.name === dbName);
      if (matches.length !== 1) throw new Error("unexpected offer database count");
      dbId = matches[0].uuid || matches[0].id;
    }
    const payload = await cf("POST", `/accounts/${accountId}/d1/database/${dbId}/query`, { sql, params });
    return payload.result?.[0]?.results || [];
  };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_D1_RECOVERY_TOKEN;
  const keyBytes = offerContentKeyBytes(process.env);
  if (!accountId || !token || !keyBytes) {
    console.error("missing account configuration, D1 credential, or a valid offer content key");
    process.exit(1);
  }
  try {
    const { rekeyed } = await rekeyOfferContent({
      d1: cloudflareD1({ accountId, token, dbName: process.env.HUMMINGBIRD_OFFER_DB_NAME || "hummingbird-offer-buffer" }),
      keyBytes,
    });
    console.log(`Re-keyed ${rekeyed} stored offer hash(es); offers without text keep none.`);
  } catch {
    console.error("offer re-key failed; provider response details were intentionally not logged");
    process.exit(1);
  }
}

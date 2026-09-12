#!/usr/bin/env node
// Run only in the private review companion. Never print offer data to Actions logs.
import fs from "node:fs";
import process from "node:process";

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const D1_TOKEN = process.env.CLOUDFLARE_D1_RECOVERY_TOKEN;
const DB_NAME = process.env.HUMMINGBIRD_OFFER_DB_NAME || "hummingbird-offer-buffer";
const OUTPUT = process.argv[2];
const API = "https://api.cloudflare.com/client/v4";
const PAGE_SIZE = 100;
const MAX_OFFERS = 1000;

async function cf(method, endpoint, body) {
  const response = await fetch(`${API}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${D1_TOKEN}`,
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) throw new Error("Cloudflare API operation failed");
  return payload;
}

async function main() {
  if (!ACCOUNT_ID || !D1_TOKEN || !OUTPUT) throw new Error("missing review configuration");
  const listed = await cf("GET", `/accounts/${ACCOUNT_ID}/d1/database?per_page=100`);
  const matches = (listed.result || []).filter((db) => db.name === DB_NAME);
  if (matches.length !== 1) throw new Error("unexpected offer database count");
  const id = matches[0].uuid || matches[0].id;
  const now = new Date().toISOString();
  const offers = [];
  for (let offset = 0; offset <= MAX_OFFERS; offset += PAGE_SIZE) {
    const response = await cf("POST", `/accounts/${ACCOUNT_ID}/d1/database/${id}/query`, {
      sql: `SELECT id, body, reference_url, question_id, state, received_at, expires_at
              FROM experimental_offers
             WHERE expires_at > ? AND state IN ('received','grouped')
             ORDER BY received_at, id LIMIT ? OFFSET ?`,
      params: [now, PAGE_SIZE, offset],
    });
    const query = response.result?.[0];
    if (query?.success !== true || !Array.isArray(query.results)) throw new Error("invalid review query result");
    if (offers.length + query.results.length > MAX_OFFERS) throw new Error("review packet limit exceeded");
    for (const row of query.results) {
      if (typeof row.id !== "string" || typeof row.body !== "string" || typeof row.state !== "string") {
        throw new Error("invalid review row");
      }
      offers.push(row);
    }
    if (query.results.length < PAGE_SIZE) break;
  }
  // Exclusive creation prevents accidentally replacing an earlier packet. The
  // private workflow uploads this file with a one-day artifact lifetime.
  fs.writeFileSync(OUTPUT, JSON.stringify({ version: 1, observed_at: now, offers }), { flag: "wx", mode: 0o600 });
  console.log("Private offer review packet prepared.");
}

main().catch(() => {
  console.error("offer review export failed; provider and offer details were intentionally not logged");
  process.exit(1);
});

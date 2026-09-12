#!/usr/bin/env node
import process from "node:process";

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const D1_TOKEN = process.env.CLOUDFLARE_D1_RECOVERY_TOKEN;
const DB_NAME = process.env.HUMMINGBIRD_OFFER_DB_NAME || "hummingbird-offer-buffer";
const API = "https://api.cloudflare.com/client/v4";

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

async function databaseId() {
  const listed = await cf("GET", `/accounts/${ACCOUNT_ID}/d1/database?per_page=100`, undefined);
  const matches = (listed.result || []).filter((db) => db.name === DB_NAME);
  if (matches.length !== 1) throw new Error("unexpected offer database count");
  return matches[0].uuid || matches[0].id;
}

async function main() {
  if (!ACCOUNT_ID) throw new Error("missing account configuration");
  if (!D1_TOKEN) throw new Error("missing D1 observer credential");

  const id = await databaseId();
  const nowIso = new Date().toISOString();
  const result = await cf("POST", `/accounts/${ACCOUNT_ID}/d1/database/${id}/query`, {
    sql: `SELECT COUNT(*) AS pending_count
            FROM experimental_offers
           WHERE expires_at > ?
             AND state IN ('received','grouped','synthesized','deferred')`,
    params: [nowIso],
  });

  const query = result.result?.[0];
  if (query?.success !== true || query.results?.length !== 1) throw new Error("invalid pending count query result");
  const count = query.results[0]?.pending_count;
  if (!Number.isSafeInteger(count) || count < 0) throw new Error("invalid pending count");
  console.log(`HB_PENDING_COUNT=${count}`);
  console.log(`HB_OFFERS_PENDING=${count > 0}`);
  console.log("Offer observer completed without selecting offer content or identifiers.");
}

main().catch(() => {
  console.error("offer observer failed; provider response details were intentionally not logged");
  process.exit(1);
});

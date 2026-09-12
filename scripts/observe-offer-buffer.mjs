#!/usr/bin/env node
import fs from "node:fs";
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

function writeOutput(name, value) {
  if (!process.env.GITHUB_OUTPUT) return;
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`, "utf8");
}

async function main() {
  if (!ACCOUNT_ID) throw new Error("missing account configuration");
  if (!D1_TOKEN) throw new Error("missing D1 observer credential");

  const id = await databaseId();
  const nowIso = new Date().toISOString();
  const result = await cf("POST", `/accounts/${ACCOUNT_ID}/d1/database/${id}/query`, {
    sql: `SELECT CASE WHEN EXISTS (
            SELECT 1
              FROM experimental_offers
             WHERE expires_at > ?
               AND state IN ('received','grouped')
          ) THEN 1 ELSE 0 END AS review_needed`,
    params: [nowIso],
  });

  const reviewNeeded = Number(result.result?.[0]?.results?.[0]?.review_needed || 0) === 1;
  writeOutput("review_needed", reviewNeeded ? "true" : "false");
  console.log("Offer observer completed without emitting participant material, counts, identifiers, or timestamps.");
}

main().catch(() => {
  console.error("offer observer failed; provider response details were intentionally not logged");
  process.exit(1);
});

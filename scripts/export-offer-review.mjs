#!/usr/bin/env node
// Run only in the private review companion. Never print offer data to Actions logs.
import fs from "node:fs";
import process from "node:process";

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const D1_TOKEN = process.env.CLOUDFLARE_D1_RECOVERY_TOKEN;
const DB_NAME = process.env.HUMMINGBIRD_OFFER_DB_NAME || "hummingbird-offer-buffer";
const OUTPUT = process.argv[2];
const API = "https://api.cloudflare.com/client/v4";
const MAX_OFFERS = 250;

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
  // The pilot admits at most 250 active rows. One bounded query avoids OFFSET
  // gaps or duplicates if a withdrawal occurs during a paginated export.
  const response = await cf("POST", `/accounts/${ACCOUNT_ID}/d1/database/${id}/query`, {
    sql: `SELECT id, body, reference_url, question_id, state, received_at, expires_at
            FROM experimental_offers
           WHERE expires_at > ? AND state IN ('received','grouped','synthesized','deferred')
           ORDER BY received_at, id LIMIT ?`,
    params: [now, MAX_OFFERS + 1],
  });
  const query = response.result?.[0];
  if (query?.success !== true || !Array.isArray(query.results) || query.results.length > MAX_OFFERS) {
    throw new Error("invalid or oversized review query result");
  }
  const groups = [];
  const byText = new Map();
  for (const row of query.results) {
    if (typeof row.id !== "string" || typeof row.body !== "string" || typeof row.state !== "string") {
      throw new Error("invalid review row");
    }
    let group = byText.get(row.body);
    if (!group) {
      group = { body: row.body, count: 0, members: [] };
      byText.set(row.body, group);
      groups.push(group);
    }
    group.count += 1;
    group.members.push({
      id: row.id, state: row.state, reference_url: row.reference_url,
      question_id: row.question_id, received_at: row.received_at, expires_at: row.expires_at,
    });
  }
  // Exclusive creation prevents accidentally replacing an earlier packet. The
  // private workflow uploads this file with a one-day artifact lifetime.
  fs.writeFileSync(OUTPUT, JSON.stringify({ version: 2, observed_at: now, unresolved_count: query.results.length, groups }), { flag: "wx", mode: 0o600 });
  console.log("Private offer review packet prepared.");
}

main().catch(() => {
  console.error("offer review export failed; provider and offer details were intentionally not logged");
  process.exit(1);
});

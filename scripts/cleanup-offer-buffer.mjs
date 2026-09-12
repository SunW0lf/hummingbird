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
  if (!response.ok || !payload?.success) {
    const message = (payload?.errors || []).map((item) => item?.message).filter(Boolean).join("; ");
    throw new Error(`Cloudflare API request failed (${response.status})${message ? `: ${message}` : ""}`);
  }
  return payload;
}

async function databaseId() {
  const listed = await cf("GET", `/accounts/${ACCOUNT_ID}/d1/database?per_page=100`, undefined);
  const matches = (listed.result || []).filter((db) => db.name === DB_NAME);
  if (matches.length !== 1) throw new Error(`expected exactly one D1 database named ${DB_NAME}; found ${matches.length}`);
  return matches[0].uuid || matches[0].id;
}

async function main() {
  if (!ACCOUNT_ID) throw new Error("CLOUDFLARE_ACCOUNT_ID is required");
  if (!D1_TOKEN) throw new Error("CLOUDFLARE_D1_RECOVERY_TOKEN is required");

  const id = await databaseId();
  const now = new Date();
  const nowIso = now.toISOString();
  const tombstoneCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  await cf("POST", `/accounts/${ACCOUNT_ID}/d1/database/${id}/query`, {
    batch: [
      {
        sql: "DELETE FROM offer_cluster_members WHERE offer_id IN (SELECT id FROM experimental_offers WHERE expires_at <= ? AND state NOT IN ('withdrawn','expired'))",
        params: [nowIso],
      },
      {
        sql: "UPDATE experimental_offers SET body=NULL, reference_url=NULL, question_id=NULL, state='expired', state_reason='retention-ended', cluster_id=NULL, synthesis_ref=NULL, resulting_record_id=NULL, content_sha256=NULL WHERE expires_at <= ? AND state NOT IN ('withdrawn','expired')",
        params: [nowIso],
      },
      {
        sql: "DELETE FROM experimental_offers WHERE state IN ('withdrawn','expired') AND expires_at <= ?",
        params: [tombstoneCutoff],
      },
      {
        sql: "DELETE FROM offer_clusters WHERE expires_at <= ? OR NOT EXISTS (SELECT 1 FROM experimental_offers o WHERE o.cluster_id = offer_clusters.id AND o.state NOT IN ('withdrawn','expired'))",
        params: [nowIso],
      }
    ]
  });

  console.log("Offer-buffer expiry cleanup completed without emitting participant material or provider identifiers.");
}

main().catch((error) => {
  console.error(`offer-buffer cleanup failed: ${error.message}`);
  process.exit(1);
});

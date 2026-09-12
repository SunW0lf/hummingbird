#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const D1_TOKEN = process.env.CLOUDFLARE_D1_RECOVERY_TOKEN;
const PAGES_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const PROJECT = process.env.CLOUDFLARE_PAGES_PROJECT || "hummingbird";
const DB_NAME = process.env.HUMMINGBIRD_OFFER_DB_NAME || "hummingbird-offer-buffer";
const API = "https://api.cloudflare.com/client/v4";

function requireEnv(name, value) {
  if (!value) throw new Error(`${name} is required`);
}

async function cf(token, method, endpoint, body) {
  const response = await fetch(`${API}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) {
    const error = new Error("Cloudflare API operation failed");
    error.status = response.status;
    throw error;
  }
  return payload;
}

async function findOrCreateDatabase() {
  const listed = await cf(D1_TOKEN, "GET", `/accounts/${ACCOUNT_ID}/d1/database?per_page=100`, undefined);
  const matches = (listed.result || []).filter((db) => db.name === DB_NAME);
  if (matches.length > 1) throw new Error("ambiguous offer database state");
  if (matches.length === 1) {
    console.log("Offer D1 resource already exists by expected name; reusing it.");
    return matches[0].uuid || matches[0].id;
  }

  const created = await cf(D1_TOKEN, "POST", `/accounts/${ACCOUNT_ID}/d1/database`, {
    name: DB_NAME,
    read_replication: { mode: "disabled" },
  });
  const id = created.result?.uuid || created.result?.id;
  if (!id) throw new Error("offer database creation returned no resource identifier");
  console.log("Created dedicated offer D1 resource.");
  return id;
}

async function queryDatabase(databaseId, body) {
  return cf(D1_TOKEN, "POST", `/accounts/${ACCOUNT_ID}/d1/database/${databaseId}/query`, body);
}

async function ensureSchema(databaseId) {
  const probe = await queryDatabase(databaseId, {
    sql: "SELECT name FROM sqlite_master WHERE type='table' AND name='experimental_offers'",
  });
  const rows = probe.result?.[0]?.results || [];
  if (rows.length === 0) {
    const migrationPath = path.join(ROOT, "experimental", "offer-buffer", "migrations", "0001_offer_buffer.sql");
    const sql = fs.readFileSync(migrationPath, "utf8");
    await queryDatabase(databaseId, { sql });
    console.log("Applied experimental offer-buffer migration 0001.");
  } else {
    console.log("Experimental offer-buffer schema already present; leaving data intact.");
  }

  const verify = await queryDatabase(databaseId, {
    sql: "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('experimental_offers','offer_clusters','offer_cluster_members') ORDER BY name",
  });
  const names = (verify.result?.[0]?.results || []).map((row) => row.name);
  for (const required of ["experimental_offers", "offer_clusters", "offer_cluster_members"]) {
    if (!names.includes(required)) throw new Error("offer database schema verification failed");
  }
}

async function bindPages(databaseId) {
  const project = await cf(PAGES_TOKEN, "GET", `/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT}`, undefined);
  const existing = project.result?.deployment_configs?.production?.d1_databases || {};
  const merged = { ...existing, OFFER_DB: { id: databaseId } };

  await cf(PAGES_TOKEN, "PATCH", `/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT}`, {
    deployment_configs: {
      production: {
        d1_databases: merged,
      },
    },
  });

  const verified = await cf(PAGES_TOKEN, "GET", `/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT}`, undefined);
  const boundId = verified.result?.deployment_configs?.production?.d1_databases?.OFFER_DB?.id;
  if (boundId !== databaseId) throw new Error("Pages production OFFER_DB binding verification failed");
  console.log("Verified Pages production binding OFFER_DB without printing provider identifiers.");
}

async function main() {
  requireEnv("CLOUDFLARE_ACCOUNT_ID", ACCOUNT_ID);
  requireEnv("CLOUDFLARE_D1_RECOVERY_TOKEN", D1_TOKEN);
  requireEnv("CLOUDFLARE_API_TOKEN", PAGES_TOKEN);

  const databaseId = await findOrCreateDatabase();
  await ensureSchema(databaseId);
  await bindPages(databaseId);
  console.log("Phase 2E offer storage is provisioned, migrated, and bound. No participant write surface was deployed by this script.");
}

main().catch(() => {
  console.error("offer-pilot provisioning failed; provider response details were intentionally not logged");
  process.exit(1);
});

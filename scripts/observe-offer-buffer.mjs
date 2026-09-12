#!/usr/bin/env node
import fs from "node:fs";
import process from "node:process";
import { constants, publicEncrypt } from "node:crypto";

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const D1_TOKEN = process.env.CLOUDFLARE_D1_RECOVERY_TOKEN;
const DB_NAME = process.env.HUMMINGBIRD_OFFER_DB_NAME || "hummingbird-offer-buffer";
const API = "https://api.cloudflare.com/client/v4";
const SIGNAL_PUBLIC_KEY = new URL("../ops/offer-signal-public.pem", import.meta.url);

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

function encryptedSignal(reviewNeeded) {
  const publicKey = fs.readFileSync(SIGNAL_PUBLIC_KEY, "utf8");
  const payload = Buffer.from(JSON.stringify({ v: 1, review_needed: reviewNeeded }), "utf8");
  return publicEncrypt(
    {
      key: publicKey,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    payload,
  ).toString("base64");
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
  console.log(`HB_OFFER_SIGNAL=${encryptedSignal(reviewNeeded)}`);
  console.log("Offer observer completed successfully. Pending-review state is emitted only as an opaque encrypted signal.");
}

main().catch(() => {
  console.error("offer observer failed; provider response details were intentionally not logged");
  process.exit(1);
});

#!/usr/bin/env node
import process from "node:process";

const base = (process.env.HEALTHCHECK_URL || "https://datum.quest").replace(/\/$/, "");
const headers = {
  "Content-Type": "application/x-www-form-urlencoded",
  Accept: "application/json",
  "User-Agent": "hummingbird-offer-launch-smoke/1.0",
};

async function post(path, params, expected) {
  const response = await fetch(`${base}${path}`, {
    method: "POST",
    headers,
    body: new URLSearchParams(params).toString(),
    redirect: "manual",
  });
  const payload = await response.json().catch(() => null);
  if (response.status !== expected || !payload) {
    throw new Error(`${path} returned ${response.status}, expected ${expected}`);
  }
  return payload;
}

async function main() {
  const marker = `Launch smoke ${crypto.randomUUID()}`;
  const accepted = await post("/offer", { offer: marker, question_id: "launch-smoke" }, 201);
  if (!accepted.accepted || !accepted.receipt || !accepted.offer_id) throw new Error("acceptance response missing receipt or offer id");

  const status = await post("/offer/status", { receipt: accepted.receipt }, 200);
  if (!status.ok || !["received", "grouped"].includes(status.state)) throw new Error("new offer status was not visible by receipt");

  const withdrawn = await post("/offer/withdraw", { receipt: accepted.receipt }, 200);
  if (!withdrawn.ok || withdrawn.state !== "withdrawn") throw new Error("withdrawal did not confirm withdrawn state");

  const after = await post("/offer/status", { receipt: accepted.receipt }, 200);
  if (!after.ok || after.state !== "withdrawn") throw new Error("withdrawn state was not durable for receipt lookup");

  console.log("Production offer lifecycle smoke passed: accept -> status -> withdraw -> status. Receipt and provider identifiers intentionally omitted.");
}

main().catch((error) => {
  console.error(`production offer lifecycle smoke failed: ${error.message}`);
  process.exit(1);
});

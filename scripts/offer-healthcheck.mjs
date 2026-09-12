#!/usr/bin/env node
import process from "node:process";

const base = (process.env.HEALTHCHECK_URL || "https://datum.quest").replace(/\/$/, "");
const marker = `Hummingbird production lifecycle smoke test ${Date.now().toString(36)}`;
let receipt = null;
let withdrawn = false;

function form(fields) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(fields)) params.set(key, value);
  return params;
}

async function post(path, fields) {
  return fetch(`${base}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      "User-Agent": "Hummingbird-production-offer-healthcheck/1.0",
    },
    body: form(fields),
    redirect: "manual",
  });
}

async function jsonResponse(response, expectedStatus, label) {
  const text = await response.text();
  if (response.status !== expectedStatus) {
    throw new Error(`${label}: expected HTTP ${expectedStatus}, got ${response.status}`);
  }
  const type = (response.headers.get("content-type") || "").toLowerCase();
  if (!type.includes("application/json")) {
    throw new Error(`${label}: expected JSON response, got ${type || "unknown content type"}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${label}: response was not valid JSON`);
  }
}

async function bestEffortWithdraw() {
  if (!receipt || withdrawn) return;
  try {
    const response = await post("/offer/withdraw", { receipt });
    if (response.status === 200) withdrawn = true;
  } catch {
    // Intentionally silent: the primary failure is reported by the caller.
  }
}

async function main() {
  const invalid = await post("/offer", { offer: "" });
  const invalidBody = await jsonResponse(invalid, 400, "validation failure check");
  if (invalidBody.accepted !== false || invalidBody.code !== "invalid_offer" || invalidBody.receipt) {
    throw new Error("validation failure check: invalid input did not fail closed without a receipt");
  }

  try {
    const accepted = await post("/offer", {
      offer: marker,
      question_id: "project-critique",
    });
    const acceptedBody = await jsonResponse(accepted, 201, "offer acceptance check");
    if (acceptedBody.accepted !== true || !acceptedBody.receipt || !acceptedBody.offer_id) {
      throw new Error("offer acceptance check: missing accepted receipt/id");
    }
    receipt = acceptedBody.receipt;

    const status = await post("/offer/status", { receipt });
    const statusBody = await jsonResponse(status, 200, "receipt status check");
    if (statusBody.offer_id !== acceptedBody.offer_id || !["received", "grouped"].includes(statusBody.state)) {
      throw new Error("receipt status check: unexpected offer identity/state");
    }

    const withdrawal = await post("/offer/withdraw", { receipt });
    const withdrawalBody = await jsonResponse(withdrawal, 200, "withdrawal check");
    if (withdrawalBody.offer_id !== acceptedBody.offer_id || withdrawalBody.state !== "withdrawn") {
      throw new Error("withdrawal check: temporary offer was not confirmed withdrawn");
    }
    withdrawn = true;

    const after = await post("/offer/status", { receipt });
    const afterBody = await jsonResponse(after, 200, "post-withdrawal status check");
    if (afterBody.state !== "withdrawn") {
      throw new Error("post-withdrawal status check: receipt did not report withdrawn");
    }

    console.log("PASS: production offer lifecycle accepted, status-checked, withdrawn, and confirmed withdrawn");
  } finally {
    await bestEffortWithdraw();
  }
}

main().catch(async () => {
  await bestEffortWithdraw();
  console.error("FAIL: production offer lifecycle smoke test failed; response bodies and receipt secrets were intentionally not logged");
  process.exit(1);
});

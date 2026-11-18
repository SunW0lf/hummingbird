import {
  effectiveState,
  escapeHtml,
  isoNow,
  lookupByReceipt,
  readUrlEncodedForm,
  requireOfferDb,
  resultResponse,
  sha256Hex,
  validReceiptSecret,
} from "../../lib/offer-runtime.mjs";

export async function onRequestGet(context) {
  return Response.redirect(new URL("/offer", context.request.url), 303);
}

export async function onRequestPost(context) {
  const request = context.request;
  let db;
  try {
    db = requireOfferDb(context.env);
  } catch {
    return resultResponse(
      request,
      503,
      "Withdrawal unavailable",
      "<h1>Withdrawal unavailable</h1><p>The experimental buffer is unavailable. Please try again later.</p>",
      { ok: false, code: "buffer_unavailable", retryable: true }
    );
  }

  const form = await readUrlEncodedForm(request);
  if (!form.ok) {
    return resultResponse(request, form.status, "Withdrawal unavailable", `<h1>Withdrawal unavailable</h1><p>${escapeHtml(form.message)}</p>`, { ok: false, code: form.code });
  }

  const receipt = String(form.params.get("receipt") || "").trim();
  if (!validReceiptSecret(receipt)) {
    return resultResponse(request, 404, "Receipt not found", "<h1>Receipt not found</h1><p>No temporary offer is available for that receipt.</p>", { ok: false, code: "receipt_not_found" });
  }

  const row = await lookupByReceipt(db, receipt);
  if (!row) {
    return resultResponse(request, 404, "Receipt not found", "<h1>Receipt not found</h1><p>No temporary offer is available for that receipt.</p>", { ok: false, code: "receipt_not_found" });
  }

  const nowIso = isoNow();
  const currentState = effectiveState(row, nowIso);
  if (currentState === "expired") {
    return resultResponse(request, 409, "Offer already expired", `<h1>Offer already expired</h1><p>Offer <code>${escapeHtml(row.id)}</code> is already outside active consideration.</p>`, { ok: false, code: "offer_expired", offer_id: row.id, state: "expired" });
  }

  if (currentState === "withdrawn") {
    return resultResponse(request, 200, "Offer withdrawn", `<h1>Offer withdrawn</h1><p>Offer <code>${escapeHtml(row.id)}</code> is already withdrawn from active experimental state.</p>`, { ok: true, offer_id: row.id, state: "withdrawn" });
  }

  const receiptHash = await sha256Hex(receipt);
  try {
    await db.batch([
      db.prepare("DELETE FROM offer_cluster_members WHERE offer_id = ?").bind(row.id),
      db.prepare(
        `UPDATE experimental_offers
            SET body = NULL,
                reference_url = NULL,
                question_id = NULL,
                state = 'withdrawn',
                state_reason = NULL,
                cluster_id = NULL,
                synthesis_ref = NULL,
                resulting_record_id = NULL,
                content_sha256 = NULL,
                withdrawn_at = ?
          WHERE id = ? AND receipt_hash = ?`
      ).bind(nowIso, row.id, receiptHash),
    ]);
  } catch {
    console.error("offer withdrawal failed; request and provider details were intentionally not logged");
    return resultResponse(request, 503, "Withdrawal unconfirmed", "<h1>Withdrawal unconfirmed</h1><p>The buffer could not confirm the withdrawal. Please retry; do not assume the offer was removed.</p>", { ok: false, code: "withdrawal_unconfirmed", retryable: true });
  }

  return resultResponse(
    request,
    200,
    "Offer withdrawn",
    `<h1>Offer withdrawn</h1><p>Offer <code>${escapeHtml(row.id)}</code> has been removed from active experimental state. Its body, reference, grouping link, and content hash were cleared.</p><p>A minimal receipt tombstone may remain until the original expiry so repeated status/withdrawal behavior remains coherent.</p>`,
    { ok: true, offer_id: row.id, state: "withdrawn", expires_at: row.expires_at }
  );
}

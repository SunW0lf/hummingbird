import {
  effectiveState,
  escapeHtml,
  isoNow,
  lookupByReceipt,
  readUrlEncodedForm,
  requireOfferDb,
  resultResponse,
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
      "Status unavailable",
      "<h1>Status unavailable</h1><p>The experimental buffer is unavailable. Please try again later.</p>",
      { ok: false, code: "buffer_unavailable", retryable: true }
    );
  }

  const form = await readUrlEncodedForm(request);
  if (!form.ok) {
    return resultResponse(request, form.status, "Status unavailable", `<h1>Status unavailable</h1><p>${escapeHtml(form.message)}</p>`, { ok: false, code: form.code });
  }

  const receipt = String(form.params.get("receipt") || "").trim();
  const row = await lookupByReceipt(db, receipt);
  if (!row) {
    return resultResponse(
      request,
      404,
      "Receipt not found",
      "<h1>Receipt not found</h1><p>No temporary offer is available for that receipt. It may be invalid, withdrawn past cleanup, or expired past cleanup.</p>",
      { ok: false, code: "receipt_not_found" }
    );
  }

  const nowIso = isoNow();
  const state = effectiveState(row, nowIso);
  const durableNote = row.resulting_record_id
    ? `<p>A separate canonical record reference exists: <code>${escapeHtml(row.resulting_record_id)}</code>. Temporary receipt actions do not erase that separate record.</p>`
    : "";

  return resultResponse(
    request,
    200,
    "Offer status",
    `<h1>Offer status</h1><p>Offer ID: <code>${escapeHtml(row.id)}</code></p><p>Current pilot-visible state: <strong>${escapeHtml(state)}</strong></p><p>Ordinary retention ends at <time datetime="${escapeHtml(row.expires_at)}">${escapeHtml(row.expires_at)}</time>.</p>${durableNote}`,
    {
      ok: true,
      offer_id: row.id,
      state,
      expires_at: row.expires_at,
      question_id: row.question_id || null,
      resulting_record_id: row.resulting_record_id || null,
    }
  );
}

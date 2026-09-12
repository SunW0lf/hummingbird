import {
  MAX_ACTIVE_OFFERS,
  effectiveState,
  escapeHtml,
  expiryIso,
  isoNow,
  newOfferId,
  newReceiptSecret,
  normalizeOffer,
  readUrlEncodedForm,
  requireOfferDb,
  resultResponse,
  sha256Hex,
} from "../../lib/offer-runtime.mjs";

export async function onRequestGet(context) {
  return context.next();
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
      "Offer not accepted",
      "<h1>Offer not accepted</h1><p>The experimental buffer is unavailable. Nothing was stored and no receipt was issued. Please try again later.</p>",
      { accepted: false, code: "buffer_unavailable", retryable: true }
    );
  }

  const form = await readUrlEncodedForm(request);
  if (!form.ok) {
    return resultResponse(
      request,
      form.status,
      "Offer not accepted",
      `<h1>Offer not accepted</h1><p>${escapeHtml(form.message)}</p>`,
      { accepted: false, code: form.code, message: form.message }
    );
  }

  const normalized = normalizeOffer(form.params);
  if (!normalized.ok) {
    return resultResponse(
      request,
      normalized.status,
      "Offer not accepted",
      `<h1>Offer not accepted</h1><p>${escapeHtml(normalized.message)}</p>`,
      { accepted: false, code: normalized.code, message: normalized.message }
    );
  }

  const now = new Date();
  const nowIso = isoNow(now);
  const expiresAt = expiryIso(now);

  try {
    const active = await db.prepare(
      `SELECT COUNT(*) AS count
         FROM experimental_offers
        WHERE expires_at > ?
          AND state NOT IN ('withdrawn','expired')`
    ).bind(nowIso).first();

    if (Number(active?.count || 0) >= MAX_ACTIVE_OFFERS) {
      return resultResponse(
        request,
        503,
        "Offer not accepted",
        `<h1>Offer not accepted</h1><p>The Phase 2E buffer has reached its current active-offer capacity of ${MAX_ACTIVE_OFFERS}. Nothing was stored and no receipt was issued.</p><p>This is a temporary pilot capacity limit, not a judgment about the offer.</p>`,
        { accepted: false, code: "pilot_capacity_reached", retryable: true, active_capacity: MAX_ACTIVE_OFFERS },
        { "Retry-After": "3600" }
      );
    }

    const { body, referenceUrl, questionId } = normalized.value;
    const contentHash = await sha256Hex(body);
    const receipt = newReceiptSecret();
    const receiptHash = await sha256Hex(receipt);
    const id = newOfferId();

    const duplicate = await db.prepare(
      `SELECT id, cluster_id
         FROM experimental_offers
        WHERE content_sha256 = ?
          AND expires_at > ?
          AND state NOT IN ('withdrawn','expired')
        ORDER BY received_at ASC
        LIMIT 1`
    ).bind(contentHash, nowIso).first();

    let state = "received";
    let clusterId = null;

    if (duplicate) {
      state = "grouped";
      clusterId = duplicate.cluster_id || `exact:${contentHash}`;
      await db.batch([
        db.prepare(
          `INSERT OR IGNORE INTO offer_clusters (id, working_summary, state, created_at, updated_at, expires_at)
           VALUES (?, NULL, 'active', ?, ?, ?)`
        ).bind(clusterId, nowIso, nowIso, expiresAt),
        db.prepare(
          `UPDATE experimental_offers
              SET state = 'grouped', cluster_id = ?
            WHERE content_sha256 = ?
              AND expires_at > ?
              AND state NOT IN ('withdrawn','expired','surfaced')`
        ).bind(clusterId, contentHash, nowIso),
        db.prepare(
          `INSERT INTO experimental_offers
            (id, body, reference_url, question_id, receipt_hash, state, cluster_id, content_sha256, received_at, expires_at)
           VALUES (?, ?, ?, ?, ?, 'grouped', ?, ?, ?, ?)`
        ).bind(id, body, referenceUrl, questionId, receiptHash, clusterId, contentHash, nowIso, expiresAt),
      ]);
    } else {
      await db.prepare(
        `INSERT INTO experimental_offers
          (id, body, reference_url, question_id, receipt_hash, state, content_sha256, received_at, expires_at)
         VALUES (?, ?, ?, ?, ?, 'received', ?, ?, ?)`
      ).bind(id, body, referenceUrl, questionId, receiptHash, contentHash, nowIso, expiresAt).run();
    }

    return resultResponse(
      request,
      201,
      "Offer received",
      `<h1>Offer received</h1>
       <p>Your offer entered Hummingbird's temporary Phase 2E buffer with state <strong>${escapeHtml(state)}</strong>.</p>
       <div class="callout"><strong>Save this private receipt now.</strong><p>Hummingbird stores only its cryptographic hash and cannot show this secret again.</p><p><code>${escapeHtml(receipt)}</code></p></div>
       <p>Offer ID: <code>${escapeHtml(id)}</code></p>
       <p>Ordinary experimental retention ends at <time datetime="${escapeHtml(expiresAt)}">${escapeHtml(expiresAt)}</time>.</p>
       <p>Receipt does not imply endorsement, publication, governance standing, or an individualized response.</p>`,
      { accepted: true, offer_id: id, receipt, state, expires_at: expiresAt }
    );
  } catch (error) {
    console.error("offer acceptance failed", error?.message || error);
    return resultResponse(
      request,
      503,
      "Offer not accepted",
      "<h1>Offer not accepted</h1><p>The buffer could not confirm a durable write. Nothing should be treated as accepted and no receipt was issued. Please try again later.</p>",
      { accepted: false, code: "write_unconfirmed", retryable: true }
    );
  }
}

import {
  MAX_ACTIVE_OFFERS,
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
    const { body, referenceUrl, questionId } = normalized.value;
    const contentHash = await sha256Hex(body);
    const receipt = newReceiptSecret();
    const receiptHash = await sha256Hex(receipt);
    const id = newOfferId();

    // The capacity predicate and write are one SQL statement. A separate
    // count-before-insert can admit concurrent requests past the pilot cap.
    const inserted = await db.prepare(
      `INSERT INTO experimental_offers
        (id, body, reference_url, question_id, receipt_hash, state, content_sha256, received_at, expires_at)
       SELECT ?, ?, ?, ?, ?, 'received', ?, ?, ?
        WHERE (SELECT COUNT(*) FROM experimental_offers
                WHERE expires_at > ? AND state NOT IN ('withdrawn','expired')) < ?`
    ).bind(id, body, referenceUrl, questionId, receiptHash, contentHash, nowIso, expiresAt, nowIso, MAX_ACTIVE_OFFERS).run();
    if (inserted?.success !== true || !Number.isSafeInteger(inserted.meta?.changes)) {
      throw new Error("unconfirmed offer insertion");
    }
    if (inserted.meta.changes === 0) {
      return resultResponse(
        request,
        503,
        "Offer not accepted",
        `<h1>Offer not accepted</h1><p>The Phase 2E buffer has reached its current active-offer capacity of ${MAX_ACTIVE_OFFERS}. Nothing was stored and no receipt was issued.</p><p>This is a temporary pilot capacity limit, not a judgment about the offer.</p>`,
        { accepted: false, code: "pilot_capacity_reached", retryable: true, active_capacity: MAX_ACTIVE_OFFERS },
        { "Retry-After": "3600" }
      );
    }
    if (inserted.meta.changes !== 1) throw new Error("unexpected offer insertion count");

    let state = "received";
    try {
      const clusterId = `exact:${contentHash}`;
      const duplicate = await db.prepare(
        `SELECT id
           FROM experimental_offers
          WHERE content_sha256 = ? AND id != ? AND expires_at > ?
            AND state IN ('received','grouped')
            AND (cluster_id IS NULL OR cluster_id = ?)
          ORDER BY received_at, id LIMIT 1`
      ).bind(contentHash, id, nowIso, clusterId).first();
      if (duplicate) {
        await db.batch([
          db.prepare(
            `INSERT OR IGNORE INTO offer_clusters (id, working_summary, state, created_at, updated_at, expires_at)
             VALUES (?, NULL, 'active', ?, ?, ?)`
          ).bind(clusterId, nowIso, nowIso, expiresAt),
          db.prepare(
            `UPDATE offer_clusters SET updated_at = ?, expires_at = MAX(expires_at, ?)
              WHERE id = ?`
          ).bind(nowIso, expiresAt, clusterId),
          db.prepare(
            `UPDATE experimental_offers SET state = 'grouped', cluster_id = ?
              WHERE content_sha256 = ? AND expires_at > ? AND state IN ('received','grouped')
                AND (cluster_id IS NULL OR cluster_id = ?)`
          ).bind(clusterId, contentHash, nowIso, clusterId),
          db.prepare(
            `INSERT OR IGNORE INTO offer_cluster_members (cluster_id, offer_id, added_at)
             SELECT ?, id, ? FROM experimental_offers
              WHERE cluster_id = ? AND expires_at > ? AND state IN ('received','grouped')`
          ).bind(clusterId, nowIso, clusterId, nowIso),
        ]);
        state = "grouped";
      }
    } catch {
      // The accepted row remains valid. Grouping is a derived convenience,
      // and the private reviewer can still compress by matching offer text.
      console.error("offer exact-grouping failed; accepted offer remains in buffer");
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
  } catch {
    console.error("offer acceptance failed; request and provider details were intentionally not logged");
    return resultResponse(
      request,
      503,
      "Offer not accepted",
      "<h1>Offer not accepted</h1><p>The buffer could not confirm a durable write. Nothing should be treated as accepted and no receipt was issued. Please try again later.</p>",
      { accepted: false, code: "write_unconfirmed", retryable: true }
    );
  }
}

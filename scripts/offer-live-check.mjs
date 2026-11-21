#!/usr/bin/env node
// On-demand live check of the offer receipt loop against production.
//
// It makes a few clearly marked test offers through each door a participant can
// use (a plain HTML form, the JSON form, and the MCP door for agents), then
// checks the stored rows against ADR 0018 and ADR 0027: the text is kept
// exactly, only the receipt's hash is stored, the text's hash is keyed, retention is thirty days (twenty-two for an answer to an ask), the receipt alone can see
// and withdraw an offer, and withdrawal clears the content. It also sweeps the
// whole buffer, by counts only, for content kept past the cleanup window.
//
// Every test row it created is deleted at the end, so no test material stays in
// the buffer or reaches review. It never prints offer text, receipts or
// provider identifiers.
import { createHash, randomBytes, randomUUID } from "node:crypto";
import process from "node:process";
import { pathToFileURL } from "node:url";

const DAY_MS = 24 * 60 * 60 * 1000;
const RETENTION_MS = 30 * DAY_MS;
const ASK_ANSWER_RETENTION_MS = 22 * DAY_MS; // ADR 0030 amendment: answers to a scoped ask
const CLEANUP_GRACE_MS = 7 * DAY_MS;
const TEST_QUESTION_ID = "live-check";

const sha256 = (value) => createHash("sha256").update(value).digest("hex");

export async function runLiveCheck({ base, fetchImpl, d1, log = console.log, now = () => new Date() }) {
  base = base.replace(/\/$/, "");
  const results = [];
  const created = new Set();
  const clusters = new Set();
  const tag = randomUUID();

  const check = (name, ok) => {
    results.push({ name, ok: Boolean(ok) });
    log(`${ok ? "PASS" : "FAIL"}: ${name}`);
    return Boolean(ok);
  };

  async function form(path, params, accept = "application/json") {
    const response = await fetchImpl(`${base}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: accept,
        "User-Agent": "hummingbird-offer-live-check/1.0",
      },
      body: new URLSearchParams(params).toString(),
      redirect: "manual",
    });
    const text = await response.text();
    let json = null;
    try { json = JSON.parse(text); } catch { /* HTML response */ }
    return { status: response.status, text, json };
  }

  let rpcId = 0;
  async function mcpTool(name, args) {
    const response = await fetchImpl(`${base}/offer/mcp`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", "User-Agent": "hummingbird-offer-live-check/1.0" },
      body: JSON.stringify({ jsonrpc: "2.0", id: ++rpcId, method: "tools/call", params: { name, arguments: args } }),
    });
    const payload = await response.json().catch(() => null);
    return payload?.result?.structuredContent ?? null;
  }

  async function row(id) {
    const rows = await d1("SELECT * FROM experimental_offers WHERE id = ?", [id]);
    return rows[0] || null;
  }

  async function memberCount(id) {
    const rows = await d1("SELECT COUNT(*) AS n FROM offer_cluster_members WHERE offer_id = ?", [id]);
    return Number(rows[0]?.n ?? -1);
  }

  // Checks that a freshly accepted offer is stored the way ADR 0018 promises.
  async function checkStored(door, accepted, text) {
    const stored = await row(accepted.offer_id);
    check(`${door}: offer is stored`, stored);
    if (!stored) return null;
    created.add(stored.id);
    if (stored.cluster_id) clusters.add(stored.cluster_id);
    check(`${door}: offer text is kept exactly`, stored.body === text);
    check(`${door}: only the receipt's hash is stored`, stored.receipt_hash === sha256(accepted.receipt));
    check(`${door}: the receipt itself appears nowhere in the row`, !Object.values(stored).some((v) => typeof v === "string" && v.includes(accepted.receipt)));
    check(`${door}: content hash is keyed, never a plain hash of the text`,
      /^[0-9a-f]{64}$/.test(stored.content_sha256 || "") && stored.content_sha256 !== sha256(text) &&
      stored.content_sha256 !== sha256(`hummingbird/v1/offer-content\u0000${text}`));
    const span = Date.parse(stored.expires_at) - Date.parse(stored.received_at);
    check(`${door}: retention is exactly 30 days`, span === RETENTION_MS);
    check(`${door}: the offerer was told the same expiry`, accepted.expires_at === stored.expires_at);
    return stored;
  }

  // Checks that withdrawal cleared the content and kept only the tombstone.
  async function checkWithdrawn(door, before) {
    const after = await row(before.id);
    check(`${door}: withdrawn row remains only as a tombstone`, after && after.state === "withdrawn" && after.withdrawn_at);
    check(`${door}: withdrawal cleared text, reference, question and hash`,
      after && after.body === null && after.reference_url === null && after.question_id === null && after.content_sha256 === null);
    check(`${door}: withdrawal removed grouping`, after && after.cluster_id === null && (await memberCount(before.id)) === 0);
    check(`${door}: withdrawal kept the original expiry`, after && after.expires_at === before.expires_at);
  }

  try {
    // 1. The JSON form: accept, look up, refuse the wrong receipt, withdraw.
    {
      const door = "JSON form";
      const text = `Live check ${tag} json`;
      const accepted = (await form("/offer", { offer: text, question_id: TEST_QUESTION_ID })).json;
      const ok = check(`${door}: offer accepted with a receipt`, accepted?.accepted === true && accepted.receipt && accepted.offer_id);
      if (ok) {
        const stored = await checkStored(door, accepted, text);
        const status = await form("/offer/status", { receipt: accepted.receipt });
        check(`${door}: receipt shows the offer's state`, status.status === 200 && ["received", "grouped"].includes(status.json?.state) && status.json?.offer_id === accepted.offer_id);

        const stranger = randomBytes(32).toString("base64url");
        const peek = await form("/offer/status", { receipt: stranger });
        check(`${door}: another receipt cannot see it`, peek.status === 404 && !peek.text.includes(accepted.offer_id));
        const grab = await form("/offer/withdraw", { receipt: stranger });
        check(`${door}: another receipt cannot withdraw it`, grab.status === 404 && (await row(accepted.offer_id))?.body === text);

        const withdrawn = await form("/offer/withdraw", { receipt: accepted.receipt });
        check(`${door}: its own receipt withdraws it`, withdrawn.status === 200 && withdrawn.json?.state === "withdrawn");
        if (stored) await checkWithdrawn(door, stored);
        const again = await form("/offer/status", { receipt: accepted.receipt });
        check(`${door}: receipt still reports it withdrawn`, again.status === 200 && again.json?.state === "withdrawn");
        const twice = await form("/offer/withdraw", { receipt: accepted.receipt });
        check(`${door}: withdrawing twice is harmless`, twice.status === 200 && twice.json?.state === "withdrawn");
      }
    }

    // 2. The plain HTML form a person uses with no JavaScript.
    {
      const door = "HTML form";
      const text = `Live check ${tag} html`;
      const page = await form("/offer", { offer: text, question_id: TEST_QUESTION_ID }, "text/html");
      const receipt = page.text.match(/<code>([A-Za-z0-9_-]{43})<\/code>/)?.[1];
      const offerId = page.text.match(/Offer ID: <code>([^<]+)<\/code>/)?.[1];
      const expires = page.text.match(/<time datetime="([^"]+)">/)?.[1];
      const ok = check(`${door}: page shows the receipt once, with a save warning`,
        page.status === 201 && receipt && offerId && page.text.includes("Save this private receipt"));
      if (ok) {
        const stored = await checkStored(door, { offer_id: offerId, receipt, expires_at: expires }, text);
        const withdrawn = await form("/offer/withdraw", { receipt });
        check(`${door}: its receipt withdraws it`, withdrawn.json?.state === "withdrawn");
        if (stored) await checkWithdrawn(door, stored);
      }
    }

    // 3. The MCP door agents use.
    {
      const door = "Agent door";
      const text = `Live check ${tag} mcp`;
      const accepted = await mcpTool("make_offer", { offer: text, question_id: TEST_QUESTION_ID });
      const ok = check(`${door}: make_offer accepted with a receipt`, accepted?.accepted === true && accepted.receipt && accepted.offer_id);
      if (ok) {
        const stored = await checkStored(door, accepted, text);
        const status = await mcpTool("offer_status", { receipt: accepted.receipt });
        check(`${door}: offer_status shows the offer's state`, status?.ok === true && status.offer_id === accepted.offer_id);
        const withdrawn = await mcpTool("withdraw_offer", { receipt: accepted.receipt });
        check(`${door}: withdraw_offer withdraws it`, withdrawn?.state === "withdrawn");
        if (stored) await checkWithdrawn(door, stored);
      }
    }

    // 4. Repetition is grouped, never dropped: both copies are kept.
    {
      const door = "Repeated offer";
      const text = `Live check ${tag} repeated`;
      const first = (await form("/offer", { offer: text, question_id: TEST_QUESTION_ID })).json;
      const second = (await form("/offer", { offer: text, question_id: TEST_QUESTION_ID })).json;
      const ok = check(`${door}: both copies accepted with their own receipts`,
        first?.accepted && second?.accepted && first.receipt !== second.receipt && first.offer_id !== second.offer_id);
      if (ok) {
        const a = await checkStored(`${door} (first)`, first, text);
        const b = await checkStored(`${door} (second)`, second, text);
        check(`${door}: both copies keep their text and are grouped together`,
          a && b && a.body === text && b.body === text && a.cluster_id && a.cluster_id === b.cluster_id && second.state === "grouped");
        check(`${door}: the group's id carries no form of the content hash`,
          a && a.cluster_id && a.content_sha256 && !a.cluster_id.includes(a.content_sha256) && !a.cluster_id.includes(sha256(text)));
        await form("/offer/withdraw", { receipt: first.receipt });
        const survivor = await row(second.offer_id);
        check(`${door}: withdrawing one copy leaves the other intact`, survivor?.body === text);
        await form("/offer/withdraw", { receipt: second.receipt });
      }
    }

    // 5. Whole-buffer retention sweep, by counts only. Content may sit up to
    // seven days past expiry before nightly cleanup (ADR 0018), plus a day of
    // slack for the cleanup schedule itself.
    {
      const cutoff = new Date(now().getTime() - CLEANUP_GRACE_MS - DAY_MS).toISOString();
      const [late] = await d1(
        "SELECT COUNT(*) AS n FROM experimental_offers WHERE expires_at <= ? AND (body IS NOT NULL OR reference_url IS NOT NULL OR content_sha256 IS NOT NULL)",
        [cutoff]
      );
      check("Buffer: no offer content kept past the cleanup window", Number(late?.n) === 0);
      const [stale] = await d1("SELECT COUNT(*) AS n FROM experimental_offers WHERE expires_at <= ?", [cutoff]);
      check("Buffer: no tombstone kept past the cleanup window", Number(stale?.n) === 0);
      const [span] = await d1(
        // 30 days, or 22 for an answer to a scoped ask. Withdrawal clears
        // question_id, so a withdrawn row may show either span.
        `SELECT COUNT(*) AS n FROM experimental_offers
          WHERE NOT ((julianday(expires_at) - julianday(received_at)) * 86400000 BETWEEN ? AND ?
                     AND (question_id IS NULL OR question_id NOT LIKE 'ask-%'))
            AND NOT ((julianday(expires_at) - julianday(received_at)) * 86400000 BETWEEN ? AND ?
                     AND (question_id IS NULL OR question_id LIKE 'ask-%'))`,
        [RETENTION_MS - 1000, RETENTION_MS + 1000, ASK_ANSWER_RETENTION_MS - 1000, ASK_ANSWER_RETENTION_MS + 1000]
      );
      check("Buffer: every stored offer has 30-day retention, or 22 for an answer to an ask", Number(span?.n) === 0);
      const [withdrawnContent] = await d1(
        "SELECT COUNT(*) AS n FROM experimental_offers WHERE state = 'withdrawn' AND (body IS NOT NULL OR reference_url IS NOT NULL OR content_sha256 IS NOT NULL)",
        []
      );
      check("Buffer: no withdrawn offer still holds content", Number(withdrawnContent?.n) === 0);
    }
  } catch (error) {
    check(`Live check finished without an unexpected error (${error?.name || "Error"})`, false);
  } finally {
    // Remove every test row this run created, by the ids the service returned.
    for (const id of created) {
      await d1("DELETE FROM offer_cluster_members WHERE offer_id = ?", [id]).catch(() => {});
      await d1("DELETE FROM experimental_offers WHERE id = ? AND (question_id = ? OR question_id IS NULL)", [id, TEST_QUESTION_ID]).catch(() => {});
    }
    for (const cluster of clusters) {
      await d1(
        "DELETE FROM offer_clusters WHERE id = ? AND NOT EXISTS (SELECT 1 FROM offer_cluster_members WHERE cluster_id = ?)",
        [cluster, cluster]
      ).catch(() => {});
    }
    let left = -1;
    try {
      const ids = [...created];
      const rows = ids.length
        ? await d1(`SELECT COUNT(*) AS n FROM experimental_offers WHERE id IN (${ids.map(() => "?").join(",")})`, ids)
        : [{ n: 0 }];
      left = Number(rows[0]?.n);
    } catch { /* reported below */ }
    check(`Cleanup: all ${created.size} test rows removed`, left === 0);
  }

  const failed = results.filter((r) => !r.ok).length;
  log(`${results.length - failed} of ${results.length} checks passed.`);
  return { results, failed };
}

function cloudflareD1({ accountId, token, dbName }) {
  const api = "https://api.cloudflare.com/client/v4";
  let dbId = null;
  async function cf(method, endpoint, body) {
    const response = await fetch(`${api}${endpoint}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.success) throw new Error("Cloudflare API operation failed");
    return payload;
  }
  return async (sql, params) => {
    if (!dbId) {
      const listed = await cf("GET", `/accounts/${accountId}/d1/database?per_page=100`);
      const matches = (listed.result || []).filter((db) => db.name === dbName);
      if (matches.length !== 1) throw new Error("unexpected offer database count");
      dbId = matches[0].uuid || matches[0].id;
    }
    const payload = await cf("POST", `/accounts/${accountId}/d1/database/${dbId}/query`, { sql, params });
    return payload.result?.[0]?.results || [];
  };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_D1_RECOVERY_TOKEN;
  if (!accountId || !token) {
    console.error("missing account configuration or D1 credential");
    process.exit(1);
  }
  const { failed } = await runLiveCheck({
    base: process.env.HEALTHCHECK_URL || "https://datum.quest",
    fetchImpl: fetch,
    d1: cloudflareD1({ accountId, token, dbName: process.env.HUMMINGBIRD_OFFER_DB_NAME || "hummingbird-offer-buffer" }),
  });
  process.exit(failed ? 1 : 0);
}

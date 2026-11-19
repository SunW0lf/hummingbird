// The MCP door (ADR 0026) must speak the protocol, expose only the six agreed
// tools, and reach offers only through the existing form handlers.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { onRequestPost, onRequestGet, TOOLS, MAX_RPC_BYTES } from "../functions/offer/mcp.js";
import { MAX_OFFER_CHARS, MAX_QUESTION_ID_CHARS, MAX_REFERENCE_CHARS } from "../lib/offer-runtime.mjs";

const ORIGIN = "https://datum.quest";
const assets = {
  "/llms.txt": new Response("# Hummingbird\nAn offer is not canonical admission.\n", { headers: { "Content-Type": "text/plain" } }),
  "/records/index.json": Response.json({ records: [{ id: "contribution-visible-consequence" }] }),
  "/records/contribution-visible-consequence.json": Response.json({ id: "contribution-visible-consequence" }),
};
const env = {
  ASSETS: {
    fetch: async (req) => {
      const hit = assets[new URL(req.url).pathname];
      return hit ? hit.clone() : new Response("not found", { status: 404 });
    },
  },
  // No OFFER_DB binding: offer tools must fail closed through the real handlers.
};

function rpc(body, headers = {}) {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  const request = new Request(`${ORIGIN}/offer/mcp`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", ...headers },
    body: text,
  });
  return onRequestPost({ request, env });
}

const call = async (name, args = {}) => (await (await rpc({ jsonrpc: "2.0", id: 9, method: "tools/call", params: { name, arguments: args } })).json()).result;

test("initialize negotiates a supported protocol version and advertises tools only", async () => {
  const res = await rpc({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "t", version: "0" } } });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.result.protocolVersion, "2025-06-18");
  assert.deepEqual(Object.keys(body.result.capabilities), ["tools"]);
  assert.match(body.result.instructions, /Acceptance is not admission/);

  const unknown = await (await rpc({ jsonrpc: "2.0", id: 2, method: "initialize", params: { protocolVersion: "1999-01-01" } })).json();
  assert.equal(unknown.result.protocolVersion, "2025-11-25");
});

test("notifications get 202 with no body; GET is refused", async () => {
  const res = await rpc({ jsonrpc: "2.0", method: "notifications/initialized" });
  assert.equal(res.status, 202);
  assert.equal(await res.text(), "");
  const get = await onRequestGet({ request: new Request(`${ORIGIN}/offer/mcp`), env });
  assert.equal(get.status, 405);
});

test("malformed, batched, oversized and non-JSON requests are rejected", async () => {
  assert.equal((await rpc("{not json")).status, 400);
  assert.equal((await rpc([{ jsonrpc: "2.0", id: 1, method: "ping" }])).status, 400);
  assert.equal((await rpc({ jsonrpc: "2.0", id: 1, method: "ping", params: { pad: "x".repeat(MAX_RPC_BYTES) } })).status, 413);
  assert.equal((await rpc("{}", { "Content-Type": "application/x-www-form-urlencoded" })).status, 415);
  const unknown = await (await rpc({ jsonrpc: "2.0", id: 5, method: "resources/list" })).json();
  assert.equal(unknown.error.code, -32601);
});

test("exposes exactly the six agreed tools, with limits matching the runtime", async () => {
  const listed = (await (await rpc({ jsonrpc: "2.0", id: 3, method: "tools/list" })).json()).result.tools;
  assert.deepEqual(listed.map((t) => t.name), ["read_guide", "list_records", "get_record", "make_offer", "offer_status", "withdraw_offer"]);
  const offer = TOOLS.find((t) => t.name === "make_offer");
  assert.equal(offer.inputSchema.properties.offer.maxLength, MAX_OFFER_CHARS);
  assert.equal(offer.inputSchema.properties.reference.maxLength, MAX_REFERENCE_CHARS);
  assert.equal(offer.inputSchema.properties.question_id.maxLength, MAX_QUESTION_ID_CHARS);
  assert.match(offer.description, /Acceptance is not admission/);
  for (const tool of TOOLS) assert.equal(tool.inputSchema.type, "object");
});

test("read tools return public assets", async () => {
  assert.match((await call("read_guide")).content[0].text, /not canonical admission/);
  assert.equal((await call("list_records")).structuredContent.records[0].id, "contribution-visible-consequence");
  assert.equal((await call("get_record", { id: "contribution-visible-consequence" })).isError, false);
  assert.equal((await call("get_record", { id: "../secrets" })).isError, true);
  assert.equal((await call("get_record", { id: "missing" })).isError, true);
});

test("offer tools go through the real handlers and fail closed without the buffer", async () => {
  const made = await call("make_offer", { offer: "hello" });
  assert.equal(made.isError, true);
  assert.equal(made.structuredContent.accepted, false);
  assert.equal(made.structuredContent.code, "buffer_unavailable");
  for (const name of ["offer_status", "withdraw_offer"]) {
    const res = await call(name, { receipt: "x" });
    assert.equal(res.isError, true);
    assert.equal(res.structuredContent.code, "buffer_unavailable");
  }
  const unknown = await (await rpc({ jsonrpc: "2.0", id: 7, method: "tools/call", params: { name: "delete_everything" } })).json();
  assert.equal(unknown.error.code, -32602);
});

test("the door reuses the form handlers and records nothing about callers", () => {
  const source = fs.readFileSync(new URL("../functions/offer/mcp.js", import.meta.url), "utf8");
  for (const handler of ['from "./index.js"', 'from "./status.js"', 'from "./withdraw.js"']) assert.ok(source.includes(handler));
  for (const forbidden of ["CF-Connecting-IP", "ip_address", "user_agent", "participant_id", "console.log", "OFFER_DB.prepare"]) {
    assert.ok(!source.includes(forbidden), `mcp.js must not contain ${forbidden}`);
  }
});

test("a successful offer returns the same receipt the form route issues, and status reads it back", async () => {
  const rows = [];
  const OFFER_DB = {
    prepare(sql) {
      return {
        bind(...args) {
          return {
            async run() {
              if (sql.includes("INSERT INTO experimental_offers")) {
                rows.push({ id: args[0], receipt_hash: args[4], state: "received", expires_at: args[7], question_id: args[3], resulting_record_id: null });
              }
              return { success: true, meta: { changes: 1 } };
            },
            async first() {
              if (sql.includes("WHERE receipt_hash = ?")) return rows.find((r) => r.receipt_hash === args[0]) || null;
              return null;
            },
          };
        },
      };
    },
    async batch() { return []; },
  };
  const withDb = { ...env, OFFER_DB };
  const send = async (name, args) => {
    const request = new Request(`${ORIGIN}/offer/mcp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }),
    });
    return (await (await onRequestPost({ request, env: withDb })).json()).result;
  };

  const made = await send("make_offer", { offer: "Please keep reading open." });
  assert.equal(made.isError, false);
  assert.equal(made.structuredContent.accepted, true);
  assert.equal(typeof made.structuredContent.receipt, "string");
  assert.equal(rows.length, 1);

  const status = await send("offer_status", { receipt: made.structuredContent.receipt });
  assert.equal(status.isError, false);
  assert.equal(status.structuredContent.offer_id, rows[0].id);

  const tooLong = await send("make_offer", { offer: "x".repeat(MAX_OFFER_CHARS + 1) });
  assert.equal(tooLong.isError, true);
  assert.equal(tooLong.structuredContent.code, "invalid_offer");
  assert.equal(rows.length, 1);
});

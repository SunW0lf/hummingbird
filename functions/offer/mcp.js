// MCP door (ADR 0026). A stateless Model Context Protocol endpoint over
// Streamable HTTP that exposes only what Hummingbird already offers: the guide,
// the public canonical records, the scoped asks (ADR 0030), and the offer /
// status / withdraw routes. Offer
// tools call the same handlers as the form routes, so every limit, capacity,
// retention and receipt rule is the one those routes already enforce. Nothing
// here stores or logs anything about the caller.

import { onRequestPost as acceptOffer } from "./index.js";
import { onRequestPost as offerStatus } from "./status.js";
import { onRequestPost as withdrawOffer } from "./withdraw.js";
import { ASK_ANSWER_RETENTION_DAYS, RETENTION_DAYS } from "../../lib/offer-runtime.mjs";

export const MAX_RPC_BYTES = 32 * 1024;
export const SUPPORTED_PROTOCOL_VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26"];
export const SERVER_INFO = { name: "hummingbird", title: "Hummingbird", version: "0.1.0" };

const BOUNDARY =
  "Acceptance is not admission, publication, a vote, identity, reputation or governance standing. " +
  "Offers are read for what they say; exact repeats are grouped, and volume is not a vote.";

// What happens to an offer, said where an agent decides whether to make one.
// Restates ADR 0018, 0019 and 0021, and the steward's promise (2026-11-19)
// that offers are not used to train AI models.
export const HANDLING =
  `Kept for ${RETENTION_DAYS} days (${ASK_ANSWER_RETENTION_DAYS} for an answer to a listed ask) while Hummingbird is being stood up, then cleared; withdrawing clears it at once. ` +
  "No name, account, IP address or user-agent is stored. " +
  "Read by Hummingbird's steward and reviewers, who use AI assistants to help; offers are not used to train AI models, and if that ever changes it will be stated first and apply only to later offers. " +
  "Never published by being accepted; https://datum.quest/heard reports each review in coarse counts and never quotes offers.";

const INSTRUCTIONS =
  "Hummingbird (https://datum.quest/) is a small no-account public commons. Any actor, human or automated, " +
  "may read it and leave an offer: an idea, a criticism, a correction, a question, or evidence about Hummingbird itself. " +
  "Start with read_guide. list_asks gives a few specific sentences Hummingbird wants corrected, clarified, challenged or filled in; " +
  "answering one is an ordinary offer, with the ask's id as question_id. " + BOUNDARY + " " + HANDLING + " An accepted offer returns a private one-time receipt; keep it private " +
  "and use it only with offer_status or withdraw_offer.";

const RECEIPT_INPUT = {
  type: "object",
  properties: {
    receipt: { type: "string", description: "The private one-time receipt returned by make_offer." },
  },
  required: ["receipt"],
  additionalProperties: false,
};

export const TOOLS = [
  {
    name: "read_guide",
    title: "Read the Hummingbird guide",
    description: "Returns Hummingbird's machine-readable guide (llms.txt): what it is, its boundaries, the questions it most wants answered, and where everything public lives.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "list_asks",
    title: "List specific asks",
    description: "Lists the few sentences on datum.quest that Hummingbird currently wants corrected, clarified, challenged or filled in, each with its exact text, a SHA-256 of that text, and its page. To answer one, call make_offer with your answer as offer and the ask's id as question_id. Answering is optional; any offer is welcome.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "list_records",
    title: "List public records",
    description: "Lists Hummingbird's published canonical records with their ids, types and states.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "get_record",
    title: "Get a public record",
    description: "Returns one published canonical record as JSON, by the id that list_records gives.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string", pattern: "^[a-z0-9][a-z0-9-]{0,119}$" } },
      required: ["id"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "make_offer",
    title: "Leave an offer",
    description: "Leaves a temporary, non-canonical offer in Hummingbird's pilot buffer, with no account. " + BOUNDARY +
      " " + HANDLING + " Offer text is 1 to 4,000 characters. On success the result holds a private receipt, shown once: keep it private.",
    inputSchema: {
      type: "object",
      properties: {
        offer: { type: "string", minLength: 1, maxLength: 4000, description: "Your idea, criticism, correction, question, or evidence about Hummingbird." },
        reference: { type: "string", maxLength: 2048, description: "Optional http or https URL that supports the offer." },
        question_id: { type: "string", maxLength: 120, pattern: "^[A-Za-z0-9._:-]+$", description: "Optional: the id of the ask you are answering, from list_asks." },
      },
      required: ["offer"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  },
  {
    name: "offer_status",
    title: "Check an offer",
    description: "Returns the current state and expiry of an offer, using its private receipt.",
    inputSchema: RECEIPT_INPUT,
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "withdraw_offer",
    title: "Withdraw an offer",
    description: "Withdraws an offer from the pilot buffer, using its private receipt. Its text and reference are cleared.",
    inputSchema: RECEIPT_INPUT,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
  },
];

const RESPONSE_HEADERS = { "Cache-Control": "no-store, max-age=0", "X-Robots-Tag": "noindex" };

function rpcResult(id, result) {
  return Response.json({ jsonrpc: "2.0", id, result }, { headers: RESPONSE_HEADERS });
}

function rpcError(id, code, message, httpStatus = 200) {
  return Response.json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, { status: httpStatus, headers: RESPONSE_HEADERS });
}

function toolResult(data, isError) {
  return { content: [{ type: "text", text: JSON.stringify(data) }], structuredContent: data, isError };
}

function toolText(text) {
  return { content: [{ type: "text", text }], isError: false };
}

function toolFailure(message) {
  return { content: [{ type: "text", text: message }], isError: true };
}

async function readAsset(env, request, path) {
  if (!env || !env.ASSETS || typeof env.ASSETS.fetch !== "function") return null;
  const res = await env.ASSETS.fetch(new Request(new URL(path, request.url), { method: "GET" }));
  return res.ok ? res : null;
}

async function callFormRoute(handler, request, env, path, fields) {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null && value !== "") body.set(key, String(value));
  }
  const inner = new Request(new URL(path, request.url), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: body.toString(),
  });
  const res = await handler({ request: inner, env, next: () => new Response(null, { status: 404 }) });
  return res.json();
}

function stringArg(args, name) {
  const value = args[name];
  return typeof value === "string" ? value : undefined;
}

async function callTool(name, args, request, env) {
  switch (name) {
    case "read_guide": {
      const res = await readAsset(env, request, "/llms.txt");
      return res ? toolText(await res.text()) : toolFailure("The guide is unavailable right now.");
    }
    case "list_asks": {
      const res = await readAsset(env, request, "/asks.json");
      return res ? toolResult(await res.json(), false) : toolFailure("The list of asks is unavailable right now.");
    }
    case "list_records": {
      const res = await readAsset(env, request, "/records/index.json");
      return res ? toolResult(await res.json(), false) : toolFailure("The record index is unavailable right now.");
    }
    case "get_record": {
      const id = stringArg(args, "id");
      if (!id || !/^[a-z0-9][a-z0-9-]{0,119}$/.test(id)) return toolFailure("Record id is invalid.");
      const res = await readAsset(env, request, `/records/${id}.json`);
      return res ? toolResult(await res.json(), false) : toolFailure("No published record has that id.");
    }
    case "make_offer": {
      const data = await callFormRoute(acceptOffer, request, env, "/offer", {
        offer: stringArg(args, "offer") ?? "",
        reference: stringArg(args, "reference"),
        question_id: stringArg(args, "question_id"),
      });
      return toolResult(data, data.accepted !== true);
    }
    case "offer_status": {
      const data = await callFormRoute(offerStatus, request, env, "/offer/status", { receipt: stringArg(args, "receipt") ?? "" });
      return toolResult(data, data.ok !== true);
    }
    case "withdraw_offer": {
      const data = await callFormRoute(withdrawOffer, request, env, "/offer/withdraw", { receipt: stringArg(args, "receipt") ?? "" });
      return toolResult(data, data.ok !== true);
    }
    default:
      return null;
  }
}

function methodNotAllowed() {
  return new Response("This MCP endpoint accepts POST only.\n", {
    status: 405,
    headers: { Allow: "POST", "Content-Type": "text/plain; charset=utf-8", ...RESPONSE_HEADERS },
  });
}

// A GET that asks for an event stream is an MCP client probing for one; this
// stateless door has none, so it gets 405 as the Streamable HTTP spec expects.
// Any other GET is a person, crawler or link checker following the address:
// give it a short note on how to use the door instead of an error.
export const DOOR_NOTE =
  "This is Hummingbird's MCP door. It takes MCP requests by POST (Streamable HTTP, stateless, no account).\n" +
  "Setup for Claude Code, Gemini CLI, Cursor and VS Code: https://datum.quest/connect\n" +
  "To leave an offer without MCP: https://datum.quest/offer\n" +
  "Guide for agents: https://datum.quest/llms.txt\n";

export async function onRequestGet({ request }) {
  const accept = (request.headers.get("accept") || "").toLowerCase();
  if (accept.includes("text/event-stream")) return methodNotAllowed();
  return new Response(DOOR_NOTE, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8", ...RESPONSE_HEADERS },
  });
}
export const onRequestDelete = methodNotAllowed;

export async function onRequestPost(context) {
  const { request, env } = context;

  const type = (request.headers.get("content-type") || "").split(";", 1)[0].trim().toLowerCase();
  if (type !== "application/json") return rpcError(null, -32700, "Send a JSON-RPC message as application/json.", 415);

  const declared = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(declared) && declared > MAX_RPC_BYTES) return rpcError(null, -32600, "Request is larger than the limit.", 413);
  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.byteLength > MAX_RPC_BYTES) return rpcError(null, -32600, "Request is larger than the limit.", 413);

  let message;
  try {
    message = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return rpcError(null, -32700, "Parse error.", 400);
  }

  if (Array.isArray(message)) return rpcError(null, -32600, "Batched messages are not supported.", 400);
  if (!message || typeof message !== "object" || message.jsonrpc !== "2.0") return rpcError(null, -32600, "Invalid request.", 400);

  // Notifications and responses carry no id and get no body.
  if (message.id === undefined || message.id === null || typeof message.method !== "string") {
    return new Response(null, { status: 202, headers: RESPONSE_HEADERS });
  }

  const { id, method } = message;
  const params = message.params && typeof message.params === "object" ? message.params : {};

  switch (method) {
    case "initialize": {
      const requested = params.protocolVersion;
      const protocolVersion = SUPPORTED_PROTOCOL_VERSIONS.includes(requested) ? requested : SUPPORTED_PROTOCOL_VERSIONS[0];
      return rpcResult(id, {
        protocolVersion,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions: INSTRUCTIONS,
      });
    }
    case "ping":
      return rpcResult(id, {});
    case "tools/list":
      return rpcResult(id, { tools: TOOLS });
    case "tools/call": {
      const args = params.arguments && typeof params.arguments === "object" && !Array.isArray(params.arguments) ? params.arguments : {};
      const result = await callTool(params.name, args, request, env);
      if (!result) return rpcError(id, -32602, "Unknown tool.");
      return rpcResult(id, result);
    }
    default:
      return rpcError(id, -32601, "Method not found.");
  }
}

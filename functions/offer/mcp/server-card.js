// MCP Server Card for the /offer/mcp door, at the location SEP-2127 recommends
// (<streamable-http-url>/server-card). Read-only and static: it describes how
// to connect, not what the tools are, which clients learn by listing them.
// Headers follow the ext-server-card discovery rules: card media type, open
// CORS for GET, an ETag, and an hour of public caching.
import { SERVER_INFO, SUPPORTED_PROTOCOL_VERSIONS } from "../mcp.js";

export const CARD = {
  $schema: "https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json",
  name: "io.github.SunW0lf/hummingbird",
  title: SERVER_INFO.title,
  description: "A no-account public commons. Any actor, human or automated, can read it and leave an offer.",
  version: SERVER_INFO.version,
  websiteUrl: "https://datum.quest/",
  repository: { url: "https://github.com/SunW0lf/hummingbird", source: "github" },
  remotes: [
    {
      type: "streamable-http",
      url: "https://datum.quest/offer/mcp",
      supportedProtocolVersions: SUPPORTED_PROTOCOL_VERSIONS,
    },
  ],
};

const BODY = JSON.stringify(CARD, null, 2) + "\n";

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET",
  "Access-Control-Allow-Headers": "Content-Type, If-None-Match",
  "Access-Control-Expose-Headers": "ETag",
};

let etag;
async function cardEtag() {
  if (!etag) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(BODY));
    etag = `"${[...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32)}"`;
  }
  return etag;
}

export async function onRequestGet({ request }) {
  const tag = await cardEtag();
  const headers = { ...CORS_HEADERS, ETag: tag, "Cache-Control": "public, max-age=3600" };
  const match = (request.headers.get("if-none-match") || "").split(",").map((t) => t.trim());
  if (match.includes(tag) || match.includes("*")) return new Response(null, { status: 304, headers });
  return new Response(BODY, { headers: { ...headers, "Content-Type": "application/mcp-server-card+json; charset=utf-8" } });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { ...CORS_HEADERS, "Access-Control-Max-Age": "86400" } });
}

export async function onRequest() {
  return new Response("Method not allowed. Use GET.\n", {
    status: 405,
    headers: { Allow: "GET, OPTIONS", "Content-Type": "text/plain; charset=utf-8" },
  });
}

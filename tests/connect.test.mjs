// The connect page and /.well-known/mcp.json tell agents and directories how
// to reach the MCP door. These checks keep both pointing at the one door the
// registry lists, and keep the site from claiming discovery it doesn't serve.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (rel) => fs.readFileSync(new URL(`../${rel}`, import.meta.url), "utf8");
const server = JSON.parse(read("server.json"));
const DOOR = server.remotes.find((r) => r.type === "streamable-http").url;
const contains = (text, needle) => text.split(needle).length > 1;

test("the registry entry names the one MCP door", () => {
  assert.equal(DOOR, "https://datum.quest/offer/mcp");
});

test("/.well-known/mcp.json is the registry entry, byte for byte, served as JSON", () => {
  assert.equal(read("app/.well-known/mcp.json"), read("server.json"));
  assert.match(read("app/_headers"), /\/\.well-known\/mcp\.json\n  Content-Type: application\/json; charset=utf-8/);
});

test("no A2A agent card is published, since Hummingbird serves no A2A endpoint", () => {
  for (const name of ["agent-card.json", "agent.json"]) {
    assert.ok(!fs.existsSync(new URL(`../app/.well-known/${name}`, import.meta.url)), `${name} must not exist`);
  }
});

test("every snippet on the connect page uses the registry door and no credential", () => {
  const page = read("app/connect.html");
  const urls = page.match(/https:\/\/datum\.quest\/offer\/mcp[^\s"'<]*/g) || [];
  assert.ok(urls.length >= 7, "expected the door in every client's snippet");
  for (const url of urls) assert.ok(url === DOOR || url === `${DOOR}/server-card`, `unexpected door URL: ${url}`);
  for (const snippet of [
    `claude mcp add --transport http hummingbird ${DOOR}`,
    `gemini mcp add --transport http hummingbird ${DOOR}`,
    `"httpUrl": "${DOOR}"`,
    `"url": "${DOOR}"`,
    `code --add-mcp '{"name":"hummingbird","type":"http","url":"${DOOR}"}'`,
    `"type": "http"`,
  ]) assert.ok(contains(page, snippet), `connect page is missing: ${snippet}`);
  assert.doesNotMatch(page, /api[_-]?key|bearer|authorization|headers"/i);
  // JSON snippets must parse once their HTML wrapper is removed.
  for (const block of page.match(/<pre><code>\{[\s\S]*?<\/code><\/pre>/g)) {
    JSON.parse(block.replace(/<\/?(pre|code)>/g, ""));
  }
});

test("the connect page names every tool the door serves", async () => {
  const { TOOLS } = await import("../functions/offer/mcp.js");
  const page = read("app/connect.html");
  for (const tool of TOOLS) assert.ok(contains(page, `<code>${tool.name}</code>`), `connect page omits ${tool.name}`);
});

test("llms.txt and More link the connect page and the server card", () => {
  const llms = read("app/llms.txt");
  assert.ok(contains(llms, "https://datum.quest/connect\n"));
  assert.ok(contains(llms, "https://datum.quest/offer/mcp/server-card\n"));
  assert.ok(contains(llms, "https://datum.quest/.well-known/ai-catalog.json\n"));
  assert.ok(contains(read("app/more.html"), 'href="connect.html"'));
});

test("the server card meets the v1 schema's rules and matches the registry entry", async () => {
  const { CARD } = await import("../functions/offer/mcp/server-card.js");
  const { SERVER_INFO, SUPPORTED_PROTOCOL_VERSIONS } = await import("../functions/offer/mcp.js");
  assert.equal(CARD.$schema, "https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json");
  for (const key of ["$schema", "name", "version", "description"]) assert.ok(CARD[key], `card is missing ${key}`);
  assert.match(CARD.name, /^[a-zA-Z0-9.-]+\/[a-zA-Z0-9._-]+$/);
  assert.equal(CARD.name, server.name);
  assert.equal(CARD.description, server.description);
  assert.ok(CARD.description.length <= 100);
  assert.equal(CARD.version, SERVER_INFO.version);
  assert.deepEqual(CARD.remotes.map((r) => [r.type, r.url]), server.remotes.map((r) => [r.type, r.url]));
  assert.deepEqual(CARD.remotes[0].supportedProtocolVersions, SUPPORTED_PROTOCOL_VERSIONS);
  // Cards describe how to connect; tools are listed by the server at runtime.
  for (const key of ["tools", "resources", "prompts", "headers"]) assert.equal(CARD[key], undefined);
  assert.equal(CARD.remotes[0].headers, undefined, "the door needs no credential header");
});

test("the server card is served with its media type, CORS, ETag and caching", async () => {
  const mod = await import("../functions/offer/mcp/server-card.js");
  const req = (headers = {}) => new Request(`${DOOR}/server-card`, { headers });
  const res = await mod.onRequestGet({ request: req({ Accept: "application/mcp-server-card+json" }) });
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type"), /^application\/mcp-server-card\+json/);
  assert.equal(res.headers.get("access-control-allow-origin"), "*");
  assert.equal(res.headers.get("access-control-allow-methods"), "GET");
  assert.equal(res.headers.get("access-control-expose-headers"), "ETag");
  assert.equal(res.headers.get("cache-control"), "public, max-age=3600");
  const tag = res.headers.get("etag");
  assert.match(tag, /^"[0-9a-f]{32}"$/);
  assert.deepEqual(JSON.parse(await res.text()), mod.CARD);
  const again = await mod.onRequestGet({ request: req({ "If-None-Match": tag }) });
  assert.equal(again.status, 304);
  const pre = await mod.onRequestOptions();
  assert.equal(pre.status, 204);
  assert.match(pre.headers.get("access-control-allow-headers"), /If-None-Match/);
  assert.equal((await mod.onRequest()).status, 405);
});

test("the AI Catalog lists the server card and nothing else", () => {
  const catalog = JSON.parse(read("app/.well-known/ai-catalog.json"));
  assert.equal(catalog.specVersion, "0.9");
  assert.deepEqual(catalog.entries, [{
    identifier: "urn:air:datum.quest:hummingbird:mcp",
    type: "application/mcp-server-card+json",
    url: `${DOOR}/server-card`,
  }]);
  assert.match(read("app/_headers"), /\/\.well-known\/ai-catalog\.json\n  Content-Type: application\/ai-catalog\+json; charset=utf-8/);
});

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
  for (const url of urls) assert.equal(url, DOOR);
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

test("llms.txt and More link the connect page", () => {
  const llms = read("app/llms.txt");
  assert.ok(contains(llms, "https://datum.quest/connect\n"));
  assert.ok(contains(llms, "https://datum.quest/.well-known/mcp.json\n"));
  assert.ok(contains(read("app/more.html"), 'href="connect.html"'));
});

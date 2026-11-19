// /.well-known/atproto-did proves the @datum.quest Bluesky handle. Bluesky
// reads the whole body as the DID, so it must be exactly one DID, nothing else.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("atproto-did holds exactly one did:plc and is served as text", () => {
  const body = fs.readFileSync(new URL("../app/.well-known/atproto-did", import.meta.url), "utf8");
  assert.match(body, /^did:plc:[a-z2-7]{24}$/);
  const headers = fs.readFileSync(new URL("../app/_headers", import.meta.url), "utf8");
  assert.match(headers, /\/\.well-known\/atproto-did\n  Content-Type: text\/plain; charset=utf-8/);
});

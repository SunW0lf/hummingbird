// The OpenAPI file describes the existing offer form routes. These checks keep
// it from drifting away from the runtime it describes.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  RETENTION_DAYS,
  MAX_OFFER_CHARS,
  MAX_QUESTION_ID_CHARS,
  MAX_REFERENCE_CHARS,
} from "../lib/offer-runtime.mjs";

const spec = JSON.parse(fs.readFileSync(new URL("../app/openapi.json", import.meta.url), "utf8"));
const routes = JSON.parse(fs.readFileSync(new URL("../app/_routes.json", import.meta.url), "utf8"));

test("describes only the three offer form routes, each backed by a function", () => {
  assert.equal(spec.openapi, "3.1.0");
  assert.deepEqual(spec.servers, [{ url: "https://datum.quest" }]);
  assert.deepEqual(Object.keys(spec.paths).sort(), ["/offer", "/offer/status", "/offer/withdraw"]);
  for (const [route, ops] of Object.entries(spec.paths)) {
    assert.deepEqual(Object.keys(ops), ["post"], `${route} should only describe POST`);
    const file = route === "/offer" ? "../functions/offer/index.js" : `../functions${route}.js`;
    assert.ok(fs.existsSync(new URL(file, import.meta.url)), `${route} has no function`);
    assert.ok(routes.include.some((pattern) => pattern === route || route.startsWith(pattern.replace(/\*$/, ""))), `${route} is not routed to Functions`);
  }
});

test("form limits match the runtime", () => {
  const props = spec.paths["/offer"].post.requestBody.content["application/x-www-form-urlencoded"].schema.properties;
  assert.equal(props.offer.maxLength, MAX_OFFER_CHARS);
  assert.equal(props.reference.maxLength, MAX_REFERENCE_CHARS);
  assert.equal(props.question_id.maxLength, MAX_QUESTION_ID_CHARS);
});

test("keeps the handling boundary in plain words", () => {
  assert.match(spec.info.description, /not a general API/);
  assert.match(spec.info.description, /acceptance is not admission/);
  assert.match(spec.paths["/offer"].post.description, /never put it in a URL/);
});

test("states retention, storage and readers where a tool builder reads first", () => {
  const d = spec.info.description;
  assert.ok(d.includes(`kept for ${RETENTION_DAYS} days`), "stated retention differs from the runtime");
  for (const fact of ["withdrawing clears it", "IP address", "may use an AI assistant", "never published by being accepted", "https://datum.quest/heard"]) {
    assert.ok(d.split(fact).length > 1, `OpenAPI description is missing: ${fact}`);
  }
});

test("is linked from the homepage, llms.txt, and headers", () => {
  const read = (p) => fs.readFileSync(new URL(p, import.meta.url), "utf8");
  assert.match(read("../app/index.html"), /<link rel="service-desc" type="application\/json" href="\/openapi.json">/);
  assert.match(read("../app/llms.txt"), /https:\/\/datum\.quest\/openapi\.json/);
  assert.match(read("../app/_headers"), /\/openapi\.json\n  Content-Type: application\/json; charset=utf-8/);
});

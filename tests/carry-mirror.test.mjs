// The carry mirror (ADR 0032) copies the machine-readable files byte for byte,
// names the commit they came from, and says offers can't be left there.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { MIRROR_BASE, MIRROR_FILES, prepareMirror } from "../scripts/prepare-mirror.mjs";

test("copies each file byte for byte and writes a README with digests and the commit", () => {
  const dist = fs.mkdtempSync(path.join(os.tmpdir(), "dist-"));
  const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "carry-")), "carry");
  for (const name of MIRROR_FILES) fs.writeFileSync(path.join(dist, name), `content of ${name}\n`);
  fs.writeFileSync(path.join(dist, "index.html"), "<p>not mirrored</p>");
  const digests = prepareMirror(dist, out, "abc1234");
  assert.deepEqual(fs.readdirSync(out).sort(), [...MIRROR_FILES, "README.md"].sort());
  const readme = fs.readFileSync(path.join(out, "README.md"), "utf8");
  assert.match(readme, /commit abc1234/);
  for (const name of MIRROR_FILES) {
    const bytes = fs.readFileSync(path.join(out, name));
    assert.equal(bytes.toString(), `content of ${name}\n`);
    const sha = createHash("sha256").update(bytes).digest("hex");
    assert.equal(digests[name], sha);
    assert.ok(readme.split(`${MIRROR_BASE}${name} (sha256 ${sha})`).length > 1, `README lists ${name}`);
  }
  assert.ok(readme.split("Offers can't be left here").length > 1);
  assert.ok(readme.split("https://datum.quest/offer").length > 1);
});

test("llms.txt names the mirror", () => {
  const llms = fs.readFileSync(new URL("../app/llms.txt", import.meta.url), "utf8");
  assert.ok(llms.split(MIRROR_BASE).length > 1);
});

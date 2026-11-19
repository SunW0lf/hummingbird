// ADR 0028: Hummingbird's own text is CC BY 4.0 and software is MIT. Every
// place a reader or agent looks for reuse terms has to say the same thing.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (relative) => fs.readFileSync(new URL(`../${relative}`, import.meta.url), "utf8");
const contains = (text, needle) => text.split(needle).length > 1;
const LEGALCODE = "https://creativecommons.org/licenses/by/4.0/legalcode";
const CREDIT = "Hummingbird (datum.quest)";

test("LICENSE keeps MIT for software and states CC BY 4.0 for text", () => {
  const license = read("LICENSE");
  assert.ok(license.startsWith("MIT License\n"), "LICENSE must still open with the MIT license");
  for (const needle of ["CC BY 4.0", LEGALCODE, CREDIT, "not covered", "ADR 0028"]) {
    assert.ok(contains(license, needle), `LICENSE lacks ${needle}`);
  }
});

test("llms.txt, robots.txt, README and CONTRIBUTING state the same terms", () => {
  const llmsLicense = read("app/llms.txt").split("\n").find((line) => line.startsWith("## License"));
  assert.ok(llmsLicense, "llms.txt has no License section");
  for (const needle of ["CC BY 4.0", CREDIT, "MIT"]) assert.ok(contains(llmsLicense, needle), `llms.txt license line lacks ${needle}`);
  const robots = read("app/robots.txt");
  assert.ok(contains(robots, "CC BY 4.0") && !contains(robots, "separate institutional decision"), "robots.txt still calls reuse undecided");
  assert.ok(contains(read("README.md"), "CC BY 4.0"), "README lacks the content license");
  assert.ok(contains(read("CONTRIBUTING.md"), "CC BY 4.0"), "CONTRIBUTING lacks inbound terms");
});

test("the licence question is resolved, not still open", () => {
  assert.ok(!contains(read("docs/governance/OPEN_QUESTIONS.md"), "OQ-LEGAL-CONTENT-LICENSE"));
  assert.ok(contains(read("docs/governance/RESOLVED_QUESTIONS.md"), "### OQ-LEGAL-CONTENT-LICENSE"));
});

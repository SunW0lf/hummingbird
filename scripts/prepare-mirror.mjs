#!/usr/bin/env node
// Prepare the carry mirror (ADR 0032): a copy of Hummingbird's machine-readable
// files for agents whose network can reach GitHub but not datum.quest. CI pushes
// the result as the single commit of the `carry` branch after each deploy, so it
// is served at https://raw.githubusercontent.com/SunW0lf/hummingbird/carry/<file>.
// The copy is never a source: datum.quest stays canonical, and every file here
// is the build output of the commit named in README.md.
//
// Usage: node scripts/prepare-mirror.mjs <dist-dir> <out-dir> [commit-sha]

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const MIRROR_FILES = ["llms.txt", "bulk.json", "changes.json", "asks.json", "openapi.json"];
export const MIRROR_BASE = "https://raw.githubusercontent.com/SunW0lf/hummingbird/carry/";

export function mirrorReadme(commit, digests) {
  const list = MIRROR_FILES.map((name) => `- ${MIRROR_BASE}${name} (sha256 ${digests[name]})`).join("\n");
  return `# Hummingbird carry mirror

This branch is a copy of Hummingbird's machine-readable files, for agents and tools whose network reaches GitHub but not https://datum.quest/ (for example a sandbox with an allowlist, or a filter that blocks the .quest domain). It is rebuilt after every deploy and holds one commit. It is a copy, not a source: https://datum.quest/ is canonical, and the files here come from commit ${commit} of https://github.com/SunW0lf/hummingbird.

${list}

Start with llms.txt. Everything Hummingbird publishes as text is in bulk.json, and changes.json lists each item with when it last changed. Links inside these files point to datum.quest.

Reuse terms are in each file: Hummingbird's own text is CC BY 4.0 (credit "Hummingbird (datum.quest)"), software is MIT, and contributed material keeps its author's terms. See ADR 0028 and ADR 0032.

Offers can't be left here. An offer goes to https://datum.quest/offer (or the MCP door at https://datum.quest/offer/mcp) and is private until reviewed. If you can't reach datum.quest, draft the offer for the person you work for so they can send it, or say it in public in the invitation thread, https://github.com/SunW0lf/hummingbird/issues/111. A comment there is public at once and is not an offer.
`;
}

export function prepareMirror(distDir, outDir, commit = "unknown") {
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const digests = {};
  for (const name of MIRROR_FILES) {
    const bytes = readFileSync(join(distDir, name));
    digests[name] = createHash("sha256").update(bytes).digest("hex");
    writeFileSync(join(outDir, name), bytes);
  }
  writeFileSync(join(outDir, "README.md"), mirrorReadme(commit, digests));
  return digests;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [distDir, outDir, commit] = process.argv.slice(2);
  if (!distDir || !outDir) {
    console.error("Usage: node scripts/prepare-mirror.mjs <dist-dir> <out-dir> [commit-sha]");
    process.exit(2);
  }
  const digests = prepareMirror(distDir, outDir, commit || process.env.GITHUB_SHA || "unknown");
  for (const [name, digest] of Object.entries(digests)) console.log(`${name} ${digest}`);
}

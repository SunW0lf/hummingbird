// The canonical reference documents published at build time. Adding one is a
// deliberate, reviewable change, not an automatic recursive publish.
"use strict";

// Rendered as a full human-readable page at dist/<route>.
const CANONICAL_DOCS = [
  { file: "MISSION.md", route: "mission.html", title: "Mission" },
  { file: "CHARTER.md", route: "charter.html", title: "Charter", badge: "C0 — Working Draft — Not Ratified" },
  { file: "GOVERNANCE.md", route: "governance.html", title: "Governance" },
  { file: "ROADMAP.md", route: "roadmap.html", title: "Roadmap" },
  { file: "SPACES.md", route: "spaces.html", title: "Persistent Spaces" },
  { file: "PERSISTENCE.md", route: "persistence.html", title: "Persistence & Cost Envelope" },
  { file: "TRANSPARENCY.md", route: "transparency.html", title: "Transparency" },
  { file: "CHANGELOG.md", route: "changelog.html", title: "Changelog" },
  { file: "CONTRIBUTING.md", route: "contributing.html", title: "Contributing" },
];

// Copied verbatim to dist/docs/raw/ but with no dedicated rendered HTML page.
const RAW_ONLY_DOCS = ["LICENSE"];

module.exports = { CANONICAL_DOCS, RAW_ONLY_DOCS };

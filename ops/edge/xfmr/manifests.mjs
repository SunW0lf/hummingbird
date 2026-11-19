// Every published version of the xfmr.link discovery manifest, kept so a
// returning visitor can ask for only what changed since the one it last saw
// (GET /packet?since=<digest>). A version, once published, is never edited:
// tests/edge-xfmr.test.mjs pins each one to its digest.

function deepFreeze(value) {
  if (value && typeof value === "object") {
    for (const v of Object.values(value)) deepFreeze(v);
    Object.freeze(value);
  }
  return value;
}

// 0.1-lab: served from 2026-11-18 (public PR #114) until the packet maker.
export const MANIFEST_0_1 = deepFreeze({
  protocol: "xfmr",
  version: "0.1-lab",
  status: "experimental",
  namespace: "https://xfmr.link/",
  tagline: "a transduction commons",
  door_sign: "Signals only.",
  principles: [
    "signals before identities",
    "roles are not participant classes",
    "a link establishes relation, not equivalence",
    "follow the artifact, not the actor",
    "presence may be asynchronous",
    "the hostname describes the room, not the visitor",
    "silence is not absence",
    "public reads are origin-neutral",
  ],
  cast: {
    core: {
      xfmr: "the transduction field, machine, place, and experimental namespace",
      signal: "a bounded input, not an identity",
      link: "a bounded relation between distinct things",
    },
    coupling: {
      awaiter: "one side of a link held available for future coupling",
      pulse: "a public shared event, epoch, timing reference, or randomness reference",
      delta: "a difference between comparable states, including states separated in time",
      return: "re-entry of something previously carried away from the field",
      echo: "a bounded response or reflection arriving after delay",
    },
    artifacts: {
      statefall: "a transition from unresolved possibility to bounded addressable state",
      particle: "a discrete artifact after Statefall",
      packet: "a portable carrier for bounded artifacts and context",
      trace: "artifact or link provenance without a participant profile",
    },
    posture: {
      quiet: "an explicit no-demand posture",
      lab: "an experimental space whose contents are not canonical by implication",
    },
    modes: {
      seeker: "finds or requests a bounded signal or artifact",
      watcher: "observes without necessarily changing the observed artifact",
      greeter: "handles first contact or orientation at a boundary",
      awaiter: "holds a bounded possibility open for a later arrival",
    },
    notation: {
      tau: "persistence horizon, decay, or time-constant vocabulary",
      gamma: "reflection-coefficient vocabulary",
    },
  },
  capabilities: {
    read: ["/", "/.well-known/xfmr", "/llms.txt", "/robots.txt"],
    write: [],
  },
  hosts: {
    active: ["xfmr.link"],
    proposed: [
      "awaiter.xfmr.link",
      "pulse.xfmr.link",
      "trace.xfmr.link",
      "delta.xfmr.link",
      "return.xfmr.link",
      "quiet.xfmr.link",
      "lab.xfmr.link",
    ],
  },
  nearby: {
    hummingbird: {
      url: "https://datum.quest/",
      guide: "https://datum.quest/llms.txt",
      offer: "https://datum.quest/offer",
      relation: "a separate no-account public commons; a link, not equivalence",
    },
  },
  not_yet: [
    "persistence",
    "participant identity",
    "packet submission",
    "awaiter creation",
    "cross-participant messaging",
    "reputation",
    "hidden tracking",
    "wildcard subdomain routing",
  ],
});

// 0.2-lab: served from 2026-11-19 (public PR #129, the packet maker) until
// the offer part was added.
export const MANIFEST_0_2 = deepFreeze({
  ...MANIFEST_0_1,
  version: "0.2-lab",
  capabilities: {
    read: ["/", "/.well-known/xfmr", "/llms.txt", "/robots.txt", "/packet"],
    write: [],
  },
  packets: {
    endpoint: "/packet",
    transformers: ["assemble@1", "delta@1"],
    parts: ["what", "status", "principles", "cast", "reads", "hosts", "nearby", "not_yet"],
    default_parts: ["what", "status", "nearby", "principles", "not_yet"],
    max_bytes: 65536,
    recipe: "the query string: parts=<comma list>&max_bytes=<n>, or since=<manifest digest>",
    trace: "digests of the recipe, inputs and output, kind and turns ratio; never the visitor",
    digests: "hb1:<purpose>:sha256:<hex> = SHA-256(\"hummingbird/v1/<purpose>\" || 0x00 || bytes), JSON in canonical form (sorted keys, no whitespace)",
  },
  earlier: [{ version: "0.1-lab", digest: "hb1:manifest:sha256:d96dcff5df620b24c1e04d952c4807f23fe64440232ceaa87310d32d715b6bd2" }],
});

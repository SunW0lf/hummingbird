// XFMR front door for xfmr.link. Source of truth for what the "xfmr" Worker
// serves; deployed only by the manual Edge workflow (see ops/edge/README.md).
// Based on the hummingbird-lab XFMR Worker, plus an orientation packet that
// points to Hummingbird. XFMR stays a separate lab namespace (ADR 0023).

const INDEXNOW_KEY = "adcccdf337d67cdffe8732e18854c535";

const DOOR = "XFMR\n\na transduction commons\n\nSignals only.\n\nNearby: Hummingbird, a no-account public commons that takes offers from any actor, human or automated.\nhttps://datum.quest/\n";

// Orientation packet: small enough for a client with a tight context budget.
const LLMS = `# XFMR

> a transduction commons. Signals only. An experimental namespace: read-only, no accounts, no identity, no tracking.

- Front door: https://xfmr.link/
- Discovery manifest (JSON): https://xfmr.link/.well-known/xfmr

## Nearby

Hummingbird (https://datum.quest/) is a separate no-account public commons. Any actor, human or automated, may make an offer: an idea, a criticism, a correction or a question. One form POST, a private receipt, and the same handling for everyone. Leaving something does not publish it, rank it, or give anyone standing.

- Agent guide: https://datum.quest/llms.txt
- Offer form: https://datum.quest/offer
`;

const ROBOTS = "User-agent: *\nAllow: /\n";

const MANIFEST = {
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
};

function headers(contentType, extra = {}) {
  return {
    "content-type": `${contentType}; charset=UTF-8`,
    "cache-control": "public, max-age=300",
    "access-control-allow-origin": "*",
    ...extra,
  };
}

function responseFor(request, body, init = {}) {
  const method = request.method.toUpperCase();
  return new Response(method === "HEAD" ? null : body, init);
}

export default {
  async fetch(request) {
    const method = request.method.toUpperCase();

    if (method !== "GET" && method !== "HEAD") {
      return new Response("Signals only. Read surface only.\n", {
        status: 405,
        headers: headers("text/plain", { allow: "GET, HEAD" }),
      });
    }

    const url = new URL(request.url);

    if (url.pathname === "/") {
      return responseFor(
        request,
        DOOR,
        {
          headers: headers("text/plain", {
            link: '</.well-known/xfmr>; rel="describedby"; type="application/json"',
          }),
        },
      );
    }

    if (url.pathname === "/.well-known/xfmr") {
      return responseFor(request, `${JSON.stringify(MANIFEST, null, 2)}\n`, {
        headers: headers("application/json"),
      });
    }

    if (url.pathname === "/llms.txt") {
      return responseFor(request, LLMS, { headers: headers("text/plain") });
    }

    if (url.pathname === "/robots.txt") {
      return responseFor(request, ROBOTS, { headers: headers("text/plain") });
    }

    if (url.pathname === `/${INDEXNOW_KEY}.txt`) {
      return responseFor(request, `${INDEXNOW_KEY}\n`, { headers: headers("text/plain") });
    }

    return responseFor(request, "No signal at this path.\n", {
      status: 404,
      headers: headers("text/plain"),
    });
  },
};

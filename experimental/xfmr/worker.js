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
    read: ["/", "/.well-known/xfmr"],
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
        "XFMR\n\na transduction commons\n\nSignals only.\n",
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

    return responseFor(request, "No signal at this path.\n", {
      status: 404,
      headers: headers("text/plain"),
    });
  },
};

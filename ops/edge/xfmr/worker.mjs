// XFMR front door for xfmr.link. Source of truth for what the "xfmr" Worker
// serves; deployed only by the manual Edge workflow (see ops/edge/README.md).
// Based on the hummingbird-lab XFMR Worker, plus an orientation packet that
// points to Hummingbird, and a read-only packet maker (GET /packet) built from
// the lab's transformer contract. XFMR stays a separate lab namespace
// (ADR 0023). Nothing here stores, logs or reads anything about a visitor.

import { canonicalJson, digest, DIGEST_RE } from "./digest.mjs";
import { MANIFEST_0_1 } from "./manifests.mjs";
import { transform, HARD_MAX_BYTES } from "./transform.mjs";

const INDEXNOW_KEY = "adcccdf337d67cdffe8732e18854c535";

const DOOR = "XFMR\n\na transduction commons\n\nSignals only.\n\nNearby: Hummingbird, a no-account public commons that takes offers from any actor, human or automated.\nhttps://datum.quest/\n";

// Orientation packet: small enough for a client with a tight context budget.
const LLMS = `# XFMR

> a transduction commons. Signals only. An experimental namespace: read-only, no accounts, no identity, no tracking.

- Front door: https://xfmr.link/
- Discovery manifest (JSON): https://xfmr.link/.well-known/xfmr
- Packet maker (JSON): https://xfmr.link/packet

## Packets

GET /packet returns a small packet of XFMR's own public material plus a trace. The trace holds digests of the recipe, the inputs and the output, never anything about who asked. Nothing is stored between requests.

- Pick parts and a byte budget: /packet?parts=what,status,nearby&max_bytes=1600
  Parts that do not fit are dropped from the end and listed under "omitted".
- Coming back: send the manifest digest you last saw and get only what changed: /packet?since=<digest>
  The current digest is in every packet response and in the manifest's ETag header.
- The query string is the recipe. Keep it and ask again; the same recipe and the same material give the same packet.

## Nearby

Hummingbird (https://datum.quest/) is a separate no-account public commons. Any actor, human or automated, may make an offer: an idea, a criticism, a correction or a question. One form POST, a private receipt, and the same handling for everyone. Leaving something does not publish it, rank it, or give anyone standing.

- Agent guide: https://datum.quest/llms.txt
- Offer form: https://datum.quest/offer
`;

const ROBOTS = "User-agent: *\nAllow: /\n";

// The current manifest. Each earlier version is listed by digest so a
// returning visitor can ask for a delta from it.
const MANIFEST = {
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
};

const EARLIER = { [MANIFEST.earlier[0].digest]: MANIFEST_0_1 };

let currentDigest;
const manifestDigest = () => (currentDigest ??= digest("manifest", canonicalJson(MANIFEST)));

// XFMR's own public material, as named parts a visitor can pick from.
const PARTS = {
  what: `${MANIFEST.protocol.toUpperCase()}: ${MANIFEST.tagline}. ${MANIFEST.door_sign}`,
  status: { status: MANIFEST.status, version: MANIFEST.version, write: MANIFEST.capabilities.write },
  principles: MANIFEST.principles,
  cast: MANIFEST.cast,
  reads: MANIFEST.capabilities.read,
  hosts: MANIFEST.hosts,
  nearby: MANIFEST.nearby,
  not_yet: MANIFEST.not_yet,
};

const ALLOWED_PARAMS = new Set(["parts", "max_bytes", "since"]);

class PacketError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

// Turn the query string into a recipe and its inputs. Fixed error messages:
// nothing the visitor sent is echoed back.
async function recipeFor(params) {
  for (const key of params.keys()) {
    if (!ALLOWED_PARAMS.has(key)) throw new PacketError(400, "unknown parameter; use parts, max_bytes or since");
  }
  for (const key of ALLOWED_PARAMS) {
    if (params.getAll(key).length > 1) throw new PacketError(400, "each parameter may appear once");
  }

  const since = params.get("since");
  if (since !== null) {
    if (params.has("parts") || params.has("max_bytes")) throw new PacketError(400, "use either since or parts and max_bytes, not both");
    if (!DIGEST_RE.test(since)) throw new PacketError(400, "since must be a manifest digest: hb1:manifest:sha256:<64 hex>");
    const current = await manifestDigest();
    const before = since === current ? MANIFEST : EARLIER[since];
    if (!before) {
      throw new PacketError(404, "unknown manifest digest", {
        known: [...MANIFEST.earlier.map((e) => e.digest), current],
      });
    }
    return { recipe: { transformer: "delta", params: { since } }, inputs: { before, after: MANIFEST } };
  }

  let include = MANIFEST.packets.default_parts;
  let packet = "orientation";
  if (params.has("parts")) {
    include = params.get("parts").split(",");
    packet = "custom";
    if (include.some((name) => !Object.hasOwn(PARTS, name))) throw new PacketError(400, `unknown part; choose from ${Object.keys(PARTS).join(", ")}`);
    if (new Set(include).size !== include.length) throw new PacketError(400, "each part may appear once");
  }

  const recipeParams = { packet, include: [...include] };
  if (params.has("max_bytes")) {
    const raw = params.get("max_bytes");
    const n = /^[0-9]{1,6}$/.test(raw) ? Number(raw) : NaN;
    if (!(n >= 1 && n <= HARD_MAX_BYTES)) throw new PacketError(400, `max_bytes must be a whole number from 1 to ${HARD_MAX_BYTES}`);
    recipeParams.max_bytes = n;
  }
  const inputs = Object.fromEntries(include.map((name) => [name, PARTS[name]]));
  return { recipe: { transformer: "assemble", params: recipeParams }, inputs };
}

async function packetResponse(request, url) {
  const json = (status, body) =>
    responseFor(request, `${JSON.stringify(body, null, 2)}\n`, { status, headers: headers("application/json") });
  try {
    const { recipe, inputs } = await recipeFor(url.searchParams);
    const { output, trace } = await transform(recipe, inputs);
    return json(200, { recipe, output, trace, manifest: await manifestDigest() });
  } catch (err) {
    if (err instanceof PacketError) return json(err.status, { error: err.message, ...err.extra });
    if (err instanceof RangeError && /budget too small/.test(err.message)) {
      return json(400, { error: "max_bytes is too small for even an empty packet" });
    }
    return json(500, { error: "the packet could not be made" });
  }
}

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
        headers: headers("application/json", { etag: `"${await manifestDigest()}"` }),
      });
    }

    if (url.pathname === "/packet") {
      return packetResponse(request, url);
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

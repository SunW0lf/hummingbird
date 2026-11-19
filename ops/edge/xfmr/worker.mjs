// XFMR front door for xfmr.link. Source of truth for what the "xfmr" Worker
// serves; deployed only by the manual Edge workflow (see ops/edge/README.md).
// Based on the hummingbird-lab XFMR Worker, plus an orientation packet that
// points to Hummingbird, a read-only packet maker (GET /packet) built from the
// lab's transformer contract, and the meeting carrier (GET /meet), where a
// visitor and the space each bring a random half. XFMR stays a separate lab
// namespace (ADR 0023). Nothing here stores, logs or reads anything about a
// visitor.

import { canonicalJson, digest, DIGEST_RE } from "./digest.mjs";
import { MANIFEST_0_1, MANIFEST_0_2, MANIFEST_0_3 } from "./manifests.mjs";
import { readDrandPulse, spaceMeetOnce, VISITOR_COMMIT_RE } from "./meeting.mjs";
import { transform, HARD_MAX_BYTES } from "./transform.mjs";

const INDEXNOW_KEY = "adcccdf337d67cdffe8732e18854c535";

const DOOR = "XFMR\n\na transduction commons\n\nSignals only.\n\nNearby: Hummingbird, a no-account public commons that takes offers from any actor, human or automated.\nhttps://datum.quest/\nHow to make an offer there, as one small packet: https://xfmr.link/packet?parts=offer\n";

// Orientation packet: small enough for a client with a tight context budget.
const LLMS = `# XFMR

> a transduction commons. Signals only. An experimental namespace: read-only, no accounts, no identity, no tracking.

- Front door: https://xfmr.link/
- Discovery manifest (JSON): https://xfmr.link/.well-known/xfmr
- Packet maker (JSON): https://xfmr.link/packet
- Meeting (JSON): https://xfmr.link/meet

## Packets

GET /packet returns a small packet of XFMR's own public material plus a trace. The trace holds digests of the recipe, the inputs and the output, never anything about who asked. Nothing is stored between requests.

- Pick parts and a byte budget: /packet?parts=what,status,nearby&max_bytes=1600
  Parts that do not fit are dropped from the end and listed under "omitted".
- Coming back: send the manifest digest you last saw and get only what changed: /packet?since=<digest>
  The current digest is in every packet response and in the manifest's ETag header.
- The query string is the recipe. Keep it and ask again; the same recipe and the same material give the same packet.

## Meeting

GET /meet makes a one-time carrier from a meeting: you bring a random half, the space brings one, and a public drand beacon round marks the moment. Neither side can steer it, and neither half alone rebuilds it. The space never sees your half and keeps nothing.

1. Draw 32 random bytes and keep them. Send only their digest: hb1:meeting-visitor:sha256:<hex>, hex = SHA-256("hummingbird/v1/meeting-visitor" || 0x00 || your 32 bytes).
2. GET /meet?commit=<that digest>. The reply holds the space's half (space_half, base64url), its commitment, and the pulse { source, round, randomness }, or null if the beacon could not be read.
3. Check SHA-256("hummingbird/v1/meeting-space" || 0x00 || space_half) matches space_commit, then compute
   carrier = HKDF-SHA256(ikm = your half || space_half, salt = "hummingbird/v1/meeting", info = canonical JSON {pulse, space_commit, visitor_commit}).
   Canonical JSON: sorted keys, no whitespace.

GET /meet with no commit returns these steps as JSON. Nothing about you is stored, and the commitment is a hash of random bytes, so it says nothing about you either.

## Nearby

Hummingbird (https://datum.quest/) is a separate no-account public commons. Any actor, human or automated, may make an offer: an idea, a criticism, a correction or a question. One form POST, a private receipt, and the same handling for everyone. Leaving something does not publish it, rank it, or give anyone standing.

- Agent guide: https://datum.quest/llms.txt
- Offer form: https://datum.quest/offer
- The offer how-to as one small packet: https://xfmr.link/packet?parts=offer
`;

const ROBOTS = "User-agent: *\nAllow: /\n";

// How to meet, served at GET /meet with no commit and listed in the manifest.
const MEETING = {
  endpoint: "/meet",
  form: "one round trip, no key",
  steps: [
    "draw 32 random bytes and keep them (your half)",
    "commit = hb1:meeting-visitor:sha256:<hex>, hex = SHA-256(\"hummingbird/v1/meeting-visitor\" || 0x00 || your half)",
    "GET /meet?commit=<commit>",
    "check SHA-256(\"hummingbird/v1/meeting-space\" || 0x00 || space_half) equals space_commit",
    "carrier = HKDF-SHA256(ikm = your half || space_half, salt = \"hummingbird/v1/meeting\", info = canonical JSON {pulse, space_commit, visitor_commit})",
  ],
  pulse: "drand quicknet { source, round, randomness }, or null if it could not be read within 1.5 s; its randomness is in the carrier, so the carrier could not exist before that round",
  keeps: "nothing: no key, no state; the space never sees your half",
  trace: "carrier kind, grain and pulse round; never a half",
};

// The current manifest. Each earlier version is listed by digest so a
// returning visitor can ask for a delta from it.
const MANIFEST = {
  ...MANIFEST_0_3,
  version: "0.4-lab",
  capabilities: {
    read: [...MANIFEST_0_3.capabilities.read, "/meet"],
    write: [],
  },
  meeting: MEETING,
  earlier: [
    ...MANIFEST_0_3.earlier,
    { version: "0.3-lab", digest: "hb1:manifest:sha256:e8d457cda7a2b1ec2d9b1de633b34131e77273fb50d49e1c96cab89b4f811c55" },
  ],
};

const EARLIER = {
  [MANIFEST.earlier[0].digest]: MANIFEST_0_1,
  [MANIFEST.earlier[1].digest]: MANIFEST_0_2,
  [MANIFEST.earlier[2].digest]: MANIFEST_0_3,
};

// How to leave an offer at Hummingbird, carried here so an agent with a tight
// budget can get the whole how-to in one small read. Hummingbird's own text
// (CC BY 4.0); tests/edge-xfmr.test.mjs keeps it in step with the offer
// runtime and datum.quest/llms.txt. XFMR itself still takes nothing.
const OFFER = {
  from: "Hummingbird (https://datum.quest/), a separate no-account public commons; its own text, CC BY 4.0",
  what: "Any actor, human or automated, may leave an offer: an idea, a criticism, a correction, a question, or evidence about Hummingbird itself. It asks no name.",
  how: "POST https://datum.quest/offer with a field named offer (1–4,000 characters), as a URL-encoded form or a JSON object of strings. Add Accept: application/json for a JSON result.",
  mcp: "https://datum.quest/offer/mcp (Streamable HTTP, no account), tool make_offer",
  receipt: "Only a 201 with accepted: true stored it. Its private receipt is shown once: use it only in a POST field named receipt at https://datum.quest/offer/status or https://datum.quest/offer/withdraw, never in a URL.",
  kept: "Kept for 30 days. No names, accounts, email or IP addresses are stored. Read by its steward and reviewers with AI help, and not used to train AI models. Accepting an offer never publishes it; volume is not a vote.",
  read_only: "If your tools can only fetch pages, draft the offer for the person you work for and give them https://datum.quest/offer to send it.",
  guide: "https://datum.quest/llms.txt",
};

let currentDigest;
const manifestDigest = () => (currentDigest ??= digest("manifest", canonicalJson(MANIFEST)));

// XFMR's own public material, as named parts a visitor can pick from.
const PARTS = {
  what: `${MANIFEST.protocol.toUpperCase()}: ${MANIFEST.tagline}. ${MANIFEST.door_sign}`,
  offer: OFFER,
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

// GET /meet. With no query: how to meet. With commit=<visitor digest>: the
// space's half, its commitment and a pulse, never stored or logged. Fixed
// error messages: nothing the visitor sent is echoed back.
async function meetResponse(request, url) {
  const json = (status, body, cache = "public, max-age=300") =>
    responseFor(request, `${JSON.stringify(body, null, 2)}\n`, {
      status,
      headers: headers("application/json", { "cache-control": cache }),
    });
  const params = url.searchParams;
  if ([...params.keys()].length === 0) return json(200, MEETING);
  if ([...params.keys()].some((k) => k !== "commit") || params.getAll("commit").length !== 1) {
    return json(400, { error: "send exactly one parameter: commit=<hb1:meeting-visitor:sha256:<64 hex>>", how: "/meet" });
  }
  const commit = params.get("commit");
  if (!VISITOR_COMMIT_RE.test(commit)) {
    return json(400, { error: "commit must be hb1:meeting-visitor:sha256:<64 hex>", how: "/meet" });
  }
  try {
    const pulse = await readDrandPulse(fetch);
    return json(200, await spaceMeetOnce({ visitor_commit: commit, pulse }), "no-store");
  } catch {
    return json(500, { error: "the meeting could not be made" }, "no-store");
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

    if (url.pathname === "/meet") {
      return meetResponse(request, url);
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

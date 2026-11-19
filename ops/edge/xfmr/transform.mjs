// The transformer contract for xfmr.link packets. Copied from the
// hummingbird-lab transformer lab (labs/transformers/transform.mjs at 3d434e2)
// with only the Assembler, Fitter and Delta. The Mixer and its one-time
// carrier stay in the lab: a carrier reading must never travel in a URL.
//
//   transform(recipe, inputs) -> { output, trace }
//
// The trace follows the artifact, never the actor: digests, the transformer's
// name and version, its kind and turns ratio, and the budget. Never who asked.

import { canonicalJson, digest, toBytes } from "./digest.mjs";

export const HARD_MAX_BYTES = 65536; // resource envelope: nothing bigger is produced

const byteLength = (value) => toBytes(typeof value === "string" ? value : canonicalJson(value)).length;
const asBytes = (value) => (typeof value === "string" ? value : canonicalJson(value));

// Drop parts from the end until the packet, including its list of what was
// left out, fits; earlier omissions (from a previous fit) stay listed last.
function fitParts(packet, maxBytes, earlier = []) {
  const parts = { ...packet.parts };
  const order = [...packet.order];
  const dropped = [];
  const build = () => ({
    ...packet,
    order: [...order],
    parts: Object.fromEntries(order.map((k) => [k, parts[k]])),
    omitted: [...dropped, ...earlier],
  });
  let current = build();
  while (byteLength(current) > maxBytes && order.length > 0) {
    dropped.unshift(order.pop());
    current = build();
  }
  if (byteLength(current) > maxBytes) throw new RangeError("budget too small for an empty packet");
  return { output: current, omitted: current.omitted };
}

function budgetOf(params) {
  const asked = params?.max_bytes ?? HARD_MAX_BYTES;
  if (!Number.isSafeInteger(asked) || asked < 1) throw new RangeError("max_bytes must be a positive integer");
  return Math.min(asked, HARD_MAX_BYTES);
}

function flatten(value, prefix = "", out = {}) {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    const keys = Object.keys(value).sort();
    if (keys.length === 0 && prefix) out[prefix] = {};
    for (const k of keys) flatten(value[k], prefix ? `${prefix}.${k}` : k, out);
  } else {
    out[prefix] = value;
  }
  return out;
}

const same = (x, y) => canonicalJson(x) === canonicalJson(y);

export const TRANSFORMERS = {
  // Picks named inputs, in order, into one packet; fits it to the budget.
  assemble: {
    version: 1,
    kind: "derived",
    ratio: "step-down",
    run(params, inputs) {
      const include = params?.include;
      if (!Array.isArray(include) || include.length === 0) throw new TypeError("assemble needs params.include");
      for (const name of include) if (!(name in inputs)) throw new RangeError(`no input named ${name}`);
      const packet = { packet: String(params.packet || "custom"), order: [...include], parts: Object.fromEntries(include.map((n) => [n, inputs[n]])) };
      return fitParts(packet, budgetOf(params));
    },
  },

  // Fits an existing packet under a smaller budget.
  fit: {
    version: 1,
    kind: "derived",
    ratio: "step-down",
    run(params, inputs) {
      const packet = inputs.packet;
      if (!packet || !Array.isArray(packet.order) || typeof packet.parts !== "object") throw new TypeError("fit needs inputs.packet");
      const { omitted: earlier = [], ...rest } = packet;
      return fitParts(rest, budgetOf(params), earlier);
    },
  },

  // Only what changed between two versions of a public object.
  delta: {
    version: 1,
    kind: "derived",
    ratio: "step-down",
    run(_params, inputs) {
      const fa = flatten(inputs.before ?? {});
      const fb = flatten(inputs.after ?? {});
      const added = {};
      const changed = {};
      for (const k of Object.keys(fb).sort()) {
        if (!(k in fa)) added[k] = fb[k];
        else if (!same(fa[k], fb[k])) changed[k] = { from: fa[k], to: fb[k] };
      }
      const removed = Object.keys(fa).filter((k) => !(k in fb)).sort();
      return { output: { added, removed, changed } };
    },
  },
};

async function inputDigests(inputs) {
  const out = {};
  for (const name of Object.keys(inputs).sort()) out[name] = await digest("artifact", asBytes(inputs[name]));
  return out;
}

export async function transform(recipe, inputs) {
  const spec = Object.hasOwn(TRANSFORMERS, recipe?.transformer) ? TRANSFORMERS[recipe.transformer] : undefined;
  if (!spec) throw new RangeError(`unknown transformer: ${recipe?.transformer}`);
  if (inputs === null || typeof inputs !== "object") throw new TypeError("inputs must be an object of named artifacts");

  const ran = spec.run(recipe.params || {}, inputs);
  const output = ran.output;
  const size = byteLength(output);
  if (size > HARD_MAX_BYTES) throw new RangeError("output exceeds the resource envelope");

  const trace = {
    transformer: `${recipe.transformer}@${spec.version}`,
    kind: spec.kind,
    ratio: spec.ratio,
    recipe: await digest("recipe", canonicalJson(recipe)),
    inputs: await inputDigests(inputs),
    output: await digest("packet", asBytes(output)),
    budget: { asked: recipe.params?.max_bytes ?? null, used: size, omitted: ran.omitted || [] },
  };
  return { output, trace };
}

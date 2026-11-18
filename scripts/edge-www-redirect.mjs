// Sets one Cloudflare Single Redirect on the datum.quest zone:
// www.datum.quest/<path>?<query>  ->  301  https://datum.quest/<path>?<query>
// Idempotent: it adds or updates only the rule with its own ref and leaves any
// other redirect rules in the zone as they are. Needs CLOUDFLARE_EDGE_TOKEN
// (Zone Read + Single Redirect Edit on datum.quest). Prints no secrets.
const API = "https://api.cloudflare.com/client/v4";
const ZONE = "datum.quest";
const PHASE = "http_request_dynamic_redirect";
const RULE = {
  ref: "hummingbird-www-to-apex",
  description: "www.datum.quest to the canonical apex (OPERATIONS.md)",
  expression: '(http.host eq "www.datum.quest")',
  action: "redirect",
  action_parameters: {
    from_value: {
      status_code: 301,
      target_url: { expression: 'concat("https://datum.quest", http.request.uri.path)' },
      preserve_query_string: true,
    },
  },
  enabled: true,
};

const token = process.env.CLOUDFLARE_EDGE_TOKEN;
if (!token) {
  console.error("error: CLOUDFLARE_EDGE_TOKEN is not set");
  process.exit(1);
}

async function cf(method, path, body) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await response.json().catch(() => ({}));
  return { status: response.status, json };
}

function fail(step, result) {
  const errors = (result.json.errors || []).map((e) => `${e.code}: ${e.message}`).join("; ");
  console.error(`error: ${step} failed with HTTP ${result.status}${errors ? ` (${errors})` : ""}`);
  process.exit(1);
}

const zones = await cf("GET", `/zones?name=${ZONE}`);
if (zones.status !== 200 || !zones.json.result?.length) fail("zone lookup", zones);
const zoneId = zones.json.result[0].id;

const entry = await cf("GET", `/zones/${zoneId}/rulesets/phases/${PHASE}/entrypoint`);
if (entry.status === 404) {
  const created = await cf("PUT", `/zones/${zoneId}/rulesets/phases/${PHASE}/entrypoint`, { rules: [RULE] });
  if (created.status !== 200) fail("creating the redirect ruleset", created);
  console.log("Created the redirect ruleset with the www rule.");
} else {
  if (entry.status !== 200) fail("reading the redirect ruleset", entry);
  const ruleset = entry.json.result;
  const existing = (ruleset.rules || []).find((rule) => rule.ref === RULE.ref);
  const result = existing
    ? await cf("PATCH", `/zones/${zoneId}/rulesets/${ruleset.id}/rules/${existing.id}`, RULE)
    : await cf("POST", `/zones/${zoneId}/rulesets/${ruleset.id}/rules`, RULE);
  if (result.status !== 200) fail(existing ? "updating the www rule" : "adding the www rule", result);
  console.log(`${existing ? "Updated" : "Added"} the www rule; ${(ruleset.rules || []).length - (existing ? 1 : 0)} other rule(s) left as they were.`);
}

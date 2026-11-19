# Edge changes (Cloudflare)

The manual **Edge** workflow (`.github/workflows/edge.yml`) makes one Cloudflare edge change per run. Nothing here runs on push or schedule.

| Target | What it does |
| --- | --- |
| `www-redirect` | Adds or updates one Single Redirect on the `datum.quest` zone: `www.datum.quest/<path>?<query>` → 301 → `https://datum.quest/<path>?<query>`. Other redirect rules are left alone. |
| `xfmr-worker` | Tests and deploys `ops/edge/xfmr/worker.mjs` as the Worker named `xfmr`, smoke-tests `xfmr.link`, and announces its pages to IndexNow. |

## Token: `CLOUDFLARE_EDGE_TOKEN`

A custom Cloudflare API token stored only as a repository Actions secret.

- Account › Workers Scripts: Edit
- Zone › Workers Routes: Edit
- Zone › Single Redirect: Edit
- Zone › Zone: Read
- Zone › Cache Purge: Purge
- Zone resources: `datum.quest` and `xfmr.link` only
- Expires 2027-11-18

It deliberately has no DNS, Pages, D1, account-settings or billing access. The Pages deploy and D1 tokens stay separate.

## The one DNS step (by hand)

A redirect rule only runs for a hostname Cloudflare proxies. In the Cloudflare dashboard, under `datum.quest` › DNS › Records:

- If a `www` record exists, make sure its proxy status is **Proxied** (orange cloud).
- If none exists, add: Type `AAAA`, Name `www`, IPv6 address `100::`, Proxy status **Proxied**.

`100::` is a discard address; with the record proxied, the redirect answers before any origin is contacted.

## XFMR

`xfmr.link` is a separate lab namespace (see the private `hummingbird-lab` repository and ADR 0023). Its custom domain is attached in Cloudflare, not in `wrangler.jsonc`, so a deploy cannot repoint the hostname. The Worker serves the XFMR door sign, the discovery manifest at `/.well-known/xfmr`, an orientation packet at `/llms.txt` pointing to Hummingbird, `robots.txt`, and its own IndexNow key file.

It also serves a read-only packet maker at `/packet`, built from the lab's transformer contract (`digest.mjs`, `transform.mjs`): a visitor picks parts of XFMR's own public material and a byte budget (`?parts=what,nearby&max_bytes=1600`), or sends the manifest digest it last saw (`?since=<digest>`) and gets only what changed. Each answer carries a trace of digests (recipe, inputs, output), never anything about the visitor, and nothing is stored or logged. Every published manifest version is kept, frozen, in `manifests.mjs` so `since` keeps working; when the manifest changes, add the old version there and list its digest under `earlier`.

The `offer` part carries Hummingbird's own offer how-to (CC BY 4.0) so a client with a tight budget gets it in one small read; it is first after `what` in the default packet. `tests/edge-xfmr.test.mjs` keeps its limits, retention and addresses in step with `lib/offer-runtime.mjs` and `app/llms.txt`, so change them together. XFMR itself still takes nothing: offers are made only at datum.quest.

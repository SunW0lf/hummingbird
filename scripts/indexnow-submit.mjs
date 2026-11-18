// Tells IndexNow-participating search engines (Bing, Yandex and others share
// submissions) which public URLs exist or changed. Run by hand, or through the
// manual "IndexNow" workflow, after a material public change; never on every
// routine build, and never for offers or anything private.
//
// The key is public by design: IndexNow proves site control by fetching
// https://datum.quest/<key>.txt and comparing its contents to the key.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOST = "datum.quest";
const ENDPOINT = process.env.INDEXNOW_ENDPOINT || "https://api.indexnow.org/indexnow";

const keyFiles = fs.readdirSync(path.join(ROOT, "app")).filter((name) => /^[0-9a-f]{32}\.txt$/.test(name));
if (keyFiles.length !== 1) {
  console.error(`error: expected exactly one IndexNow key file in app/, found ${keyFiles.length}`);
  process.exit(1);
}
const key = keyFiles[0].replace(/\.txt$/, "");

const sitemapPath = path.join(ROOT, "dist", "sitemap.xml");
if (!fs.existsSync(sitemapPath)) {
  console.error("error: dist/sitemap.xml is missing. Run ./scripts/build first.");
  process.exit(1);
}
const urlList = [...fs.readFileSync(sitemapPath, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((match) => match[1])
  .filter((url) => new URL(url).host === HOST);
for (const extra of [`https://${HOST}/llms.txt`]) if (!urlList.includes(extra)) urlList.push(extra);

const body = { host: HOST, key, keyLocation: `https://${HOST}/${key}.txt`, urlList };
if (process.argv.includes("--dry-run")) {
  console.log(JSON.stringify(body, null, 2));
  process.exit(0);
}

const response = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});
console.log(`IndexNow: ${response.status} for ${urlList.length} URLs`);
if (response.status !== 200 && response.status !== 202) {
  console.error((await response.text()).slice(0, 500));
  process.exit(1);
}

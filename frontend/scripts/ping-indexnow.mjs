/**
 * Notify IndexNow about sitemap URLs. Run only after production is live
 * and https://www.aryandani.com/{key}.txt is reachable.
 */
import { SEO_CONFIG, SITE_URL } from "../src/config/seoConfig.js";
import { collectSitemapEntries } from "./generate-sitemap.mjs";
import { INDEXNOW_KEY } from "./indexnow-key.mjs";

const ENDPOINT = "https://api.indexnow.org/indexnow";

function isNoindexUrl(loc) {
  const path = new URL(loc).pathname;
  const robots = SEO_CONFIG[path]?.robots || "";
  return /noindex/i.test(robots);
}

const host = new URL(SITE_URL).host;
const urlList = collectSitemapEntries()
  .map((entry) => entry.loc)
  .filter((loc) => !isNoindexUrl(loc));

if (urlList.length === 0) {
  console.error("IndexNow: no indexable URLs to submit.");
  process.exit(1);
}

const body = {
  host,
  key: INDEXNOW_KEY,
  keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
  urlList,
};

const response = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});

if (!response.ok && response.status !== 202) {
  const detail = await response.text();
  console.error(`IndexNow failed (${response.status}): ${detail}`);
  process.exit(1);
}

console.log(`IndexNow accepted ${urlList.length} URLs (${response.status}).`);

/**
 * Notify IndexNow about sitemap URLs.
 * Runs on every commit, build, or deploy to keep search engines up to date.
 */
import { SEO_CONFIG, SITE_URL } from "../src/config/seoConfig.js";
import { collectSitemapEntries } from "./generate-sitemap.mjs";
import { INDEXNOW_KEY as DEFAULT_KEY } from "./indexnow-key.mjs";

if (process.env.VERCEL_ENV === "preview") {
  console.log("[IndexNow] Skipping preview deployment on Vercel.");
  process.exit(0);
}

const key = process.env.INDEXNOW_KEY?.trim() || DEFAULT_KEY;
const ENDPOINT = "https://api.indexnow.org/indexnow";

function isNoindexUrl(loc) {
  const path = new URL(loc).pathname;
  const robots = SEO_CONFIG[path]?.robots || "";
  return /noindex/i.test(robots);
}

const host = new URL(SITE_URL).host;

const cliUrls = process.argv
  .slice(2)
  .filter((arg) => arg.startsWith("http://") || arg.startsWith("https://"));

const urlList =
  cliUrls.length > 0
    ? cliUrls
    : collectSitemapEntries()
        .map((entry) => entry.loc)
        .filter((loc) => !isNoindexUrl(loc));

if (urlList.length === 0) {
  console.error("[IndexNow] Error: No indexable URLs to submit.");
  process.exit(1);
}

const body = {
  host,
  key,
  keyLocation: `${SITE_URL}/${key}.txt`,
  urlList,
};

try {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok && response.status !== 202) {
    const detail = await response.text().catch(() => "");
    console.error(`[IndexNow] Request failed (${response.status}): ${detail}`);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  } else {
    console.log(
      `[IndexNow] Accepted ${urlList.length} URLs (HTTP ${response.status}) for host ${host}.`,
    );
  }
} catch (error) {
  console.error(`[IndexNow] Network error: ${error.message}`);
  if (!process.env.VERCEL) {
    process.exit(1);
  }
}

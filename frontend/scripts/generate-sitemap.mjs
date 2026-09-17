/**
 * Build-time sitemap.xml generator.
 * Reads route meta from seoConfig + project highlight URLs from projects data.
 * Writes frontend/public/sitemap.xml and validates against the sitemap 0.9 contract.
 */
import { execSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SEO_ROUTE_META, SEO_ROUTE_ORDER, SITE_URL } from "../src/config/seoConfig.js";
import { projects } from "../src/data/projects.js";

const SITEMAP_PATH = new URL("../public/sitemap.xml", import.meta.url);
const CHANGEFREQ = new Set([
  "always",
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "never",
]);

function xmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function resolveLastmod() {
  try {
    const gitDate = execSync("git log -1 --format=%cs", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(gitDate)) return gitDate;
  } catch {
    /* not a git checkout or git unavailable */
  }
  return new Date().toISOString().slice(0, 10);
}

/** Top-level pages + deep-linkable project cards (query highlights). */
export function collectSitemapEntries(lastmod = resolveLastmod()) {
  const entries = SEO_ROUTE_ORDER.map((path) => {
    const meta = SEO_ROUTE_META[path] || {
      priority: path === "/" ? "1.0" : "0.8",
      changefreq: "monthly",
    };
    return {
      loc: path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`,
      lastmod,
      changefreq: meta.changefreq,
      priority: String(meta.priority),
    };
  });

  for (const project of projects) {
    entries.push({
      loc: `${SITE_URL}/projects?highlight=${encodeURIComponent(project.id)}`,
      lastmod,
      changefreq: "monthly",
      priority: "0.5",
    });
  }

  return entries;
}

export function buildSitemapXml(entries = collectSitemapEntries()) {
  const urls = entries
    .map(
      (entry) => `  <url>
    <loc>${xmlEscape(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export function validateSitemapXml(xml) {
  const errors = [];

  if (!xml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')) {
    errors.push('Missing sitemap 0.9 xmlns on <urlset>');
  }
  if (!xml.trimStart().startsWith("<?xml")) {
    errors.push("Missing XML declaration");
  }

  const blocks = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)];
  if (blocks.length === 0) errors.push("No <url> entries found");

  for (const [index, match] of blocks.entries()) {
    const block = match[1];
    const loc = block.match(/<loc>(.*?)<\/loc>/)?.[1];
    const lastmod = block.match(/<lastmod>(.*?)<\/lastmod>/)?.[1];
    const changefreq = block.match(/<changefreq>(.*?)<\/changefreq>/)?.[1];
    const priority = block.match(/<priority>(.*?)<\/priority>/)?.[1];

    if (!loc || !/^https:\/\//.test(loc)) {
      errors.push(`url[${index}]: invalid or missing <loc>`);
    }
    if (!lastmod || !/^\d{4}-\d{2}-\d{2}$/.test(lastmod)) {
      errors.push(`url[${index}]: invalid <lastmod>`);
    }
    if (!changefreq || !CHANGEFREQ.has(changefreq)) {
      errors.push(`url[${index}]: invalid <changefreq>`);
    }
    const p = Number(priority);
    if (priority == null || Number.isNaN(p) || p < 0 || p > 1) {
      errors.push(`url[${index}]: <priority> must be 0.0–1.0`);
    }
  }

  return errors;
}

export async function writeSitemap() {
  const entries = collectSitemapEntries();
  const xml = buildSitemapXml(entries);
  const errors = validateSitemapXml(xml);
  if (errors.length) {
    throw new Error(`sitemap.xml failed validation:\n- ${errors.join("\n- ")}`);
  }
  await writeFile(SITEMAP_PATH, xml, "utf8");
  return { path: SITEMAP_PATH.pathname, count: entries.length };
}

const runningAsCli =
  Boolean(process.argv[1]) &&
  path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]);

if (runningAsCli) {
  const result = await writeSitemap();
  console.log(`Wrote sitemap.xml (${result.count} URLs).`);
}

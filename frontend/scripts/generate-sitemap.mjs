/**
 * Build-time sitemap.xml generator.
 * Reads route meta from seoConfig and research PDF URLs.
 * Writes frontend/public/sitemap.xml and validates against the sitemap 0.9 contract.
 */
import { execSync } from "node:child_process";
import { statSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SEO_CONFIG, SEO_ROUTE_META, SEO_ROUTE_ORDER, SITE_URL } from "../src/config/seoConfig.js";
import { researchPapers } from "../src/data/research.js";

const ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
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

function resolveBuildDate() {
  try {
    const gitDate = execSync("git log -1 --format=%cs", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      cwd: ROOT,
    }).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(gitDate)) return gitDate;
  } catch {
    /* not a git checkout or git unavailable */
  }
  return new Date().toISOString().slice(0, 10);
}

function fileMtimeDate(...relativePaths) {
  let latest = 0;
  for (const relativePath of relativePaths) {
    try {
      const mtimeMs = statSync(path.join(ROOT, relativePath)).mtimeMs;
      if (mtimeMs > latest) latest = mtimeMs;
    } catch {
      /* missing file — skip */
    }
  }
  return latest ? new Date(latest).toISOString().slice(0, 10) : null;
}

/** Source files that meaningfully change each route's content. */
function sourcesForRoute(routePath) {
  if (routePath === "/") {
    return ["src/data/projects.js", "src/data/stats.js", "src/data/availability.js", "src/config/seoConfig.js"];
  }
  if (routePath === "/projects") return ["src/data/projects.js", "src/config/seoConfig.js"];
  if (routePath === "/services") {
    return ["src/data/services.js", "src/data/availability.js", "src/config/seoConfig.js"];
  }
  if (routePath.startsWith("/work/")) return ["src/data/caseStudies.js", "src/config/seoConfig.js"];
  if (routePath.startsWith("/guides/")) return ["src/data/services.js", "src/config/seoConfig.js"];
  if (routePath.startsWith("/services/")) return ["src/data/services.js", "src/config/seoConfig.js"];
  if (routePath === "/experience") return ["src/data/experience.js", "src/config/seoConfig.js"];
  if (routePath === "/research") return ["src/data/research.js", "src/config/seoConfig.js"];
  if (routePath === "/certifications") return ["src/data/certifications.js", "src/config/seoConfig.js"];
  if (routePath === "/skills") return ["src/data/skills.js", "src/config/seoConfig.js"];
  if (routePath === "/about") {
    return ["src/data/availability.js", "src/config/seoConfig.js", "public/resume.pdf"];
  }
  if (routePath === "/achievements") return ["src/data/achievements.js", "src/config/seoConfig.js"];
  return ["src/config/seoConfig.js"];
}

function resolveRouteLastmod(routePath, fallback = resolveBuildDate()) {
  return fileMtimeDate(...sourcesForRoute(routePath)) || fallback;
}

function isIndexableRoute(routePath) {
  const robots = SEO_CONFIG[routePath]?.robots || "";
  return !/noindex/i.test(robots);
}

/** Canonical routes plus research / resume PDF assets. Query highlight URLs are omitted. */
export function collectSitemapEntries(fallbackLastmod = resolveBuildDate()) {
  const entries = SEO_ROUTE_ORDER.filter(isIndexableRoute).map((routePath) => {
    const meta = SEO_ROUTE_META[routePath] || {
      priority: routePath === "/" ? "1.0" : "0.8",
      changefreq: "monthly",
    };
    return {
      loc: routePath === "/" ? `${SITE_URL}/` : `${SITE_URL}${routePath}`,
      lastmod: resolveRouteLastmod(routePath, fallbackLastmod),
      changefreq: meta.changefreq,
      priority: String(meta.priority),
    };
  });

  for (const paper of researchPapers) {
    if (paper.pdfUrl) {
      const publicPath = paper.pdfUrl.replace(/^\//, "");
      entries.push({
        loc: `${SITE_URL}${paper.pdfUrl}`,
        lastmod: fileMtimeDate(`public/${publicPath}`) || fallbackLastmod,
        changefreq: "yearly",
        priority: "0.7",
      });
    }
  }

  for (const resume of [
    { loc: "/resume.pdf", priority: "0.6" },
    { loc: "/resume-latex.pdf", priority: "0.5" },
  ]) {
    entries.push({
      loc: `${SITE_URL}${resume.loc}`,
      lastmod: fileMtimeDate(`public${resume.loc}`) || fallbackLastmod,
      changefreq: "monthly",
      priority: resume.priority,
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

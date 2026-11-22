/**
 * Phase 7 — real build-time content snapshots for crawlers (Vite SPA middle path).
 *
 * Full React SSR is intentionally not used. After `vite build`, this script copies
 * dist/index.html per SEO route and injects:
 *   1) route-specific <head> meta + JSON-LD (@graph from seoConfig)
 *   2) a visible <article id="prerender-content" data-prerender="true"> sibling
 *      placed before #root with semantic HTML from the same data modules the app uses
 *
 * Priority bodies (full page content for view-source / non-JS crawlers):
 *   - /services — packages + prices, process, FAQ, inquiry heading
 *   - /work/:slug — full case study sections
 *   - /guides/:slug — full guide sections
 * Lighter summaries for /about, /projects, and most list pages. Home stays thin.
 *
 * Runtime: main.jsx removes #prerender-content (and [data-prerender]) after React
 * mounts so users do not see duplicate content. index.css also hides [data-prerender]
 * once html.js is set. Crawlers that skip JS keep the full article in the HTML file.
 *
 * Phase 6 note: head injection uses a </head> replacer function so `$` in prices
 * is never treated as a RegExp substitution token.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SEO_CONFIG,
  SEO_ROUTE_ORDER,
  buildBaseSchemas,
  DEFAULT_IMAGE,
  DEFAULT_IMAGE_ALT,
  SITE_NAME,
  TWITTER_HANDLE,
  routeOgImage,
} from "../src/config/seoConfig.js";
import { projects } from "../src/data/projects.js";
import { certifications } from "../src/data/certifications.js";
import { aboutInfo, experiences } from "../src/data/experience.js";
import { CASE_STUDIES } from "../src/data/caseStudies.js";
import { researchPapers } from "../src/data/research.js";
import { AVAILABILITY, PRIMARY_CTA } from "../src/data/availability.js";
import {
  SERVICES_FAQ,
  SERVICES_GUIDES,
  SERVICES_HERO,
  SERVICES_PACKAGES,
  SERVICES_PRICE_NOTE,
  SERVICES_PROCESS,
  WEB_ADDONS,
  WEB_EVERY_SITE,
  WEB_FAQ,
  WEB_PACKAGES,
  WEB_PROCESS,
  SERVICE_LANDINGS,
  formatInr,
  formatUsd,
} from "../src/data/services.js";

const distDir = new URL("../dist/", import.meta.url);
const baseHtmlPath = new URL("index.html", distDir);

const EXTRA_DATA = {
  "/": { projects },
  "/projects": { projects },
  "/experience": { experiences },
  "/certifications": { certifications },
  "/research": { papers: researchPapers },
  "/services": { faqItems: [...SERVICES_FAQ, ...WEB_FAQ] },
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function toGraph(schemas = []) {
  const nodes = schemas.map((schema) => {
    if (!schema || typeof schema !== "object") return null;
    const { "@context": _ctx, ...rest } = schema;
    return rest;
  }).filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}

function jsonScript(graph) {
  return `<script type="application/ld+json" data-page-seo="true">${JSON.stringify(graph).replaceAll("</", "<\\/")}</script>`;
}

function metaName(name, content, extra = "") {
  if (!content) return "";
  return `<meta name="${name}" content="${escapeHtml(content)}"${extra} />`;
}

function metaProperty(property, content) {
  if (!content) return "";
  return `<meta property="${property}" content="${escapeHtml(content)}" />`;
}

function routeLinks(currentPath) {
  return SEO_ROUTE_ORDER.filter((routePath) => routePath !== currentPath)
    .slice(0, 16)
    .map(
      (routePath) =>
        `<li><a href="${routePath}">${escapeHtml(SEO_CONFIG[routePath]?.title || routePath)}</a></li>`,
    )
    .join("");
}

function listItems(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function packageBlock(pack, { priceLine }) {
  const includes = Array.isArray(pack.includes) ? listItems(pack.includes) : "";
  return `<section>
  <h3>${escapeHtml(pack.name)}</h3>
  <p><strong>Price:</strong> ${escapeHtml(priceLine)}</p>
  ${pack.timeline ? `<p><strong>Timeline:</strong> ${escapeHtml(pack.timeline)}</p>` : ""}
  ${pack.forWho ? `<p>${escapeHtml(pack.forWho)}</p>` : ""}
  ${pack.priceDetail ? `<p>${escapeHtml(pack.priceDetail)}</p>` : ""}
  ${includes ? `<ul>${includes}</ul>` : ""}
</section>`;
}

function webPriceLine(pack) {
  const prefix = pack.priceKind === "from" ? "From" : "Starting at";
  const suffix = pack.priceSuffix || "";
  return `${prefix} ${formatInr(pack.priceInr)}${suffix} · ${prefix} ${formatUsd(pack.priceUsd)}${suffix}`;
}

function aiPriceLine(pack) {
  // priceLabel already pairs USD + INR; fall back to separate labels when needed.
  if (pack.priceLabel) return pack.priceLabel;
  return [pack.priceLabelUsd, pack.priceLabelInr].filter(Boolean).join(" · ");
}

/** Full Services page body: packages, process, FAQ, inquiry — visible in view-source. */
function servicesFullBody() {
  const webBlocks = WEB_PACKAGES.map((pack) =>
    packageBlock(pack, { priceLine: webPriceLine(pack) }),
  ).join("");
  const aiBlocks = SERVICES_PACKAGES.map((pack) =>
    packageBlock(pack, { priceLine: aiPriceLine(pack) }),
  ).join("");
  const faq = [...SERVICES_FAQ, ...WEB_FAQ]
    .map(
      (item) =>
        `<dt>${escapeHtml(item.q)}</dt><dd>${escapeHtml(item.a)}</dd>`,
    )
    .join("");

  return [
    `<p class="eyebrow">${escapeHtml(SERVICES_HERO.eyebrow)}</p>`,
    `<p>${escapeHtml(SERVICES_HERO.subline)}</p>`,
    `<p><strong>Availability:</strong> ${escapeHtml(AVAILABILITY.label)}. ${escapeHtml(AVAILABILITY.detail)}</p>`,
    `<p><a href="#inquiry">${escapeHtml(PRIMARY_CTA.label)}</a></p>`,
    `<h2>Website packages</h2>`,
    webBlocks,
    `<h2>Included with every website</h2><ul>${listItems(WEB_EVERY_SITE)}</ul>`,
    `<h2>Optional add-ons</h2><ul>${listItems(WEB_ADDONS)}</ul>`,
    `<h2>Website process</h2><ol>${listItems(WEB_PROCESS)}</ol>`,
    `<h2>AI packages</h2>`,
    aiBlocks,
    `<p>${escapeHtml(SERVICES_PRICE_NOTE)}</p>`,
    `<h2>AI process</h2><ol>${listItems(SERVICES_PROCESS)}</ol>`,
    `<h2>FAQ</h2><dl>${faq}</dl>`,
    `<h2 id="inquiry">${escapeHtml(PRIMARY_CTA.label)}</h2>`,
    `<p>Send a project brief for a clear scope outline. ${escapeHtml(AVAILABILITY.detail)}</p>`,
  ].join("");
}

/** Full case study body from CASE_STUDIES data. */
function caseStudyFullBody(study) {
  return [
    study.oneLiner ? `<p>${escapeHtml(study.oneLiner)}</p>` : "",
    study.stack?.length
      ? `<p><strong>Stack:</strong> ${escapeHtml(study.stack.join(", "))}</p>`
      : "",
    `<h2>Problem</h2><p>${escapeHtml(study.problem)}</p>`,
    `<h2>Approach</h2><p>${escapeHtml(study.approach)}</p>`,
    `<h2>Architecture</h2><p>${escapeHtml(study.architecture)}</p>`,
    study.outcome ? `<h2>Outcome</h2><p>${escapeHtml(study.outcome)}</p>` : "",
    study.retrospective
      ? `<h2>What I would do differently</h2><p>${escapeHtml(study.retrospective)}</p>`
      : "",
    study.live
      ? `<p><a href="${escapeHtml(study.live)}">${escapeHtml(
          study.liveAnchor || "Live demo",
        )}</a></p>`
      : "",
    study.github
      ? `<p><a href="${escapeHtml(study.github)}">Source repository</a></p>`
      : "",
    `<p><a href="/services">Back to services</a> · <a href="${escapeHtml(PRIMARY_CTA.to)}">${escapeHtml(PRIMARY_CTA.label)}</a></p>`,
  ].join("");
}

/** Full service landing body from SERVICE_LANDINGS data. */
function serviceLandingFullBody(landing) {
  const process = listItems(landing.process || []);
  const faq = (landing.faq || [])
    .map(
      (item) =>
        `<dt>${escapeHtml(item.q)}</dt><dd>${escapeHtml(item.a)}</dd>`,
    )
    .join("");
  return [
    landing.description ? `<p>${escapeHtml(landing.description)}</p>` : "",
    process ? `<h2>Process</h2><ol>${process}</ol>` : "",
    faq ? `<h2>FAQ</h2><dl>${faq}</dl>` : "",
    `<p><a href="/services#inquiry">Request a quote</a></p>`,
  ].join("");
}

/** Full guide body from SERVICES_GUIDES data. */
function guideFullBody(guide) {
  const sections = (guide.sections || [])
    .map(
      (section) =>
        `<h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.body)}</p>`,
    )
    .join("");
  return [
    guide.description ? `<p>${escapeHtml(guide.description)}</p>` : "",
    sections,
    `<p><a href="/services#inquiry">Request a quote</a></p>`,
  ].join("");
}

function routeExtraBody(path) {
  if (path === "/") {
    // Home stays thin — brand + description in the article shell is enough.
    return `<p><a href="/services">${escapeHtml(PRIMARY_CTA.label)}</a> · <a href="/projects">View projects</a></p>`;
  }

  if (path === "/projects") {
    const items = projects
      .slice(0, 12)
      .map(
        (project) =>
          `<li><strong>${escapeHtml(project.title)}</strong> — ${escapeHtml(
            String(project.description || ""),
          )}${
            project.links?.preview
              ? ` (<a href="${escapeHtml(project.links.preview)}">${escapeHtml(
                  project.liveAnchor || `${project.title} live demo`,
                )}</a>)`
              : ""
          }</li>`,
      )
      .join("");
    return `<h2>Selected work</h2><ul>${items}</ul>`;
  }

  if (path === "/about") {
    const bio = String(aboutInfo.bio || "")
      .split(/\n\n+/)
      .map((para) => `<p>${escapeHtml(para)}</p>`)
      .join("");
    const highlights = (aboutInfo.highlights || [])
      .map(
        (item) =>
          `<li><strong>${escapeHtml(item.title)}:</strong> ${escapeHtml(item.description)}</li>`,
      )
      .join("");
    return [
      `<p><strong>${escapeHtml(aboutInfo.title)}</strong> — ${escapeHtml(aboutInfo.tagline)}</p>`,
      bio,
      highlights ? `<h2>Highlights</h2><ul>${highlights}</ul>` : "",
      aboutInfo.email
        ? `<p><a href="mailto:${escapeHtml(aboutInfo.email)}">${escapeHtml(aboutInfo.email)}</a></p>`
        : "",
    ].join("");
  }

  if (path === "/services") {
    return servicesFullBody();
  }

  if (path.startsWith("/work/")) {
    const slug = path.replace("/work/", "");
    const study = CASE_STUDIES.find((entry) => entry.slug === slug);
    if (!study) return "";
    return caseStudyFullBody(study);
  }

  if (path.startsWith("/guides/")) {
    const slug = path.replace("/guides/", "");
    const guide = SERVICES_GUIDES.find((entry) => entry.slug === slug);
    if (!guide) return "";
    return guideFullBody(guide);
  }

  if (path.startsWith("/services/")) {
    const slug = path.replace("/services/", "");
    const landing = SERVICE_LANDINGS.find((entry) => entry.slug === slug);
    if (!landing) return "";
    return serviceLandingFullBody(landing);
  }

  if (path === "/research") {
    return researchPapers
      .map((paper) => {
        const highlights = (paper.highlights || [])
          .map(
            (item) =>
              `<li><strong>${escapeHtml(item.label)}:</strong> ${escapeHtml(item.value)}${
                item.detail ? ` — ${escapeHtml(item.detail)}` : ""
              }</li>`,
          )
          .join("");
        const sections = (paper.sections || [])
          .map(
            (section) =>
              `<h3>${escapeHtml(section.title)}</h3><p>${escapeHtml(section.body)}</p>`,
          )
          .join("");
        return [
          `<section>`,
          `<h2>${escapeHtml(paper.title)}${paper.subtitle ? `: ${escapeHtml(paper.subtitle)}` : ""}</h2>`,
          `<p>${escapeHtml(paper.summary || paper.abstract || "")}</p>`,
          paper.abstract && paper.summary
            ? `<p>${escapeHtml(paper.abstract)}</p>`
            : "",
          highlights ? `<ul>${highlights}</ul>` : "",
          sections,
          paper.pdfUrl
            ? `<p><a href="${escapeHtml(paper.pdfUrl)}">Read the full PDF</a></p>`
            : "",
          `</section>`,
        ].join("");
      })
      .join("");
  }

  if (path === "/certifications") {
    const items = certifications
      .map(
        (cert) =>
          `<li><strong>${escapeHtml(cert.title)}</strong> — ${escapeHtml(cert.issuer)}</li>`,
      )
      .join("");
    return `<h2>Credentials</h2><ul>${items}</ul>`;
  }

  if (path === "/experience") {
    return experiences
      .map((exp) => {
        const points = (exp.responsibilities || [])
          .map((point) => `<li>${escapeHtml(point)}</li>`)
          .join("");
        return `<section>
  <h2>${escapeHtml(exp.position)} · ${escapeHtml(exp.company)}</h2>
  <p>${escapeHtml(exp.period)}${exp.location ? ` · ${escapeHtml(exp.location)}` : ""}</p>
  ${points ? `<ul>${points}</ul>` : ""}
</section>`;
      })
      .join("");
  }

  return "";
}

function routeArticle(path, config) {
  const heading =
    path === "/"
      ? "Aryan Dani — Freelance AI Engineer & Full-Stack Developer"
      : path === "/services"
        ? SERVICES_HERO.headline
        : path.startsWith("/work/")
          ? CASE_STUDIES.find((s) => s.slug === path.replace("/work/", ""))?.title || config.title
          : path.startsWith("/guides/")
            ? SERVICES_GUIDES.find((g) => g.slug === path.replace("/guides/", ""))?.title ||
              config.title
            : path.startsWith("/services/")
              ? SERVICE_LANDINGS.find((l) => l.slug === path.replace("/services/", ""))?.title ||
                config.title
              : config.title;
  const extra = routeExtraBody(path);

  // Visible in the HTML file (view-source / non-JS). Hidden/removed after React mounts.
  return `<article id="prerender-content" data-prerender="true">
  <main>
    <h1>${escapeHtml(heading)}</h1>
    <p>${escapeHtml(config.description)}</p>
    ${extra}
    <nav aria-label="Portfolio sections">
      <ul>${routeLinks(path)}</ul>
    </nav>
  </main>
</article>`;
}

function replaceHead(html, config, graph, routePath) {
  const image = config.ogImage || routeOgImage(routePath) || DEFAULT_IMAGE;
  const imageAlt = config.imageAlt || DEFAULT_IMAGE_ALT;
  const headMeta = [
    `<title>${escapeHtml(config.title)}</title>`,
    metaName("title", config.title),
    metaName("description", config.description),
    metaName("keywords", config.keywords),
    metaName("author", "Aryan Dani"),
    metaName("creator", "Aryan Dani"),
    metaName("publisher", "Aryan Dani"),
    metaName("application-name", SITE_NAME),
    metaName("generator", "Vite + React"),
    metaName("robots", config.robots),
    metaName("theme-color", "#f5f5f5", ' media="(prefers-color-scheme: light)"'),
    metaName("theme-color", "#272727", ' media="(prefers-color-scheme: dark)"'),
    `<link rel="canonical" href="${escapeHtml(config.canonical)}" />`,
    metaProperty("og:type", config.ogType || "website"),
    metaProperty("og:url", config.canonical),
    metaProperty("og:locale", "en_US"),
    metaProperty("og:title", config.title),
    metaProperty("og:description", config.description),
    metaProperty("og:image", image),
    metaProperty("og:image:width", "1200"),
    metaProperty("og:image:height", "630"),
    metaProperty("og:image:type", "image/png"),
    metaProperty("og:image:alt", imageAlt),
    metaProperty("og:site_name", SITE_NAME),
    metaName("twitter:card", "summary_large_image"),
    metaName("twitter:url", config.canonical),
    metaName("twitter:title", config.title),
    metaName("twitter:description", config.description),
    metaName("twitter:image", image),
    metaName("twitter:image:alt", imageAlt),
    metaName("twitter:creator", TWITTER_HANDLE),
    metaName("twitter:site", TWITTER_HANDLE),
    jsonScript(graph),
  ]
    .filter(Boolean)
    .join("\n    ");

  // Keep charset/viewport first; place route meta + JSON-LD before </head> (ahead of body scripts).
  // Use a replacer function so `$` in prices is not treated as a RegExp substitution.
  return html
    .replace(/<title>[\s\S]*?<\/title>/, "")
    .replace(
      /<meta\s+(?:name|property)="(?:title|description|keywords|robots|author|creator|publisher|application-name|generator|theme-color|twitter:[^"]+|og:[^"]+)"[\s\S]*?>/g,
      "",
    )
    .replace(/<link rel="canonical"[\s\S]*?>/g, "")
    .replace(/<!--\s*Structured Data[\s\S]*?-->/g, "")
    .replace(/<script type="application\/ld\+json"[\s\S]*?<\/script>/g, "")
    .replace(/<\/head>/i, () => `    ${headMeta}\n  </head>`);
}

async function writeRouteHtml(routePath, html) {
  const relativePath = routePath === "/" ? "index.html" : `${routePath.slice(1)}/index.html`;
  const outputUrl = new URL(relativePath, distDir);
  await mkdir(dirname(fileURLToPath(outputUrl)), { recursive: true });
  await writeFile(outputUrl, html, "utf8");
}

const rawBaseHtml = await readFile(baseHtmlPath, "utf8");
// Strip prior snapshots if dist/index.html was already prerendered (safe re-runs).
const baseHtml = rawBaseHtml
  .replace(/<article\s+id="prerender-content"[\s\S]*?<\/article>\s*/gi, "")
  .replace(/<article\s+id="seo-prerender"[\s\S]*?<\/article>\s*/gi, "");

for (const routePath of SEO_ROUTE_ORDER) {
  const config = SEO_CONFIG[routePath];
  const routeSchemas = [
    ...buildBaseSchemas(),
    ...(config.schemas?.(EXTRA_DATA[routePath]) || []),
  ];
  const graph = toGraph(routeSchemas);
  const routeHtml = replaceHead(baseHtml, config, graph, routePath).replace(
    '<div id="root"></div>',
    `${routeArticle(routePath, config)}\n    <div id="root"></div>`,
  );
  await writeRouteHtml(routePath, routeHtml);
}

const notFoundConfig = SEO_CONFIG["/404"];
const notFoundHtml = replaceHead(
  baseHtml,
  notFoundConfig,
  toGraph(notFoundConfig.schemas?.() || []),
  "/404",
).replace(
  '<div id="root"></div>',
  `${routeArticle("/404", notFoundConfig)}\n    <div id="root"></div>`,
);
await writeFile(new URL("404.html", distDir), notFoundHtml, "utf8");

console.log(`Prerendered SEO HTML for ${SEO_ROUTE_ORDER.length} routes plus 404.`);

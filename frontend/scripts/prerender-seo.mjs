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
import { experiences } from "../src/data/experience.js";
import { CASE_STUDIES } from "../src/data/caseStudies.js";
import {
  SERVICES_FAQ,
  SERVICES_PACKAGES,
  WEB_FAQ,
  WEB_PACKAGES,
} from "../src/data/services.js";

const distDir = new URL("../dist/", import.meta.url);
const baseHtmlPath = new URL("index.html", distDir);

const EXTRA_DATA = {
  "/": { projects },
  "/projects": { projects },
  "/experience": { experiences },
  "/certifications": { certifications },
  "/services": { faqItems: [...SERVICES_FAQ, ...WEB_FAQ] },
  "/contact": {
    faqItems: [
      {
        q: "Is Aryan Dani available for freelance projects?",
        a: "Yes. Aryan Dani is open to freelance web development, AI engineering, and full-stack collaboration opportunities.",
      },
      {
        q: "What does Aryan Dani specialize in?",
        a: "Aryan Dani specializes in AI agents, RAG pipelines, computer vision, and full-stack Next.js and React applications for startups and local businesses.",
      },
    ],
  },
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

function routeExtraBody(path) {
  if (path === "/" || path === "/projects") {
    const items = projects
      .slice(0, 12)
      .map(
        (project) =>
          `<li><strong>${escapeHtml(project.title)}</strong> — ${escapeHtml(
            String(project.description || "").slice(0, 160),
          )}</li>`,
      )
      .join("");
    return `<h2>Selected work</h2><ul>${items}</ul>`;
  }

  if (path === "/services") {
    const packs = [...WEB_PACKAGES, ...SERVICES_PACKAGES]
      .map(
        (pack) =>
          `<li><strong>${escapeHtml(pack.name)}</strong> — ${escapeHtml(
            pack.forWho || pack.priceLabel || "",
          )}</li>`,
      )
      .join("");
    return `<h2>Packages</h2><ul>${packs}</ul>`;
  }

  if (path.startsWith("/work/")) {
    const slug = path.replace("/work/", "");
    const study = CASE_STUDIES.find((entry) => entry.slug === slug);
    if (!study) return "";
    return [
      `<h2>Problem</h2><p>${escapeHtml(study.problem)}</p>`,
      `<h2>Approach</h2><p>${escapeHtml(study.approach)}</p>`,
      `<h2>Architecture</h2><p>${escapeHtml(study.architecture)}</p>`,
      study.live
        ? `<p><a href="${escapeHtml(study.live)}">Live demo</a></p>`
        : "",
    ].join("");
  }

  if (path === "/certifications") {
    const items = certifications
      .slice(0, 12)
      .map(
        (cert) =>
          `<li><strong>${escapeHtml(cert.title)}</strong> — ${escapeHtml(cert.issuer)}</li>`,
      )
      .join("");
    return `<h2>Credentials</h2><ul>${items}</ul>`;
  }

  return "";
}

function routeArticle(path, config) {
  const heading =
    path === "/"
      ? "Aryan Dani — Freelance AI Engineer & Full-Stack Developer"
      : config.title;
  const extra = routeExtraBody(path);

  return `<article data-prerender="true">
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

  return html
    .replace(/<title>[\s\S]*?<\/title>/, "")
    .replace(
      /<meta\s+(?:name|property)="(?:title|description|keywords|robots|author|creator|publisher|application-name|generator|theme-color|twitter:[^"]+|og:[^"]+)"[\s\S]*?>/g,
      "",
    )
    .replace(/<link rel="canonical"[\s\S]*?>/g, "")
    .replace(/<script type="application\/ld\+json"[\s\S]*?<\/script>/g, "")
    .replace("</head>", `    ${headMeta}\n  </head>`);
}

async function writeRouteHtml(routePath, html) {
  const relativePath = routePath === "/" ? "index.html" : `${routePath.slice(1)}/index.html`;
  const outputUrl = new URL(relativePath, distDir);
  await mkdir(dirname(fileURLToPath(outputUrl)), { recursive: true });
  await writeFile(outputUrl, html, "utf8");
}

const baseHtml = await readFile(baseHtmlPath, "utf8");

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

import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import { SEO_ROUTE_ORDER, SITE_URL } from "../src/config/seoConfig.js";
import { CASE_STUDIES } from "../src/data/caseStudies.js";
import { SERVICES_GUIDES } from "../src/data/services.js";
import { INDEXNOW_KEY } from "./indexnow-key.mjs";
import { writeSitemap } from "./generate-sitemap.mjs";

const publicDir = new URL("../public/", import.meta.url);
const fontsDir = new URL("./fonts/", import.meta.url);
const contentDate = new Date().toISOString().slice(0, 10);

const PAPER = "#f8f7f4";
const INK = "#131316";
const MUTED = "#454449";
const WHITE = "#ffffff";

const FONT_SPACE = fileURLToPath(new URL("SpaceGrotesk-Variable.ttf", fontsDir));

function xmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function writePublicFile(path, contents, encoding = "utf8") {
  await writeFile(new URL(path, publicDir), contents, encoding);
}

function routeSlug(path) {
  return path === "/" ? "home" : path.replace(/^\//, "").replace(/\//g, "-");
}

function wrapLines(text, maxChars, maxLines = 2) {
  const words = String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  if (!words.length) return [];

  const lines = [];
  let current = "";
  let wordIndex = 0;

  while (wordIndex < words.length && lines.length < maxLines) {
    const word = words[wordIndex];
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = "";
      continue;
    }
    current = next;
    wordIndex += 1;
  }

  if (current && lines.length < maxLines) lines.push(current);

  if (wordIndex < words.length && lines.length) {
    const last = lines[lines.length - 1];
    lines[lines.length - 1] = `${last.replace(/[.,;:!?]?$/, "")}…`;
  }

  return lines;
}

function splitForcedLines(text, maxChars, maxLines = 2) {
  const forced = String(text || "").split("\n").map((line) => line.trim()).filter(Boolean);
  if (forced.length <= 1) return wrapLines(text, maxChars, maxLines);

  const perLine = Math.max(1, Math.floor(maxLines / forced.length));
  const lines = [];
  for (let i = 0; i < forced.length; i += 1) {
    const remainingSlots = maxLines - lines.length;
    if (remainingSlots <= 0) break;
    const slots = i === forced.length - 1 ? remainingSlots : Math.min(perLine, remainingSlots);
    lines.push(...wrapLines(forced[i], maxChars, slots));
  }
  return lines.slice(0, maxLines);
}

const STATIC_OG_COPY = {
  "/": {
    kicker: "PORTFOLIO",
    headline: "Freelance AI Engineer\n& Full-Stack Dev",
    subline: "Custom agents, RAG pipelines, and production web apps from Pune.",
  },
  "/projects": {
    kicker: "WORK",
    headline: "Shipped AI &\nweb products",
    subline: "Live case studies across agents, RAG, and full-stack builds.",
  },
  "/services": {
    kicker: "HIRE",
    headline: "Websites &\nAI tools",
    subline: "Fixed quotes from INR 8,000. India and worldwide.",
  },
  "/experience": {
    kicker: "EXPERIENCE",
    headline: "AI engineer\nin the field",
    subline: "Internships, product work, and shipped systems that hold up.",
  },
  "/research": {
    kicker: "RESEARCH",
    headline: "Papers &\ntechnical write-ups",
    subline: "Threat detection research with a full PDF you can open.",
  },
  "/certifications": {
    kicker: "CREDENTIALS",
    headline: "AI & cloud\ncertifications",
    subline: "Google, IBM, and related credentials in one place.",
  },
  "/skills": {
    kicker: "STACK",
    headline: "Tools that\nship products",
    subline: "Python, LangGraph, React, Vite, FastAPI, CV, and cloud.",
  },
  "/about": {
    kicker: "ABOUT",
    headline: "Aryan Dani,\nPune",
    subline: "MIT-WPU. Google Student Ambassador. Building AI and the web.",
  },
  "/playground": {
    kicker: "PLAYGROUND",
    headline: "CLI for\nthis portfolio",
    subline: "Query projects, skills, and pages from an interactive terminal.",
  },
  "/achievements": {
    kicker: "TROPHY WALL",
    headline: "Unlock the\nhidden badges",
    subline: "CLI tricks, easter eggs, and modes waiting to be found.",
  },
  "/guestbook": {
    kicker: "GUESTBOOK",
    headline: "Leave a note\non the wall",
    subline: "Say hello, share feedback, or drop a short reaction.",
  },
  "/copyright": {
    kicker: "LICENSE",
    headline: "Copyright &\nMIT terms",
    subline: "What you can reuse, share, and modify in this open project.",
  },
  "/contact": {
    kicker: "CONTACT",
    headline: "Start a\nproject",
    subline: "Freelance AI engineering, web builds, and collaborations.",
  },
};

function ogCopyForPath(path) {
  if (STATIC_OG_COPY[path]) return STATIC_OG_COPY[path];

  if (path.startsWith("/work/")) {
    const slug = path.replace("/work/", "");
    const study = CASE_STUDIES.find((entry) => entry.slug === slug);
    return {
      kicker: "CASE STUDY",
      headline: study?.title || "Case study",
      subline: study?.oneLiner || "Shipped work by Aryan Dani.",
    };
  }

  if (path.startsWith("/guides/")) {
    const slug = path.replace("/guides/", "");
    const guide = SERVICES_GUIDES.find((entry) => entry.slug === slug);
    return {
      kicker: "GUIDE",
      headline: guide?.title || "Guide",
      subline: guide?.description || "Practical notes from Aryan Dani.",
    };
  }

  return {
    kicker: "ARYAN DANI",
    headline: "AI Engineer &\nFull-Stack Dev",
    subline: "Portfolio, services, and shipped work from Pune.",
  };
}

function buildOgSvg({ kicker, headline, subline }) {
  const headlineLines = splitForcedLines(headline, 22, 2);
  const sublineLines = wrapLines(subline, 48, 2);
  const headlineStartY = headlineLines.length === 1 ? 300 : 268;
  const headlineSvg = headlineLines
    .map(
      (line, index) =>
        `<text x="88" y="${headlineStartY + index * 76}" fill="${INK}" font-family="Space Grotesk" font-size="70" font-weight="700">${xmlEscape(line)}</text>`,
    )
    .join("\n  ");
  const sublineStartY = 430;
  const sublineSvg = sublineLines
    .map(
      (line, index) =>
        `<text x="88" y="${sublineStartY + index * 34}" fill="${MUTED}" font-family="Space Grotesk" font-size="26" font-weight="500">${xmlEscape(line)}</text>`,
    )
    .join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${PAPER}"/>
  <rect x="64" y="64" width="1080" height="520" fill="${INK}"/>
  <rect x="48" y="48" width="1080" height="520" fill="${WHITE}" stroke="${INK}" stroke-width="10"/>
  <rect x="88" y="88" width="72" height="72" fill="${INK}"/>
  <text x="124" y="136" text-anchor="middle" fill="${PAPER}" font-family="Space Grotesk" font-size="28" font-weight="700">AD</text>
  <text x="180" y="134" fill="${INK}" font-family="Space Grotesk" font-size="26" font-weight="700">ARYAN DANI</text>
  <rect x="88" y="196" width="14" height="14" fill="${INK}"/>
  <text x="116" y="210" fill="${MUTED}" font-family="Space Grotesk" font-size="22" font-weight="700" letter-spacing="4">${xmlEscape(kicker)}</text>
  ${headlineSvg}
  ${sublineSvg}
  <rect x="48" y="500" width="1080" height="68" fill="${INK}"/>
  <text x="88" y="542" fill="${PAPER}" font-family="Space Grotesk" font-size="24" font-weight="700">aryandani.com</text>
  <text x="1088" y="542" text-anchor="end" fill="${PAPER}" font-family="Space Grotesk" font-size="22" font-weight="500">AI · Web · Pune</text>
</svg>`;
}

async function renderOgPng(copy) {
  const svg = buildOgSvg(copy);
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
    font: {
      fontFiles: [FONT_SPACE],
      loadSystemFonts: false,
      defaultFontFamily: "Space Grotesk",
    },
  });
  return resvg.render().asPng();
}

function buildRobots() {
  return `# robots.txt for ${SITE_URL}/

User-agent: *
Allow: /
Disallow: /api/

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: CCBot
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

function buildLlmsTxt() {
  return `# Aryan Dani

> AI Engineer and Full Stack Developer in Pune, India (MIT-WPU). Builds agentic AI, computer vision, RAG, and production web apps. This portfolio site runs on React, Vite, React Router, Tailwind CSS, and Framer Motion.

## Site
- [Portfolio home](${SITE_URL}/): Overview, stats, and entry points to projects and contact
- [Projects](${SITE_URL}/projects): Shipped AI and full-stack work (Utility, Arbiter, Shadow Instructor, Democrazy, and more)
- [Services](${SITE_URL}/services): Websites and AI tools with fixed quotes from INR 8,000
- [Experience](${SITE_URL}/experience): ProvaanTech AI/ML intern, Artem HealthTech, MIT-WPU capstone
- [Research](${SITE_URL}/research): Research papers and technical write-ups (card catalog + PDFs)
- [Skills](${SITE_URL}/skills): Stack across Python, LLMs, LangGraph, React, Vite, FastAPI, CV, and cloud
- [About](${SITE_URL}/about): Bio, Google Student Ambassador, resume PDF
- [Contact](${SITE_URL}/contact): Email and hire/collaboration form
- [Resume PDF](${SITE_URL}/resume.pdf): Downloadable CV
- [Research PDF](${SITE_URL}/research-paper.pdf): Full threat-detection research paper

## Also useful
- [Certifications](${SITE_URL}/certifications): Google, IBM, and related credentials
- [GitHub](https://github.com/aryan-dani): Source repositories
- [LinkedIn](https://www.linkedin.com/in/aryandani/): Professional profile
`;
}

function buildHumansTxt() {
  return `/* TEAM */
Developer: Aryan Dani
Role: AI Engineer & Full Stack Developer
Site: ${SITE_URL}/
LinkedIn: https://www.linkedin.com/in/aryandani/
GitHub: https://github.com/aryan-dani

/* SITE */
Stack: React, Vite, Framer Motion, Lenis, Tailwind CSS
Language: English
Last updated: ${contentDate}
`;
}

function buildFaviconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#f8f7f4"/>
  <rect x="56" y="56" width="400" height="400" fill="#ffffff" stroke="#131316" stroke-width="28"/>
  <text x="256" y="300" text-anchor="middle" fill="#131316" font-family="Arial, sans-serif" font-size="150" font-weight="900">AD</text>
</svg>
`;
}

async function removeLegacyOgSvgs() {
  const entries = await readdir(publicDir);
  await Promise.all(
    entries
      .filter((name) => name === "og-image.svg" || /^og-.+\.svg$/.test(name))
      .map((name) => unlink(new URL(name, publicDir))),
  );
}

await mkdir(new URL("favicons/", publicDir), { recursive: true });
const sitemap = await writeSitemap();
await writePublicFile(`${INDEXNOW_KEY}.txt`, INDEXNOW_KEY);
await writePublicFile("robots.txt", buildRobots());
await writePublicFile("llms.txt", buildLlmsTxt());
await writePublicFile("humans.txt", buildHumansTxt());

const defaultPng = await renderOgPng(STATIC_OG_COPY["/"]);
await writePublicFile("og-image.png", defaultPng, null);

for (const path of SEO_ROUTE_ORDER) {
  const slug = routeSlug(path);
  const png = await renderOgPng(ogCopyForPath(path));
  await writePublicFile(`og-${slug}.png`, png, null);
}

await removeLegacyOgSvgs();
await writePublicFile("favicons/favicon.svg", buildFaviconSvg());
await writePublicFile("favicons/apple-touch-icon.svg", buildFaviconSvg());

console.log(`Generated SEO public assets (sitemap: ${sitemap.count} URLs, og png: ${SEO_ROUTE_ORDER.length + 1}).`);

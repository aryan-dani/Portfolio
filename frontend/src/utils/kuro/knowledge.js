/**
 * Entity indices and formatters for Kuro, built only from src/data modules.
 * Nothing here invents facts: every string comes from data or is a template around data.
 */
import { projects } from "../../data/projects.js";
import { experiences, aboutInfo, socialLinks } from "../../data/experience.js";
import { getAllSkills, skillCategories, getSkillCategoryId } from "../../data/skills.js";
import { CASE_STUDIES } from "../../data/caseStudies.js";
import { certifications } from "../../data/certifications.js";
import { researchPapers } from "../../data/research.js";
import { ACHIEVEMENTS } from "../../data/achievements.js";
import {
  SERVICES_FAQ,
  WEB_FAQ,
  SERVICES_PACKAGES,
  WEB_PACKAGES,
  WEB_COMMERCIAL,
  WEB_WIX_NOTE,
  WEB_ADDONS,
  WEB_EVERY_SITE,
  WEB_REVIEW_ROUNDS,
  SERVICE_LANDINGS,
  SERVICES_GUIDES,
  formatWebPackagePrice,
  formatAiPackagePrice,
} from "../../data/services.js";
import { normalize, findSequence, stem, contentTokens, truncate, stripHtml } from "./text.js";

export {
  projects,
  experiences,
  aboutInfo,
  socialLinks,
  certifications,
  researchPapers,
  ACHIEVEMENTS,
  SERVICES_FAQ,
  SERVICES_PACKAGES,
  WEB_PACKAGES,
  WEB_COMMERCIAL,
  WEB_REVIEW_ROUNDS,
  SERVICE_LANDINGS,
  SERVICES_GUIDES,
  CASE_STUDIES,
  skillCategories,
};

/* ------------------------------------------------------------------ pages */

export const PAGES = [
  { id: "home", path: "/", label: "Home", words: ["home", "homepage", "landing", "main page", "start page"] },
  { id: "projects", path: "/projects", label: "Projects", words: ["projects", "project page", "my work", "work page", "gallery"] },
  { id: "services", path: "/services", label: "Services", words: ["services", "service page", "pricing page", "packages page", "hire page", "rates page"] },
  { id: "experience", path: "/experience", label: "Experience", words: ["experience", "career", "work history", "jobs", "timeline page"] },
  { id: "research", path: "/research", label: "Research", words: ["research", "papers", "publications"] },
  { id: "certifications", path: "/certifications", label: "Certifications", words: ["certifications", "certificates", "certs", "credentials"] },
  { id: "skills", path: "/skills", label: "Skills", words: ["skills", "skill page", "skill vault", "tech stack page"] },
  { id: "about", path: "/about", label: "About", words: ["about", "about page", "bio page"] },
  { id: "contact", path: "/services#inquiry", label: "Inquiry form", words: ["contact", "inquiry", "enquiry", "contact page", "contact form", "inquiry form", "hire form"] },
  { id: "playground", path: "/playground", label: "Playground", words: ["playground", "terminal", "cli", "console", "shell"] },
  { id: "achievements", path: "/achievements", label: "Achievements", words: ["achievements", "badges", "trophies"] },
  { id: "guestbook", path: "/guestbook", label: "Guestbook", words: ["guestbook", "guest book", "wall"] },
  { id: "copyright", path: "/copyright", label: "Copyright", words: ["copyright", "license", "legal"] },
];

export const PAGE_BY_ID = Object.fromEntries(PAGES.map((p) => [p.id, p]));

export const SWARM_PATHS = new Set([
  "/projects",
  "/skills",
  "/achievements",
  "/certifications",
  "/experience",
  "/research",
  "/services",
]);

/** Words that name a page only after an explicit "go to / open" verb (bare "pricing" gets an answer). */
const VERB_ONLY_WORDS = { services: ["pricing", "packages", "rates", "price list", "prices"] };

const PAGE_INDEX = PAGES.map((page) => ({
  page,
  phrases: page.words.map((w) => normalize(w).tokens),
  verbPhrases: (VERB_ONLY_WORDS[page.id] || []).map((w) => normalize(w).tokens),
}));

/** Tokens that name a page on their own (used to tell "just a page name" from longer questions). */
export const PAGE_WORD_STEMS = new Set(PAGE_INDEX.flatMap((e) => e.phrases.flat()).map(stem));
export const PAGE_VERB_STEMS = new Set(PAGE_INDEX.flatMap((e) => e.verbPhrases.flat()).map(stem));

/** Pages mentioned in the utterance, best (longest phrase) first. */
export function findPages(tokens, { withVerb = false } = {}) {
  const found = [];
  for (const { page, phrases, verbPhrases } of PAGE_INDEX) {
    let best = 0;
    for (const phrase of withVerb ? [...phrases, ...verbPhrases] : phrases) {
      if (findSequence(tokens, phrase, { fuzzy: true }) >= 0) {
        best = Math.max(best, phrase.join("").length);
      }
    }
    if (best) found.push({ page, score: best });
  }
  return found.sort((a, b) => b.score - a.score).map((f) => f.page);
}

export function navigateAction(page) {
  return { type: "navigate", page: page.id, path: page.path, label: page.label };
}

/* --------------------------------------------------------------- projects */

const PROJECT_ALIAS_BY_ID = {
  13: ["utility", "utilityos", "utility os", "academic os"],
  18: ["swiggy nexus", "swiggy", "nexus"],
  1: ["fourth clover", "the fourth clover", "clover"],
  20: ["siya", "siya portfolio", "hearts from siya", "heartsfromsiya"],
  19: ["prism"],
  16: ["samiksha"],
  14: ["ishani"],
  10: ["shadow instructor", "the shadow instructor", "shadow"],
  11: ["arbiter", "rift", "rift 2026"],
  17: ["aegis"],
  12: ["democrazy"],
  2: ["debatebot", "debate bot"],
  3: ["posepro", "pose pro"],
  4: ["north star", "northstar"],
  5: ["threat detection", "real time threat detection", "threat detection system", "rtds"],
  6: ["dicom", "dicom slice analyzer", "dicom analyzer"],
  7: ["api demonstration", "api demo"],
  8: ["speech to text", "stt"],
  9: ["capstone", "data science capstone"],
};

const PROJECT_INDEX = projects.map((project) => {
  const names = new Set([project.title, ...(PROJECT_ALIAS_BY_ID[project.id] || [])]);
  return {
    project,
    aliases: [...names].map((name) => normalize(name).tokens).filter((t) => t.length),
  };
});

export function caseStudyFor(project) {
  return CASE_STUDIES.find((c) => c.projectId === project.id) || null;
}

/** Projects named in the utterance. Longest alias wins; results are score-sorted. */
export function findProjects(tokens) {
  const hits = [];
  for (const { project, aliases } of PROJECT_INDEX) {
    let best = 0;
    for (const alias of aliases) {
      if (findSequence(tokens, alias, { fuzzy: true }) >= 0) {
        best = Math.max(best, alias.join("").length + (alias.length - 1) * 2);
      }
    }
    if (best) hits.push({ project, score: best });
  }
  return hits.sort((a, b) => b.score - a.score);
}

export function projectPath(project) {
  return `/projects?highlight=${project.id}`;
}

export function projectCard(project) {
  const study = caseStudyFor(project);
  return {
    type: "project",
    id: project.id,
    title: project.title,
    year: project.year,
    image: project.image,
    imageAlt: project.imageAlt,
    tags: (project.tags || []).slice(0, 4),
    blurb: truncate(project.description, 130),
    path: projectPath(project),
    caseStudyPath: study ? `/work/${study.slug}` : null,
    live: project.links?.preview || null,
    github: project.links?.github || null,
  };
}

/** Category and tag filters ("ai projects", "web projects", "computer vision", ...). */
const PROJECT_FILTERS = [
  {
    id: "ai",
    label: "AI and ML",
    words: ["ai", "ml", "machine learning", "llm", "llms", "genai", "agentic", "agents", "artificial intelligence"],
    test: (p) => p.category === "ai-ml",
  },
  {
    id: "web",
    label: "web",
    words: ["web", "website", "websites", "frontend", "front end", "full stack", "fullstack"],
    test: (p) => p.category === "web-dev",
  },
  {
    id: "vision",
    label: "computer vision",
    words: ["vision", "computer vision", "opencv", "yolo", "image", "detection"],
    test: (p) =>
      (p.skillIds || []).some((s) => ["computer-vision", "opencv", "mediapipe"].includes(s)) ||
      /vision|yolo|opencv|mediapipe|cnn/i.test((p.tags || []).join(" ")),
  },
];

const FILTER_INDEX = PROJECT_FILTERS.map((f) => ({
  ...f,
  phrases: f.words.map((w) => normalize(w).tokens),
}));

export function projectsLive() {
  return projects.filter((p) => p.links?.preview);
}

export function projectsWithCaseStudy() {
  return projects.filter((p) => caseStudyFor(p));
}

/* ----------------------------------------------------------------- skills */

const SKILL_ALIAS_BY_ID = {
  html5: ["html", "html5"],
  css3: ["css", "css3"],
  sass: ["sass", "scss"],
  javascript: ["javascript", "js"],
  typescript: ["typescript", "ts"],
  react: ["react", "reactjs"],
  nextjs: ["nextjs", "next js"],
  tailwind: ["tailwind", "tailwindcss", "tailwind css"],
  nodejs: ["nodejs", "node", "node js"],
  fastapi: ["fastapi", "fast api"],
  mongodb: ["mongodb", "mongo"],
  websockets: ["websocket", "websockets", "web sockets"],
  "rest-api": ["rest api", "restful", "apis"],
  llms: ["llm", "llms", "large language models", "language models"],
  agentic: ["agentic", "agents", "ai agents", "agentic ai", "multi agent"],
  mcp: ["mcp", "model context protocol"],
  "prompt-engineering": ["prompt engineering", "prompting", "prompts"],
  rag: ["rag", "retrieval augmented generation", "retrieval"],
  chroma: ["chroma", "chromadb"],
  "scikit-learn": ["scikit learn", "sklearn", "scikit"],
  pytorch: ["pytorch", "torch"],
  "deep-learning": ["deep learning"],
  "computer-vision": ["computer vision"],
  "data-analysis": ["data analysis", "data science", "pandas"],
  docker: ["docker", "containers"],
  git: ["git", "version control"],
  "github-actions": ["github actions", "cicd"],
};

let skillIndexCache = null;
function getSkillIndex() {
  if (skillIndexCache) return skillIndexCache;
  skillIndexCache = getAllSkills().map((skill) => {
    const names = new Set([skill.id.replace(/-/g, " "), ...(SKILL_ALIAS_BY_ID[skill.id] || [])]);
    return { skill, aliases: [...names].map((n) => normalize(n).tokens).filter((t) => t.length) };
  });
  return skillIndexCache;
}

export function findSkills(tokens) {
  const hits = [];
  for (const { skill, aliases } of getSkillIndex()) {
    let best = 0;
    for (const alias of aliases) {
      if (findSequence(tokens, alias, { fuzzy: true }) >= 0) {
        best = Math.max(best, alias.join("").length + (alias.length - 1) * 2);
      }
    }
    if (best) hits.push({ skill, score: best });
  }
  return hits.sort((a, b) => b.score - a.score);
}

export function skillProjects(skill) {
  return (skill.projectIds || [])
    .map((id) => projects.find((p) => p.id === id))
    .filter(Boolean);
}

export function skillCategoryLabel(skill) {
  const id = getSkillCategoryId(skill.id);
  return skillCategories.find((c) => c.id === id)?.label || "";
}

export function skillsByCategory(categoryId) {
  return getAllSkills().filter((s) => getSkillCategoryId(s.id) === categoryId);
}

const SKILL_CATEGORY_WORDS = [
  { id: "webdev", words: ["web", "frontend", "front end", "backend", "back end", "fullstack", "full stack", "web development", "ui"] },
  { id: "machinelearning", words: ["ai", "ml", "machine learning", "llm", "data", "artificial intelligence", "genai"] },
  { id: "devops", words: ["devops", "tools", "tooling", "deployment", "infrastructure", "cicd"] },
].map((entry) => ({ ...entry, phrases: entry.words.map((w) => normalize(w).tokens) }));

export function findSkillCategory(tokens) {
  for (const entry of SKILL_CATEGORY_WORDS) {
    if (entry.phrases.some((p) => findSequence(tokens, p, { fuzzy: "stem" }) >= 0)) {
      return skillCategories.find((c) => c.id === entry.id);
    }
  }
  return null;
}

/** Project filter from category/tag/skill words. Returns { label, list } or null. */
export function filterProjectsByUtterance(tokens) {
  const skillHit = findSkills(tokens)[0];
  const category = FILTER_INDEX.find((f) =>
    f.phrases.some((p) => findSequence(tokens, p, { fuzzy: "stem" }) >= 0),
  );
  if (category && !(skillHit && skillHit.score >= 5)) {
    return { label: category.label, list: projects.filter(category.test) };
  }
  if (skillHit) {
    const list = skillProjects(skillHit.skill);
    return { label: skillHit.skill.name, list };
  }
  const wanted = contentTokens(tokens).filter((t) => t.length >= 3);
  const byTag = projects.filter((p) => {
    const tagTokens = new Set(normalize((p.tags || []).join(" ")).tokens.map(stem));
    return wanted.some((t) => tagTokens.has(stem(t)));
  });
  if (byTag.length) return { label: "that tag", list: byTag };
  return null;
}

/* ------------------------------------------------------------- experience */

const EXPERIENCE_ALIAS_BY_ID = {
  3: ["provaantech", "provaan", "provaan tech"],
  2: ["mit wpu", "mitwpu", "mit world peace university"],
  1: ["artem", "artem health", "artem healthtech"],
};

export function findExperience(tokens) {
  for (const exp of experiences) {
    const aliases = [exp.company, ...(EXPERIENCE_ALIAS_BY_ID[exp.id] || [])].map((a) => normalize(a).tokens);
    if (aliases.some((alias) => alias.length && findSequence(tokens, alias, { fuzzy: true }) >= 0)) {
      return exp;
    }
  }
  return null;
}

export function currentExperience() {
  return experiences.find((e) => e.current) || experiences[0];
}

export function experienceLine(exp) {
  return `**${exp.position}**, ${exp.company} (${exp.period}, ${exp.location})`;
}

export function experienceDetail(exp) {
  const bullet = stripHtml((exp.responsibilities || [])[0] || "");
  const tech = (exp.technologies || []).slice(0, 5).join(", ");
  return [experienceLine(exp) + ".", truncate(bullet, 240), tech ? `Tech: ${tech}.` : ""]
    .filter(Boolean)
    .join(" ");
}

/* --------------------------------------------------------- certifications */

export function findCertifications(tokens) {
  const wanted = contentTokens(tokens).filter(
    (t) => t.length >= 3 && !["certification", "certificate", "course", "credential", "cert"].includes(stem(t)),
  );
  if (!wanted.length) return [];
  return certifications.filter((c) => {
    const bag = new Set(normalize(`${c.title} ${c.issuer} ${c.badge} ${c.tag}`).tokens.map(stem));
    return wanted.some((t) => bag.has(stem(t)));
  });
}

/* ---------------------------------------------------------------- services */

export const currencyFrom = (tokens) => {
  if (tokens.some((t) => ["inr", "rupee", "rupees", "rs", "indian"].includes(t))) return "INR";
  if (tokens.some((t) => ["usd", "dollar", "dollars", "us", "international"].includes(t))) return "USD";
  return "both";
};

const PACKAGE_ALIAS_BY_ID = {
  "starter-website": ["starter website", "starter", "basic website", "simple website", "small website", "starter site"],
  "business-website": ["business website", "business site", "local business website"],
  "portfolio-creator": ["portfolio site", "portfolio website", "creator site", "creator website", "personal website", "portfolio creator"],
  "custom-web-app": ["web app", "webapp", "mvp", "custom app", "custom web app", "saas"],
  "website-care": ["care plan", "website care", "maintenance plan", "maintenance"],
  "prototype-sprint": ["prototype sprint", "ai prototype", "prototype", "sprint", "poc"],
  "grounded-mvp": ["grounded ai assistant", "assistant mvp", "ai assistant", "grounded mvp"],
  "hitl-workflow": ["human in the loop", "hitl", "workflow tool", "newsroom tool"],
  "code-audit": ["code audit", "ai audit", "audit", "ai feature audit"],
  retainer: ["retainer", "monthly retainer", "hourly rate", "per hour", "hourly"],
};

const ALL_PACKAGES = [
  ...WEB_PACKAGES.map((p) => ({ ...p, kind: "web" })),
  ...SERVICES_PACKAGES.map((p) => ({ ...p, kind: "ai" })),
];

const PACKAGE_INDEX = ALL_PACKAGES.map((pack) => {
  const names = new Set([pack.name, ...(PACKAGE_ALIAS_BY_ID[pack.id] || [])]);
  return { pack, aliases: [...names].map((n) => normalize(n).tokens).filter((t) => t.length) };
});

export function findPackages(tokens) {
  const hits = [];
  for (const { pack, aliases } of PACKAGE_INDEX) {
    let best = 0;
    for (const alias of aliases) {
      if (findSequence(tokens, alias, { fuzzy: "stem" }) >= 0) {
        best = Math.max(best, alias.join("").length + (alias.length - 1) * 2);
      }
    }
    if (best) hits.push({ pack, score: best });
  }
  return hits.sort((a, b) => b.score - a.score);
}

export function getPackage(id) {
  return ALL_PACKAGES.find((p) => p.id === id) || null;
}

const stripPricePrefix = (value) => value.replace(/^(Starting at|From)\s+/i, "");

export function webPrice(pack, currency = "both") {
  if (currency === "INR") return formatWebPackagePrice(pack, "INR");
  if (currency === "USD") return formatWebPackagePrice(pack, "USD");
  return `${formatWebPackagePrice(pack, "INR")} · ${stripPricePrefix(formatWebPackagePrice(pack, "USD"))}`;
}

export function aiPrice(pack, currency = "both") {
  if (currency === "INR") return formatAiPackagePrice(pack, "INR");
  if (currency === "USD") return formatAiPackagePrice(pack, "USD");
  if (pack.id === "hitl-workflow") {
    return `${formatAiPackagePrice(pack, "USD")} (INR amounts are on the Services page)`;
  }
  return pack.priceLabel;
}

export function packagePrice(pack, currency = "both") {
  return pack.kind === "ai" ? aiPrice(pack, currency) : webPrice(pack, currency);
}

export function packageCard(pack) {
  return {
    type: "package",
    id: pack.id,
    name: pack.name,
    price: packagePrice(pack, "both"),
    timeline: pack.timeline,
    forWho: truncate(pack.forWho, 110),
    path: "/services#inquiry",
  };
}

/* -------------------------------------------------------------------- FAQ */

const SYNTHETIC_FAQ = [
  {
    q: "How do revisions and review rounds work?",
    a: `${WEB_COMMERCIAL.revisions} ${WEB_COMMERCIAL.changeRequests} Included review rounds: ${WEB_REVIEW_ROUNDS}.`,
    extra: ["revision", "revisions", "changes", "edits", "round", "rounds", "feedback"],
  },
  {
    q: "Why not Wix or Squarespace?",
    a: WEB_WIX_NOTE.body,
    extra: ["wix", "squarespace", "wordpress", "template", "templates", "shopify", "builder"],
  },
  {
    q: "What add-ons can you build?",
    a: `Add-ons include: ${WEB_ADDONS.join("; ")}.`,
    extra: ["addon", "addons", "extra", "extras", "feature", "features", "chatbot", "ordering", "blog", "cms", "multilingual"],
  },
  {
    q: "What is included in every website?",
    a: `Every site includes: ${WEB_EVERY_SITE.join("; ")}.`,
    extra: ["included", "include", "includes", "every", "standard", "get"],
  },
  {
    q: "What do I get at handover?",
    a: WEB_COMMERCIAL.handover,
    extra: ["handover", "hand", "credentials", "repository", "repo"],
  },
];

let faqCache = null;
function getFaqIndex() {
  if (faqCache) return faqCache;
  const items = [
    ...WEB_FAQ.map((f) => ({ ...f, extra: [], source: "web" })),
    ...SERVICES_FAQ.map((f) => ({ ...f, extra: [], source: "ai" })),
    ...SYNTHETIC_FAQ.map((f) => ({ ...f, source: "web" })),
  ].map((item) => ({
    ...item,
    qStems: new Set(
      [...contentTokens(normalize(item.q).tokens), ...item.extra].map(stem),
    ),
    aStems: new Set(contentTokens(normalize(item.a).tokens).map(stem)),
  }));
  const df = new Map();
  for (const item of items) {
    for (const s of item.qStems) df.set(s, (df.get(s) || 0) + 1);
  }
  const idf = (s) => Math.log(1 + items.length / (df.get(s) || 0.5));
  faqCache = { items, idf };
  return faqCache;
}

/** Words shared by most questions; matching only these must not trigger an FAQ answer. */
const FAQ_GENERIC = new Set(["ai", "project", "website", "site", "web", "work", "build", "developer", "aryan", "dani", "app", "client", "projects"]);

/** Best FAQ match for the utterance tokens: { item, coverage, matched } or null. */
export function matchFaq(tokens) {
  const { items, idf } = getFaqIndex();
  const query = [...new Set(contentTokens(tokens).map(stem))];
  if (query.length < 2) return null;
  const total = query.reduce((sum, s) => sum + idf(s), 0);
  let best = null;
  for (const item of items) {
    let weight = 0;
    let matched = 0;
    let specific = 0;
    for (const s of query) {
      if (item.qStems.has(s)) {
        weight += idf(s);
        matched += 1;
        if (!FAQ_GENERIC.has(s)) specific += 1;
      } else if (item.aStems.has(s)) {
        weight += idf(s) * 0.35;
      }
    }
    if (matched < 2 || specific < 1) continue;
    const coverage = weight / total;
    if (!best || coverage > best.coverage) best = { item, coverage, matched };
  }
  return best;
}

/* ------------------------------------------------------------ misc facts */

export function achievementCounts() {
  const visible = ACHIEVEMENTS.filter((a) => !a.secret);
  return { total: ACHIEVEMENTS.length, visible, secret: ACHIEVEMENTS.length - visible.length };
}
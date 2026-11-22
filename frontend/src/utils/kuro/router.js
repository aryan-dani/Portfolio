/**
 * Kuro intent router: normalize -> score every intent -> answer deterministically when confident.
 * Returns null when nothing clears the medium threshold, so the caller can hand off to the LLM
 * (with `buildKuroContext` facts for grounding).
 */
import { createContext } from "./context.js";
import { chatIntents } from "./intentsChat.js";
import { serviceIntents } from "./intentsServices.js";
import { contentIntents } from "./intentsContent.js";
import {
  PAGES,
  findProjects,
  findSkills,
  findPackages,
  findExperience,
  findPages,
  skillProjects,
  skillCategoryLabel,
  caseStudyFor,
  projectPath,
} from "./knowledge.js";
import { truncate } from "./text.js";

/** Score >= high: answer. medium <= score < high: answer plus an "Ask the AI" chip. Below: LLM. */
export const KURO_THRESHOLDS = { high: 6, medium: 3.5 };
export const KURO_AI_CHIP_LABEL = "Not what you meant? Ask the AI";
export const MAX_MESSAGE_LENGTH = 500;

const INTENTS = [...chatIntents, ...serviceIntents, ...contentIntents];

/** No em or en dashes in Kuro copy (house style), even when data strings contain them. */
function sanitize(text) {
  return String(text ?? "")
    .replace(/\u2014/g, " - ")
    .replace(/\u2013/g, "-")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/ {2,}/g, " ")
    .trim();
}

/** Every intent's score for an utterance, best first. Exposed for tests and debugging. */
export function scoreIntents(message, opts = {}) {
  const ctx = createContext(message, opts);
  if (!ctx.tokens.length) return [];
  return INTENTS.map((intent) => ({ id: intent.id, score: intent.score(ctx), priority: intent.priority }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.priority - a.priority);
}

/**
 * Resolve a Kuro turn without any model call.
 * @returns {{reply:string, actions:object[], cards:object[], chips:object[], confidence:number,
 *   tier:'high'|'medium', source:'rule', intent:string, meta?:object} | null}
 */
export function routeKuro(message, opts = {}) {
  if (typeof message !== "string") return null;
  const clean = message.trim();
  if (!clean || clean.length > MAX_MESSAGE_LENGTH) return null;

  const ctx = createContext(clean, opts);
  if (!ctx.tokens.length) return null;

  let best = null;
  for (const intent of INTENTS) {
    const score = intent.score(ctx);
    if (score < KURO_THRESHOLDS.medium) continue;
    if (!best || score > best.score || (score === best.score && intent.priority > best.intent.priority)) {
      best = { intent, score };
    }
  }
  if (!best) return null;

  const result = best.intent.run(ctx);
  if (!result) return null;

  const tier = best.score >= KURO_THRESHOLDS.high ? "high" : "medium";
  let chips = Array.isArray(result.chips) ? result.chips.slice(0, 5) : [];
  if (tier === "medium") {
    chips = [...chips.slice(0, 3), { label: KURO_AI_CHIP_LABEL, ai: true, query: clean }];
  }

  return {
    reply: sanitize(result.reply),
    actions: Array.isArray(result.actions) ? result.actions : [],
    cards: Array.isArray(result.cards) ? result.cards : [],
    chips,
    confidence: Math.min(0.99, Math.round((best.score / 9) * 100) / 100),
    tier,
    source: "rule",
    intent: best.intent.id,
    meta: { intent: best.intent.id, ...(result.meta || {}) },
  };
}

/**
 * Compact deterministic facts for the LLM prompt when no rule is confident enough.
 * Keeps the model grounded in real project, skill, package, and page data.
 */
export function buildKuroContext(message, opts = {}) {
  const ctx = createContext(message, opts);
  const lines = [];

  const base = (ctx.path || "/").split("?")[0].split("#")[0];
  const page = PAGES.find((p) => p.path === base);
  lines.push(`Visitor is on: ${page ? page.label : base}`);

  const near = scoreIntents(message, opts)
    .filter((e) => e.score >= 1.5)
    .slice(0, 3)
    .map((e) => `${e.id} ${e.score.toFixed(1)}`);
  if (near.length) lines.push(`Closest rule intents (none confident): ${near.join(", ")}`);

  for (const { project } of findProjects(ctx.tokens).slice(0, 2)) {
    const study = caseStudyFor(project);
    lines.push(
      `Project: ${project.title} (${project.year}), tags ${(project.tags || []).join(", ")}. ${truncate(project.description, 220)}` +
        `${project.links?.preview ? ` Live: ${project.links.preview}.` : ""}` +
        `${study ? ` Case study: /work/${study.slug}.` : ""} Card: ${projectPath(project)}`,
    );
  }
  for (const { skill } of findSkills(ctx.tokens).slice(0, 2)) {
    const used = skillProjects(skill).map((p) => p.title).slice(0, 5).join(", ");
    lines.push(`Skill: ${skill.name} (${skillCategoryLabel(skill)}). Used in: ${used || "no listed project"}.`);
  }
  for (const { pack } of findPackages(ctx.tokens).slice(0, 1)) {
    lines.push(`Package: ${pack.name}, ${pack.timeline}. ${truncate(pack.forWho, 120)}`);
  }
  const company = findExperience(ctx.tokens);
  if (company) lines.push(`Experience: ${company.position} at ${company.company} (${company.period}).`);
  const pages = findPages(ctx.tokens).slice(0, 2).map((p) => `${p.label} (${p.path})`);
  if (pages.length) lines.push(`Pages mentioned: ${pages.join(", ")}`);

  return lines.join("\n").slice(0, 1400);
}

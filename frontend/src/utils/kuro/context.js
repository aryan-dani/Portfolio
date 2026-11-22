/**
 * Per-turn context for the intent router, plus small reply/chip builders shared by every intent.
 */
import { normalize, stem, tokenEq, findSequence } from "./text.js";
import { findProjects, projects } from "./knowledge.js";

const ARTICLES = new Set(["the", "a", "an"]);

/** Create the lookup helpers every intent scorer uses. */
export function createContext(message, opts = {}) {
  const raw = String(message ?? "").trim();
  const { text, tokens } = normalize(raw);
  const set = new Set(tokens);
  const stemSet = new Set(tokens.map(stem));
  const longTokens = tokens.filter((t) => t.length >= 5);
  const phraseCache = new Map();
  // Phrases ignore articles so "scroll to the bottom" matches "scroll to bottom".
  const bare = tokens.filter((t) => !ARTICLES.has(t));

  const ctx = {
    raw,
    text,
    tokens,
    path: opts.currentPath || "/",
    history: Array.isArray(opts.history) ? opts.history : [],
    siteState: opts.siteState || {},
    now: opts.now instanceof Date ? opts.now : new Date(),
    has(word) {
      if (set.has(word) || stemSet.has(stem(word))) return true;
      return word.length >= 5 && longTokens.some((t) => tokenEq(t, word));
    },
    any(...words) {
      return words.some((w) => ctx.has(w));
    },
    count(...words) {
      return words.filter((w) => ctx.has(w)).length;
    },
    phrase(p) {
      if (!phraseCache.has(p)) {
        const wanted = normalize(p).tokens.filter((t) => !ARTICLES.has(t));
        phraseCache.set(p, findSequence(bare, wanted, { fuzzy: "stem" }) >= 0);
      }
      return phraseCache.get(p);
    },
    anyPhrase(...phrases) {
      return phrases.some((p) => ctx.phrase(p));
    },
  };
  return ctx;
}

/** Sum keyword / phrase weights (and negative weights) for one intent spec. */
export function scoreRules(ctx, spec) {
  let score = 0;
  for (const [word, weight] of Object.entries(spec.kw || {})) {
    if (ctx.has(word)) score += weight;
  }
  for (const [phrase, weight] of Object.entries(spec.ph || {})) {
    if (ctx.phrase(phrase)) score += weight;
  }
  for (const [phrase, weight] of Object.entries(spec.neg || {})) {
    if (phrase.includes(" ") ? ctx.phrase(phrase) : ctx.has(phrase)) score -= weight;
  }
  return Math.max(0, score);
}

/* ------------------------------------------------------------- chip builders */

export const send = (label, text) => ({ label, send: text ?? label });
export const go = (label, to) => ({ label, to });
export const ext = (label, href) => ({ label, href });
export const act = (label, action) => ({ label, action });

export const CHIP = {
  pricing: send("See pricing", "What are your prices?"),
  availability: send("Availability", "Are you available?"),
  hire: send("How to hire", "How do I hire Aryan?"),
  startProject: go("Start a project", "/services#inquiry"),
  projects: send("Show projects", "Show me the projects"),
  skills: send("Tech stack", "What is the tech stack?"),
  experience: send("Experience", "Tell me about his experience"),
  contact: send("Contact", "How do I contact Aryan?"),
  services: send("What he builds", "What does Aryan do?"),
  help: send("What can you do?", "What can you do?"),
  copyEmail: send("Copy email", "Copy email"),
  resume: send("Open resume", "Open the resume"),
};

/* ------------------------------------------------------------ time helpers */

const IST = "Asia/Kolkata";

export function istHour(now) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: IST,
    hour: "2-digit",
    hour12: false,
  }).formatToParts(now);
  return Number(parts.find((p) => p.type === "hour")?.value ?? 12) % 24;
}

export function istTime(now) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(now)
    .replace(/\s?(am|pm)/i, (m) => m.toUpperCase());
}

export function istDate(now) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);
}

/* --------------------------------------------------------- history helpers */

function messageText(msg) {
  if (typeof msg?.text === "string") return msg.text;
  if (typeof msg?.content === "string") return msg.content;
  return "";
}

/** The project most recently discussed (metadata first, then text scan). */
export function lastProjectInHistory(history = []) {
  const recent = [...history].reverse().slice(0, 8);
  for (const msg of recent) {
    if (msg?.meta?.projectId) {
      const found = projects.find((p) => p.id === msg.meta.projectId);
      if (found) return found;
    }
  }
  for (const msg of recent) {
    const text = messageText(msg);
    if (!text) continue;
    const hit = findProjects(normalize(text).tokens)[0];
    if (hit) return hit.project;
  }
  return null;
}

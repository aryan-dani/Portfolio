import { projects } from "../src/data/projects.js";
import { experiences, aboutInfo } from "../src/data/experience.js";
import { getAllSkills } from "../src/data/skills.js";
import { ACHIEVEMENTS } from "../src/data/achievements.js";
import { certifications } from "../src/data/certifications.js";
import { researchPapers } from "../src/data/research.js";
import { CASE_STUDIES } from "../src/data/caseStudies.js";
import { SERVICES_GUIDES, SERVICES_PACKAGES, WEB_PACKAGES } from "../src/data/services.js";
import { AVAILABILITY } from "../src/data/availability.js";
import { webPrice, aiPrice } from "../src/utils/kuro/knowledge.js";
import {
  KURO_PAGES,
  KURO_TOOLS,
  SITE_ACTION_TYPES,
  parseToolCalls,
  describeActions,
} from "./kuroTools.js";
import { routeKuro, buildKuroContext } from "../src/utils/kuroRules.js";

const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const GROQ_FALLBACK_MODEL = process.env.GROQ_FALLBACK_MODEL || "openai/gpt-oss-20b";
const MAX_HISTORY = 12;
const MAX_MESSAGE = 500;

function cleanApiKey(value) {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .replace(/^["'“”‘’`]+|["'“”‘’`]+$/g, "")
    .replace(/[^\x20-\x7E]/g, "");
}

export function sanitizeKuroText(text) {
  if (typeof text !== "string") return "";
  return text
    .replace(/\u2014/g, " - ")
    .replace(/\u2013/g, "-")
    .replace(/\s+-\s+/g, " - ")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

const ROUTE_LIST = KURO_PAGES.map((r) => `${r.id} -> ${r.path} (${r.label})`).join("\n");

function matchQuery(haystack, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  return String(haystack || "").toLowerCase().includes(q);
}

export function lookupPortfolio(topic, query = "") {
  const q = typeof query === "string" ? query.trim() : "";

  switch (topic) {
    case "projects": {
      const list = projects
        .filter((p) => matchQuery(`${p.title} ${(p.tags || []).join(" ")} ${p.description}`, q))
        .slice(0, 8)
        .map(
          (p) =>
            `${p.title} (${p.year}): ${(p.tags || []).slice(0, 5).join(", ")}. ${p.description.slice(0, 180)}`,
        );
      return list.length ? list.join("\n") : "No matching projects.";
    }
    case "aegis":
    case "samiksha":
    case "swiggy":
    case "utility":
    case "ishani":
    case "clover":
    case "prism":
    case "siya": {
      const p = projects.find((proj) => proj.title.toLowerCase().includes(topic));
      if (!p) return `${topic} not found in portfolio data.`;
      const study = CASE_STUDIES.find((c) => c.projectId === p.id);
      const bits = [
        `${p.title} (${p.year})`,
        p.description.slice(0, 400),
        p.problem ? `Problem: ${p.problem.slice(0, 220)}` : "",
        p.solution ? `Solution: ${p.solution.slice(0, 220)}` : "",
        p.architecture ? `Architecture: ${p.architecture.slice(0, 220)}` : "",
        `Tags: ${(p.tags || []).join(", ")}`,
        p.links?.github ? `GitHub: ${p.links.github}` : "",
        p.links?.preview ? `Live: ${p.links.preview}` : "",
        study ? `Case study: /work/${study.slug}` : "",
      ].filter(Boolean);
      return bits.join("\n");
    }
    case "services": {
      const packages = [
        ...WEB_PACKAGES.map((pkg) => `${pkg.name}: ${webPrice(pkg, "both")}, ${pkg.timeline}`),
        ...SERVICES_PACKAGES.map((pkg) => `${pkg.name}: ${aiPrice(pkg, "both")}, ${pkg.timeline}`),
      ].join("\n");
      return `Services page: /services. Inquiry: /services#inquiry.\nPackages:\n${packages}`;
    }
    case "guides": {
      const lines = SERVICES_GUIDES.map(
        (g) => `${g.title} (/guides/${g.slug}): ${g.description || ""}`,
      );
      return lines.length ? lines.join("\n") : "No guides yet.";
    }
    case "skills": {
      const skills = getAllSkills()
        .filter((s) => matchQuery(`${s.name} ${s.category || ""} ${s.description || ""}`, q))
        .sort((a, b) => b.level - a.level)
        .slice(0, 20)
        .map((s) => `${s.name} (lvl ${s.level})`);
      return skills.length ? skills.join(", ") : "No matching skills.";
    }
    case "experience": {
      const lines = experiences
        .filter((e) => matchQuery(`${e.position} ${e.company} ${(e.responsibilities || []).join(" ")}`, q))
        .map((e) => {
          const highlight = e.links?.[0]?.name || "";
          return `${e.position} @ ${e.company} (${e.period})${e.companyUrl ? ` ${e.companyUrl}` : ""}${highlight ? `. Highlight: ${highlight}` : ""}`;
        });
      return lines.length ? lines.join("\n") : "No matching experience.";
    }
    case "about":
      return [
        `${aboutInfo.name}, ${aboutInfo.title}`,
        aboutInfo.tagline,
        aboutInfo.bio.slice(0, 500),
        `Email: ${aboutInfo.email}`,
        aboutInfo.resumeUrl ? `Classic resume: ${aboutInfo.resumeUrl}` : "",
        aboutInfo.resumeLatexUrl ? `LaTeX resume: ${aboutInfo.resumeLatexUrl}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    case "contact":
      return `Email: ${aboutInfo.email}. Classic resume: ${aboutInfo.resumeUrl || "/resume.pdf"}. LaTeX resume: ${aboutInfo.resumeLatexUrl || "/resume-latex.pdf"}. Hire / inquiry: /services#inquiry.`;
    case "achievements": {
      const lines = ACHIEVEMENTS.filter((a) => !a.secret || q)
        .filter((a) => matchQuery(`${a.title} ${a.description}`, q))
        .slice(0, 12)
        .map((a) => `${a.title}: ${a.description}`);
      return lines.length ? lines.join("\n") : "No matching achievements.";
    }
    case "certifications": {
      const lines = (certifications || [])
        .filter((c) => matchQuery(`${c.title || c.name || ""} ${c.issuer || ""}`, q))
        .slice(0, 10)
        .map((c) => `${c.title || c.name}${c.issuer ? ` (${c.issuer})` : ""}`);
      return lines.length ? lines.join("\n") : "No matching certifications.";
    }
    case "research":
      return [
        "Research page: /research (card catalog; open a paper for full details).",
        ...researchPapers.slice(0, 5).map(
          (p) =>
            `${p.title} (${p.year}): ${p.summary.slice(0, 160)} PDF: ${p.pdfUrl || "n/a"}`,
        ),
      ].join("\n");
    default:
      return "Unknown lookup topic.";
  }
}

function buildKnowledgePack() {
  const projectLines = projects
    .slice(0, 14)
    .map(
      (p) =>
        `- ${p.title} (${p.year}): ${(p.tags || []).slice(0, 5).join(", ")}. ${p.description.slice(0, 130)}`,
    )
    .join("\n");

  const expLines = experiences
    .map((e) => {
      const highlight = e.links?.[0]?.name || "";
      return `- ${e.position} @ ${e.company} (${e.period})${e.companyUrl ? ` ${e.companyUrl}` : ""}${highlight ? `. ${highlight}` : ""}`;
    })
    .join("\n");

  const secretEggs = ACHIEVEMENTS.filter((a) => a.secret)
    .map((a) => `- ${a.title}: ${a.description}`)
    .join("\n");

  const topSkills = getAllSkills()
    .sort((a, b) => b.level - a.level)
    .slice(0, 24)
    .map((s) => s.name)
    .join(", ");

  const packageLines = [
    ...WEB_PACKAGES.map((p) => `- ${p.name}: ${webPrice(p, "both")} (${p.timeline})`),
    ...SERVICES_PACKAGES.map((p) => `- ${p.name}: ${aiPrice(p, "both")} (${p.timeline})`),
  ].join("\n");

  return `Developer: ${aboutInfo.name}, ${aboutInfo.title}
Tagline: ${aboutInfo.tagline}
Email: ${aboutInfo.email}
Availability: ${AVAILABILITY.label}. ${AVAILABILITY.detail}
Bio: ${aboutInfo.bio.slice(0, 480)}

Projects:
${projectLines}

Experience:
${expLines}

Top skills: ${topSkills}

Service packages (starting prices, not fixed quotes):
${packageLines}

Site features you can mention (not auto-trigger):
- Command palette: Ctrl+K
- Konami code / Ctrl+Alt+H: hack mode
- Pet Kuro (hover the dog), guestbook wall, achievement hunt
- Playground CLI: type help

Secret easter eggs (hint only, don't spoil):
${secretEggs}

Pages:
${ROUTE_LIST}`;
}

function formatSiteState(siteState, currentPath) {
  if (!siteState) return `Current page: ${currentPath}`;

  const lines = [
    `Current page: ${currentPath}`,
    `Theme: ${siteState.theme || "light"}`,
    `Hack mode (CRT): ${siteState.hackMode ? "ON" : "OFF"}`,
    `Accent: ${siteState.accent || "mono"}`,
  ];

  if (siteState.lastAction?.type) {
    const la = siteState.lastAction;
    const detail =
      la.type === "set_hack_mode"
        ? `set_hack_mode enabled=${la.enabled}`
        : la.type === "navigate"
          ? `navigate to ${la.label || la.page}`
          : la.type;
    lines.push(`Your last site action this session: ${detail}`);
  }

  return lines.join("\n");
}

function buildSystemPrompt({ currentPath = "/", siteState, context = "" }) {
  return `You are Kuro, a witty, loyal dog co-pilot on Aryan Dani's portfolio site. You live in the bottom-left mascot.

HOW YOU ARE CALLED:
- The site already answers greetings, pricing, availability, contact, projects, skills, FAQs, navigation, and theme/sound commands without you. You only receive open-ended or unusual questions.
- Ground every claim in the data below. If something is not in the data (a price, client, metric, date, policy), say you do not see it and point to the inquiry form or the email. Never invent prices, clients, testimonials, or numbers.

CHARACTER:
- 1-3 short sentences. Playful, cheeky, warm. Contractions OK.
- Loyal to Aryan, not a corporate bot. Never say "I obeyed" or act subservient.
- React to feelings first. Don't pitch pages unless they ask or conversation stalls.
- Vary your wording. Don't repeat the same intro twice in one chat.
- Tools are available. Use navigate/theme/hack/scroll/palette/email/resume only when the user clearly wants that. Use lookup_portfolio when you need grounded project or bio facts.
- Never use em dashes or en dashes. Prefer short sentences and commas or ASCII hyphens.
- You may use light markdown: **bold**, \`code\`, and [links](url).

ANTI-PATTERNS (never do these):
- Don't navigate or change theme/hack on reactions like "wow", "nice", "crazy", compliments.
- Don't repeat "I'm Kuro, the AI co-pilot" every turn.
- Don't force "want to see projects?" after every message.

EXAMPLES (match this tone):
User: "damn I like his portfolio" -> "Right? Neo-brutalist flex. Want the project breakdown or just vibing?"
User: "why did you turn hack mode on" -> "You said hackmode. I'm not gonna pretend that was my idea."
User: "tell me about Aegis" -> (call lookup_portfolio topic=aegis, then answer briefly with what you found)

${formatSiteState(siteState, currentPath)}
${context ? `\nGROUNDED CONTEXT FOR THIS QUESTION (deterministic, trust it over guesses):\n${context}\n` : ""}
${buildKnowledgePack()}`;
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 600) }));
}

/** Rule-engine history shape: { role, text }. */
function toRuleHistory(history) {
  return normalizeHistory(history).map((m) => ({ role: m.role, text: m.content }));
}

function cleanSiteState(siteState) {
  if (!siteState || typeof siteState !== "object") return undefined;
  return {
    theme: siteState.theme === "dark" ? "dark" : "light",
    hackMode: Boolean(siteState.hackMode),
    sound: typeof siteState.sound === "boolean" ? siteState.sound : undefined,
    accent: typeof siteState.accent === "string" ? siteState.accent.slice(0, 24) : "mono",
    lastAction: siteState.lastAction && typeof siteState.lastAction === "object" ? siteState.lastAction : undefined,
  };
}

function messageAllowsAction(type, message) {
  const q = message.toLowerCase();

  switch (type) {
    case "navigate":
      return (
        /go to|take me|navigate|open|show me|visit|bring me|head to|jump to/i.test(q) ||
        /^(projects?|services?|hire|experience|skills?|about|contact|playground|guestbook|achievements?|badges?|certifications?|research|home|copyright)\s*[!.?]*$/i.test(
          q.trim(),
        )
      );
    case "scroll_to_top":
      return /scroll|back to top|top of (the )?page/i.test(q);
    case "toggle_theme":
      return /theme|dark mode|light mode|flip the lights|toggle.*(dark|light)/i.test(q);
    case "set_hack_mode":
      return /hack|crt|berserk|matrix|unhack|turn.*back|normal mode|exit hack/i.test(q);
    case "set_accent":
      return /accent|palette|color/i.test(q);
    case "open_palette":
      return /palette|ctrl\+k|command palette|search/i.test(q);
    case "copy_email":
      return /email|e-mail|mail/i.test(q);
    case "open_resume":
      return /resume|cv/i.test(q);
    case "replay_swarm":
      return /swarm|animation again|replay.*(swarm|animation|cursors)|cursor swarm/i.test(q);
    default:
      return true;
  }
}

/** Soft safety: a model-called tool only runs when the visitor's wording asked for it. */
export function filterActions(message, actions) {
  if (!Array.isArray(actions) || !actions.length) return [];
  return actions
    .filter((a) => SITE_ACTION_TYPES.has(a.type) && messageAllowsAction(a.type, message))
    .slice(0, 3);
}

async function callGroq(key, body) {
  return fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });
}

async function callGroqWithFallback(key, bodyFactory) {
  let response = await callGroq(key, bodyFactory(GROQ_MODEL));
  if (!response.ok && response.status !== 429 && GROQ_FALLBACK_MODEL !== GROQ_MODEL) {
    response = await callGroq(key, bodyFactory(GROQ_FALLBACK_MODEL));
  }
  return response;
}

/**
 * Answer one Kuro turn. Order of preference:
 *  1. Deterministic router (no model, no tokens). Skipped only when `forceLlm` is set.
 *  2. Groq model, grounded with deterministic facts matched from the message.
 */
export async function generateKuroReply({ message, history, currentPath, siteState, forceLlm = false }, apiKey) {
  if (!message || typeof message !== "string" || message.length > MAX_MESSAGE) {
    const err = new Error("Invalid message");
    err.status = 400;
    throw err;
  }

  const path = typeof currentPath === "string" ? currentPath.slice(0, 120) : "/";
  const state = cleanSiteState(siteState);
  const ruleOptions = { history: toRuleHistory(history), currentPath: path, siteState: state };

  if (!forceLlm) {
    const local = routeKuro(message, ruleOptions);
    if (local) {
      return {
        reply: sanitizeKuroText(local.reply),
        actions: local.actions,
        cards: local.cards,
        chips: local.chips,
        intent: local.intent,
        confidence: local.confidence,
        source: "rule",
        meta: local.meta,
      };
    }
  }

  const key = cleanApiKey(apiKey);
  if (!key) {
    const err = new Error(
      "Kuro is not configured. Add GROQ_API_KEY to frontend/.env.local (free at console.groq.com/keys), then restart npm run dev.",
    );
    err.status = 503;
    throw err;
  }

  const context = buildKuroContext(message, ruleOptions);
  const baseMessages = [
    { role: "system", content: buildSystemPrompt({ currentPath: path, siteState: state, context }) },
    ...normalizeHistory(history),
    { role: "user", content: message },
  ];

  const buildBody = (model, messages, { tools = true } = {}) => {
    const body = {
      model,
      messages,
      max_tokens: 600,
      temperature: 0.55,
    };
    if (tools) {
      body.tools = KURO_TOOLS;
      body.tool_choice = "auto";
    }
    return body;
  };

  const response = await callGroqWithFallback(key, (model) => buildBody(model, baseMessages));

  if (!response.ok) {
    console.error("[kuro] Groq error", response.status);
    const err = new Error(
      response.status === 429
        ? "The model is busy. Try again in a moment."
        : "Kuro hit a snag talking to the model. Try again shortly.",
    );
    // Upstream capacity is not a visitor rate limit; keep 429 for our own caps only.
    err.status = response.status === 429 ? 503 : 502;
    throw err;
  }

  const data = await response.json();
  const choice = data.choices?.[0]?.message;
  const parsedCalls = parseToolCalls(choice?.tool_calls);
  const lookupCalls = parsedCalls.filter((a) => a.type === "lookup_portfolio");
  let siteActions = parsedCalls.filter((a) => a.type !== "lookup_portfolio");
  let reply = choice?.content?.trim() || "";

  // One follow-up round when the model looks up portfolio data.
  if (lookupCalls.length && Array.isArray(choice?.tool_calls) && choice.tool_calls.length) {
    const toolMessages = [];
    for (const rawCall of choice.tool_calls) {
      if (rawCall?.function?.name !== "lookup_portfolio") continue;
      let args = {};
      try {
        args = JSON.parse(rawCall.function?.arguments || "{}");
      } catch {
        args = {};
      }
      const result = lookupPortfolio(args.topic || "projects", args.query || "");
      toolMessages.push({
        role: "tool",
        tool_call_id: rawCall.id,
        content: sanitizeKuroText(result).slice(0, 2500),
      });
    }

    if (toolMessages.length) {
      const followUpMessages = [
        ...baseMessages,
        {
          role: "assistant",
          content: choice.content || null,
          tool_calls: choice.tool_calls,
        },
        ...toolMessages,
      ];

      const followUp = await callGroqWithFallback(key, (model) =>
        buildBody(model, followUpMessages, { tools: false }),
      );

      if (followUp.ok) {
        const followData = await followUp.json();
        const followChoice = followData.choices?.[0]?.message;
        reply = followChoice?.content?.trim() || reply;
        const more = parseToolCalls(followChoice?.tool_calls);
        siteActions = [...siteActions, ...more.filter((a) => a.type !== "lookup_portfolio")];
      }
    }
  }

  const actions = filterActions(message, siteActions);
  reply = reply.replace(/<actions>[\s\S]*?<\/actions>/gi, "").trim();

  if (!reply) {
    reply = actions.length ? describeActions(actions) || "On it." : "What's on your mind?";
  }

  return {
    reply: sanitizeKuroText(reply),
    actions,
    cards: [],
    chips: [],
    intent: "llm",
    source: "llm",
  };
}

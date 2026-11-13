import { projects } from "../data/projects";
import { experiences, aboutInfo } from "../data/experience";
import { getAllSkills } from "../data/skills";

/** Paths without pulling react-icon route config into the API bundle. */
const PAGE_PATHS = {
  home: "/",
  projects: "/projects",
  services: "/services",
  experience: "/experience",
  research: "/research",
  certifications: "/certifications",
  skills: "/skills",
  about: "/about",
  contact: "/services#inquiry",
  hire: "/services#inquiry",
  playground: "/playground",
  achievements: "/achievements",
  guestbook: "/guestbook",
  copyright: "/copyright",
};

const SWARM_PATHS = new Set([
  "/projects",
  "/skills",
  "/achievements",
  "/certifications",
  "/experience",
  "/research",
  "/services",
]);

const REACTION_ONLY =
  /^(wow|nice|crazy|damn|cool|lol|lmao|okay|ok|oh okay|yep|yeah|yup|haha|ha|omg|whoa|dang|sick|fire|lit|bet|word|true|facts|same|mood|fr|ngl|tbh|hm+|hmm+|wtf|what the fuck|what the hell|bruh|dude|bro)[\s!.?]*$/i;

const FRUSTRATION =
  /^(wtf|what the fuck|what the hell|bruh|dude|seriously|come on|ugh+|argh+)[\s!.?]*$/i;

const REACTION_LINES = [
  "Yeah, it's a lot. In a good way.",
  "Right? Neo-brutalist flex.",
  "Glad it landed.",
  "Noted. Loud and clear.",
];

const FRUSTRATION_LINES = [
  "Fair. Kennel glitched. Try the ask again, or say go to projects.",
  "My bad. Say it plain: open Utility, go to projects, flip theme.",
  "Got it. Skip the drama. Tell me the page or project name.",
];

const PAGE_PATTERNS = [
  [/projects?/, "projects"],
  [/services?|hire/, "services"],
  [/experience|jobs?/, "experience"],
  [/skills?/, "skills"],
  [/research|paper/, "research"],
  [/about/, "about"],
  [/contact/, "contact"],
  [/cert/, "certifications"],
  [/playground|terminal|cli/, "playground"],
  [/achievements?|trophies|badges?/, "achievements"],
  [/guestbook/, "guestbook"],
  [/home|landing/, "home"],
  [/copyright/, "copyright"],
];

const PROJECT_ALIASES = [
  { keys: ["utility", "utilityos", "academic os"], match: /utility/i },
  { keys: ["swiggy", "nexus", "swiggy nexus"], match: /swiggy|nexus/i },
  { keys: ["clover", "fourth clover", "the fourth clover"], match: /clover/i },
  { keys: ["siya", "siya's portfolio", "siyas portfolio"], match: /siya/i },
  { keys: ["prism"], match: /prism/i },
  { keys: ["samiksha"], match: /samiksha/i },
  { keys: ["ishani"], match: /ishani/i },
  { keys: ["aegis"], match: /aegis/i },
  { keys: ["shadow instructor", "shadow"], match: /shadow instructor|shadow/i },
  { keys: ["arbiter", "rift"], match: /arbiter|rift/i },
  { keys: ["democrazy"], match: /democrazy/i },
  { keys: ["debatebot", "debate bot"], match: /debate/i },
  { keys: ["posepro", "pose pro"], match: /pose/i },
  { keys: ["north-star", "north star", "northstar"], match: /north[- ]?star/i },
  { keys: ["threat detection", "rtds"], match: /threat detection/i },
  { keys: ["dicom"], match: /dicom/i },
  { keys: ["capstone"], match: /capstone/i },
];

function pick(lines) {
  return lines[Math.floor(Math.random() * lines.length)];
}

function findProjectByAlias(text) {
  const q = text.toLowerCase();
  for (const alias of PROJECT_ALIASES) {
    if (alias.keys.some((k) => q.includes(k)) || alias.match.test(q)) {
      const project = projects.find((p) => alias.match.test(p.title));
      if (project) return project;
    }
  }
  for (const project of projects) {
    if (q.includes(project.title.toLowerCase())) return project;
  }
  return null;
}

function findProjectInHistory(history = []) {
  const recent = [...history].reverse().slice(0, 10);
  for (const msg of recent) {
    const text = typeof msg?.text === "string" ? msg.text : typeof msg?.content === "string" ? msg.content : "";
    if (!text) continue;
    const hit = findProjectByAlias(text);
    if (hit) return hit;
  }
  return null;
}

function formatProjectReply(project) {
  const tags = (project.tags || []).slice(0, 6).join(", ");
  const live = project.links?.preview;
  const github = project.links?.github;
  const links = [
    live ? `[live](${live})` : null,
    github ? `[github](${github})` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return [
    `**${project.title}** (${project.year}).`,
    project.description.slice(0, 280),
    tags ? `Stack: ${tags}.` : "",
    links,
    "Say navigate me to the card if you want me to open it.",
  ]
    .filter(Boolean)
    .join(" ");
}

function pageAction(pageId, currentPath) {
  const path = PAGE_PATHS[pageId];
  if (!path) return null;
  const basePath = path.split("#")[0];
  if (basePath === currentPath && !path.includes("#")) {
    return {
      reply: `You're already on ${pageId}.`,
      actions: [],
    };
  }
  const label =
    pageId === "contact" || pageId === "hire"
      ? "Services inquiry"
      : pageId.charAt(0).toUpperCase() + pageId.slice(1);
  return {
    reply: `Opening ${label}.`,
    actions: [{ type: "navigate", page: pageId === "hire" ? "services" : pageId, path, label }],
  };
}

function projectCardAction(project) {
  return {
    reply: `Taking you to **${project.title}**.`,
    actions: [
      {
        type: "navigate",
        page: "projects",
        path: `/projects?highlight=${project.id}`,
        label: project.title,
      },
    ],
  };
}

function trySiteControl(message, currentPath) {
  const q = message.toLowerCase().trim();

  if (/hackmode|hack\s*mode|crt|berserk|matrix/.test(q) && !/unhack|exit|off|turn.*back|normal/.test(q)) {
    return { reply: "CRT on. Eyes peeled.", actions: [{ type: "set_hack_mode", enabled: true }] };
  }
  if (/unhack|exit hack|normal mode|turn.*back|turn it back/.test(q)) {
    return { reply: "CRT off. Back to normal.", actions: [{ type: "set_hack_mode", enabled: false }] };
  }
  if (/dark mode|light mode|toggle theme|flip the lights|switch (the )?theme/.test(q)) {
    return { reply: "Flipped the lights.", actions: [{ type: "toggle_theme" }] };
  }
  if (/scroll (to )?top|back to top/.test(q)) {
    return { reply: "Back to the top.", actions: [{ type: "scroll_to_top" }] };
  }
  if (/command palette|open palette|ctrl\+k/.test(q)) {
    return { reply: "Palette up.", actions: [{ type: "open_palette" }] };
  }
  if (/\b(copy|give me|what'?s)\s+(the\s+)?(email|e-mail)\b|\bemail\s+please\b/i.test(q)) {
    return {
      reply: `Email copied: ${aboutInfo.email}`,
      actions: [{ type: "copy_email" }],
    };
  }
  if (/\b(open|show|download)\s+(the\s+)?(latex\s+)?(resume|cv)\b|\bresume\s+please\b/i.test(q)) {
    const latex = /\blatex\b/i.test(q);
    return {
      reply: latex
        ? "Opening the LaTeX resume."
        : "Opening the classic resume. Ask for the LaTeX resume if you want the two-pager.",
      actions: [{ type: "open_resume", version: latex ? "latex" : "classic" }],
    };
  }

  if (
    /swarm cursors|cursor swarm|animation again( on this page)?|replay (the )?(swarm|animation|cursors)|play (the )?(swarm|animation) again|run (the )?swarm again/i.test(
      q,
    )
  ) {
    if (!SWARM_PATHS.has(currentPath || "/")) {
      return {
        reply: "No cursor swarm on this page. Try Projects, Skills, or Services.",
        actions: [],
      };
    }
    return {
      reply: "Running the cursor swarm again.",
      actions: [{ type: "replay_swarm" }],
    };
  }

  const wantsNav =
    /go to|take me|navigate|open|show me|visit|bring me|head to|jump to/i.test(q) ||
    /^(projects?|services?|hire|experience|skills?|about|contact|playground|guestbook|achievements?|badges?|certifications?|research|home|copyright)\s*[!.?]*$/i.test(
      q,
    );

  if (wantsNav) {
    // Prefer a named project card over a bare page when both match.
    const project = findProjectByAlias(q);
    if (
      project &&
      /(card|project|open|show|navigate|take me|go to|visit)/i.test(q) &&
      !/projects?\s*page|go to projects$/i.test(q)
    ) {
      // "go to utility" / "open utility card" -> highlight
      if (!/^go to projects?$/i.test(q) && !/^open projects?$/i.test(q)) {
        const named = PROJECT_ALIASES.some((a) => a.keys.some((k) => q.includes(k)) || a.match.test(q));
        if (named || /card|project/i.test(q)) {
          return projectCardAction(project);
        }
      }
    }

    for (const [re, page] of PAGE_PATTERNS) {
      if (re.test(q)) {
        return pageAction(page, currentPath || "/");
      }
    }
  }

  return null;
}

function tryFollowUpNav(message, history) {
  const q = message.toLowerCase().trim();
  const followUp =
    /^(navigate me to (the )?card|take me (there|to (the )?card)|open (it|the card)|show (me )?(the )?card|the card|go there|open that)\s*[!.?]*$/i.test(
      q,
    ) || /navigate me to the card/i.test(q);

  if (!followUp) return null;
  const project = findProjectInHistory(history);
  if (!project) {
    return {
      reply: "Which card? Name a project like Utility or Aegis.",
      actions: [],
    };
  }
  return projectCardAction(project);
}

function tryProjectFact(message) {
  const q = message.trim();
  // Bare project name or "tell me about X"
  const aboutish =
    /^(tell me about|what(?:'s| is)|about)\b/i.test(q) ||
    PROJECT_ALIASES.some((a) => a.keys.some((k) => q.toLowerCase() === k));

  const project = findProjectByAlias(q);
  if (!project) return null;

  // Avoid stealing open-ended chat that merely mentions a word in passing with other intent.
  const shortOrDirect =
    q.length < 48 ||
    aboutish ||
    /^(tell me about|what(?:'s| is)|about|describe)\b/i.test(q);

  if (!shortOrDirect) return null;

  return {
    reply: formatProjectReply(project),
    actions: [],
  };
}

function tryAboutContact(message) {
  const q = message.toLowerCase().trim();
  if (/^(who (is|built|made)|who are you|what are you)\b/i.test(q) && /aryan|portfolio|this|you\b/i.test(q)) {
    return {
      reply: `${aboutInfo.name}, ${aboutInfo.title}. ${aboutInfo.tagline}`,
      actions: [],
    };
  }
  if (/^who (built|made) (this|the portfolio)/i.test(q) || /^who is aryan/i.test(q)) {
    return {
      reply: `${aboutInfo.name}. ${aboutInfo.bio.slice(0, 220)}`,
      actions: [],
    };
  }
  if (/^(email)\s*[?.!]*$/i.test(q)) {
    return {
      reply: `Email: ${aboutInfo.email}. Or say copy email.`,
      actions: [],
    };
  }
  if (/^skills?\s*[?.!]*$/i.test(q) || /^list (the )?skills/i.test(q)) {
    const top = getAllSkills()
      .sort((a, b) => b.level - a.level)
      .slice(0, 12)
      .map((s) => s.name)
      .join(", ");
    return { reply: `Top skills: ${top}.`, actions: [] };
  }
  if (/^experience\s*[?.!]*$/i.test(q) || /^where (does|did) (he|aryan) work/i.test(q)) {
    const line = experiences
      .slice(0, 3)
      .map((e) => `${e.position} @ ${e.company}`)
      .join("; ");
    return { reply: line || "Check /experience.", actions: [] };
  }
  return null;
}

/**
 * Resolve a Kuro turn without calling the model.
 * @returns {{ reply: string, actions: object[], intent?: string } | null}
 */
export function resolveKuroRules(message, { history = [], currentPath = "/" } = {}) {
  if (!message || typeof message !== "string") return null;
  const clean = message.trim();
  if (!clean || clean.length > 500) return null;

  if (FRUSTRATION.test(clean) || (REACTION_ONLY.test(clean) && /fuck|hell|bruh|ugh/i.test(clean))) {
    return { reply: pick(FRUSTRATION_LINES), actions: [], intent: "chat" };
  }

  if (REACTION_ONLY.test(clean)) {
    return { reply: pick(REACTION_LINES), actions: [], intent: "chat" };
  }

  const followUp = tryFollowUpNav(clean, history);
  if (followUp) return { ...followUp, intent: "site_control" };

  const control = trySiteControl(clean, currentPath);
  if (control) return { ...control, intent: "site_control" };

  const about = tryAboutContact(clean);
  if (about) return { ...about, intent: "portfolio_qa" };

  const project = tryProjectFact(clean);
  if (project) return { ...project, intent: "portfolio_qa" };

  return null;
}

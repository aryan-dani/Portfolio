/**
 * Page-aware suggestion chips. Every `send` here must resolve through the deterministic router
 * (checked by scripts/check-kuro.mjs), so tapping a tip never costs a model call.
 */
const TIP_POOL = {
  "/": [
    { label: "Projects", send: "Show me the projects" },
    { label: "Pricing", send: "What are your prices?" },
    { label: "Hack mode", send: "hack mode" },
    { label: "Who built this?", send: "Who built this?" },
    { label: "Swiggy Nexus", send: "Tell me about Swiggy Nexus" },
    { label: "Aegis vault", send: "Tell me about Aegis" },
    { label: "Tech stack", send: "What is the tech stack?" },
  ],
  "/projects": [
    { label: "Swiggy Nexus", send: "Tell me about Swiggy Nexus" },
    { label: "Siya", send: "Tell me about Siya's Portfolio" },
    { label: "Aegis", send: "Tell me about Aegis" },
    { label: "Samiksha", send: "What is Samiksha?" },
    { label: "Swarm again", send: "animation again on this page" },
    { label: "Live demos", send: "Which projects have a live demo?" },
    { label: "Case studies", send: "Show case studies" },
    { label: "AI projects", send: "AI projects" },
  ],
  "/skills": [
    { label: "Rust / Tauri", send: "Does he use Rust?" },
    { label: "AI stack", send: "What AI tools does he use?" },
    { label: "React projects", send: "Which projects use React?" },
    { label: "See projects", send: "go to projects" },
  ],
  "/experience": [
    { label: "Latest role", send: "What is his current role?" },
    { label: "Resume", send: "Open the classic resume" },
    { label: "LaTeX resume", send: "Open the LaTeX resume" },
    { label: "Research", send: "go to research" },
    { label: "Projects", send: "go to projects" },
  ],
  "/research": [
    { label: "Paper PDF", send: "Where is the research paper?" },
    { label: "Threat system", send: "Tell me about the threat detection project" },
    { label: "Projects", send: "go to projects" },
  ],
  "/about": [
    { label: "GitHub", send: "Tell me about his GitHub" },
    { label: "How to hire", send: "How do I hire Aryan?" },
    { label: "Email", send: "What's his email?" },
    { label: "Location", send: "Where are you based?" },
  ],
  "/services": [
    { label: "Pricing", send: "What are your prices?" },
    { label: "Availability", send: "Are you available?" },
    { label: "Process", send: "What is the process?" },
    { label: "Copy email", send: "Copy email" },
    { label: "Swarm again", send: "swarm cursors" },
  ],
  "/contact": [
    { label: "Copy email", send: "Copy email" },
    { label: "Availability", send: "Are you available?" },
    { label: "Guestbook", send: "go to guestbook" },
  ],
  "/playground": [
    { label: "sudo hire-me", send: "What does sudo hire-me do?" },
    { label: "Hack mode", send: "hack mode" },
    { label: "Konami tip", send: "How do I enable hack mode?" },
  ],
  "/guestbook": [
    { label: "Sign the wall", send: "How does the guestbook work?" },
    { label: "Projects", send: "go to projects" },
  ],
  "/achievements": [
    { label: "Secret eggs", send: "Any easter eggs?" },
    { label: "Hack mode", send: "hack mode" },
    { label: "Home", send: "go to home" },
  ],
};

const FALLBACK_TIPS = [
  { label: "Projects", send: "Show me the projects" },
  { label: "Hack mode", send: "hack mode" },
  { label: "Who built this?", send: "Who built this?" },
  { label: "Aegis", send: "Tell me about Aegis" },
  { label: "Swiggy Nexus", send: "Tell me about Swiggy Nexus" },
  { label: "Skills", send: "go to skills" },
  { label: "Email", send: "What's his email?" },
  { label: "Pricing", send: "What are your prices?" },
];

const PLACEHOLDERS = [
  "Ask about Aryan, pricing, or availability",
  "Try: are you available in January?",
  "Try: tell me about Swiggy Nexus",
  "Try: how much for a website?",
  "Try: take me to skills",
  "Try: dark mode",
];

/** Every tip utterance, for tests. */
export const KURO_TIP_SENDS = [
  ...new Set([...Object.values(TIP_POOL).flat(), ...FALLBACK_TIPS].map((tip) => tip.send)),
];

const RECENT_KEY = "portfolio_kuro_tip_recent";

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function readRecent() {
  try {
    const raw = sessionStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRecent(labels) {
  try {
    sessionStorage.setItem(RECENT_KEY, JSON.stringify(labels.slice(-9)));
  } catch {
    /* ignore */
  }
}

/** Pick suggestion chips for the current path, avoiding recently shown labels. */
export function getDynamicSuggestionChips(pathname = "/", count = 3) {
  const pool = [...(TIP_POOL[pathname] || []), ...FALLBACK_TIPS];
  const recent = new Set(readRecent());
  const fresh = pool.filter((tip) => !recent.has(tip.label));
  const source = fresh.length >= count ? fresh : pool;
  const unique = [];
  const seen = new Set();
  for (const tip of shuffle(source)) {
    if (seen.has(tip.label)) continue;
    seen.add(tip.label);
    unique.push(tip);
    if (unique.length >= count) break;
  }
  writeRecent([...readRecent(), ...unique.map((t) => t.label)]);
  return unique;
}

export function getDynamicPlaceholder() {
  return PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)];
}

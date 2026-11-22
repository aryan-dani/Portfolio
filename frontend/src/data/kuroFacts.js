/**
 * Small, verified fact sheet for Kuro's deterministic engine.
 * Everything here is either copied from another data module (source noted) or is Kuro's own
 * personality copy. Do not add prices, clients, metrics, or testimonials here.
 */

/** Source: SERVICES_HERO.subline ("Based in Pune") and SERVICES_FAQ (international clients). */
export const KURO_LOCATION = {
  city: "Pune",
  country: "India",
  timeZone: "Asia/Kolkata",
  tzLabel: "IST, UTC+5:30",
};

/** Source: src/config/routes.js (Alt + number dock shortcuts). */
export const KURO_SHORTCUTS = [
  { key: "Alt+1", label: "Home" },
  { key: "Alt+2", label: "Projects" },
  { key: "Alt+3", label: "Services" },
  { key: "Alt+4", label: "Experience" },
  { key: "Alt+5", label: "Research" },
  { key: "Alt+6", label: "Certifications" },
  { key: "Alt+7", label: "Skills" },
  { key: "Alt+8", label: "About" },
  { key: "Alt+9", label: "Playground" },
];

/** Source: package.json dependencies and the Vercel serverless /api folder. */
export const KURO_SITE_STACK =
  "React 18 and Vite, Tailwind CSS v4, Framer Motion, Lenis smooth scroll, a Three.js tech globe, and Vercel serverless functions for the API.";

/** Source: aboutInfo.bio, second paragraph (anime, Gemini, chai). Checked by scripts/check-kuro.mjs. */
export const KURO_PERSONAL_LINE =
  "Off the keyboard: anime like Haikyu!!, experimenting with new Gemini releases, and chai over coffee, according to his bio.";

/** Kuro's own jokes. They make no claims about Aryan. */
export const KURO_JOKES = [
  "Why do programmers prefer dark mode? Because light attracts bugs.",
  "A SQL query walks into a bar, sees two tables, and asks: can I join you?",
  "Why did the dog sit in the shade? He did not want to be a hot dog.",
  "There are 10 kinds of people: those who read binary and those who do not.",
  "I would tell you a UDP joke, but you might not get it.",
  "My favorite bug is the one that disappears when I add a console.log.",
];

export const KURO_FUN_LINES = {
  food: "Bones, mostly. Aryan is the tea person (chai over coffee), so I just guard the biscuits.",
  teaCoffee: "Chai over coffee, always. That is straight from Aryan's bio.",
  color: "Ink black with a hard offset shadow. Very on brand.",
  age: "Dog years. I mostly nap and answer questions.",
  sleep: "I doze off when nobody is around. Move the mouse and I wake up.",
  sit: "*sits*. Good enough? Treat tax is one project click.",
  speak: "Woof. That is the whole bark API.",
  fetch: "*fetches a link* Try the projects page. Good doggo.",
  love: "*tail wag* Aw. Right back at you.",
};

/** Always-useful starting points for the empty chat state. */
export const KURO_EMPTY_CHIPS = [
  { label: "What does Aryan do?", send: "What does Aryan do?" },
  { label: "Pricing", send: "What are your prices?" },
  { label: "Availability", send: "Are you available?" },
  { label: "Show projects", send: "Show me the projects" },
  { label: "Tech stack", send: "What is the tech stack?" },
  { label: "How to hire", send: "How do I hire Aryan?" },
];

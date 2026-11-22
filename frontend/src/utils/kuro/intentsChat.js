/**
 * Small talk, personality, and site-control intents.
 * Each intent: { id, priority, score(ctx) -> number, run(ctx) -> reply }.
 */
import { send, go, act, CHIP, istHour, istTime, istDate } from "./context.js";
import { pick } from "./text.js";
import { projects, PAGES, SWARM_PATHS, achievementCounts, projectCard } from "./knowledge.js";
import { KURO_JOKES, KURO_FUN_LINES, KURO_SHORTCUTS, KURO_LOCATION } from "../../data/kuroFacts.js";

const GREET_FIRST =
  /^(h+i+|h+e+y+|he+l+o+|hiya|heya|yo+|hola|namaste|sup|howdy|gm|greetings|ahoy|wassup|hallo)$/;
const GREET_FILLER = new Set([
  "kuro", "there", "buddy", "boy", "dog", "doggo", "friend", "mate", "bro", "dude", "everyone", "all",
  "how", "are", "you", "is", "it", "going", "doing", "what", "up", "today", "good", "morning",
  "afternoon", "evening", "again", "world", "man", "yes", "do",
]);

const REACTION_VOCAB = new Set(
  (
    "wow nice crazy damn cool lol lmao ok oh haha ha omg whoa dang sick fire lit bet word true facts " +
    "same mood fr ngl tbh hm hmm hmmm great awesome amazing interesting got it i see makes sense " +
    "alright fine good neat sweet dope love hehe heh yay ooh ah aha wild insane nuts noted right " +
    "indeed okay perfect lovely beautiful excellent so thats that is cute"
  ).split(" "),
);

const FRUSTRATION_WORDS = ["wtf", "bruh", "ugh", "argh", "useless", "stupid", "dumb", "idiot", "trash", "garbage", "worst", "annoying", "broken", "suck", "sucks"];

const FRUSTRATION_LINES = [
  "Fair. Kennel glitched. Say it plain: a page, a project, or pricing.",
  "My bad. Try the short version: open projects, pricing, availability.",
  "Got it. Skip the drama. Name a page, a project, or what you need.",
];

const POSITIVE = new Set([
  "love", "like", "awesome", "amazing", "great", "cool", "nice", "beautiful", "gorgeous", "cute", "smart",
  "clever", "brilliant", "impressive", "sleek", "clean", "dope", "fire", "sick", "best", "fantastic",
  "incredible", "wonderful", "neat", "slick", "polished", "stunning", "solid", "sweet", "good", "perfect",
]);
const COMPLIMENT_SUBJECTS = [
  "portfolio", "site", "website", "design", "work", "animation", "animations", "projects", "ui", "page",
  "aryan", "developer", "stuff", "style", "look", "vibe",
];

const FUN_TRIVIA = [
  { test: (c) => c.anyPhrase("favorite food", "favourite food", "what do you eat", "are you hungry", "do you eat"), line: KURO_FUN_LINES.food },
  { test: (c) => c.any("chai", "coffee") && c.any("tea", "chai", "coffee") && c.tokens.length <= 8, line: KURO_FUN_LINES.teaCoffee },
  { test: (c) => c.anyPhrase("favorite color", "favourite colour", "favorite colour", "favourite color"), line: KURO_FUN_LINES.color },
  { test: (c) => c.anyPhrase("how old are you", "your age", "how old is kuro"), line: KURO_FUN_LINES.age },
  { test: (c) => c.anyPhrase("do you sleep", "are you sleeping", "are you sleepy", "do you nap"), line: KURO_FUN_LINES.sleep },
  { test: (c) => c.any("sit", "stay") && c.tokens.length <= 4, line: KURO_FUN_LINES.sit },
  { test: (c) => c.any("bark", "woof", "speak", "arf") && c.tokens.length <= 4, line: KURO_FUN_LINES.speak },
  { test: (c) => c.has("fetch") && c.tokens.length <= 5, line: KURO_FUN_LINES.fetch },
  { test: (c) => c.anyPhrase("i love you", "love you kuro", "you are cute", "you are adorable", "you are the best", "you are awesome", "you are a good dog"), line: KURO_FUN_LINES.love },
];

const PET_PHRASES = [
  "good boy", "good dog", "good doggo", "good girl", "who is a good boy", "pet you", "pet kuro", "pat you",
  "belly rub", "scratch", "cuddle", "hug", "give you a treat", "treat", "bone", "biscuit", "shake paw",
  "roll over", "high five",
];

export const chatIntents = [
  {
    id: "greeting",
    priority: 50,
    score(ctx) {
      const [first, second] = ctx.tokens;
      const tod = first === "good" && ["morning", "afternoon", "evening"].includes(second);
      if (!GREET_FIRST.test(first || "") && !tod) return 0;
      if (ctx.tokens.length <= 3) return 9;
      return ctx.tokens.slice(1).every((t) => GREET_FILLER.has(t) || GREET_FIRST.test(t)) ? 8.5 : 0;
    },
    run(ctx) {
      const hour = istHour(ctx.now);
      const hello = hour < 5 ? "Hey, night owl." : hour < 12 ? "Morning." : hour < 17 ? "Hey." : hour < 22 ? "Evening." : "Hey, night owl.";
      return {
        reply: `${hello} I'm Kuro, the dog on this portfolio. Ask me about Aryan's work, pricing, or availability, or tell me where to go.`,
        chips: [CHIP.projects, CHIP.pricing, CHIP.availability, CHIP.hire],
      };
    },
  },
  {
    id: "how_are_you",
    priority: 50,
    score(ctx) {
      const hit = ctx.anyPhrase("how are you", "how is it going", "how you doing", "how do you do", "what is up", "how is life", "how have you been", "you good", "how are things", "how are you doing");
      return hit && ctx.tokens.length <= 8 ? 8.6 : 0;
    },
    run() {
      return {
        reply: "Tail wagging, ears up. Ask me anything about Aryan or the site.",
        chips: [CHIP.projects, CHIP.help],
      };
    },
  },
  {
    id: "thanks",
    priority: 50,
    score(ctx) {
      if (!ctx.any("thanks", "thank", "appreciate", "grateful", "cheers", "thankyou")) return 0;
      return ctx.tokens.length <= 7 ? 8.5 : 3;
    },
    run() {
      return {
        reply: pick(["Anytime.", "Happy to help.", "*tail wag* Anytime.", "Good boy reporting for duty."]),
        chips: [CHIP.pricing, CHIP.hire],
        actions: [{ type: "pet_kuro" }],
      };
    },
  },
  {
    id: "bye",
    priority: 50,
    score(ctx) {
      const hit =
        ctx.any("bye", "goodbye", "goodnight", "gtg", "farewell") ||
        ctx.anyPhrase("see you", "see ya", "talk later", "good night", "catch you later", "have a good day");
      return hit && ctx.tokens.length <= 6 ? 8.5 : 0;
    },
    run() {
      return {
        reply: "See you around. I'll be here, probably napping.",
        chips: [CHIP.startProject],
      };
    },
  },
  {
    id: "sorry",
    priority: 50,
    score(ctx) {
      const hit = ctx.any("sorry", "apologies", "oops") || ctx.phrase("my bad");
      return hit && ctx.tokens.length <= 6 ? 8 : 0;
    },
    run() {
      return { reply: "No worries. Dogs forgive fast." };
    },
  },
  {
    id: "reaction",
    priority: 40,
    score(ctx) {
      if (!ctx.tokens.length || ctx.tokens.length > 5) return 0;
      return ctx.tokens.every((t) => REACTION_VOCAB.has(t)) ? 8.5 : 0;
    },
    run() {
      return {
        reply: pick(["Yeah, it's a lot. In a good way.", "Right? Neo-brutalist on purpose.", "Glad it landed.", "Noted. Loud and clear."]),
        chips: [CHIP.projects, CHIP.pricing],
      };
    },
  },
  {
    id: "yes_no",
    priority: 40,
    score(ctx) {
      if (!ctx.tokens.length || ctx.tokens.length > 3) return 0;
      return ctx.tokens.every((t) => ["yes", "no", "sure", "maybe", "idk", "dunno", "nope"].includes(t)) ? 8 : 0;
    },
    run() {
      return {
        reply: "Got it. What should I pull up?",
        chips: [CHIP.projects, CHIP.pricing, CHIP.availability, CHIP.help],
      };
    },
  },
  {
    id: "frustration",
    priority: 45,
    score(ctx) {
      if (ctx.tokens.length > 8) return 0;
      const hit = FRUSTRATION_WORDS.some((w) => ctx.has(w));
      if (!hit) return 0;
      return ctx.tokens.length <= 3 || ctx.any("you", "kuro", "this", "it") ? 8 : 0;
    },
    run() {
      return { reply: pick(FRUSTRATION_LINES), chips: [CHIP.help, CHIP.projects] };
    },
  },
  {
    id: "compliment",
    priority: 35,
    score(ctx) {
      if (ctx.tokens.length > 12) return 0;
      const positive = ctx.tokens.some((t) => POSITIVE.has(t));
      const subject = COMPLIMENT_SUBJECTS.some((s) => ctx.has(s)) || ctx.any("you", "kuro", "dog");
      if (!positive || !subject) return 0;
      // Questions like "is the site good" or "what is the best project" are not compliments.
      if (ctx.any("what", "which", "how", "show", "list", "price", "cost")) return 0;
      return 7.5;
    },
    run(ctx) {
      const aboutKuro = ctx.any("you", "kuro", "dog");
      return {
        reply: aboutKuro
          ? "*tail wag* Thanks. I just fetch answers."
          : "Glad it landed. Neo-brutalist on purpose. Want the project breakdown or the pricing?",
        chips: [CHIP.projects, CHIP.pricing, CHIP.hire],
        actions: aboutKuro ? [{ type: "pet_kuro" }] : [],
      };
    },
  },
  {
    id: "pet",
    priority: 60,
    score(ctx) {
      return ctx.tokens.length <= 7 && PET_PHRASES.some((p) => ctx.phrase(p)) ? 9 : 0;
    },
    run() {
      return {
        reply: pick(["*tail wag* More pets please.", "*happy pant*", "Good boy. Yes. Very good.", "*leans into the pet*"]),
        actions: [{ type: "pet_kuro" }],
        chips: [CHIP.projects, CHIP.help],
      };
    },
  },
  {
    id: "kuro_trivia",
    priority: 38,
    score(ctx) {
      return ctx.tokens.length <= 9 && FUN_TRIVIA.some((t) => t.test(ctx)) ? 8 : 0;
    },
    run(ctx) {
      const hit = FUN_TRIVIA.find((t) => t.test(ctx));
      return { reply: hit.line, chips: [CHIP.help] };
    },
  },
  {
    id: "joke",
    priority: 40,
    score(ctx) {
      return ctx.any("joke", "funny", "pun", "humor") || ctx.phrase("make me laugh") ? 8.5 : 0;
    },
    run() {
      return { reply: pick(KURO_JOKES), chips: [send("Another joke", "Tell me another joke"), CHIP.projects] };
    },
  },
  {
    id: "who_kuro",
    priority: 70,
    score(ctx) {
      const hit = ctx.anyPhrase(
        "who are you", "what are you", "what is kuro", "who is kuro", "your name", "introduce yourself",
        "tell me about yourself", "are you ai", "are you a bot", "are you real", "are you human",
        "are you a dog", "are you chatgpt", "are you gpt", "are you an llm", "are you a robot",
        "what model are you", "which model", "who made you", "who built you", "who created you",
        "who owns you", "who trained you", "what powers you",
      );
      return hit ? 8.8 : 0;
    },
    run(ctx) {
      const maker = ctx.anyPhrase("who made you", "who built you", "who created you", "who owns you", "who trained you");
      return {
        reply: maker
          ? "Aryan Dani built me. I'm Kuro, the dog mascot of this portfolio."
          : "I'm Kuro, the dog mascot and assistant of this portfolio. Most answers come straight from the site's own data (projects, pricing, availability, skills). Only open-ended questions go to an AI model.",
        chips: [send("Who is Aryan?", "Who is Aryan?"), CHIP.help],
      };
    },
  },
  {
    id: "capabilities",
    priority: 55,
    score(ctx) {
      const hit = ctx.anyPhrase(
        "what can you do", "what can i ask", "what can i say", "what do you know", "how can you help",
        "what are you capable of", "how to use", "list commands", "what do you do", "what can kuro do",
        "show commands", "show me commands",
      );
      if (hit) return 9;
      return ctx.any("help", "commands", "menu", "options", "capabilities") && ctx.tokens.length <= 3 ? 8.5 : 0;
    },
    run() {
      return {
        reply: [
          "Here is what I can do, no AI needed for most of it:",
          "- **About Aryan:** bio, projects, skills, experience, research, certifications",
          "- **Hiring:** pricing, packages, availability, process, FAQs, contact",
          "- **Site controls:** open any page, dark or light, sound, hack mode, command palette",
          "- **Quick tools:** copy email, open the resume, current time in IST",
        ].join("\n"),
        chips: [
          CHIP.projects, CHIP.pricing, CHIP.availability, CHIP.skills, CHIP.hire,
          send("Dark mode", "Dark mode"), send("Surprise me", "Surprise me"),
        ],
      };
    },
  },
  {
    id: "surprise",
    priority: 45,
    score(ctx) {
      return ctx.anyPhrase("surprise me", "random project", "fun fact", "show me something cool", "impress me", "wow me", "something cool", "random fact") ? 8.2 : 0;
    },
    run() {
      const project = pick(projects);
      return {
        reply: `Fetching one at random: **${project.title}** (${project.year}). ${project.description.split(". ")[0]}.`,
        cards: [projectCard(project)],
        chips: [send("Another one", "Surprise me"), CHIP.projects],
        meta: { projectId: project.id },
      };
    },
  },
  {
    id: "easter_egg",
    priority: 62,
    score(ctx) {
      return ctx.anyPhrase("easter egg", "easter eggs", "secret", "secrets", "konami", "cheat code", "hidden stuff", "hidden feature") || ctx.has("konami") ? 8.5 : 0;
    },
    run() {
      const { secret } = achievementCounts();
      return {
        reply: `There are ${secret} secret badges on this site. Hints: the Konami code, Ctrl+Alt+H, and the Playground CLI (type **help**). Tea fans get a bonus. I won't spoil the rest.`,
        chips: [go("Playground", "/playground"), go("Achievements", "/achievements"), send("Hack mode", "Hack mode")],
      };
    },
  },
  {
    id: "time_date",
    priority: 65,
    score(ctx) {
      if (ctx.any("zone", "timezone", "overlap")) return 0;
      if (ctx.anyPhrase("what time", "current time", "time now", "time is it", "what date", "todays date", "what day", "date today", "what is today", "time in india", "time in ist", "time in pune")) return 9;
      return ctx.has("time") && ctx.any("now", "currently") && ctx.tokens.length <= 5 ? 7 : 0;
    },
    run(ctx) {
      const dateOnly = ctx.any("date", "day", "today") && !ctx.has("time");
      return {
        reply: dateOnly
          ? `Today is ${istDate(ctx.now)} (${KURO_LOCATION.tzLabel}).`
          : `It's ${istTime(ctx.now)} in ${KURO_LOCATION.city} (${KURO_LOCATION.tzLabel}), ${istDate(ctx.now)}.`,
        chips: [CHIP.availability, CHIP.contact],
      };
    },
  },
  {
    id: "where_am_i",
    priority: 45,
    score(ctx) {
      return ctx.anyPhrase("where am i", "what page", "which page", "current page", "what page is this", "what is this page") ? 8 : 0;
    },
    run(ctx) {
      const base = ctx.path.split("?")[0];
      const page = PAGES.find((p) => p.path === base) || null;
      return {
        reply: page ? `You're on **${page.label}** (${base}).` : `You're at ${base}.`,
        chips: [CHIP.help, CHIP.projects],
      };
    },
  },

  /* ----------------------------------------------------------- site control */
  {
    id: "hack_mode",
    priority: 100,
    score(ctx) {
      const named =
        ctx.any("hackmode", "crt", "berserk", "matrix", "unhack") ||
        ctx.anyPhrase("hack mode", "normal mode", "exit hack", "turn it back");
      if (!named) return 0;
      const question = ctx.any("how", "what", "why", "where") && !ctx.has("turn");
      return question ? 3 : 9;
    },
    run(ctx) {
      const off =
        ctx.has("unhack") ||
        ctx.anyPhrase("exit hack", "normal mode", "turn back", "turn it back", "hack mode off", "crt off", "disable hack", "stop hack", "leave hack", "turn off hack", "disable crt") ||
        (ctx.has("off") && ctx.any("hack", "hackmode", "crt", "berserk", "matrix"));
      if (off) {
        if (ctx.siteState.hackMode === false) return { reply: "CRT is already off." };
        return { reply: "CRT off. Back to normal.", actions: [{ type: "set_hack_mode", enabled: false }] };
      }
      if (ctx.siteState.hackMode === true) return { reply: "CRT is already on. Eyes peeled." };
      return { reply: "CRT on. Eyes peeled.", actions: [{ type: "set_hack_mode", enabled: true }], chips: [send("Turn it back", "Normal mode")] };
    },
  },
  {
    id: "theme",
    priority: 100,
    score(ctx) {
      if (ctx.any("love", "like", "prefer", "hate", "enjoy")) return 0;
      const named =
        (ctx.any("dark", "light", "night") && ctx.any("mode", "theme", "lights")) ||
        ctx.anyPhrase("go dark", "flip the lights", "toggle theme", "switch theme", "change theme", "lights on", "lights off", "turn on the lights", "turn off the lights", "toggle dark mode", "toggle light mode", "swap theme") ||
        (ctx.has("theme") && ctx.any("toggle", "switch", "flip", "change", "swap"));
      return named ? 9 : 0;
    },
    run(ctx) {
      const question = ["do", "does", "is", "are", "can", "what", "which"].includes(ctx.tokens[0]) && ctx.any("have", "has", "support", "available", "offer");
      if (question) {
        return { reply: "Yep. Say **dark mode** or **light mode** and I'll flip it.", chips: [send("Dark mode"), send("Light mode")] };
      }
      const wantsDark = ctx.any("dark", "night") || ctx.anyPhrase("go dark", "lights off", "turn off the lights");
      const wantsLight = ctx.any("light", "day", "bright") || ctx.anyPhrase("lights on", "turn on the lights");
      const target = wantsDark && !wantsLight ? "dark" : wantsLight && !wantsDark ? "light" : "toggle";
      if (target === "toggle") return { reply: "Flipped the lights.", actions: [{ type: "toggle_theme" }] };
      const current = ctx.siteState.theme;
      if (current === target && ctx.siteState.hackMode === false) return { reply: `Already ${target}.` };
      return { reply: `Switching to ${target} mode.`, actions: [{ type: "set_theme", theme: target }] };
    },
  },
  {
    id: "sound",
    priority: 100,
    score(ctx) {
      if (ctx.any("mute", "unmute")) return 9;
      const named = ctx.any("sound", "audio", "sfx", "volume", "noise", "silence");
      const verb = ctx.any("on", "off", "enable", "disable", "toggle", "turn", "switch", "stop", "quiet", "silence", "start");
      return named && verb && ctx.tokens.length <= 7 ? 9 : 0;
    },
    run(ctx) {
      const off = ctx.any("off", "disable", "mute", "stop", "quiet", "silence") && !ctx.has("unmute");
      const on = ctx.any("on", "enable", "unmute", "start") || ctx.has("unmute");
      const known = ctx.siteState.sound;
      if (off && !on) {
        if (known === false) return { reply: "Sound is already off." };
        return { reply: "Sound off. Shhh.", actions: [{ type: "set_sound", enabled: false }] };
      }
      if (on && !off) {
        if (known === true) return { reply: "Sound is already on." };
        return { reply: "Sound on.", actions: [{ type: "set_sound", enabled: true }] };
      }
      return { reply: "Toggling sound.", actions: [{ type: "set_sound" }] };
    },
  },
  {
    id: "scroll_top",
    priority: 100,
    score(ctx) {
      return ctx.anyPhrase("scroll to top", "scroll top", "back to top", "top of the page", "go to top", "scroll up", "take me to the top", "jump to top") ? 9 : 0;
    },
    run() {
      return { reply: "Back to the top.", actions: [{ type: "scroll_to_top" }] };
    },
  },
  {
    id: "scroll_bottom",
    priority: 100,
    score(ctx) {
      return ctx.anyPhrase("scroll to bottom", "scroll bottom", "bottom of the page", "end of the page", "go to bottom", "scroll down", "jump to bottom", "take me to the bottom", "scroll to footer", "go to footer", "take me to the footer") ? 9 : 0;
    },
    run() {
      return { reply: "Heading to the bottom.", actions: [{ type: "scroll_to_bottom" }] };
    },
  },
  {
    id: "palette",
    priority: 100,
    score(ctx) {
      if (ctx.any("color", "colour", "accent")) return 0;
      return ctx.anyPhrase("command palette", "open palette", "quick search", "search the site") || ctx.any("ctrlk", "palette") ? 9 : 0;
    },
    run() {
      return { reply: "Palette up. Shortcut for next time: Ctrl+K.", actions: [{ type: "open_palette" }] };
    },
  },
  {
    id: "shortcuts",
    priority: 70,
    score(ctx) {
      return ctx.any("shortcuts", "shortcut", "hotkeys", "hotkey", "keybindings") || ctx.phrase("keyboard shortcuts") ? 8.5 : 0;
    },
    run() {
      const lines = KURO_SHORTCUTS.map((s) => `- **${s.key}:** ${s.label}`);
      return {
        reply: ["Dock shortcuts:", ...lines, "- **Ctrl+K:** command palette", "- **Ctrl+Alt+H:** hack mode"].join("\n"),
        chips: [send("Open palette", "Open the command palette")],
      };
    },
  },
  {
    id: "copy_email",
    priority: 100,
    score(ctx) {
      return ctx.has("copy") && ctx.has("email") ? 9.5 : 0;
    },
    run() {
      return { reply: "Email copied to your clipboard.", actions: [{ type: "copy_email" }], chips: [CHIP.startProject] };
    },
  },
  {
    id: "resume",
    priority: 95,
    score(ctx) {
      if (!ctx.has("resume") || ctx.tokens.length > 9) return 0;
      if (ctx.any("write", "build", "make", "create", "generate")) return 0;
      return 9;
    },
    run(ctx) {
      const latex = ctx.has("latex");
      return {
        reply: latex
          ? "Opening the LaTeX resume (the updated two-pager)."
          : "Opening the classic resume (one-pager). Ask for the LaTeX resume for the updated two-pager.",
        actions: [{ type: "open_resume", version: latex ? "latex" : "classic" }],
        chips: [act(latex ? "Classic version" : "LaTeX version", { type: "open_resume", version: latex ? "classic" : "latex" }), CHIP.contact],
      };
    },
  },
  {
    id: "swarm",
    priority: 100,
    score(ctx) {
      const hit =
        ctx.has("swarm") ||
        ctx.anyPhrase("animation again", "cursor animation", "cursors animation") ||
        (ctx.has("replay") && ctx.any("animation", "cursors", "cursor"));
      return hit ? 9 : 0;
    },
    run(ctx) {
      const base = ctx.path.split("?")[0].split("#")[0];
      if (!SWARM_PATHS.has(base)) {
        return {
          reply: "No cursor swarm on this page. Try Projects, Skills, or Services.",
          chips: [go("Projects", "/projects"), go("Skills", "/skills")],
        };
      }
      return { reply: "Running the cursor swarm again.", actions: [{ type: "replay_swarm" }] };
    },
  },
];

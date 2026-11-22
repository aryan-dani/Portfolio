/**
 * Sanity checks for Kuro's deterministic engine (no model calls, no new dependencies).
 * Run: node scripts/check-kuro.mjs   (Node 20.6+)
 *
 * Verifies that basic questions resolve to the right intent, never hit the LLM path, are built
 * from real data modules, and behave the same through the API layer (api/kuroChat.js).
 */
import assert from "node:assert/strict";
import { register } from "node:module";

// src/data/skills.js and stats.js import "./projects" without an extension (Vite resolves it).
// This tiny loader hook lets plain Node follow the same imports.
register(
  `data:text/javascript,${encodeURIComponent(
    `export async function resolve(s,c,n){try{return await n(s,c)}catch(e){if(s.startsWith(".")&&!/\\.[a-z]+$/.test(s))return n(s+".js",c);throw e}}`,
  )}`,
);

const { routeKuro, scoreIntents, buildKuroContext, KURO_THRESHOLDS, KURO_AI_CHIP_LABEL } = await import(
  "../src/utils/kuroRules.js"
);
const { generateKuroReply } = await import("../api/kuroChat.js");
const { KURO_TIP_SENDS } = await import("../src/utils/kuroTips.js");
const { KURO_EMPTY_CHIPS } = await import("../src/data/kuroFacts.js");
const { projects } = await import("../src/data/projects.js");
const { experiences, aboutInfo } = await import("../src/data/experience.js");
const { ACHIEVEMENTS } = await import("../src/data/achievements.js");
const { AVAILABILITY } = await import("../src/data/availability.js");
const { TESTIMONIALS } = await import("../src/data/testimonials.js");
const { getSkillById } = await import("../src/data/skills.js");
const { certifications } = await import("../src/data/certifications.js");
const { SERVICES_HERO, WEB_PACKAGES, formatWebPackagePrice } = await import("../src/data/services.js");

const DEFAULT_OPTS = { currentPath: "/", siteState: { theme: "light", hackMode: false, sound: true } };

/** [utterance, expected intent]. Every one must be answered by the router (high confidence). */
const CASES = [
  // small talk
  ["hi", "greeting"],
  ["hello kuro", "greeting"],
  ["good morning", "greeting"],
  ["hello how are you", "how_are_you"],
  ["thanks!", "thanks"],
  ["bye", "bye"],
  ["wow", "reaction"],
  ["wtf", "frustration"],
  ["tell me a joke", "joke"],
  ["good boy", "pet"],
  ["who are you", "who_kuro"],
  ["who made you", "who_kuro"],
  ["what can you do", "capabilities"],
  ["help", "capabilities"],
  ["i love this portfolio", "compliment"],
  ["surprise me", "surprise"],
  ["any easter eggs?", "easter_egg"],
  // about / services
  ["who is Aryan?", "who_aryan"],
  ["who built this?", "who_aryan"],
  ["What does Aryan do?", "what_does_aryan_do"],
  ["what services do you offer", "what_does_aryan_do"],
  ["can you build a mobile app", "what_does_aryan_do"],
  // pricing
  ["How much does it cost?", "pricing"],
  ["what are your prices", "pricing"],
  ["pricing", "pricing"],
  ["how much do you charge for a restaurant website", "pricing"],
  ["starter website price in inr", "pricing"],
  ["what is your hourly rate", "pricing"],
  ["ai product prices", "pricing"],
  // availability / hiring / contact
  ["are you available?", "availability"],
  ["can you start in January 2027", "availability"],
  ["are you still taking clients", "availability"],
  ["how do I hire Aryan?", "hire"],
  ["I want to start a project", "hire"],
  ["is he open to work", "hire_job"],
  ["contact", "navigate"],
  ["how do i contact aryan", "contact"],
  ["what's his email?", "email"],
  ["copy email", "copy_email"],
  ["github", "socials"],
  ["linkedin", "socials"],
  ["open the resume", "resume"],
  ["open the latex resume", "resume"],
  ["where are you based?", "location"],
  ["what time zone are you in", "location"],
  ["what time is it", "time_date"],
  // tech / projects
  ["what is the tech stack?", "skills_overview"],
  ["what ai tools does he use", "skills_overview"],
  ["does he use rust?", "skill_lookup"],
  ["does he know python", "skill_lookup"],
  ["does he know cobol", "skill_lookup"],
  ["show me the projects", "navigate"],
  ["ai projects", "projects_list"],
  ["which projects use react", "projects_list"],
  ["which projects have a live demo?", "projects_list"],
  ["how many projects", "projects_list"],
  ["tell me about Utility", "project"],
  ["tell me about Siya's Portfolio", "project"],
  ["what is Samiksha?", "project"],
  ["open aegis", "project"],
  ["case study for prism", "project"],
  ["tell me about the threat detection project", "project"],
  // experience / research / certs / achievements
  ["what is his current role?", "experience"],
  ["tell me about provaantech", "experience"],
  ["where does he work", "experience"],
  ["certifications", "navigate"],
  ["how many certifications", "certifications"],
  ["where is the research paper", "research"],
  ["achievements", "navigate"],
  ["how many achievements are there", "achievements"],
  // services detail
  ["website development pune", "service_landing"],
  ["do you do website redesign", "service_landing"],
  ["i need a rag chatbot for my company", "service_landing"],
  ["what is the process", "process"],
  ["payment terms", "payment"],
  ["how long does a website take", "faq"],
  ["who owns the code", "faq"],
  ["why not wix", "faq"],
  ["do you have any testimonials", "testimonials"],
  ["read your guides", "guides"],
  ["what is your education", "education"],
  ["what are his hobbies", "personal"],
  ["how was this website built", "site_stack"],
  ["how does the guestbook work", "site_help"],
  ["keyboard shortcuts", "shortcuts"],
  // navigation & site control
  ["go to skills", "navigate"],
  ["take me to pricing", "navigate"],
  ["open the experience page", "navigate"],
  ["projects", "navigate"],
  ["scroll to the bottom", "scroll_bottom"],
  ["scroll to top", "scroll_top"],
  ["dark mode", "theme"],
  ["flip the lights", "theme"],
  ["turn off sound", "sound"],
  ["unmute", "sound"],
  ["hack mode", "hack_mode"],
  ["normal mode", "hack_mode"],
  ["open the command palette", "palette"],
  ["tea or coffee", "kuro_trivia"],
];

/** Typos and chat-speak still resolve (fuzzy matching). */
const TYPO_CASES = [
  ["projcts", "projects_list"],
  ["pricng", "pricing"],
  ["avalible?", "availability"],
  ["wats ur email", "email"],
  ["hiii", "greeting"],
  ["thx", "thanks"],
  ["resum pls", "resume"],
  ["certifcations", "certifications"],
];

/** Open-ended questions the router must NOT claim (these go to the LLM with grounding). */
const LLM_CASES = [
  "explain quantum computing to me",
  "write me a poem about autumn",
  "what is the capital of france",
  "how would you design a rate limiter",
  "what's the weather today",
];

const KNOWN_ACTIONS = new Set([
  "navigate", "toggle_theme", "set_theme", "set_sound", "set_hack_mode", "scroll_to_top", "scroll_to_bottom",
  "open_palette", "copy_email", "open_resume", "replay_swarm", "pet_kuro", "open_url", "set_accent",
]);

let checks = 0;
const ok = (condition, message) => {
  checks += 1;
  assert.ok(condition, message);
};

function route(message, opts = DEFAULT_OPTS) {
  return routeKuro(message, opts);
}

/* -------------------------------------------------------------- intent map */

assert.ok(CASES.length >= 60, `need at least 60 utterances, have ${CASES.length}`);

const mismatches = [];
for (const [message, expected] of [...CASES, ...TYPO_CASES]) {
  const result = route(message);
  const top = scoreIntents(message)
    .slice(0, 3)
    .map((s) => `${s.id}:${s.score.toFixed(1)}`)
    .join(", ");
  if (!result) mismatches.push(`"${message}" returned null (expected ${expected}; scores ${top || "none"})`);
  else if (result.intent !== expected) mismatches.push(`"${message}" -> ${result.intent} (expected ${expected}; scores ${top})`);
  else if (result.source !== "rule") mismatches.push(`"${message}" is not a rule answer`);
  else if (CASES.some(([m]) => m === message) && result.tier !== "high") {
    mismatches.push(`"${message}" should be high confidence, got ${result.tier} (${top})`);
  }
}
assert.equal(mismatches.length, 0, `intent mismatches:\n  ${mismatches.join("\n  ")}`);

for (const message of LLM_CASES) {
  assert.equal(route(message), null, `"${message}" should fall through to the LLM`);
}

/* ------------------------------------------------------- reply well-formed */

const everyReply = [];
for (const [message] of [...CASES, ...TYPO_CASES]) {
  const result = route(message);
  everyReply.push([message, result]);
  ok(typeof result.reply === "string" && result.reply.length > 0, `"${message}" empty reply`);
  ok(!/[\u2013\u2014]/.test(result.reply), `"${message}" reply contains an em/en dash`);
  ok(!/undefined|NaN|\[object/.test(result.reply), `"${message}" reply has a template leak: ${result.reply}`);
  for (const action of result.actions) {
    ok(KNOWN_ACTIONS.has(action.type), `"${message}" unknown action type ${action.type}`);
  }
  for (const card of result.cards) {
    ok(card.type === "project" || card.type === "package", `"${message}" bad card type`);
    ok(card.title || card.name, `"${message}" card without a title`);
    ok(card.path, `"${message}" card without a path`);
  }
  for (const chip of result.chips) {
    ok(chip.label, `"${message}" chip without label`);
    ok(chip.send || chip.to || chip.href || chip.action || chip.ai, `"${message}" chip without behaviour`);
  }
  if (result.tier === "high") ok(!result.chips.some((c) => c.ai), `"${message}" high tier must not offer the AI chip`);
}

// Every quick-reply chip (and every tip / empty-state chip) must itself be a rule answer.
const chipSends = new Set([...KURO_TIP_SENDS, ...KURO_EMPTY_CHIPS.map((c) => c.send)]);
for (const [, result] of everyReply) {
  for (const chip of result.chips) if (chip.send) chipSends.add(chip.send);
}
for (const send of chipSends) {
  const result = route(send);
  ok(result, `chip/tip "${send}" would reach the LLM`);
  ok(!result.chips.some((c) => c.ai && c.query === send) || result.tier === "medium", `chip "${send}" tier`);
}

/* ------------------------------------------------------ data-driven facts */

const starter = WEB_PACKAGES.find((p) => p.id === "starter-website");
const pricing = route("what are your prices").reply;
ok(pricing.includes(formatWebPackagePrice(starter, "INR")), "pricing must show the starter INR price from data");
ok(pricing.includes(formatWebPackagePrice(starter, "USD").replace(/^(Starting at|From) /, "")), "pricing must show the starter USD price");
ok(/Starter Website/.test(pricing) && /Custom Web App/.test(pricing), "pricing lists the web packages");
ok(/USD 399/.test(pricing), "pricing mentions the AI audit starting price");
ok(/INR|\u20b9/.test(route("website prices in inr").reply), "INR request shows rupees");
ok(/USD|\$/.test(route("website prices in dollars").reply), "USD request shows dollars");
ok(route("ai product prices").reply.includes("AI Prototype Sprint"), "AI pricing lists AI packages");
ok(route("price of the starter website").cards[0]?.id === "starter-website", "package question returns a package card");

ok(route("are you available?").reply.includes(AVAILABILITY.label), "availability reply uses AVAILABILITY.label");

ok(route("how many projects").reply.startsWith(`${projects.length} projects`), "project count comes from data");
const utility = route("tell me about utility");
ok(utility.cards[0].title === "Utility" && utility.cards[0].live, "project card carries title and live link");
ok(route("open utility").actions[0].path === "/projects?highlight=13", "open <project> navigates to its card");
ok(route("case study for prism").actions[0].path === "/work/prism", "case study opens /work/:slug");

const rust = route("does he use rust");
ok(rust.reply.includes("Aegis"), "skill lookup names the projects that use the skill");
ok(getSkillById("rust").projectIds.length >= 1, "rust skill data present");
ok(/don't see \*\*cobol\*\*/.test(route("does he know cobol").reply), "unknown skills are admitted, not invented");

const current = experiences.find((e) => e.current);
ok(route("what is his current role").reply.includes(current.company), "current role comes from experience data");
ok(route("how many certifications").reply.startsWith(`${certifications.length} certifications`), "cert count from data");
ok(route("how many achievements are there").reply.includes(`${ACHIEVEMENTS.length} achievements`), "achievement count from data");

const secretTitles = ACHIEVEMENTS.filter((a) => a.secret).map((a) => a.title);
for (const q of ["any easter eggs?", "list the achievements", "how many achievements are there"]) {
  const reply = route(q).reply;
  for (const title of secretTitles) ok(!reply.includes(title), `"${q}" leaked secret badge ${title}`);
}

ok(/Pune/.test(SERVICES_HERO.subline), "KURO_LOCATION city must stay in sync with SERVICES_HERO");
ok(/Pune/.test(route("where are you based").reply), "location reply names Pune");
ok(/haikyu/i.test(aboutInfo.bio) && /chai/i.test(aboutInfo.bio), "KURO_PERSONAL_LINE must match the bio");
ok(/Haikyu/.test(route("what are his hobbies").reply), "personal reply from bio facts");
ok(/IST/.test(route("what time is it").reply), "time answers in IST");

if (TESTIMONIALS.length === 0) {
  ok(/No public testimonials/.test(route("do you have any testimonials").reply), "no invented testimonials");
}
ok(!/\$\d|USD \d|\u20b9\d/.test(route("do you have any testimonials").reply), "testimonial reply has no prices");

/* ------------------------------------------------------ site state & memory */

const dark = route("dark mode", { currentPath: "/", siteState: { theme: "dark", hackMode: false } });
ok(dark.actions.length === 0 && /Already dark/.test(dark.reply), "dark mode when already dark does nothing");
ok(route("dark mode", { currentPath: "/", siteState: { theme: "light", hackMode: false } }).actions[0].theme === "dark", "dark mode sets dark");
ok(route("turn off sound", { siteState: { sound: false } }).actions.length === 0, "sound already off is a no-op");
ok(route("hack mode", { siteState: { hackMode: true } }).actions.length === 0, "hack mode already on is a no-op");
ok(route("projects", { currentPath: "/projects" }).actions.length === 0, "navigating to the current page is a no-op");
ok(route("scroll to top").actions[0].type === "scroll_to_top", "scroll to top action");
ok(route("swarm cursors", { currentPath: "/" }).actions.length === 0, "swarm only runs on swarm pages");
ok(route("swarm cursors", { currentPath: "/projects" }).actions[0].type === "replay_swarm", "swarm on /projects");

const followHistory = [
  { role: "user", text: "tell me about aegis" },
  { role: "assistant", text: "Aegis is a vault.", meta: { projectId: 17 } },
];
const more = route("tell me more", { history: followHistory });
ok(more && more.cards[0]?.title === "Aegis", "follow-up resolves the last project from history metadata");
const textOnly = route("navigate me to the card", { history: [{ role: "user", text: "tell me about prism" }] });
ok(textOnly.actions[0]?.path === "/projects?highlight=19", "follow-up falls back to scanning history text");
ok(/Which one/.test(route("tell me more", { history: [] }).reply), "follow-up without context asks which project");

/* ------------------------------------------------------ confidence model */

ok(KURO_THRESHOLDS.high > KURO_THRESHOLDS.medium && KURO_THRESHOLDS.medium > 0, "thresholds ordered");
const medium = route("process");
ok(medium && medium.tier === "medium", `"process" should be medium confidence, got ${medium?.tier}`);
ok(medium.chips.at(-1).ai === true && medium.chips.at(-1).label === KURO_AI_CHIP_LABEL, "medium tier adds the Ask the AI chip last");
ok(medium.chips.at(-1).query === "process", "AI chip carries the original question");
ok(route("") === null && route("   ") === null && route("x".repeat(501)) === null && route(null) === null, "invalid input returns null");

/* ------------------------------------------------------ LLM grounding context */

const ctx = buildKuroContext("how does prism handle role based access control", { currentPath: "/projects" });
ok(ctx.includes("Visitor is on: Projects"), "context names the current page");
ok(/Project: Prism/.test(ctx) && /Case study: \/work\/prism/.test(ctx), "context includes matched project facts");
ok(buildKuroContext("tell me about rust", {}).includes("Skill: Rust"), "context includes matched skill facts");
ok(ctx.length <= 1400, "context stays compact");

/* ------------------------------------------------------ API layer (no network) */

const realFetch = globalThis.fetch;
let fetchCalls = [];
globalThis.fetch = async (url, init) => {
  fetchCalls.push({ url, body: JSON.parse(init.body) });
  return {
    ok: true,
    status: 200,
    json: async () => ({ choices: [{ message: { content: "Stub model reply." } }] }),
  };
};

try {
  // Rule-answerable messages never touch the model, even with a key configured.
  for (const [message] of CASES) {
    const result = await generateKuroReply({ message, history: [], currentPath: "/", siteState: DEFAULT_OPTS.siteState }, "test-key");
    assert.equal(result.source, "rule", `API should answer "${message}" from rules`);
  }
  assert.equal(fetchCalls.length, 0, "rule answers must never call the model");

  // ...and without a key they still work (no 503).
  const noKey = await generateKuroReply({ message: "what are your prices", currentPath: "/" }, "");
  assert.equal(noKey.source, "rule");
  await assert.rejects(
    () => generateKuroReply({ message: "explain quantum computing to me", currentPath: "/" }, ""),
    /not configured/,
  );

  // Open-ended questions reach the model, grounded with deterministic context.
  const llm = await generateKuroReply(
    { message: "explain how transformers work", history: [], currentPath: "/projects" },
    "test-key",
  );
  assert.equal(llm.source, "llm");
  assert.equal(llm.reply, "Stub model reply.");
  assert.equal(fetchCalls.length, 1, "exactly one model call for an unmatched question");
  const system = fetchCalls[0].body.messages[0].content;
  ok(system.includes("GROUNDED CONTEXT") && system.includes("Visitor is on: Projects"), "system prompt carries the page context");
  ok(system.includes(AVAILABILITY.label), "system prompt carries availability from data");
  ok(/Starter Website/.test(system), "system prompt carries package pricing from data");

  // "Ask the AI" chip: forceLlm skips rules but still grounds the model with matched facts.
  fetchCalls = [];
  const forced = await generateKuroReply(
    { message: "how does prism handle role based access control", currentPath: "/", forceLlm: true },
    "test-key",
  );
  assert.equal(forced.source, "llm");
  assert.equal(fetchCalls.length, 1, "forceLlm must call the model");
  ok(fetchCalls[0].body.messages[0].content.includes("Project: Prism"), "forced LLM prompt carries matched project facts");

  // Model-called site actions are still gated by the visitor's wording.
  const { filterActions } = await import("../api/kuroChat.js");
  ok(filterActions("wow", [{ type: "toggle_theme" }]).length === 0, "reaction text must not flip the theme");
  ok(filterActions("flip the lights", [{ type: "toggle_theme" }]).length === 1, "explicit theme request is allowed");

  await assert.rejects(() => generateKuroReply({ message: "", currentPath: "/" }, "k"), /Invalid message/);
} finally {
  globalThis.fetch = realFetch;
}

/* ------------------------------------------------------ speed */

const started = performance.now();
const rounds = 20;
for (let i = 0; i < rounds; i += 1) {
  for (const [message] of CASES) route(message);
}
const perCall = (performance.now() - started) / (rounds * CASES.length);
ok(perCall < 15, `router too slow: ${perCall.toFixed(2)}ms per message`);

console.log(
  `check-kuro: ${CASES.length} intent cases, ${TYPO_CASES.length} typo cases, ${LLM_CASES.length} LLM fall-through cases, ` +
    `${chipSends.size} chip/tip utterances, ${checks} extra checks, ${perCall.toFixed(2)}ms avg per message. OK`,
);

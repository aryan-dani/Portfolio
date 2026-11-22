/**
 * Hiring-side intents: services, pricing, availability, contact, process, FAQs.
 * All figures come from src/data/services.js and src/data/availability.js.
 */
import { scoreRules, send, go, ext, CHIP, istTime } from "./context.js";
import { joinList, truncate } from "./text.js";
import {
  aboutInfo,
  socialLinks,
  PAGE_BY_ID,
  WEB_PACKAGES,
  SERVICES_PACKAGES,
  SERVICES_FAQ,
  WEB_COMMERCIAL,
  WEB_REVIEW_ROUNDS,
  SERVICE_LANDINGS,
  SERVICES_GUIDES,
  currencyFrom,
  findPackages,
  getPackage,
  packagePrice,
  packageCard,
  webPrice,
  aiPrice,
  caseStudyFor,
  matchFaq,
  navigateAction,
  currentExperience,
  projects,
  projectCard,
} from "./knowledge.js";
import {
  SERVICES_PRICE_NOTE,
  SERVICES_HERO,
  SERVICES_PROCESS,
  WEB_PROCESS,
  BOOKING_CALL_URL,
  getWebGallery,
} from "../../data/services.js";
import { TESTIMONIALS } from "../../data/testimonials.js";
import { AVAILABILITY } from "../../data/availability.js";
import { KURO_LOCATION } from "../../data/kuroFacts.js";

const INQUIRY = PAGE_BY_ID.contact;
const EMAIL = aboutInfo.email;
const AI_WORDS = ["ai", "rag", "chatbot", "llm", "assistant", "agent", "agentic", "prototype", "hitl", "audit", "retainer", "grounded"];
const WEB_WORDS = ["website", "site", "web", "restaurant", "shop", "clinic", "landing", "blog", "store", "webapp", "app", "mvp", "portfolio", "creator"];

const priceLine = (pack, currency) =>
  `- **${pack.name}:** ${packagePrice(pack, currency)}, ${pack.timeline}`;

function packageDetail(pack, currency) {
  const includes = (pack.includes || []).map((i) => `- ${i}`);
  return {
    reply: [
      `**${pack.name}:** ${packagePrice(pack, currency)}.`,
      `Timeline: ${pack.timeline}. ${pack.forWho}`,
      ...includes,
      pack.priceDetail ? pack.priceDetail : "",
      "Starting ranges, not fixed quotes. A fixed quote follows a short written brief.",
    ]
      .filter(Boolean)
      .join("\n"),
    cards: [packageCard(pack)],
    chips: [CHIP.startProject, send("All pricing", "What are your prices?"), CHIP.availability],
    meta: { packageId: pack.id },
  };
}

function inquiryNavigate() {
  return [navigateAction(INQUIRY)];
}

const RULES = {
  pricing: {
    kw: {
      price: 6, pricing: 6, cost: 6, quote: 5.5, rate: 3, charge: 6, fee: 5, budget: 4.5, package: 4,
      afford: 4.5, affordable: 4.5, cheap: 4.5, cheapest: 6, expensive: 4.5, estimate: 4.5, ballpark: 4.5,
      inr: 3, usd: 3, rupee: 3, dollar: 3,
    },
    ph: {
      "how much": 3.5, "how much for": 2.5, "what do you charge": 3, "per hour": 5, "hourly rate": 5,
      "rate card": 4, "how much would": 1.5,
    },
    neg: {
      "how much experience": 7, "how much time": 4, "how much do you know": 6, "how much does he know": 6,
      "how much of": 3, "package manager": 6,
    },
  },
  availability: {
    kw: {
      available: 6.5, availability: 6.5, booking: 4, booked: 4, january: 3, "2027": 4, slot: 4, capacity: 3.5, busy: 3.5,
    },
    ph: {
      "are you free": 6, "is he free": 6, "is aryan free": 6, "when can you start": 6.5, "can you start": 5,
      "taking new clients": 6.5, "taking new projects": 6.5, "taking new work": 6.5, "accepting projects": 6.5,
      "accepting clients": 6.5, "taking clients": 6.5, "taking projects": 6.5, "taking on clients": 6.5, "accepting new clients": 6.5, "accepting new projects": 6.5, "any slots": 6, "open for projects": 6, "open for work": 5, "when can he start": 6.5,
    },
    neg: {},
  },
  hire: {
    kw: { hire: 6, collaborate: 5, collaboration: 5, inquiry: 5, enquiry: 5, freelance: 4, freelancer: 4, commission: 3 },
    ph: {
      "work with you": 7, "work with aryan": 7, "work with him": 7, "work together": 6.5,
      "start a project": 8.5, "start project": 8, "new project": 4.5, "get started": 5.5,
      "book a call": 7.5, "schedule a call": 7.5, "book a meeting": 7.5, "need a developer": 6,
      "looking for a developer": 6, "need a website": 5.5, "build me": 5, "i have a project": 6.5,
      "have a project": 5.5, "want to build": 5,
    },
    neg: { "full time": 4, job: 3, internship: 3, recruiter: 4 },
  },
  contact: {
    kw: { contact: 6, phone: 6.5, whatsapp: 5.5, telegram: 4, dm: 4, call: 2, message: 2.5, reach: 4.5 },
    ph: { "get in touch": 8.5, "reach out": 3, "reach him": 3, "reach aryan": 3, "talk to": 3.5, "contact details": 3 },
    neg: {},
  },
  email: { kw: { email: 6.5 }, ph: {}, neg: {} },
  socials: {
    kw: { github: 6, linkedin: 6.5, twitter: 6, instagram: 6.5, social: 4.5, socials: 5.5, follow: 3, profile: 3 },
    ph: { "on x": 2, "x account": 5, "x handle": 5, "his x": 3 },
    neg: {},
  },
  hire_job: {
    kw: {
      job: 3, internship: 4, intern: 3, recruiter: 6, recruit: 5, vacancy: 5, employ: 4, employer: 5, fulltime: 7,
    },
    ph: {
      "full time": 7, "part time job": 6, "open to work": 8, "looking for work": 7, "looking for a job": 7,
      "job offer": 7, "offer you a job": 8, "join our team": 7, "work for us": 6, "career opportunity": 6,
    },
    neg: {
      "has he done": 5, "did he do": 5, "what internship": 4, "which internship": 4, "how many internships": 6,
      "where did": 4, "has he worked": 4,
    },
  },
  location: {
    kw: {
      location: 6.5, located: 6, based: 5, timezone: 7, remote: 4, remotely: 4.5, city: 3.5, country: 3.5,
      pune: 3.5, india: 3, overseas: 3.5, international: 4, worldwide: 4, overlap: 5, global: 2.5,
    },
    ph: {
      "time zone": 7, "where are you": 6.5, "where do you live": 8, "where is he from": 7, "where are you from": 7,
      "which city": 7, "where is aryan": 6.5, "work remotely": 3, "where is he based": 3,
    },
    neg: {},
  },
  payment: {
    kw: {
      payment: 6.5, pay: 4.5, paid: 4, invoice: 5, advance: 4.5, deposit: 5, installment: 5.5, upfront: 5, upi: 5,
      paypal: 5, refund: 5,
    },
    ph: { "how do i pay": 6, "payment terms": 7, "payment methods": 6.5, "bank transfer": 5, "milestone payment": 2 },
    neg: {},
  },
  process: {
    kw: { process: 5, workflow: 3.5, steps: 3, milestone: 4, handover: 4, onboarding: 4 },
    ph: {
      "how does it work": 8, "how do you work": 7.5, "how does the process work": 8, "what is the process": 8,
      "working process": 7, "review rounds": 6, "how does working": 6, "how will we work": 8, "what happens after": 6,
    },
    neg: { "hiring process": 0 },
  },
  timeline: {
    kw: { timeline: 5.5, turnaround: 6, deadline: 4.5, deliver: 3, delivery: 4 },
    ph: { "how long": 3.5, "how fast": 4.5, "how soon": 4.5, "delivery time": 7, "when will it be ready": 7 },
    neg: { "how long has": 6, "how long have": 6, "how long is the": 3 },
  },
  guides: {
    kw: { guide: 6, blog: 5, article: 5, checklist: 4.5, resources: 3 },
    ph: { "read more": 2 },
    neg: {},
  },
  testimonials: {
    kw: { testimonial: 7, client: 3.5, references: 6, recommend: 3, review: 3 },
    ph: { "past work": 5, "who have you worked with": 8, "past clients": 7, "your clients": 5.5, "his clients": 5.5, "any clients": 5, "happy clients": 7, "worked with": 2 },
    neg: { "review rounds": 6, "code review": 6 },
  },
  what_does: {
    kw: { offer: 3, services: 5.5 },
    ph: {
      "what does aryan do": 9, "what does he do": 8.5, "what do you offer": 9, "what services": 9,
      "what do you build": 8.5, "what can you build": 8.5, "what can he build": 8.5, "what can aryan build": 8.5,
      "what do you make": 8, "what do you provide": 8, "what are your services": 9, "do you offer": 5.5,
      "what kind of projects": 6, "do you build": 6, "can you build": 6, "can you make": 5.5, "do you do": 3,
      "what does aryan offer": 9, "what does he offer": 9, "what do you sell": 8,
    },
    neg: {},
  },
};

const LANDING_RULES = {
  "website-development-pune": (c) => (c.has("pune") && c.any("website", "web", "developer", "site", "development") ? 8.5 : 0),
  "web-app-mvp-development": (c) =>
    c.any("mvp", "webapp", "startup", "saas") || c.phrase("web app") ? (c.any("development", "developer", "build", "hire", "app", "need", "want") ? 8 : 4) : 0,
  "website-redesign": (c) =>
    c.any("redesign", "revamp", "refresh", "rebuild", "migrate", "migration") && c.any("website", "site", "web", "page") ? 8.5 : 0,
  "rag-chatbot-development": (c) =>
    (c.any("rag", "chatbot", "llm") || c.phrase("chat bot")) && c.any("develop", "development", "developer", "build", "hire", "create", "need", "want", "made", "for", "business", "company") ? 8 : 0,
};

function landingMatch(ctx) {
  let best = null;
  for (const landing of SERVICE_LANDINGS) {
    const score = LANDING_RULES[landing.slug]?.(ctx) || 0;
    if (score && (!best || score > best.score)) best = { landing, score };
  }
  return best;
}

export const serviceIntents = [
  {
    id: "what_does_aryan_do",
    priority: 60,
    score: (ctx) => scoreRules(ctx, RULES.what_does),
    run(ctx) {
      if (ctx.any("mobile", "ios", "android", "flutter", "native")) {
        return {
          reply: "Mobile apps aren't listed. Aryan builds websites, web apps, and AI tools. If it's close to that, send the brief on the inquiry form.",
          chips: [CHIP.startProject, CHIP.services],
        };
      }
      const starter = getPackage("starter-website");
      const audit = getPackage("code-audit");
      const sprint = getPackage("prototype-sprint");
      return {
        reply: [
          `${SERVICES_HERO.eyebrow}. Two lanes:`,
          `- **Websites and web apps:** Next.js and React sites for local businesses and creators, plus custom MVPs. ${webPrice(starter, "both")}.`,
          `- **AI products:** grounded RAG assistants, human-in-the-loop workflow tools, and AI audits. From ${aiPrice(audit, "USD").replace(/^Starting at /, "")} (audit) and ${aiPrice(sprint, "USD").replace(/^Starting at /, "")} (prototype sprint).`,
          AVAILABILITY.label + ".",
        ].join("\n"),
        chips: [CHIP.pricing, CHIP.startProject, CHIP.availability, CHIP.projects],
      };
    },
  },
  {
    id: "pricing",
    priority: 66,
    score(ctx) {
      const base = scoreRules(ctx, RULES.pricing);
      if (!base) return 0;
      return findPackages(ctx.tokens).length ? base + 2.5 : base;
    },
    run(ctx) {
      const currency = currencyFrom(ctx.tokens);
      const hit = findPackages(ctx.tokens)[0];
      const wantsAi = ctx.any(...AI_WORDS);
      const wantsWeb = ctx.any(...WEB_WORDS);
      if (hit && hit.score >= 5) return packageDetail(hit.pack, currency);
      if (ctx.any("cheapest", "cheap", "lowest", "minimum", "affordable") && !wantsAi) {
        return packageDetail(getPackage("starter-website"), currency);
      }
      const webList = ["**Websites and web apps**", ...WEB_PACKAGES.map((p) => priceLine({ ...p, kind: "web" }, currency))];
      const aiList = ["**AI products**", ...SERVICES_PACKAGES.map((p) => priceLine({ ...p, kind: "ai" }, currency))];
      let lines;
      let chips;
      if (wantsAi && !wantsWeb) {
        lines = aiList;
        chips = [send("Website pricing", "Website prices")];
      } else if (wantsWeb && !wantsAi) {
        lines = webList;
        chips = [send("AI pricing", "AI product prices")];
      } else {
        const audit = getPackage("code-audit");
        lines = [...webList, `**AI products** start at ${aiPrice(audit, "USD").replace(/^Starting at /, "")} (code audit). Ask for AI pricing for the full list.`];
        chips = [send("AI pricing", "AI product prices")];
      }
      return {
        reply: [...lines, SERVICES_PRICE_NOTE].join("\n"),
        chips: [CHIP.startProject, ...chips, CHIP.availability],
      };
    },
  },
  {
    id: "availability",
    priority: 66,
    score: (ctx) => scoreRules(ctx, RULES.availability),
    run() {
      return {
        reply: `**${AVAILABILITY.label}.** ${AVAILABILITY.detail}. The inquiry form is the fastest way to claim a slot.`,
        chips: [CHIP.startProject, CHIP.pricing, CHIP.contact],
      };
    },
  },
  {
    id: "hire",
    priority: 62,
    score(ctx) {
      const base = scoreRules(ctx, RULES.hire);
      const jobWords = ctx.any("job", "internship", "intern", "fulltime", "recruiter");
      return base && jobWords ? Math.max(0, base - 2) : base;
    },
    run(ctx) {
      const wantsCall = ctx.anyPhrase("book a call", "schedule a call", "book a meeting");
      const imperative = ctx.anyPhrase("start a project", "start project", "get started", "i have a project") || wantsCall;
      const callNote = wantsCall && !BOOKING_CALL_URL ? "There's no calendar link yet, so the inquiry form is the booking path. " : "";
      return {
        reply: `${callNote}Send the inquiry form on the Services page or email ${EMAIL}. You get clarifying questions first, then a written estimate, and no chargeable work starts without a written agreement. ${AVAILABILITY.label}.`,
        actions: imperative ? inquiryNavigate() : [],
        chips: [CHIP.startProject, CHIP.pricing, CHIP.copyEmail],
      };
    },
  },
  {
    id: "contact",
    priority: 58,
    score: (ctx) => scoreRules(ctx, RULES.contact),
    run(ctx) {
      const noPhone = ctx.any("phone", "whatsapp", "telegram", "number", "call");
      const github = socialLinks.find((s) => s.name === "GitHub");
      const linkedin = socialLinks.find((s) => s.name === "LinkedIn");
      return {
        reply: [
          noPhone ? "No phone number is listed on the site. Best routes:" : "Best routes:",
          `- **Inquiry form** on the Services page (${AVAILABILITY.detail.split("·").pop().trim().toLowerCase()})`,
          `- **Email:** [${EMAIL}](mailto:${EMAIL})`,
          `- [GitHub](${github.url}) and [LinkedIn](${linkedin.url})`,
        ].join("\n"),
        chips: [CHIP.startProject, CHIP.copyEmail, ext("LinkedIn", linkedin.url)],
      };
    },
  },
  {
    id: "email",
    priority: 64,
    score: (ctx) => scoreRules(ctx, RULES.email),
    run() {
      return {
        reply: `Email: [${EMAIL}](mailto:${EMAIL}). For a project, the inquiry form on the Services page gets a reply faster.`,
        chips: [CHIP.copyEmail, CHIP.startProject],
      };
    },
  },
  {
    id: "socials",
    priority: 56,
    score: (ctx) => scoreRules(ctx, RULES.socials),
    run(ctx) {
      const wanted = socialLinks.filter((s) => {
        if (s.name === "Email") return false;
        const n = s.name.toLowerCase();
        if (n === "x") return ctx.has("twitter") || ctx.anyPhrase("on x", "x account", "x handle", "his x");
        return ctx.has(n);
      });
      const list = wanted.length ? wanted : socialLinks.filter((s) => s.name !== "Email");
      const lines = list.map((s) => `- [${s.name}](${s.url})`);
      const github = list.some((s) => s.name === "GitHub");
      return {
        reply: [wanted.length === 1 ? `Here you go:` : "Aryan online:", ...lines, github ? "Live GitHub stats are on the About page." : ""]
          .filter(Boolean)
          .join("\n"),
        chips: [...list.slice(0, 3).map((s) => ext(s.name, s.url)), ...(github ? [go("About page", "/about")] : [])],
      };
    },
  },
  {
    id: "hire_job",
    priority: 63,
    score(ctx) {
      const base = scoreRules(ctx, RULES.hire_job);
      return base && ctx.has("hire") ? base + 3.5 : base;
    },
    run() {
      const now = currentExperience();
      return {
        reply: `For roles or internships, email ${EMAIL} and grab the resume. Right now Aryan is ${now.position} at ${now.company} (${now.period}). Client projects: ${AVAILABILITY.label.toLowerCase()}.`,
        chips: [CHIP.copyEmail, CHIP.resume, CHIP.experience],
      };
    },
  },
  {
    id: "location",
    priority: 55,
    score: (ctx) => scoreRules(ctx, RULES.location),
    run(ctx) {
      const intl = SERVICES_FAQ.find((f) => /international/i.test(f.q));
      const overlap = intl?.a.split(". ").find((s) => /overlap/i.test(s));
      return {
        reply: `Based in **${KURO_LOCATION.city}, ${KURO_LOCATION.country}** (${KURO_LOCATION.tzLabel}), working remotely with clients worldwide. ${overlap ? `${overlap.replace(/\.$/, "")}.` : ""} It's ${istTime(ctx.now)} there right now.`.replace(/\s+/g, " ").trim(),
        chips: [CHIP.availability, CHIP.contact],
      };
    },
  },
  {
    id: "payment",
    priority: 57,
    score: (ctx) => scoreRules(ctx, RULES.payment),
    run(ctx) {
      const ai = SERVICES_FAQ.find((f) => /payment work for AI/i.test(f.q));
      const unknown = ctx.any("upi", "paypal", "refund", "methods", "transfer");
      return {
        reply: [
          `- **Websites:** ${WEB_COMMERCIAL.paymentSmall}`,
          `- **Web apps and MVPs:** ${WEB_COMMERCIAL.paymentApp}`,
          ai ? `- **AI projects:** ${ai.a}` : "",
          unknown ? "Accepted payment methods and refunds aren't listed on the site, so ask on the inquiry form." : "",
        ].filter(Boolean).join("\n"),
        chips: [CHIP.pricing, CHIP.startProject],
      };
    },
  },
  {
    id: "process",
    priority: 57,
    score: (ctx) => scoreRules(ctx, RULES.process),
    run(ctx) {
      const ai = ctx.any(...AI_WORDS) && !ctx.any("website", "site");
      const steps = (ai ? SERVICES_PROCESS : WEB_PROCESS).map((s, i) => `${i + 1}. ${s}`);
      return {
        reply: [`How ${ai ? "an AI" : "a web"} project runs:`, ...steps].join("\n"),
        chips: [ai ? send("Web process", "How does a website project work?") : send("AI process", "How does an AI project work?"), send("Timeline", "How long does it take?"), CHIP.startProject],
      };
    },
  },
  {
    id: "timeline",
    priority: 54,
    score(ctx) {
      const base = scoreRules(ctx, RULES.timeline);
      return base && ctx.any("take", "takes", "taking", "ready", "launch") ? base + 2.5 : base;
    },
    run() {
      const web = WEB_PACKAGES.filter((p) => p.id !== "website-care").map((p) => `- **${p.name}:** ${p.timeline}`);
      const ai = SERVICES_PACKAGES.filter((p) => p.id !== "retainer").map((p) => `- **${p.name}:** ${p.timeline}`);
      return {
        reply: ["Typical timelines:", ...web, ...ai, `Review rounds included on websites: ${WEB_REVIEW_ROUNDS}.`].join("\n"),
        chips: [CHIP.pricing, CHIP.availability, CHIP.startProject],
      };
    },
  },
  {
    id: "service_landing",
    priority: 59,
    score(ctx) {
      return landingMatch(ctx)?.score || 0;
    },
    run(ctx) {
      const { landing } = landingMatch(ctx);
      const packs = (landing.relatedPackageIds || []).map(getPackage).filter(Boolean);
      const studies = (landing.relatedCaseStudySlugs || [])
        .map((slug) => projects.find((p) => caseStudyFor(p)?.slug === slug))
        .filter(Boolean)
        .slice(0, 2);
      const open = ctx.any("open", "go", "take", "visit", "show", "navigate");
      return {
        reply: [
          `**${landing.title}.** ${truncate(landing.description, 200)}`,
          packs.length ? `Packages: ${joinList(packs.map((p) => `${p.name} (${packagePrice(p, "both").split("·")[0].trim()})`))}.` : "",
        ].filter(Boolean).join("\n"),
        cards: studies.map(projectCard),
        actions: open ? [{ type: "navigate", page: "services", path: `/services/${landing.slug}`, label: landing.title }] : [],
        chips: [go("Open the page", `/services/${landing.slug}`), CHIP.pricing, CHIP.startProject],
      };
    },
  },
  {
    id: "guides",
    priority: 50,
    score: (ctx) => scoreRules(ctx, RULES.guides),
    run() {
      const lines = SERVICES_GUIDES.map((g) => `- [${g.title}](/guides/${g.slug})`);
      return { reply: ["Plain-English guides:", ...lines].join("\n"), chips: [CHIP.pricing, CHIP.startProject] };
    },
  },
  {
    id: "testimonials",
    priority: 50,
    score: (ctx) => scoreRules(ctx, RULES.testimonials),
    run() {
      const gallery = getWebGallery();
      const client = gallery[0];
      return {
        reply: TESTIMONIALS.length
          ? "Testimonials are on the Services page."
          : `No public testimonials yet, and I won't invent any. Proof lives in shipped work: live demos and case studies. Client site on the gallery: **${client.title}**.`,
        cards: [projectCard(projects.find((p) => p.id === client.projectId))],
        chips: [go("Services page", "/services"), CHIP.projects],
        meta: { projectId: client.projectId },
      };
    },
  },
  {
    id: "faq",
    priority: 10,
    score(ctx) {
      // Only question-shaped utterances: short noun phrases ("ai projects") belong to other intents.
      const questionLike =
        ctx.raw.includes("?") || ctx.tokens.length >= 4 || ctx.any("how", "what", "who", "why", "do", "does", "can", "will", "is", "are");
      if (!questionLike) return 0;
      const hit = matchFaq(ctx.tokens);
      if (!hit || hit.matched < 2) return 0;
      return Math.min(8.5, 1.5 + 9 * hit.coverage);
    },
    run(ctx) {
      const { item } = matchFaq(ctx.tokens);
      return {
        reply: `**${item.q}** ${item.a}`,
        chips: [CHIP.pricing, CHIP.startProject, go("Full FAQ", "/services")],
      };
    },
  },
];
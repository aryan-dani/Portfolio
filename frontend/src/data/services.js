/**
 * Editable hire / services copy, packages, keywords, and inquiry options.
 * Update prices and URLs here. Do not invent testimonials or metrics elsewhere.
 * Web gallery cards resolve from `projects.js` so titles, links, and images stay in one place.
 */

import { getProjectById } from "./projects.js";
import { AVAILABILITY } from "./availability.js";

/** Optional Calendly or booking URL. Inquiry form is the default path when empty. */
export const BOOKING_CALL_URL = "";
/** @deprecated Use BOOKING_CALL_URL */
export const SCOPING_CALL_URL = BOOKING_CALL_URL;

export const BOOKING_CALL_LABEL = "Book a short project briefing";

export const SERVICES_EMAIL = "daniaryan212@gmail.com";

/** Planning rate for AI package INR display. Web package INR amounts are set explicitly. */
export const USD_TO_INR = 85;

export const CURRENCY_STORAGE_KEY = "portfolio_services_currency";

export function formatInr(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function formatUsd(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

/** Convert USD to a readable INR figure (nearest 100 under 100k, nearest lakh above). */
export function aboutInrFromUsd(usd) {
  const raw = usd * USD_TO_INR;
  if (usd <= 100) return formatInr(Math.round(raw / 100) * 100);
  if (raw < 500000) return formatInr(Math.round(raw / 1000) * 1000);
  return formatInr(Math.round(raw / 100000) * 100000);
}

export function detectDefaultCurrency() {
  if (typeof window === "undefined") return "INR";
  try {
    const stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (stored === "INR" || stored === "USD") return stored;
  } catch {
    /* ignore */
  }
  const lang = (navigator.language || "").toLowerCase();
  let timeZone = "";
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    timeZone = "";
  }
  if (timeZone === "Asia/Kolkata" || lang === "en-in" || lang.startsWith("hi")) return "INR";
  return "USD";
}

export function formatWebPackagePrice(pack, currency = "INR") {
  const prefix = pack.priceKind === "from" ? "From" : "Starting at";
  const suffix = pack.priceSuffix || "";
  if (currency === "USD") return `${prefix} ${formatUsd(pack.priceUsd)}${suffix}`;
  return `${prefix} ${formatInr(pack.priceInr)}${suffix}`;
}

export function formatAiPackagePrice(pack, currency = "USD") {
  if (currency === "INR") return pack.priceLabelInr || pack.priceLabel;
  return pack.priceLabelUsd || pack.priceLabel;
}

export const SERVICES_HERO = {
  eyebrow: "Websites, web apps, and AI tools",
  headline:
    "I build fast websites for local businesses and AI tools people can trust.",
  subline:
    "Next.js, React, FastAPI, Node, PostgreSQL, and Tailwind, deployed on Vercel. Based in Pune. Open to clients across India and worldwide. AI features are optional: chatbots that answer from your own content, document search, or smart forms when they help.",
  availability: AVAILABILITY.label,
};

export const SERVICES_TABS = [
  { id: "ai", label: "AI Products" },
  { id: "web", label: "Websites and Web Apps" },
];

export const SERVICES_KEYWORDS = {
  primary: [
    "AI engineer for hire",
    "freelance AI developer India",
    "RAG developer",
    "LLM application developer",
    "Next.js FastAPI developer",
    "website developer in Pune",
    "freelance web developer India",
    "website design for restaurants",
    "small business website India",
    "affordable business website Pune",
    "Next.js developer for hire",
    "portfolio website for creators",
  ],
  secondary: [
    "human-in-the-loop AI",
    "grounded AI with source citations",
    "AI agent development",
    "LangGraph developer",
    "retrieval augmented generation consultant",
    "AI tool for newsrooms and journalism",
    "open-source AI development",
    "document intelligence",
    "AI MVP development",
    "hire AI developer Pune",
    "restaurant website with online menu",
    "website for clinics and coaches",
    "website redesign",
    "fast website for local business",
    "Google Business Profile and local SEO setup",
    "web app development India",
    "MVP development startup India",
    "Shopify alternative custom website",
  ],
};

export const SERVICES_PROOF = [
  {
    id: "prism",
    slug: "prism",
    title: "Prism",
    outcome:
      "Grounded RAG agent that answers only from retrieved passages and refuses when confidence is low.",
    stack: ["React", "FastAPI", "Ollama", "Chroma", "RAG"],
    live: null,
    github: "https://github.com/aryan-dani/Prism",
  },
  {
    id: "swiggy-nexus",
    slug: "swiggy-nexus",
    title: "Swiggy Nexus",
    outcome:
      "LangGraph agent that stages actions and blocks every write until a person approves. Independent POC, not affiliated with Swiggy.",
    stack: ["Next.js", "FastAPI", "LangGraph", "HITL", "MCP"],
    live: "https://swiggy-nexus.vercel.app/",
    github: "https://github.com/aryan-dani/Swiggy_Nexus",
  },
  {
    id: "utility",
    slug: "utility",
    title: "Utility",
    outcome: "Live document-intelligence product with ingestion, RAG, and study tools students can open today.",
    stack: ["Next.js", "Supabase", "TypeScript", "RAG"],
    live: "https://utilityos.tech",
    github: "https://github.com/aryan-dani/Utility",
  },
  {
    id: "shadow-instructor",
    slug: "shadow-instructor",
    title: "The Shadow Instructor",
    outcome: "Dual-agent mock interview platform: one agent speaks, a second agent only reviews in real time.",
    stack: ["Next.js", "FastAPI", "Gemini", "WebSockets"],
    live: "https://the-shadow-instructor.vercel.app/",
    github: "https://github.com/aryan-dani/The_Shadow_Instructor",
  },
  {
    id: "fourth-clover",
    slug: "fourth-clover",
    title: "The Fourth Clover",
    outcome: "Writing and editor product with drafts, comments, auth, and a real editing surface.",
    stack: ["Next.js", "TypeScript", "Supabase", "Tailwind"],
    live: "https://thefourthclover.netlify.app/",
    github: "https://github.com/aryan-dani/The-Fourth-Clover",
  },
];

export const SERVICES_PACKAGES = [
  {
    id: "prototype-sprint",
    name: "AI Prototype Sprint",
    priceLabelUsd: "Starting at USD 799",
    priceLabelInr: `Starting at about ${aboutInrFromUsd(799)}`,
    priceLabel: `Starting at USD 799 · about ${aboutInrFromUsd(799)}`,
    timeline: "1 to 2 weeks",
    forWho: "Founders and researchers who need a working demo before a larger build.",
    includes: [
      "Grounded RAG or agent prototype with a walkthrough demo",
      "Source-linked answers or a human approval checkpoint",
      "Basic deploy notes and a short handover",
    ],
  },
  {
    id: "grounded-mvp",
    name: "Grounded AI Assistant MVP",
    priceLabelUsd: "Starting at USD 2,000",
    priceLabelInr: `Starting at about ${aboutInrFromUsd(2000)}`,
    priceLabel: `Starting at USD 2,000 · about ${aboutInrFromUsd(2000)}`,
    timeline: "3 to 5 weeks",
    forWho: "Teams that need a production-shaped assistant over their own documents.",
    includes: [
      "React or Next.js frontend plus FastAPI backend",
      "Retrieval over client documents with source citations",
      "Refusal on low confidence, admin basics, and deployment",
    ],
  },
  {
    id: "hitl-workflow",
    name: "Human-in-the-Loop Workflow Tool",
    flagship: true,
    priceLabelUsd: "Essential USD 6,000 to 9,000 · Full USD 12,000 to 16,000",
    priceLabelInr: `Essential about ${aboutInrFromUsd(6000)} to ${aboutInrFromUsd(9000)} · Full about ${aboutInrFromUsd(12000)} to ${aboutInrFromUsd(16000)}`,
    priceLabel: `Essential USD 6,000 to 9,000 · about ${aboutInrFromUsd(6000)} to ${aboutInrFromUsd(9000)} · Full USD 12,000 to 16,000 · about ${aboutInrFromUsd(12000)} to ${aboutInrFromUsd(16000)}`,
    priceDetail: "Essential about 180 to 260 hours. Full about 340 to 460 hours. Milestone-based.",
    timeline: "Aligned to your milestone calendar",
    forWho: "Newsrooms and product teams that need source-linked suggestions, approval, export, and an audit trail.",
    includes: [
      "Source-linked AI suggestions and evidence review",
      "Editable output with approval that invalidates on edit",
      "Export, audit trail, tests, and documentation",
    ],
  },
  {
    id: "code-audit",
    name: "AI Feature or Code Audit",
    priceLabelUsd: "Starting at USD 399",
    priceLabelInr: `Starting at about ${aboutInrFromUsd(399)}`,
    priceLabel: `Starting at USD 399 · about ${aboutInrFromUsd(399)}`,
    timeline: "3 to 7 days",
    forWho: "Teams with an existing AI app that need a clear grounding and security fix plan.",
    includes: [
      "Review of grounding, approval flows, and security posture",
      "Prioritized findings with concrete next steps",
      "Optional follow-up implementation quote",
    ],
  },
  {
    id: "retainer",
    name: "Monthly Retainer",
    priceLabelUsd: "From USD 25/hour",
    priceLabelInr: `From about ${aboutInrFromUsd(25)}/hour`,
    priceLabel: `From USD 25/hour · about ${aboutInrFromUsd(25)}/hour`,
    priceDetail: "Up to 8 to 20 hours a month of maintenance, improvements, and support.",
    timeline: "Month to month",
    forWho: "Clients who want a steady partner after launch.",
    includes: [
      "Bug fixes, small features, and dependency updates",
      "Prompt and grounding improvements",
      "Priority email support during the booked hours",
    ],
  },
];

export const SERVICES_PRICE_NOTE =
  "Prices are starting ranges, not fixed quotes. Domain, hosting, model-API usage, and paid third-party services are billed at cost. A fixed quote follows a short written brief.";

export const WEB_PACKAGES = [
  {
    id: "starter-website",
    name: "Starter Website",
    priceInr: 8000,
    priceUsd: 150,
    priceKind: "starting",
    timeline: "3 to 7 days",
    forWho: "Restaurants, shops, clinics, and coaches who need a clear first site that works on phones.",
    includes: [
      "Single page or up to 3 pages, mobile-first",
      "Contact or WhatsApp button and Google Maps",
      "Basic SEO and deploy on your own domain",
    ],
  },
  {
    id: "business-website",
    name: "Business Website",
    priceInr: 15000,
    priceUsd: 299,
    priceKind: "starting",
    timeline: "1 to 2 weeks",
    forWho: "Local businesses that need menus or services, a gallery, and a proper enquiry path.",
    includes: [
      "Up to 6 pages with a custom design",
      "Menu or service listings, gallery, and enquiry form with email delivery",
      "Google Business Profile guidance, on-page SEO, schema, and analytics",
    ],
  },
  {
    id: "portfolio-creator",
    name: "Portfolio or Creator Site",
    priceInr: 10000,
    priceUsd: 199,
    priceKind: "starting",
    timeline: "1 to 2 weeks",
    forWho: "Creators, freelancers, and professionals who need a site that shows work and invites collaboration.",
    includes: [
      "Case-study pages and embeds for reels or video",
      "Collaboration packages and a contact form",
      "Mobile-first layout and basic SEO",
    ],
  },
  {
    id: "custom-web-app",
    name: "Custom Web App or MVP",
    priceInr: 35000,
    priceUsd: 699,
    priceKind: "starting",
    flagship: true,
    timeline: "3 to 6 weeks, milestone based",
    forWho: "Startups and founders who need a product, not only a brochure site.",
    includes: [
      "Next.js frontend with FastAPI or Node backend",
      "Database, authentication, and a dashboard",
      "Payments or integrations when needed, plus deployment, tests, and docs",
    ],
  },
  {
    id: "website-care",
    name: "Website Care Plan",
    priceInr: 999,
    priceUsd: 15,
    priceKind: "from",
    priceSuffix: " a month",
    timeline: "Month to month",
    forWho: "Clients who want the site kept online, updated, and lightly edited after launch.",
    includes: [
      "Hosting checks, updates, and small content changes",
      "Backups and uptime monitoring",
      "A short monthly report",
    ],
  },
];

export const WEB_ADDONS = [
  "Online ordering or booking",
  "Blog or CMS you can edit yourself",
  "Multilingual pages (Hindi or Gujarati when you supply the words)",
  "A chatbot that answers only from your own content, with source links",
  "Tally or accounting data dashboards",
];

export const WEB_EVERY_SITE = [
  "Mobile-first layout that loads fast on phones",
  "SEO basics so search engines can find your pages",
  "Accessibility basics for keyboard and contrast",
  "You own the code and the domain",
  "A handover walkthrough when we launch",
];

export const WEB_PROCESS = [
  "Short written brief to learn the business and goals",
  "Written scope and a fixed quote",
  "Design preview in a few days",
  "Build against that approved preview",
  "Review rounds included: 2 (extra rounds are change requests)",
  "Launch on your domain",
  "Handover of source code, credentials, and a short how-to",
];

export const WEB_REVIEW_ROUNDS = 2;

export const WEB_COMMERCIAL = {
  revisions:
    "Included review rounds cover copy tweaks, layout tweaks, and small content changes inside the agreed pages.",
  changeRequests:
    "New pages, new features, new integrations, or a redesign after the preview is approved count as change requests and are quoted separately.",
  paymentSmall:
    "Small sites: 50 percent to start, 50 percent on launch.",
  paymentApp:
    "Web apps and MVPs: milestone payments tied to demos.",
  handover:
    "Source code and credentials are handed over at the end. You keep the domain and the repository.",
};

export const WEB_WIX_NOTE = {
  title: "Why not Wix or Squarespace?",
  body: "Those tools are fine for a quick start. A custom build means you own the code, pages stay fast, you are not locked into one platform, and we can add features those templates cannot. If a template already solves your need, use it.",
};

/** One-line blurbs for the services web gallery. Titles, images, and URLs come from projects.js. */
export const WEB_GALLERY_SPECS = [
  {
    projectId: 20,
    line: "Client creator portfolio: editorial layout, reels, rates, and brand inquiry.",
  },
  {
    projectId: 1,
    line: "A writing product with an editor, drafts, and comments.",
  },
  {
    projectId: 13,
    line: "A live web app for documents, RAG, and study tools.",
  },
  {
    projectId: 14,
    line: "Department timetable portal with an optional AI assistant.",
  },
];

/** Resolve gallery cards from the shared projects list. */
export function getWebGallery() {
  return WEB_GALLERY_SPECS.map((spec) => {
    const project = getProjectById(spec.projectId);
    if (!project) {
      throw new Error(`WEB_GALLERY_SPECS references missing project id ${spec.projectId}`);
    }
    return {
      id: String(project.id),
      projectId: project.id,
      title: project.title,
      line: spec.line,
      image: project.image,
      tags: project.tags || [],
      live: project.links?.preview || null,
      liveAnchor: project.liveAnchor || null,
      github: project.links?.github || null,
      projectPath: `/projects?highlight=${project.id}`,
    };
  });
}

/** @deprecated Prefer getWebGallery(); kept for scripts that expect a constant. */
export const WEB_GALLERY = getWebGallery();

export const SERVICES_PROCESS = [
  "Short written brief to lock outcomes, inputs, and constraints",
  "Written estimate with hours by workstream",
  "Milestone demos every 2 to 4 weeks",
  "GitHub repository owned by the client from the first commit",
  "Tests for grounding and approval flows",
  "Handover docs and a 30-day warranty on agreed checklist items",
  "Payment in milestones tied to demos",
];

export const SERVICES_TECH_APPROACH = [
  "Original text stored and hashed so the model never rewrites sources",
  "Suggestions returned as character offsets into the supplied material",
  "Adversarial test fixtures for wrong matches and altered quotations",
  "Explicit approval that invalidates when content changes",
  "Audit records for model id, prompt version, editor, and source hash",
  "WCAG 2.2 AA target for the app and templates",
  "Permissive-license dependency policy; MIT or Apache-2.0 open-source releases",
];

export const SERVICES_AUDIENCES = [
  {
    title: "Newsrooms and media tools",
    body: "Source-linked suggestions, evidence review, and export with a person in the loop.",
  },
  {
    title: "Education and research",
    body: "Document intelligence, grounded Q and A, and tools that refuse when retrieval is weak.",
  },
  {
    title: "Document-heavy small businesses",
    body: "Assistants that cite your files instead of inventing answers.",
  },
  {
    title: "Startups needing an AI MVP",
    body: "A scoped prototype or MVP with Next.js, FastAPI, and clear handover.",
  },
];

export const SERVICES_FAQ = [
  {
    q: "How long does a typical AI project take?",
    a: "Prototype sprints are 1 to 2 weeks. Grounded assistant MVPs are usually 3 to 5 weeks. Larger human-in-the-loop workflow tools follow a milestone calendar and can span several months part time.",
  },
  {
    q: "Can you take work while you are still a student?",
    a: `Yes. ${AVAILABILITY.label}. ${AVAILABILITY.detail}. I will flag academic conflicts early.`,
  },
  {
    q: "Do you work with international clients?",
    a: "Yes. I am based in Pune, India, and work remotely with clients worldwide. Call overlap is typically morning US Central and evening India.",
  },
  {
    q: "How does payment work for AI projects?",
    a: "Milestone payments tied to demos. A typical split is an initial payment after the signed agreement, then payments at agreed demos, with the final amount on handover.",
  },
  {
    q: "Who owns the code and can it be open source?",
    a: "You or your organization own the repository from the first commit. I can release under MIT or Apache-2.0 when that is the plan, with a dependency license inventory.",
  },
  {
    q: "What happens to my data with third-party AI APIs?",
    a: "Only the passages required for a request are sent. I document that data leaves the server and prefer API plans that do not train on your text. If text must never leave your machines, that is a different architecture and quote.",
  },
  {
    q: "What is excluded from the AI package prices?",
    a: "Model-API usage, hosting, domains, email, OCR, generative images, CMS or social publishing, a second language, and formal accessibility certification unless we add them in writing. Those are billed at cost or scoped separately.",
  },
  {
    q: "How do I start?",
    a: "Send the inquiry form on this page or email daniaryan212@gmail.com. I reply with clarifying questions, then a written estimate. No chargeable work starts without a written agreement.",
  },
];

export const WEB_FAQ = [
  {
    q: "How long does a website take?",
    a: "A starter site is usually 3 to 7 days. Business and creator sites are about 1 to 2 weeks. Custom web apps are 3 to 6 weeks with milestones.",
  },
  {
    q: "How much does a website cost?",
    a: "Starter sites start at INR 8,000 or USD 150. Business sites start at INR 15,000 or USD 299. Creator sites start at INR 10,000 or USD 199. Custom web apps start at INR 35,000 or USD 699. Care plans start at INR 999 or USD 15 a month.",
  },
  {
    q: "Who owns the site and the domain?",
    a: "You do. The domain is registered in your name. Source code and credentials are handed over at launch.",
  },
  {
    q: "Do I need to provide content?",
    a: "Yes. You provide text, photos, logo, and menu or service details. I can help structure them and write short page outlines, but the facts and photos come from you.",
  },
  {
    q: "Will the site show up on Google?",
    a: "I set on-page SEO basics, schema where it helps, and analytics. Rankings still depend on your content, reviews, and competition. I do not promise a position.",
  },
  {
    q: "What about maintenance after launch?",
    a: "Small fixes in the first days after launch are included. Ongoing updates, content edits, and monitoring are covered by the Website Care Plan if you want it.",
  },
  {
    q: "Can you build pages in Hindi or Gujarati?",
    a: "Yes, when you supply the translated text. Layout and fonts will support those languages. Translation itself is not included unless we add it in writing.",
  },
  {
    q: "Can you move my existing site?",
    a: "Often yes. We map your current pages, rebuild them cleanly, and point the domain when you approve. Complex CMS migrations are quoted after a look at the old site.",
  },
];

export const SERVICES_GUIDES = [
  {
    slug: "small-business-website",
    title: "What a small business website should include",
    description:
      "A plain checklist for restaurants, shops, clinics, and coaches in India who need a clear first website.",
    sections: [
      {
        title: "Who this is for",
        body: "Local businesses that get most work from phones, WhatsApp, walk-ins, and Google Maps. You need a site that answers the basics and makes it easy to contact you.",
      },
      {
        title: "Pages that earn their keep",
        body: "Home with what you do and where you are. About or story if it builds trust. Services or menu with prices when you can share them. Contact with phone, WhatsApp, map, and hours. Add a gallery only if photos help people choose you.",
      },
      {
        title: "Must-have details",
        body: "Your real name and address, phone that works, WhatsApp link, opening hours, and a clear call to action on every page. Put the important facts above the fold on mobile.",
      },
      {
        title: "Speed and phones",
        body: "Most visitors are on phones. Compress images, keep the layout simple, and test on a mid-range Android. A slow site loses people before they call.",
      },
      {
        title: "Search and maps",
        body: "Claim your Google Business Profile, match the name and address on the site, and add basic on-page SEO. The site and the Maps listing should tell the same story.",
      },
      {
        title: "How this maps to my packages",
        body: "The Starter Website covers a first site with contact and maps. The Business Website adds menus or services, a gallery, enquiry email, and stronger SEO. AI chatbots are optional add-ons, not required.",
      },
    ],
  },
  {
    slug: "website-cost-india",
    title: "How much does a website cost in India",
    description:
      "Honest starting ranges for small business sites and custom web apps, in INR and USD, based on the packages I sell.",
    sections: [
      {
        title: "Short answer",
        body: "A simple site for a local business usually starts around INR 8,000. A fuller business site starts around INR 15,000. A creator portfolio starts around INR 10,000. A custom web app or MVP starts around INR 35,000. Monthly care starts around INR 999.",
      },
      {
        title: "What changes the price",
        body: "Number of pages, custom design, menus or catalogues, forms, booking, payments, dashboards, and how much content you already have. Domain and hosting are separate and billed at cost.",
      },
      {
        title: "Starter, business, and creator",
        body: `Starter Website: starting at ${formatInr(8000)} or ${formatUsd(150)}, about 3 to 7 days. Business Website: starting at ${formatInr(15000)} or ${formatUsd(299)}, about 1 to 2 weeks. Portfolio or Creator Site: starting at ${formatInr(10000)} or ${formatUsd(199)}, about 1 to 2 weeks.`,
      },
      {
        title: "Custom web apps",
        body: `Custom Web App or MVP: starting at ${formatInr(35000)} or ${formatUsd(699)}, about 3 to 6 weeks with milestones. That covers Next.js, a backend, database, auth, and deployment. Payments and heavy integrations are scoped separately.`,
      },
      {
        title: "Care after launch",
        body: `Website Care Plan: from ${formatInr(999)} or ${formatUsd(15)} a month for hosting checks, updates, small content changes, backups, and a short report.`,
      },
      {
        title: "How to get a fixed number",
        body: "Send a short brief through the inquiry form. You get a written scope and a fixed quote before any chargeable work starts.",
      },
    ],
  },
  {
    slug: "hire-web-developer-pune",
    title: "How to hire a freelance web developer in Pune",
    description:
      "What to prepare, realistic timelines, and starting prices when you hire a freelance Next.js developer in Pune for a business site or MVP.",
    sections: [
      {
        title: "When a freelance developer fits",
        body: "You need a custom layout, speed, or features a template cannot handle. You want to own the code and domain. You are fine sharing text, photos, and goals in a written brief instead of long workshop calls.",
      },
      {
        title: "What to send in a brief",
        body: "Business name, what you sell, target customers, pages you need, example sites you like, logo and photos if you have them, deadline, and budget range. I reply with clarifying questions, then a written scope and fixed quote.",
      },
      {
        title: "Timelines you can plan around",
        body: "Starter sites: 3 to 7 days. Business or creator sites: 1 to 2 weeks. Custom web apps: 3 to 6 weeks with milestone demos. Chargeable work starts only after you accept the written agreement.",
      },
      {
        title: "Starting prices (2026)",
        body: `Starter from ${formatInr(8000)} or ${formatUsd(150)}. Business from ${formatInr(15000)} or ${formatUsd(299)}. Creator from ${formatInr(10000)} or ${formatUsd(199)}. Web app MVP from ${formatInr(35000)} or ${formatUsd(699)}. Domain and hosting are billed at cost.`,
      },
      {
        title: "How we start",
        body: "Use the inquiry form on the Services page or email daniaryan212@gmail.com. If a calendar link is published on Services, you can book a short briefing; otherwise everything starts in writing.",
      },
    ],
  },
  {
    slug: "web-app-mvp-process",
    title: "Web app MVP process and milestone payments",
    description:
      "How a fixed-scope MVP is scoped, built, and paid for when you hire for Next.js plus a backend in India.",
    sections: [
      {
        title: "Scope before code",
        body: "We agree on users, core flows, data you already have, integrations, and what is out of scope for v1. You get hours by workstream and milestone dates before the first commit.",
      },
      {
        title: "Typical stack",
        body: "Next.js on the frontend, FastAPI or Node on the API, PostgreSQL or Supabase for data, auth when needed, deployed on Vercel or your host. AI features are optional and scoped separately.",
      },
      {
        title: "Milestone rhythm",
        body: "Demos every 2 to 4 weeks: auth and shell, core feature, polish and deploy. You pay per milestone after you review the demo, not upfront for the whole build.",
      },
      {
        title: "What starts at INR 35,000",
        body: `The Custom Web App or MVP package starts at ${formatInr(35000)} or ${formatUsd(699)} for a focused v1 with dashboard, database, and deployment. Payments, heavy integrations, or mobile apps are quoted as add-ons.`,
      },
      {
        title: "Handover",
        body: "GitHub repo in your org, environment notes, and a walkthrough at launch. A short warranty covers agreed checklist bugs after handover.",
      },
    ],
  },
  {
    slug: "rag-chatbot-business",
    title: "RAG chatbot for your business content",
    description:
      "When a grounded chatbot is worth it, what it costs to start, and how answers stay tied to your documents.",
    sections: [
      {
        title: "When RAG helps",
        body: "You have PDFs, policies, menus, or help docs and people ask the same questions repeatedly. You need answers with source links, not a generic ChatGPT skin.",
      },
      {
        title: "When to skip it",
        body: "A simple FAQ page or contact form is enough. You cannot keep source material updated. You need guaranteed legal advice or medical diagnosis from a bot.",
      },
      {
        title: "What I build",
        body: "Ingestion for your files, retrieval with citations, refusal when confidence is low, and optional human review for sensitive actions. Stack is usually React or Next.js with FastAPI and a vector store.",
      },
      {
        title: "Starting prices",
        body: `AI Prototype Sprint from USD 799 (about ${aboutInrFromUsd(799)}) for a demo. Grounded AI Assistant MVP from USD 2,000 (about ${aboutInrFromUsd(2000)}) for a production-shaped assistant. Model API usage and hosting are at cost.`,
      },
      {
        title: "Proof in this portfolio",
        body: "See the Prism and Utility case studies for grounded Q and A patterns. Start with the inquiry form and mention your documents and roles.",
      },
    ],
  },
];

/** Placeholder publication dates for guide Article schema (Phase 7). */
export const SEO_GUIDE_DATE_PUBLISHED = "2026-01-12";
export const SEO_GUIDE_DATE_MODIFIED = "2026-11-01";

export const SERVICE_LANDINGS = [
  {
    slug: "website-development-pune",
    title: "Website development in Pune",
    description:
      "Hire a freelance website developer in Pune for fast, mobile-first business sites. Starter packages from INR 8,000 with contact, maps, SEO basics, and code you own.",
    keywords: [
      "website developer Pune",
      "freelance web developer Pune",
      "business website Pune",
      "small business website India",
      "affordable business website Pune",
    ],
    relatedPackageIds: ["starter-website", "business-website", "portfolio-creator"],
    relatedCaseStudySlugs: ["siya-portfolio", "fourth-clover"],
    faq: [
      WEB_FAQ.find((item) => item.q === "How long does a website take?"),
      WEB_FAQ.find((item) => item.q === "How much does a website cost?"),
      WEB_FAQ.find((item) => item.q === "Who owns the site and the domain?"),
      WEB_FAQ.find((item) => item.q === "Will the site show up on Google?"),
      WEB_FAQ.find((item) => item.q === "Do I need to provide content?"),
    ].filter(Boolean),
    process: WEB_PROCESS,
  },
  {
    slug: "web-app-mvp-development",
    title: "Web app and MVP development",
    description:
      "Hire for a custom web app or startup MVP: Next.js, backend, database, auth, and milestone demos. Starting at INR 35,000 with clear handover.",
    keywords: [
      "web app development India",
      "MVP development startup India",
      "Next.js developer for hire",
      "custom web application developer",
      "freelance full stack developer India",
    ],
    relatedPackageIds: ["custom-web-app"],
    relatedCaseStudySlugs: ["utility", "swiggy-nexus", "fourth-clover"],
    faq: [
      WEB_FAQ.find((item) => item.q === "How long does a website take?"),
      SERVICES_FAQ.find((item) => item.q === "How does payment work for AI projects?"),
      WEB_FAQ.find((item) => item.q === "Who owns the site and the domain?"),
      SERVICES_FAQ.find((item) => item.q === "Who owns the code and can it be open source?"),
    ].filter(Boolean),
    process: SERVICES_PROCESS,
  },
  {
    slug: "website-redesign",
    title: "Website redesign and refresh",
    description:
      "Rebuild a slow or outdated site with modern Next.js, better mobile performance, and SEO basics. Migration help and fixed quotes after a short brief.",
    keywords: [
      "website redesign",
      "website redesign India",
      "migrate website to Next.js",
      "fast website for local business",
      "website refresh Pune",
    ],
    relatedPackageIds: ["business-website", "website-care"],
    relatedCaseStudySlugs: ["siya-portfolio"],
    faq: [
      WEB_FAQ.find((item) => item.q === "Can you move my existing site?"),
      WEB_FAQ.find((item) => item.q === "How much does a website cost?"),
      WEB_FAQ.find((item) => item.q === "What about maintenance after launch?"),
      WEB_FAQ.find((item) => item.q === "Will the site show up on Google?"),
    ].filter(Boolean),
    process: WEB_PROCESS,
  },
  {
    slug: "rag-chatbot-development",
    title: "RAG chatbot development",
    description:
      "Hire for a grounded RAG chatbot that answers from your documents with citations and refuses when retrieval is weak. MVP packages from USD 799.",
    keywords: [
      "RAG developer",
      "RAG chatbot development",
      "freelance AI developer India",
      "LLM application developer",
      "retrieval augmented generation consultant",
    ],
    relatedPackageIds: ["prototype-sprint", "grounded-mvp", "code-audit"],
    relatedCaseStudySlugs: ["prism", "utility"],
    faq: [
      SERVICES_FAQ.find((item) => item.q === "How long does a typical AI project take?"),
      SERVICES_FAQ.find((item) => item.q === "What happens to my data with third-party AI APIs?"),
      SERVICES_FAQ.find((item) => item.q === "What is excluded from the AI package prices?"),
      SERVICES_FAQ.find((item) => item.q === "How does payment work for AI projects?"),
    ].filter(Boolean),
    process: SERVICES_PROCESS,
  },
];

export function getGuideBySlug(slug) {
  return SERVICES_GUIDES.find((guide) => guide.slug === slug) || null;
}

export function guidePaths() {
  return SERVICES_GUIDES.map((guide) => `/guides/${guide.slug}`);
}

export function getServiceLandingBySlug(slug) {
  return SERVICE_LANDINGS.find((landing) => landing.slug === slug) || null;
}

export function serviceLandingPaths() {
  return SERVICE_LANDINGS.map((landing) => `/services/${landing.slug}`);
}

export function getPackagesByIds(ids) {
  const web = WEB_PACKAGES.filter((pack) => ids.includes(pack.id));
  const ai = SERVICES_PACKAGES.filter((pack) => ids.includes(pack.id));
  return [...web, ...ai];
}

export const INQUIRY_PROJECT_TYPES = [
  "Website",
  "Web app / MVP",
  "AI Prototype Sprint",
  "Grounded AI Assistant MVP",
  "Human-in-the-Loop Workflow Tool",
  "AI Feature or Code Audit",
  "Monthly Retainer / Care Plan",
  "Not sure yet",
  "Something else",
];

export const INQUIRY_HAS_SITE = [
  "No website yet",
  "I have a website",
  "I have a domain only",
  "Not sure",
];

export const INQUIRY_BUDGET_RANGES = [
  "Under INR 10,000 / USD 200",
  "INR 10,000 to 25,000 / USD 200 to 500",
  "INR 25,000 to 60,000 / USD 500 to 1,200",
  "INR 60,000+ / USD 1,200+",
  "Not sure yet",
];

export const INQUIRY_TIMELINES = [
  "ASAP",
  "Within 1 month",
  "1 to 3 months",
  "Planning for 2027",
  "Flexible",
];

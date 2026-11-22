/**
 * Deterministic brief content for the home brief builder.
 * Prices and timelines come from real packages in services.js.
 */

import {
  WEB_PACKAGES,
  SERVICES_PACKAGES,
  formatWebPackagePrice,
  formatAiPackagePrice,
} from "../../data/services";

function webPack(id) {
  return WEB_PACKAGES.find((p) => p.id === id);
}

function aiPack(id) {
  return SERVICES_PACKAGES.find((p) => p.id === id);
}

const STARTER = webPack("starter-website");
const BUSINESS = webPack("business-website");
const WEB_APP = webPack("custom-web-app");
const GROUNDED = aiPack("grounded-mvp");
const HITL = aiPack("hitl-workflow");
const PROTOTYPE = aiPack("prototype-sprint");

export const BRIEF_AGENTS = [
  { id: "scope", label: "Scope" },
  { id: "stack", label: "Stack" },
  { id: "timeline", label: "Timeline" },
  { id: "price", label: "Price" },
];

/** Suggested need chips mapped to real packages. */
export const BRIEF_CHIPS = [
  {
    id: "website",
    label: "Website / landing",
    projectType: "Website",
    scope:
      "Mobile-first landing or up to 3 pages with a clear offer, contact path, and basic SEO.",
    stack: "Next.js · React · Tailwind · Vercel",
    timeline: STARTER.timeline,
    priceLabel: formatWebPackagePrice(STARTER, "INR"),
    priceLabelUsd: formatWebPackagePrice(STARTER, "USD"),
    packageName: STARTER.name,
    budgetRange: "Under INR 10,000 / USD 200",
    inquiryTimeline: "Within 1 month",
    message:
      `I need a ${STARTER.name.toLowerCase()} (${STARTER.timeline}). Looking for a mobile-first site with a clear enquiry path. Starting range: ${formatWebPackagePrice(STARTER, "INR")} / ${formatWebPackagePrice(STARTER, "USD")}.`,
  },
  {
    id: "webapp",
    label: "Web app / SaaS",
    projectType: "Web app / MVP",
    scope:
      "Product MVP with auth, dashboard, and a backend — not just a brochure site.",
    stack: "Next.js · FastAPI or Node · PostgreSQL · Auth",
    timeline: WEB_APP.timeline,
    priceLabel: formatWebPackagePrice(WEB_APP, "INR"),
    priceLabelUsd: formatWebPackagePrice(WEB_APP, "USD"),
    packageName: WEB_APP.name,
    budgetRange: "INR 25,000 to 60,000 / USD 500 to 1,200",
    inquiryTimeline: "1 to 3 months",
    message:
      `I need a ${WEB_APP.name.toLowerCase()} (${WEB_APP.timeline}). Auth, database, and a usable dashboard. Starting range: ${formatWebPackagePrice(WEB_APP, "INR")} / ${formatWebPackagePrice(WEB_APP, "USD")}.`,
  },
  {
    id: "rag",
    label: "Grounded RAG / chatbot",
    projectType: "Grounded AI Assistant MVP",
    scope:
      "Assistant that answers only from your documents, with source citations and refusal on low confidence.",
    stack: "React/Next.js · FastAPI · RAG · citations",
    timeline: GROUNDED.timeline,
    priceLabel: formatAiPackagePrice(GROUNDED, "USD"),
    priceLabelUsd: formatAiPackagePrice(GROUNDED, "USD"),
    packageName: GROUNDED.name,
    budgetRange: "INR 60,000+ / USD 1,200+",
    inquiryTimeline: "1 to 3 months",
    message:
      `I need a ${GROUNDED.name} (${GROUNDED.timeline}). Grounded answers over our own documents with citations. ${formatAiPackagePrice(GROUNDED, "USD")}.`,
  },
  {
    id: "agent",
    label: "AI agent / workflow",
    projectType: "Human-in-the-Loop Workflow Tool",
    scope:
      "Agentic workflow with staged actions, human approval before writes, and an audit trail.",
    stack: "LangGraph · Next.js · FastAPI · HITL",
    timeline: HITL.timeline,
    priceLabel: formatAiPackagePrice(HITL, "USD"),
    priceLabelUsd: formatAiPackagePrice(PROTOTYPE, "USD"),
    packageName: HITL.name,
    budgetRange: "INR 60,000+ / USD 1,200+",
    inquiryTimeline: "1 to 3 months",
    message:
      `I need a ${HITL.name} (or a ${PROTOTYPE.name} first). Human approval before any write actions. ${formatAiPackagePrice(HITL, "USD")}. Prototype path: ${formatAiPackagePrice(PROTOTYPE, "USD")}, ${PROTOTYPE.timeline}.`,
  },
  {
    id: "redesign",
    label: "Redesign / conversion",
    projectType: "Website",
    scope:
      "Rebuild or redesign an existing site for clearer offers, stronger enquiry paths, and faster mobile load.",
    stack: "Next.js · Tailwind · SEO · analytics",
    timeline: BUSINESS.timeline,
    priceLabel: formatWebPackagePrice(BUSINESS, "INR"),
    priceLabelUsd: formatWebPackagePrice(BUSINESS, "USD"),
    packageName: BUSINESS.name,
    budgetRange: "INR 10,000 to 25,000 / USD 200 to 500",
    inquiryTimeline: "Within 1 month",
    message:
      `I need a redesign / conversion-focused ${BUSINESS.name.toLowerCase()} (${BUSINESS.timeline}). Clearer offer and enquiry path on mobile. Starting range: ${formatWebPackagePrice(BUSINESS, "INR")} / ${formatWebPackagePrice(BUSINESS, "USD")}.`,
  },
];

export function getBriefChip(chipId) {
  return BRIEF_CHIPS.find((c) => c.id === chipId) || null;
}

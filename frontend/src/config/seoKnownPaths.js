/**
 * Edge-safe list of public routes that must return 200 for crawlers.
 * Keep this free of schema helpers and heavy service modules so middleware can import it.
 */
import { CASE_STUDIES } from "../data/caseStudies.js";

/** Keep in sync with SERVICES_GUIDES slugs in data/services.js */
export const GUIDE_PATHS = [
  "/guides/small-business-website",
  "/guides/website-cost-india",
];

export const WORK_PATHS = CASE_STUDIES.map((study) => `/work/${study.slug}`);

export const SEO_ROUTE_ORDER = [
  "/",
  "/projects",
  "/services",
  ...WORK_PATHS,
  ...GUIDE_PATHS,
  "/experience",
  "/research",
  "/certifications",
  "/skills",
  "/about",
  "/playground",
  "/achievements",
  "/guestbook",
  "/copyright",
];

export const KNOWN_SEO_PATHS = new Set([
  ...SEO_ROUTE_ORDER,
  "/contact",
  "/404",
  "/resume.pdf",
  "/resume-latex.pdf",
  "/research-paper.pdf",
]);

/**
 * Sanity checks for the services config and contact honeypot.
 * Run: node scripts/check-services.mjs
 */
import assert from "node:assert/strict";
import { buildContactPayload } from "../api/contact.js";
import { CASE_STUDIES } from "../src/data/caseStudies.js";
import {
  SERVICES_FAQ,
  SERVICES_GUIDES,
  SERVICES_PACKAGES,
  SERVICES_PROOF,
  SCOPING_CALL_URL,
  USD_TO_INR,
  WEB_FAQ,
  WEB_PACKAGES,
  WEB_REVIEW_ROUNDS,
  formatWebPackagePrice,
  getGuideBySlug,
  getWebGallery,
} from "../src/data/services.js";
import { getProjectById } from "../src/data/projects.js";
import { SEO_CONFIG, SEO_ROUTE_ORDER } from "../src/config/seoConfig.js";

assert.equal(SERVICES_PACKAGES.length, 5, "expected five AI packages");
assert.ok(Number.isFinite(USD_TO_INR) && USD_TO_INR > 0, "USD_TO_INR must be a positive number");
assert.ok(
  SERVICES_PACKAGES.some((pack) => pack.id === "retainer" && /25/.test(pack.priceLabel)),
  "retainer must show from USD 25/hour",
);
assert.ok(
  SERVICES_PACKAGES.every((pack) => pack.id === "retainer" || !/25\/hour/i.test(pack.priceLabel)),
  "hourly rate only belongs on the retainer card",
);
assert.ok(
  SERVICES_PACKAGES.every((pack) => /₹|INR/i.test(pack.priceLabel)),
  "every AI package should show an INR amount beside USD",
);
assert.ok(SERVICES_PROOF.length >= 3 && SERVICES_PROOF.length <= 5, "proof strip should be 3 to 5 cards");
assert.ok(SERVICES_FAQ.length >= 6 && SERVICES_FAQ.length <= 8, "AI FAQ should be 6 to 8 items");

assert.equal(WEB_PACKAGES.length, 5, "expected five web packages");
assert.ok(Number.isInteger(WEB_REVIEW_ROUNDS) && WEB_REVIEW_ROUNDS >= 1, "review rounds must be set");
const webGallery = getWebGallery();
assert.equal(webGallery.length, 4, "web gallery must list exactly four live proof sites");
assert.ok(WEB_FAQ.length >= 6 && WEB_FAQ.length <= 8, "web FAQ should be 6 to 8 items");

const starter = WEB_PACKAGES.find((pack) => pack.id === "starter-website");
assert.equal(starter?.priceInr, 8000, "starter INR must be 8000");
assert.equal(starter?.priceUsd, 150, "starter USD must be 150");
assert.match(formatWebPackagePrice(starter, "INR"), /8,000|₹8,000/);
assert.match(formatWebPackagePrice(starter, "USD"), /150/);

const siya = getProjectById(20);
assert.ok(siya, "Siya portfolio project must exist");
assert.equal(siya.links?.preview, "https://siyas-portfolio-eight.vercel.app/");
assert.ok(!siya.links?.github, "Siya portfolio repo is private and should omit GitHub");
assert.ok(
  webGallery.some((site) => site.projectId === 20 && site.live === siya.links.preview),
  "web gallery must reuse the Siya project card",
);

for (const site of webGallery) {
  assert.ok(site.live, `${site.title} needs a live URL`);
  assert.ok(/^https?:\/\//.test(site.live), `${site.title} live URL must be absolute`);
  assert.ok(site.projectPath?.startsWith("/projects?highlight="), `${site.title} must link to its project card`);
  assert.equal(getProjectById(site.projectId)?.title, site.title, `${site.title} must match projects.js`);
}

assert.equal(SERVICES_GUIDES.length, 2, "expected two guides");
for (const guide of SERVICES_GUIDES) {
  assert.ok(getGuideBySlug(guide.slug), `guide lookup failed for ${guide.slug}`);
  const path = `/guides/${guide.slug}`;
  assert.ok(SEO_ROUTE_ORDER.includes(path), `${path} missing from SEO_ROUTE_ORDER`);
  assert.ok(SEO_CONFIG[path], `${path} missing from SEO_CONFIG`);
}

assert.ok(SEO_CONFIG["/services"]?.title.length <= 60, "services title must stay under 60 chars");
assert.ok(
  SEO_CONFIG["/services"]?.description.length <= 160,
  "services description must stay under 160 chars",
);

for (const project of SERVICES_PROOF) {
  assert.ok(project.github || project.live, `${project.title} needs a proof link`);
  assert.ok(project.slug, `${project.title} needs a case-study slug`);
  assert.ok(
    CASE_STUDIES.some((study) => study.slug === project.slug),
    `missing case study for ${project.slug}`,
  );
}

const prism = CASE_STUDIES.find((study) => study.slug === "prism");
assert.ok(prism?.retrospective?.trim(), "Prism case study must include a retrospective");

const valid = buildContactPayload({
  name: "Test Client",
  email: "client@example.com",
  message: "Need a grounded RAG MVP for document Q and A.",
  projectType: "Grounded AI Assistant MVP",
  budgetRange: "USD 2,000 to 5,000",
  hasExistingSite: "No website yet",
});
assert.equal(valid.safeName, "Test Client");
assert.match(valid.text, /Project type:/);
assert.match(valid.text, /Existing site or domain:/);

assert.throws(
  () =>
    buildContactPayload({
      name: "Bot",
      email: "bot@example.com",
      message: "spam",
      companyWebsite: "https://spam.example",
    }),
  (error) => error?.code === "HONEYPOT" || /Rejected/i.test(error?.message || ""),
  "filled honeypot must be rejected",
);

assert.equal(typeof SCOPING_CALL_URL, "string", "SCOPING_CALL_URL must be a string");

console.log("check-services: ok");

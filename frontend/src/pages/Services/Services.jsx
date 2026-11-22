import { memo, useEffect, useMemo, useRef, useState, lazy, Suspense } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
 FaCheck,
 FaCopy,
 FaEnvelope,
 FaExternalLinkAlt,
 FaFileDownload,
 FaGithub,
 FaPaperPlane,
} from "react-icons/fa";
import { usePageSEO } from "../../utils/seo";
import { useToast } from "../../context/ToastContext";
import { containerVariants, itemVariants } from "../../utils/motionVariants";
import ResumeActions from "../../components/ResumeModal/ResumeActions";
import { openSiteBrowser } from "../../utils/siteBrowser";
import { trackActionClick, trackInquirySubmitted } from "../../utils/funnel";
import { consumeBriefPrefill } from "../../utils/briefPrefill";
import { AVAILABILITY, PRIMARY_CTA } from "../../data/availability";

const ResumeModal = lazy(() => import("../../components/ResumeModal/ResumeModal"));
import {
 CURRENCY_STORAGE_KEY,
 BOOKING_CALL_URL,
 BOOKING_CALL_LABEL,
 SCOPING_CALL_URL,
 SERVICES_AUDIENCES,
 SERVICES_EMAIL,
 SERVICES_FAQ,
 SERVICES_GUIDES,
 SERVICES_HERO,
 SERVICES_PACKAGES,
 SERVICES_PRICE_NOTE,
 SERVICES_PROCESS,
 SERVICES_PROOF,
 SERVICES_TABS,
 SERVICES_TECH_APPROACH,
 WEB_ADDONS,
 WEB_COMMERCIAL,
 WEB_EVERY_SITE,
 WEB_FAQ,
 WEB_PACKAGES,
 WEB_PROCESS,
 WEB_REVIEW_ROUNDS,
 WEB_WIX_NOTE,
 INQUIRY_BUDGET_RANGES,
 INQUIRY_HAS_SITE,
 INQUIRY_PROJECT_TYPES,
 INQUIRY_TIMELINES,
 detectDefaultCurrency,
 formatAiPackagePrice,
 formatWebPackagePrice,
 getWebGallery,
} from "../../data/services";
import { getAssetPath } from "../../utils/paths";
import ProgressiveImage from "../../components/ProgressiveImage/ProgressiveImage";
import BrutalSelect from "../../components/BrutalSelect/BrutalSelect";

const CONTACT_ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT || "/api/contact";

const emptyForm = {
 name: "",
 email: "",
 organization: "",
 projectType: "",
 budgetRange: "",
 timeline: "",
 hasExistingSite: "",
 message: "",
 links: "",
 companyWebsite: "",
};

const FORM_KEYS = Object.keys(emptyForm);

function openMailtoFallback(payload) {
 if (typeof window === "undefined") return;
 const body = [
 `Name: ${payload.name}`,
 `Email: ${payload.email}`,
 payload.organization && `Organization: ${payload.organization}`,
 payload.projectType && `Project type: ${payload.projectType}`,
 payload.budgetRange && `Budget range: ${payload.budgetRange}`,
 payload.timeline && `Timeline: ${payload.timeline}`,
 payload.hasExistingSite && `Existing site or domain: ${payload.hasExistingSite}`,
 payload.links && `Links: ${payload.links}`,
 "",
 payload.message,
 ]
 .filter(Boolean)
 .join("\n");
 const href = `mailto:${SERVICES_EMAIL}?subject=${encodeURIComponent(
 `[Services] ${payload.projectType || "Inquiry"} from ${payload.name}`,
 )}&body=${encodeURIComponent(body.slice(0, 1800))}`;
 window.location.href = href;
}

const fieldClass =
 "border-2 border-outline p-3 md:p-4 font-body-md text-base md:text-lg focus:outline-none focus:shadow-[6px_6px_0px_0px_var(--shadow-color)] shadow-[2px_2px_0px_0px_var(--shadow-color)] transition-all duration-200 bg-surface-variant text-on-surface w-full";

const tabButtonClass = (active) =>
 `border-2 border-outline px-4 py-3 font-label-bold text-xs md:text-sm shadow-[4px_4px_0_0_var(--shadow-color)] transition-all ${
 active
 ? "bg-primary-container text-on-primary-container"
 : "bg-surface text-on-surface hover:translate-x-0.5 hover:translate-y-0.5"
 }`;

const Services = memo(function Services() {
 const faqData = useMemo(() => ({ faqItems: [...SERVICES_FAQ, ...WEB_FAQ] }), []);
 usePageSEO(faqData);
 const location = useLocation();

 const { showToast } = useToast();
 const [activeTab, setActiveTab] = useState("web");
 const [currency, setCurrency] = useState("INR");
 const [formData, setFormData] = useState(emptyForm);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [submitted, setSubmitted] = useState(false);
 const [isResumeOpen, setIsResumeOpen] = useState(false);
 const [resumeVersion, setResumeVersion] = useState("classic");
 const [showMobileCta, setShowMobileCta] = useState(false);
 const inquiryRef = useRef(null);
 const heroCtaRef = useRef(null);

 useEffect(() => {
 setCurrency(detectDefaultCurrency());
 }, []);

 useEffect(() => {
 const fromStorage = consumeBriefPrefill();
 const params = new URLSearchParams(location.search);
 const fromQuery = {
 projectType: params.get("projectType") || "",
 timeline: params.get("timeline") || "",
 budgetRange: params.get("budgetRange") || "",
 message: params.get("message") || "",
 };
 const merged = {
 ...(fromStorage && typeof fromStorage === "object" ? fromStorage : {}),
 ...Object.fromEntries(
 Object.entries(fromQuery).filter(([, value]) => Boolean(value)),
 ),
 };
 const hasAny = FORM_KEYS.some(
 (key) => key !== "companyWebsite" && typeof merged[key] === "string" && merged[key],
 );
 if (!hasAny) return;
 setFormData((prev) => {
 const next = { ...prev };
 for (const key of FORM_KEYS) {
 if (key === "companyWebsite") continue;
 if (typeof merged[key] === "string" && merged[key]) {
 next[key] = merged[key];
 }
 }
 return next;
 });
 }, [location.search]);

 useEffect(() => {
 if (location.hash !== "#inquiry") return;
 const timer = window.setTimeout(() => {
 document.getElementById("inquiry")?.scrollIntoView({ behavior: "smooth", block: "start" });
 }, 120);
 return () => window.clearTimeout(timer);
 }, [location.hash, location.pathname]);

 // Sticky mobile action: only between the hero's own button and the form.
 // Showing it while either is on screen puts two identical buttons on top
 // of each other.
 useEffect(() => {
 const hero = heroCtaRef.current;
 const inquiry = inquiryRef.current;
 if (!hero || !inquiry || typeof IntersectionObserver === "undefined") return undefined;
 const seen = { hero: true, inquiry: false };
 const update = () => setShowMobileCta(!seen.hero && !seen.inquiry);
 const heroObserver = new IntersectionObserver(([entry]) => {
 seen.hero = Boolean(entry?.isIntersecting);
 update();
 });
 const inquiryObserver = new IntersectionObserver(
 ([entry]) => {
 seen.inquiry = Boolean(entry?.isIntersecting);
 update();
 },
 { rootMargin: "0px 0px -10% 0px" },
 );
 heroObserver.observe(hero);
 inquiryObserver.observe(inquiry);
 return () => {
 heroObserver.disconnect();
 inquiryObserver.disconnect();
 };
 }, []);

 const setCurrencyPreference = (next) => {
 setCurrency(next);
 if (typeof window === "undefined") return;
 try {
 window.localStorage.setItem(CURRENCY_STORAGE_KEY, next);
 } catch {
 /* ignore */
 }
 };

 const handleChange = (e) => {
 const { name, value } = e.target;
 setFormData((prev) => ({ ...prev, [name]: value }));
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (formData.companyWebsite) return;
 if (!formData.projectType) {
 showToast("Please select a project type.", "error");
 return;
 }
 setIsSubmitting(true);

 const payload = {
 name: formData.name,
 email: formData.email,
 organization: formData.organization,
 projectType: formData.projectType,
 budgetRange: formData.budgetRange,
 timeline: formData.timeline,
 hasExistingSite: formData.hasExistingSite,
 links: formData.links,
 companyWebsite: formData.companyWebsite,
 subject: formData.projectType
 ? `Services inquiry: ${formData.projectType}`
 : "Services inquiry",
 message: formData.message,
 };

 try {
 const response = await fetch(CONTACT_ENDPOINT, {
 method: "POST",
 headers: { "Content-Type": "application/json", Accept: "application/json" },
 body: JSON.stringify(payload),
 });
 const result = await response.json().catch(() => ({}));

 if (response.ok && result.success === true) {
 setSubmitted(true);
 trackInquirySubmitted("services_form");
 showToast(result.message || "Inquiry sent. I will reply soon.", "success");
 setFormData(emptyForm);
 } else if (response.status === 503 || result.code === "EMAIL_NOT_CONFIGURED") {
 openMailtoFallback(payload);
 trackInquirySubmitted("services_mailto_fallback");
 showToast("Opening your email app so the message still goes through.", "success");
 } else {
 throw new Error(result.error || "Could not send just now. Use the email link below.");
 }
 } catch (error) {
 showToast(error.message || "Could not send just now. Use the email link below.", "error");
 } finally {
 setIsSubmitting(false);
 }
 };

 const goToInquiry = () => {
 trackActionClick(PRIMARY_CTA.label, PRIMARY_CTA.to);
 document.getElementById("inquiry")?.scrollIntoView({ behavior: "smooth", block: "start" });
 };

 const visibleFaq = activeTab === "web" ? WEB_FAQ : SERVICES_FAQ;
 const webGallery = useMemo(() => getWebGallery(), []);

 return (
 <motion.section
 className="flex flex-col gap-14 md:gap-20 w-full pb-8"
 initial={false}
 animate="visible"
 variants={containerVariants}
 >
 <motion.header
 data-build-card=""
 className="relative isolate overflow-hidden border-b-2 border-outline pb-8 mt-4 flex flex-col gap-5"
 variants={itemVariants}
 >
 <p className="font-label-bold text-xs md:text-sm tracking-[0.16em] text-secondary">
 {SERVICES_HERO.eyebrow}
 </p>
 <h1
 data-build-part="title"
 className="font-headline-xl text-3xl md:text-5xl lg:text-6xl normal-case tracking-tight leading-[1] text-on-surface max-w-4xl w-fit bg-surface border-4 border-outline p-4 md:p-6 shadow-[8px_8px_0_0_var(--shadow-color)]"
 >
 {SERVICES_HERO.headline}
 </h1>
 <p
 data-build-part="blurb"
 className="font-body-lg text-base md:text-lg text-on-surface-variant max-w-3xl leading-snug"
 >
 {SERVICES_HERO.subline}
 </p>
 <div className="flex flex-wrap gap-3">
 <a
 ref={heroCtaRef}
 href="#inquiry"
 onClick={(e) => {
 e.preventDefault();
 goToInquiry();
 }}
 className="bg-primary-container text-on-primary-container border-2 border-outline px-6 py-3 font-label-bold text-sm shadow-[8px_8px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] transition-all"
 >
 {PRIMARY_CTA.label}
 </a>
 <Link
 to="/projects"
 className="bg-surface text-on-surface border-2 border-outline px-6 py-3 font-label-bold text-sm shadow-[8px_8px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] transition-all"
 >
 View projects
 </Link>
 </div>
 <p className="font-label-bold text-sm tracking-wide text-on-surface">
 {AVAILABILITY.label}
 <span className="block font-body-md text-xs md:text-sm normal-case tracking-normal mt-1 opacity-80">
 {AVAILABILITY.detail}
 </span>
 </p>
 </motion.header>

 <motion.div
 className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-2 border-outline bg-surface p-4 shadow-[4px_4px_0_0_var(--shadow-color)]"
 variants={itemVariants}
 >
 <div className="flex flex-wrap gap-2" role="tablist" aria-label="Services line">
 {SERVICES_TABS.map((tab) => (
 <button
 key={tab.id}
 type="button"
 role="tab"
 aria-selected={activeTab === tab.id}
 className={tabButtonClass(activeTab === tab.id)}
 onClick={() => setActiveTab(tab.id)}
 >
 {tab.label}
 </button>
 ))}
 </div>
 <div className="flex items-center gap-2" role="group" aria-label="Price currency">
 <span className="font-label-bold text-xs ">Prices</span>
 {["INR", "USD"].map((code) => (
 <button
 key={code}
 type="button"
 aria-pressed={currency === code}
 className={tabButtonClass(currency === code)}
 onClick={() => setCurrencyPreference(code)}
 >
 {code}
 </button>
 ))}
 </div>
 </motion.div>

 {activeTab === "ai" ? (
 <>
 <motion.section aria-labelledby="packages-heading" className="flex flex-col gap-6" variants={itemVariants}>
 <h2 id="packages-heading" className="font-headline-md text-2xl md:text-3xl normal-case border-b border-outline pb-2 w-fit">
 AI packages
 </h2>
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
 {SERVICES_PACKAGES.map((pack) => (
 <article
 key={pack.id}
 data-build-card=""
 className={`border-2 border-outline p-5 md:p-6 shadow-[8px_8px_0px_0px_var(--shadow-color)] flex flex-col gap-4 ${
 pack.flagship
 ? "bg-primary-container text-on-primary-container lg:col-span-2"
 : "bg-surface text-on-surface"
 }`}
 >
 <div className="flex flex-wrap items-baseline justify-between gap-3">
 <h3 data-build-part="title" className="font-headline-md text-xl md:text-2xl normal-case">
 {pack.name}
 </h3>
 {pack.flagship && (
 <span className="font-label-bold text-xs border-2 border-current px-2 py-1">
 Flagship
 </span>
 )}
 </div>
 <p className="font-label-bold text-sm md:text-base tracking-wide">
 {formatAiPackagePrice(pack, currency)}
 </p>
 {pack.priceDetail && <p className="font-body-md text-sm leading-snug">{pack.priceDetail}</p>}
 <p className="font-body-md text-sm">
 <span className="font-label-bold text-xs">Timeline: </span>
 {pack.timeline}
 </p>
 <p data-build-part="blurb" className="font-body-md text-sm leading-snug">
 <span className="font-label-bold text-xs">For: </span>
 {pack.forWho}
 </p>
 <ul data-build-part="meta" className="flex flex-col gap-2">
 {pack.includes.map((item) => (
 <li key={item} className="flex gap-2 font-body-md text-sm leading-snug">
 <FaCheck className="mt-1 shrink-0 text-xs" aria-hidden />
 <span>{item}</span>
 </li>
 ))}
 </ul>
 </article>
 ))}
 </div>
 <p className="font-body-md text-sm md:text-base border-2 border-outline bg-surface p-4 shadow-[4px_4px_0_0_var(--shadow-color)] w-full">
 {SERVICES_PRICE_NOTE}
 </p>
 </motion.section>

 <motion.section aria-labelledby="proof-heading" className="flex flex-col gap-6" variants={itemVariants}>
 <h2 id="proof-heading" className="font-headline-md text-2xl md:text-3xl normal-case border-b border-outline pb-2 w-fit">
 Proof you can open
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
 {SERVICES_PROOF.map((project) => (
 <article
 key={project.id}
 data-build-card=""
 className="border-2 border-outline bg-surface p-5 shadow-[6px_6px_0px_0px_var(--shadow-color)] flex flex-col gap-4"
 >
 <div className="flex items-start justify-between gap-3">
 <h3 data-build-part="title" className="font-headline-md text-xl normal-case">
 {project.title}
 </h3>
 <Link
 to={`/work/${project.slug}`}
 className="font-label-bold text-xs underline underline-offset-4 shrink-0"
 >
 Case study
 </Link>
 </div>
 <p
 data-build-part="blurb"
 className="font-body-md text-sm md:text-base leading-snug text-on-surface"
 >
 {project.outcome}
 </p>
 <div data-build-part="meta" className="flex flex-col gap-3 mt-auto">
 <ul className="flex flex-wrap gap-2" aria-label={`${project.title} stack`}>
 {project.stack.map((tag) => (
 <li
 key={tag}
 className="border-2 border-outline px-2 py-1 font-label-bold text-[10px] bg-primary-container text-on-primary-container"
 >
 {tag}
 </li>
 ))}
 </ul>
 <div className="flex flex-wrap gap-3 pt-1">
 {project.live && (
 <a
 href={project.live}
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center gap-2 font-label-bold text-xs border-2 border-outline px-3 py-2 shadow-[3px_3px_0_0_var(--shadow-color)]"
 >
 Live <FaExternalLinkAlt className="text-[10px]" aria-hidden />
 </a>
 )}
 {project.github && (
 <a
 href={project.github}
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center gap-2 font-label-bold text-xs border-2 border-outline px-3 py-2 shadow-[3px_3px_0_0_var(--shadow-color)]"
 >
 GitHub <FaGithub aria-hidden />
 </a>
 )}
 </div>
 </div>
 </article>
 ))}
 </div>
 </motion.section>

 <motion.section aria-labelledby="process-heading" className="flex flex-col gap-5" variants={itemVariants}>
 <h2 id="process-heading" className="font-headline-md text-2xl md:text-3xl normal-case border-b border-outline pb-2 w-fit">
 How I work
 </h2>
 <ol className="grid grid-cols-1 md:grid-cols-2 gap-3 list-none">
 {SERVICES_PROCESS.map((step, index) => (
 <li
 key={step}
 className="border-2 border-outline bg-surface p-4 shadow-[4px_4px_0_0_var(--shadow-color)] flex gap-3"
 >
 <span className="font-headline-md text-xl shrink-0">{String(index + 1).padStart(2, "0")}</span>
 <span className="font-body-md text-sm md:text-base leading-snug">{step}</span>
 </li>
 ))}
 </ol>
 </motion.section>

 <motion.section aria-labelledby="tech-heading" className="flex flex-col gap-5" variants={itemVariants}>
 <h2 id="tech-heading" className="font-headline-md text-2xl md:text-3xl normal-case border-b border-outline pb-2 w-fit">
 Technical approach
 </h2>
 <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {SERVICES_TECH_APPROACH.map((item) => (
 <li
 key={item}
 className="border-2 border-outline bg-surface p-4 font-body-md text-sm md:text-base leading-snug shadow-[4px_4px_0_0_var(--shadow-color)]"
 >
 {item}
 </li>
 ))}
 </ul>
 </motion.section>

 <motion.section aria-labelledby="audience-heading" className="flex flex-col gap-5" variants={itemVariants}>
 <h2 id="audience-heading" className="font-headline-md text-2xl md:text-3xl normal-case border-b border-outline pb-2 w-fit">
 Who this is for
 </h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {SERVICES_AUDIENCES.map((audience) => (
 <article
 key={audience.title}
 className="border-2 border-outline bg-surface p-5 shadow-[4px_4px_0_0_var(--shadow-color)]"
 >
 <h3 className="font-headline-md text-lg normal-case mb-2">{audience.title}</h3>
 <p className="font-body-md text-sm leading-snug">{audience.body}</p>
 </article>
 ))}
 </div>
 </motion.section>
 </>
 ) : (
 <>
 <motion.section aria-labelledby="web-packages-heading" className="flex flex-col gap-6" variants={itemVariants}>
 <h2 id="web-packages-heading" className="font-headline-md text-2xl md:text-3xl normal-case border-b border-outline pb-2 w-fit">
 Website packages
 </h2>
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
 {WEB_PACKAGES.map((pack) => (
 <article
 key={pack.id}
 data-build-card=""
 className={`border-2 border-outline p-5 md:p-6 shadow-[8px_8px_0px_0px_var(--shadow-color)] flex flex-col gap-4 ${
 pack.id === "website-care"
 ? "bg-surface text-on-surface lg:col-span-2"
 : pack.flagship
 ? "bg-primary-container text-on-primary-container"
 : "bg-surface text-on-surface"
 }`}
 >
 <div className="flex flex-wrap items-baseline justify-between gap-3">
 <h3 data-build-part="title" className="font-headline-md text-xl md:text-2xl normal-case">
 {pack.name}
 </h3>
 {pack.flagship && (
 <span className="font-label-bold text-xs border-2 border-current px-2 py-1">
 Flagship
 </span>
 )}
 </div>
 <p className="font-label-bold text-sm md:text-base tracking-wide">
 {formatWebPackagePrice(pack, currency)}
 </p>
 <p className="font-body-md text-sm">
 <span className="font-label-bold text-xs">Timeline: </span>
 {pack.timeline}
 </p>
 <p data-build-part="blurb" className="font-body-md text-sm leading-snug">
 <span className="font-label-bold text-xs">For: </span>
 {pack.forWho}
 </p>
 <ul data-build-part="meta" className="flex flex-col gap-2">
 {pack.includes.map((item) => (
 <li key={item} className="flex gap-2 font-body-md text-sm leading-snug">
 <FaCheck className="mt-1 shrink-0 text-xs" aria-hidden />
 <span>{item}</span>
 </li>
 ))}
 </ul>
 </article>
 ))}
 </div>
 <p className="font-body-md text-sm md:text-base border-2 border-outline bg-surface p-4 shadow-[4px_4px_0_0_var(--shadow-color)] w-full">
 {SERVICES_PRICE_NOTE}
 </p>
 </motion.section>

 <motion.section aria-labelledby="every-site-heading" className="flex flex-col gap-5" variants={itemVariants}>
 <h2 id="every-site-heading" className="font-headline-md text-2xl md:text-3xl normal-case border-b border-outline pb-2 w-fit">
 What you get with every site
 </h2>
 <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {WEB_EVERY_SITE.map((item) => (
 <li
 key={item}
 className="border-2 border-outline bg-surface p-4 font-body-md text-sm md:text-base leading-snug shadow-[4px_4px_0_0_var(--shadow-color)] flex gap-2"
 >
 <FaCheck className="mt-1 shrink-0 text-xs" aria-hidden />
 <span>{item}</span>
 </li>
 ))}
 </ul>
 </motion.section>

 <motion.section aria-labelledby="web-process-heading" className="flex flex-col gap-5" variants={itemVariants}>
 <h2 id="web-process-heading" className="font-headline-md text-2xl md:text-3xl normal-case border-b border-outline pb-2 w-fit">
 How a website project works
 </h2>
 <ol className="grid grid-cols-1 md:grid-cols-2 gap-3 list-none">
 {WEB_PROCESS.map((step, index) => (
 <li
 key={step}
 className="border-2 border-outline bg-surface p-4 shadow-[4px_4px_0_0_var(--shadow-color)] flex gap-3"
 >
 <span className="font-headline-md text-xl shrink-0">{String(index + 1).padStart(2, "0")}</span>
 <span className="font-body-md text-sm md:text-base leading-snug">{step}</span>
 </li>
 ))}
 </ol>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <article className="border-2 border-outline bg-surface p-5 shadow-[4px_4px_0_0_var(--shadow-color)] flex flex-col gap-2">
 <h3 className="font-headline-md text-lg normal-case">Revisions vs change requests</h3>
 <p className="font-body-md text-sm leading-snug">{WEB_COMMERCIAL.revisions}</p>
 <p className="font-body-md text-sm leading-snug">{WEB_COMMERCIAL.changeRequests}</p>
 <p className="font-label-bold text-xs pt-1">
 Included review rounds: {WEB_REVIEW_ROUNDS}
 </p>
 </article>
 <article className="border-2 border-outline bg-surface p-5 shadow-[4px_4px_0_0_var(--shadow-color)] flex flex-col gap-2">
 <h3 className="font-headline-md text-lg normal-case">Payment and handover</h3>
 <p className="font-body-md text-sm leading-snug">{WEB_COMMERCIAL.paymentSmall}</p>
 <p className="font-body-md text-sm leading-snug">{WEB_COMMERCIAL.paymentApp}</p>
 <p className="font-body-md text-sm leading-snug">{WEB_COMMERCIAL.handover}</p>
 </article>
 </div>
 </motion.section>

 <motion.section aria-labelledby="wix-heading" className="flex flex-col gap-4" variants={itemVariants}>
 <h2 id="wix-heading" className="font-headline-md text-2xl md:text-3xl normal-case border-b border-outline pb-2 w-fit">
 {WEB_WIX_NOTE.title}
 </h2>
 <p className="font-body-md text-sm md:text-base border-2 border-outline bg-surface p-4 shadow-[4px_4px_0_0_var(--shadow-color)] w-full leading-snug">
 {WEB_WIX_NOTE.body}
 </p>
 </motion.section>

 <motion.section aria-labelledby="addons-heading" className="flex flex-col gap-5" variants={itemVariants}>
 <h2 id="addons-heading" className="font-headline-md text-2xl md:text-3xl normal-case border-b border-outline pb-2 w-fit">
 Optional add-ons
 </h2>
 <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {WEB_ADDONS.map((item) => (
 <li
 key={item}
 className="border-2 border-outline bg-surface p-4 font-body-md text-sm md:text-base leading-snug shadow-[4px_4px_0_0_var(--shadow-color)]"
 >
 {item}
 </li>
 ))}
 </ul>
 </motion.section>

 <motion.section aria-labelledby="web-gallery-heading" className="flex flex-col gap-6" variants={itemVariants}>
 <h2 id="web-gallery-heading" className="font-headline-md text-2xl md:text-3xl normal-case border-b border-outline pb-2 w-fit">
 Live sites you can open
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 {webGallery.map((site) => (
 <article
 key={site.id}
 data-build-card=""
 className="border-2 border-outline bg-surface shadow-[6px_6px_0px_0px_var(--shadow-color)] flex flex-col overflow-hidden"
 >
 {site.image && (
 <div data-build-part="media" className="h-40 border-b-4 border-outline overflow-hidden">
 <ProgressiveImage
 src={getAssetPath(site.image)}
 alt={`${site.title} preview`}
 width="640"
 height="360"
 sizes="(min-width: 768px) 50vw, 100vw"
 className="h-full w-full"
 imgClassName="w-full h-full object-cover"
 />
 </div>
 )}
 <div className="p-5 flex flex-col gap-4 grow">
 <div className="flex items-start justify-between gap-3">
 <h3 data-build-part="title" className="font-headline-md text-xl normal-case">
 {site.title}
 </h3>
 <Link
 to={site.projectPath}
 className="font-label-bold text-xs underline underline-offset-4 shrink-0"
 >
 Project card
 </Link>
 </div>
 <p data-build-part="blurb" className="font-body-md text-sm md:text-base leading-snug">
 {site.line}
 </p>
 <div data-build-part="meta" className="flex flex-wrap gap-3 mt-auto">
 {site.live && (
 <a
 href={site.live}
 target="_blank"
 rel="noopener noreferrer"
 onClick={(event) => {
 if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
 event.preventDefault();
 openSiteBrowser({ url: site.live, title: site.title });
 }}
 className="inline-flex items-center gap-2 font-label-bold text-xs border-2 border-outline px-3 py-2 shadow-[3px_3px_0_0_var(--shadow-color)] hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
 >
 {site.liveAnchor ? <span className="truncate max-w-[220px]">{site.liveAnchor}</span> : "Live"} <FaExternalLinkAlt className="text-[10px] shrink-0" aria-hidden />
 </a>
 )}
 {site.github && (
 <a
 href={site.github}
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center gap-2 font-label-bold text-xs border-2 border-outline px-3 py-2 shadow-[3px_3px_0_0_var(--shadow-color)]"
 >
 GitHub <FaGithub aria-hidden />
 </a>
 )}
 </div>
 </div>
 </article>
 ))}
 </div>
 </motion.section>

 <motion.section aria-labelledby="guides-heading" className="flex flex-col gap-4" variants={itemVariants}>
 <h2 id="guides-heading" className="font-headline-md text-2xl md:text-3xl normal-case border-b border-outline pb-2 w-fit">
 Short guides
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {SERVICES_GUIDES.map((guide) => (
 <Link
 key={guide.slug}
 to={`/guides/${guide.slug}`}
 className="border-2 border-outline bg-surface p-5 shadow-[4px_4px_0_0_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_0_var(--shadow-color)] transition-all flex flex-col gap-2"
 >
 <h3 className="font-headline-md text-lg normal-case">{guide.title}</h3>
 <p className="font-body-md text-sm leading-snug">{guide.description}</p>
 </Link>
 ))}
 </div>
 </motion.section>
 </>
 )}

 <motion.section aria-labelledby="faq-heading" className="flex flex-col gap-5" variants={itemVariants}>
 <h2 id="faq-heading" className="font-headline-md text-2xl md:text-3xl normal-case border-b border-outline pb-2 w-fit">
 FAQ
 </h2>
 <div className="flex flex-col gap-3">
 {visibleFaq.map((item) => (
 <div
 key={item.q}
 className="border-2 border-outline bg-surface shadow-[4px_4px_0_0_var(--shadow-color)] p-4 flex flex-col gap-3"
 >
 <h3 className="font-label-bold text-sm md:text-base">{item.q}</h3>
 <p className="font-body-md text-sm md:text-base leading-snug border-t-4 border-outline pt-3">
 {item.a}
 </p>
 </div>
 ))}
 </div>
 </motion.section>

 <motion.section
 id="inquiry"
 ref={inquiryRef}
 aria-labelledby="inquiry-heading"
 className="flex flex-col gap-6 scroll-mt-24"
 variants={itemVariants}
 >
 <h2 id="inquiry-heading" className="font-headline-md text-2xl md:text-3xl normal-case border-b border-outline pb-2 w-fit">
 {PRIMARY_CTA.label}
 </h2>
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {submitted ? (
 <div className="lg:col-span-2 border-2 border-outline bg-surface p-5 md:p-6 shadow-[6px_6px_0_0_var(--shadow-color)] flex flex-col gap-4">
 <p className="font-headline-md text-xl normal-case flex items-center gap-3">
 <FaCheck aria-hidden /> Inquiry sent
 </p>
 <p className="font-body-md text-sm md:text-base leading-snug">
 I reply within 24 hours with next steps and a clear scope outline.
 </p>
 <p className="font-body-md text-sm md:text-base leading-snug opacity-80">
 {AVAILABILITY.detail}
 </p>
 {(BOOKING_CALL_URL || SCOPING_CALL_URL) ? (
 <a
 href={BOOKING_CALL_URL || SCOPING_CALL_URL}
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center justify-center gap-2 border-2 border-outline bg-primary-container text-on-primary-container px-5 py-3 font-label-bold text-sm shadow-[4px_4px_0_0_var(--shadow-color)] w-fit"
 >
 {BOOKING_CALL_LABEL}
 <FaExternalLinkAlt className="text-xs" aria-hidden />
 </a>
 ) : null}
 </div>
 ) : (
 <form
 onSubmit={handleSubmit}
 className="lg:col-span-2 border-2 border-outline bg-surface p-5 md:p-6 shadow-[6px_6px_0_0_var(--shadow-color)] flex flex-col gap-4 relative"
 noValidate
 >
 <div
 className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden"
 aria-hidden="true"
 >
 <label htmlFor="companyWebsite">Company website</label>
 <input
 id="companyWebsite"
 name="companyWebsite"
 type="text"
 tabIndex={-1}
 autoComplete="off"
 value={formData.companyWebsite}
 onChange={handleChange}
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="flex flex-col gap-2">
 <label htmlFor="services-name" className="font-label-bold text-sm">
 Name *
 </label>
 <input
 id="services-name"
 name="name"
 required
 value={formData.name}
 onChange={handleChange}
 className={fieldClass}
 />
 </div>
 <div className="flex flex-col gap-2">
 <label htmlFor="services-email" className="font-label-bold text-sm">
 Email *
 </label>
 <input
 id="services-email"
 name="email"
 type="email"
 required
 value={formData.email}
 onChange={handleChange}
 className={fieldClass}
 />
 </div>
 </div>

 <BrutalSelect
 id="services-type"
 name="projectType"
 label="Project type *"
 value={formData.projectType}
 options={INQUIRY_PROJECT_TYPES}
 onChange={handleChange}
 />

 <div className="flex flex-col gap-2">
 <label htmlFor="services-message" className="font-label-bold text-sm">
 Project description * (about 3 sentences)
 </label>
 <textarea
 id="services-message"
 name="message"
 required
 rows={5}
 value={formData.message}
 onChange={handleChange}
 className={`${fieldClass} resize-y min-h-[8rem]`}
 />
 </div>

 <details className="border-2 border-outline bg-surface-variant/40 open:bg-surface">
 <summary className="cursor-pointer font-label-bold text-sm p-4 select-none">
 More detail (optional)
 </summary>
 <div className="flex flex-col gap-4 p-4 pt-0 border-t-4 border-outline">
 <div className="flex flex-col gap-2">
 <label htmlFor="services-org" className="font-label-bold text-sm">
 Organization
 </label>
 <input
 id="services-org"
 name="organization"
 value={formData.organization}
 onChange={handleChange}
 className={fieldClass}
 />
 </div>
 <BrutalSelect
 id="services-has-site"
 name="hasExistingSite"
 label="Do you already have a website or domain?"
 value={formData.hasExistingSite}
 options={INQUIRY_HAS_SITE}
 onChange={handleChange}
 />
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <BrutalSelect
 id="services-budget"
 name="budgetRange"
 label="Budget range"
 value={formData.budgetRange}
 options={INQUIRY_BUDGET_RANGES}
 onChange={handleChange}
 />
 <BrutalSelect
 id="services-timeline"
 name="timeline"
 label="Timeline"
 value={formData.timeline}
 options={INQUIRY_TIMELINES}
 onChange={handleChange}
 />
 </div>
 <div className="flex flex-col gap-2">
 <label htmlFor="services-links" className="font-label-bold text-sm">
 Links
 </label>
 <input
 id="services-links"
 name="links"
 value={formData.links}
 onChange={handleChange}
 placeholder="Docs, Figma, repo, brief, current site"
 className={fieldClass}
 />
 </div>
 </div>
 </details>

 <button
 type="submit"
 disabled={isSubmitting}
 className="w-full border-2 border-outline px-6 py-4 font-headline-md text-xl normal-case flex items-center justify-center gap-3 bg-primary-container text-on-primary-container shadow-[6px_6px_0px_0px_var(--shadow-color)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0px_0px_var(--shadow-color)] transition-all disabled:opacity-70"
 >
 {isSubmitting ? (
 "Sending..."
 ) : (
 <>
 <FaPaperPlane aria-hidden /> Send inquiry
 </>
 )}
 </button>
 </form>
 )}

 <aside className="flex flex-col gap-4">
 <div className="border-2 border-outline bg-primary-container text-on-primary-container p-5 shadow-[6px_6px_0_0_var(--shadow-color)] flex flex-col gap-4">
 <div className="flex items-center gap-2.5 border-b-2 border-current/30 pb-3">
 <FaEnvelope className="text-xl text-current shrink-0" aria-hidden />
 <h3 className="font-headline-md text-xl normal-case tracking-wide">Direct email</h3>
 </div>
 <p className="font-body-md text-sm leading-relaxed opacity-90">
 Have a quick question or urgent project? I typically respond within 24 hours.
 </p>
 <div className="flex items-center justify-between gap-2 p-3 border-2 border-current/40 bg-current/5">
 <a
 href={`mailto:${SERVICES_EMAIL}`}
 className="font-body-md text-sm font-semibold truncate hover:underline underline-offset-4 text-current"
 title={SERVICES_EMAIL}
 >
 {SERVICES_EMAIL}
 </a>
 <button
 type="button"
 onClick={async () => {
 try {
 await navigator.clipboard.writeText(SERVICES_EMAIL);
 showToast?.("Email copied to clipboard!", "success");
 } catch {
 if (typeof window !== "undefined") {
 window.location.href = `mailto:${SERVICES_EMAIL}`;
 }
 }
 }}
 className="px-2.5 py-1 text-[11px] font-label-bold border border-current/40 bg-current/10 hover:bg-current hover:text-on-background transition-colors cursor-none shrink-0 flex items-center gap-1.5"
 >
 <FaCopy aria-hidden className="text-[10px]" />
 <span>Copy</span>
 </button>
 </div>
 {(BOOKING_CALL_URL || SCOPING_CALL_URL) ? (
 <a
 href={BOOKING_CALL_URL || SCOPING_CALL_URL}
 target="_blank"
 rel="noopener noreferrer"
 className="border-2 border-outline bg-surface text-on-surface px-4 py-3 font-label-bold text-xs text-center shadow-[3px_3px_0_0_var(--shadow-color)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2 cursor-none"
 >
 <span>{BOOKING_CALL_LABEL}</span>
 <FaExternalLinkAlt className="text-xs" aria-hidden />
 </a>
 ) : (
 <a
 href={`mailto:${SERVICES_EMAIL}`}
 className="border-2 border-outline bg-surface text-on-surface px-4 py-3 font-label-bold text-xs text-center shadow-[3px_3px_0_0_var(--shadow-color)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2 cursor-none"
 >
 <FaPaperPlane className="text-xs" aria-hidden />
 <span>Open in your email app</span>
 </a>
 )}
 </div>
 <div
 className="border-2 border-outline p-5 flex flex-col gap-4 shadow-[6px_6px_0_0_var(--shadow-color)]"
 style={{ background: "var(--color-on-background)", color: "var(--color-background)" }}
 >
 <div className="flex items-center gap-3 border-b-2 border-current/30 pb-3">
 <FaFileDownload className="text-2xl text-current shrink-0" aria-hidden />
 <div>
 <div className="font-headline-md text-lg normal-case tracking-wide">My Resume</div>
 <div className="font-body-md text-xs opacity-75">Classic PDF + LaTeX PDF</div>
 </div>
 </div>
 <ResumeActions
 onView={(id) => {
 setResumeVersion(id);
 setIsResumeOpen(true);
 }}
 />
 </div>
 </aside>
 </div>
 </motion.section>

 {showMobileCta && (
 <div
 className="lg:hidden fixed inset-x-0 z-40 px-3 pointer-events-none"
 style={{
 bottom: "max(5rem, calc(env(safe-area-inset-bottom, 0px) + 4.5rem))",
 }}
 >
 <a
 href="#inquiry"
 onClick={(e) => {
 e.preventDefault();
 goToInquiry();
 }}
 className="pointer-events-auto mx-auto max-w-lg flex items-center justify-center border-2 border-outline bg-primary-container text-on-primary-container px-5 py-3 font-label-bold text-sm shadow-[6px_6px_0_0_var(--shadow-color)]"
 >
 {PRIMARY_CTA.label}
 </a>
 </div>
 )}

 {isResumeOpen && (
 <Suspense fallback={null}>
 <ResumeModal
 isOpen={isResumeOpen}
 initialVersion={resumeVersion}
 onClose={() => setIsResumeOpen(false)}
 />
 </Suspense>
 )}

 </motion.section>
 );
});

export default Services;

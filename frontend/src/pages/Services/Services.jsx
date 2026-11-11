import { memo, useEffect, useMemo, useRef, useState, lazy, Suspense } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheck,
  FaChevronDown,
  FaEnvelope,
  FaEye,
  FaExternalLinkAlt,
  FaFileDownload,
  FaGithub,
  FaPaperPlane,
} from "react-icons/fa";
import { usePageSEO } from "../../utils/seo";
import { useToast } from "../../context/ToastContext";
import { containerVariants, itemVariants } from "../../utils/motionVariants";
import CardBuildSwarm from "../../components/CardBuildSwarm/CardBuildSwarm";
import { aboutInfo } from "../../data/experience";

const ResumeModal = lazy(() => import("../../components/ResumeModal/ResumeModal"));
import {
  CURRENCY_STORAGE_KEY,
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

function openMailtoFallback(payload) {
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
  "border-4 border-outline p-3 md:p-4 font-body-md text-base md:text-lg focus:outline-none focus:shadow-[6px_6px_0px_0px_var(--shadow-color)] shadow-[2px_2px_0px_0px_var(--shadow-color)] transition-all duration-200 bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] w-full";

const tabButtonClass = (active) =>
  `border-4 border-outline px-4 py-3 font-label-bold text-xs md:text-sm uppercase shadow-[4px_4px_0_0_var(--shadow-color)] transition-all ${
    active
      ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]"
      : "bg-[var(--color-surface)] text-[var(--color-on-surface)] hover:translate-x-0.5 hover:translate-y-0.5"
  }`;

const Services = memo(function Services() {
  const faqData = useMemo(() => ({ faqItems: [...SERVICES_FAQ, ...WEB_FAQ] }), []);
  usePageSEO(faqData);
  const scopeRef = useRef(null);
  const location = useLocation();

  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("ai");
  const [currency, setCurrency] = useState("INR");
  const [formData, setFormData] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [isResumeOpen, setIsResumeOpen] = useState(false);

  useEffect(() => {
    setCurrency(detectDefaultCurrency());
  }, []);

  useEffect(() => {
    if (location.hash !== "#inquiry") return;
    const timer = window.setTimeout(() => {
      document.getElementById("inquiry")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [location.hash, location.pathname]);

  const setCurrencyPreference = (next) => {
    setCurrency(next);
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
        showToast("Inquiry sent. I will reply soon.", "success");
        setFormData(emptyForm);
      } else if (response.status === 503 || result.code === "EMAIL_NOT_CONFIGURED") {
        openMailtoFallback(payload);
        showToast("Opening your email app so the message still goes through.", "success");
      } else {
        throw new Error(result.error || "Could not send just now. Use the email link below.");
      }
    } catch (error) {
      showToast(error.message || "Could not send just now. Use the email link below.", "error");
    } finally {
      setIsSubmitting(false);
      window.setTimeout(() => setSubmitted(false), 4000);
    }
  };

  const scopingHref = SCOPING_CALL_URL || "#inquiry";
  const visibleFaq = activeTab === "web" ? WEB_FAQ : SERVICES_FAQ;
  const webGallery = useMemo(() => getWebGallery(), []);

  return (
    <motion.section
      ref={scopeRef}
      className="flex flex-col gap-14 md:gap-20 w-full pb-8"
      initial={false}
      animate="visible"
      variants={containerVariants}
    >
      <motion.header
        data-build-card=""
        className="relative isolate overflow-hidden border-b-8 border-outline pb-8 mt-4 bg-hatch p-4 md:p-6 shadow-[4px_4px_0px_0px_var(--shadow-color)] flex flex-col gap-6"
        variants={itemVariants}
      >
        <p className="font-label-bold text-xs md:text-sm uppercase tracking-[0.16em] text-[var(--color-secondary)]">
          {SERVICES_HERO.eyebrow}
        </p>
        <h1
          data-build-part="title"
          className="font-headline-xl text-3xl md:text-5xl lg:text-6xl uppercase tracking-tighter leading-tight text-[var(--color-on-surface)] max-w-4xl bg-[var(--color-surface)] border-4 border-outline p-4 md:p-5 shadow-[8px_8px_0px_0px_var(--shadow-color)]"
        >
          {SERVICES_HERO.headline}
        </h1>
        <p
          data-build-part="blurb"
          className="font-body-lg text-base md:text-lg text-[var(--color-on-surface)] max-w-3xl bg-[var(--color-surface)] border-4 border-outline p-4 shadow-[4px_4px_0px_0px_var(--shadow-color)] leading-snug"
        >
          {SERVICES_HERO.subline}
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="#inquiry"
            className="bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-4 border-outline px-6 py-3 font-label-bold text-sm uppercase shadow-[8px_8px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] transition-all"
          >
            Request a quote
          </a>
          <Link
            to="/projects"
            className="bg-[var(--color-surface)] text-[var(--color-on-surface)] border-4 border-outline px-6 py-3 font-label-bold text-sm uppercase shadow-[8px_8px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] transition-all"
          >
            View projects
          </Link>
        </div>
        <p className="font-label-bold text-sm uppercase tracking-wide text-[var(--color-on-surface)]">
          {SERVICES_HERO.availability}
        </p>
      </motion.header>

      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-4 border-outline bg-[var(--color-surface)] p-4 shadow-[4px_4px_0_0_var(--shadow-color)]"
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
              onClick={() => {
                setActiveTab(tab.id);
                setExpandedFaq(null);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2" role="group" aria-label="Price currency">
          <span className="font-label-bold text-xs uppercase">Prices</span>
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
          <motion.section aria-labelledby="proof-heading" className="flex flex-col gap-6" variants={itemVariants}>
            <h2 id="proof-heading" className="font-headline-md text-2xl md:text-3xl uppercase border-b-4 border-outline pb-2 w-fit">
              Proof you can open
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {SERVICES_PROOF.map((project) => (
                <article
                  key={project.id}
                  data-build-card=""
                  className="border-4 border-outline bg-[var(--color-surface)] p-5 shadow-[6px_6px_0px_0px_var(--shadow-color)] flex flex-col gap-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 data-build-part="title" className="font-headline-md text-xl uppercase">
                      {project.title}
                    </h3>
                    <Link
                      to={`/work/${project.slug}`}
                      className="font-label-bold text-xs uppercase underline underline-offset-4 shrink-0"
                    >
                      Case study
                    </Link>
                  </div>
                  <p
                    data-build-part="blurb"
                    className="font-body-md text-sm md:text-base leading-snug text-[var(--color-on-surface)]"
                  >
                    {project.outcome}
                  </p>
                  <div data-build-part="meta" className="flex flex-col gap-3 mt-auto">
                    <ul className="flex flex-wrap gap-2" aria-label={`${project.title} stack`}>
                      {project.stack.map((tag) => (
                        <li
                          key={tag}
                          className="border-2 border-outline px-2 py-1 font-label-bold text-[10px] uppercase bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]"
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
                          className="inline-flex items-center gap-2 font-label-bold text-xs uppercase border-2 border-outline px-3 py-2 shadow-[3px_3px_0_0_var(--shadow-color)]"
                        >
                          Live <FaExternalLinkAlt className="text-[10px]" aria-hidden />
                        </a>
                      )}
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 font-label-bold text-xs uppercase border-2 border-outline px-3 py-2 shadow-[3px_3px_0_0_var(--shadow-color)]"
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

          <motion.section aria-labelledby="packages-heading" className="flex flex-col gap-6" variants={itemVariants}>
            <h2 id="packages-heading" className="font-headline-md text-2xl md:text-3xl uppercase border-b-4 border-outline pb-2 w-fit">
              AI packages
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {SERVICES_PACKAGES.map((pack) => (
                <article
                  key={pack.id}
                  data-build-card=""
                  className={`border-4 border-outline p-5 md:p-6 shadow-[8px_8px_0px_0px_var(--shadow-color)] flex flex-col gap-4 ${
                    pack.flagship
                      ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] lg:col-span-2"
                      : "bg-[var(--color-surface)] text-[var(--color-on-surface)]"
                  }`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h3 data-build-part="title" className="font-headline-md text-xl md:text-2xl uppercase">
                      {pack.name}
                    </h3>
                    {pack.flagship && (
                      <span className="font-label-bold text-xs uppercase border-2 border-current px-2 py-1">
                        Flagship
                      </span>
                    )}
                  </div>
                  <p className="font-label-bold text-sm md:text-base uppercase tracking-wide">
                    {formatAiPackagePrice(pack, currency)}
                  </p>
                  {pack.priceDetail && <p className="font-body-md text-sm leading-snug">{pack.priceDetail}</p>}
                  <p className="font-body-md text-sm">
                    <span className="font-label-bold uppercase text-xs">Timeline: </span>
                    {pack.timeline}
                  </p>
                  <p data-build-part="blurb" className="font-body-md text-sm leading-snug">
                    <span className="font-label-bold uppercase text-xs">For: </span>
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
            <p className="font-body-md text-sm md:text-base border-4 border-outline bg-[var(--color-surface)] p-4 shadow-[4px_4px_0_0_var(--shadow-color)] max-w-4xl">
              {SERVICES_PRICE_NOTE}
            </p>
          </motion.section>

          <motion.section aria-labelledby="process-heading" className="flex flex-col gap-5" variants={itemVariants}>
            <h2 id="process-heading" className="font-headline-md text-2xl md:text-3xl uppercase border-b-4 border-outline pb-2 w-fit">
              How I work
            </h2>
            <ol className="grid grid-cols-1 md:grid-cols-2 gap-3 list-none">
              {SERVICES_PROCESS.map((step, index) => (
                <li
                  key={step}
                  className="border-4 border-outline bg-[var(--color-surface)] p-4 shadow-[4px_4px_0_0_var(--shadow-color)] flex gap-3"
                >
                  <span className="font-headline-md text-xl shrink-0">{String(index + 1).padStart(2, "0")}</span>
                  <span className="font-body-md text-sm md:text-base leading-snug">{step}</span>
                </li>
              ))}
            </ol>
          </motion.section>

          <motion.section aria-labelledby="tech-heading" className="flex flex-col gap-5" variants={itemVariants}>
            <h2 id="tech-heading" className="font-headline-md text-2xl md:text-3xl uppercase border-b-4 border-outline pb-2 w-fit">
              Technical approach
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SERVICES_TECH_APPROACH.map((item) => (
                <li
                  key={item}
                  className="border-4 border-outline bg-[var(--color-surface)] p-4 font-body-md text-sm md:text-base leading-snug shadow-[4px_4px_0_0_var(--shadow-color)]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </motion.section>

          <motion.section aria-labelledby="audience-heading" className="flex flex-col gap-5" variants={itemVariants}>
            <h2 id="audience-heading" className="font-headline-md text-2xl md:text-3xl uppercase border-b-4 border-outline pb-2 w-fit">
              Who this is for
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SERVICES_AUDIENCES.map((audience) => (
                <article
                  key={audience.title}
                  className="border-4 border-outline bg-[var(--color-surface)] p-5 shadow-[4px_4px_0_0_var(--shadow-color)]"
                >
                  <h3 className="font-headline-md text-lg uppercase mb-2">{audience.title}</h3>
                  <p className="font-body-md text-sm leading-snug">{audience.body}</p>
                </article>
              ))}
            </div>
          </motion.section>
        </>
      ) : (
        <>
          <motion.section aria-labelledby="web-packages-heading" className="flex flex-col gap-6" variants={itemVariants}>
            <h2 id="web-packages-heading" className="font-headline-md text-2xl md:text-3xl uppercase border-b-4 border-outline pb-2 w-fit">
              Website packages
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {WEB_PACKAGES.map((pack) => (
                <article
                  key={pack.id}
                  data-build-card=""
                  className={`border-4 border-outline p-5 md:p-6 shadow-[8px_8px_0px_0px_var(--shadow-color)] flex flex-col gap-4 ${
                    pack.flagship
                      ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] lg:col-span-2"
                      : "bg-[var(--color-surface)] text-[var(--color-on-surface)]"
                  }`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h3 data-build-part="title" className="font-headline-md text-xl md:text-2xl uppercase">
                      {pack.name}
                    </h3>
                    {pack.flagship && (
                      <span className="font-label-bold text-xs uppercase border-2 border-current px-2 py-1">
                        Flagship
                      </span>
                    )}
                  </div>
                  <p className="font-label-bold text-sm md:text-base uppercase tracking-wide">
                    {formatWebPackagePrice(pack, currency)}
                  </p>
                  <p className="font-body-md text-sm">
                    <span className="font-label-bold uppercase text-xs">Timeline: </span>
                    {pack.timeline}
                  </p>
                  <p data-build-part="blurb" className="font-body-md text-sm leading-snug">
                    <span className="font-label-bold uppercase text-xs">For: </span>
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
            <p className="font-body-md text-sm md:text-base border-4 border-outline bg-[var(--color-surface)] p-4 shadow-[4px_4px_0_0_var(--shadow-color)] max-w-4xl">
              {SERVICES_PRICE_NOTE}
            </p>
          </motion.section>

          <motion.section aria-labelledby="every-site-heading" className="flex flex-col gap-5" variants={itemVariants}>
            <h2 id="every-site-heading" className="font-headline-md text-2xl md:text-3xl uppercase border-b-4 border-outline pb-2 w-fit">
              What you get with every site
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {WEB_EVERY_SITE.map((item) => (
                <li
                  key={item}
                  className="border-4 border-outline bg-[var(--color-surface)] p-4 font-body-md text-sm md:text-base leading-snug shadow-[4px_4px_0_0_var(--shadow-color)] flex gap-2"
                >
                  <FaCheck className="mt-1 shrink-0 text-xs" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.section>

          <motion.section aria-labelledby="web-process-heading" className="flex flex-col gap-5" variants={itemVariants}>
            <h2 id="web-process-heading" className="font-headline-md text-2xl md:text-3xl uppercase border-b-4 border-outline pb-2 w-fit">
              How a website project works
            </h2>
            <ol className="grid grid-cols-1 md:grid-cols-2 gap-3 list-none">
              {WEB_PROCESS.map((step, index) => (
                <li
                  key={step}
                  className="border-4 border-outline bg-[var(--color-surface)] p-4 shadow-[4px_4px_0_0_var(--shadow-color)] flex gap-3"
                >
                  <span className="font-headline-md text-xl shrink-0">{String(index + 1).padStart(2, "0")}</span>
                  <span className="font-body-md text-sm md:text-base leading-snug">{step}</span>
                </li>
              ))}
            </ol>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <article className="border-4 border-outline bg-[var(--color-surface)] p-5 shadow-[4px_4px_0_0_var(--shadow-color)] flex flex-col gap-2">
                <h3 className="font-headline-md text-lg uppercase">Revisions vs change requests</h3>
                <p className="font-body-md text-sm leading-snug">{WEB_COMMERCIAL.revisions}</p>
                <p className="font-body-md text-sm leading-snug">{WEB_COMMERCIAL.changeRequests}</p>
                <p className="font-label-bold text-xs uppercase pt-1">
                  Included review rounds: {WEB_REVIEW_ROUNDS}
                </p>
              </article>
              <article className="border-4 border-outline bg-[var(--color-surface)] p-5 shadow-[4px_4px_0_0_var(--shadow-color)] flex flex-col gap-2">
                <h3 className="font-headline-md text-lg uppercase">Payment and handover</h3>
                <p className="font-body-md text-sm leading-snug">{WEB_COMMERCIAL.paymentSmall}</p>
                <p className="font-body-md text-sm leading-snug">{WEB_COMMERCIAL.paymentApp}</p>
                <p className="font-body-md text-sm leading-snug">{WEB_COMMERCIAL.handover}</p>
              </article>
            </div>
          </motion.section>

          <motion.section aria-labelledby="wix-heading" className="flex flex-col gap-4" variants={itemVariants}>
            <h2 id="wix-heading" className="font-headline-md text-2xl md:text-3xl uppercase border-b-4 border-outline pb-2 w-fit">
              {WEB_WIX_NOTE.title}
            </h2>
            <p className="font-body-md text-sm md:text-base border-4 border-outline bg-[var(--color-surface)] p-4 shadow-[4px_4px_0_0_var(--shadow-color)] max-w-4xl leading-snug">
              {WEB_WIX_NOTE.body}
            </p>
          </motion.section>

          <motion.section aria-labelledby="addons-heading" className="flex flex-col gap-5" variants={itemVariants}>
            <h2 id="addons-heading" className="font-headline-md text-2xl md:text-3xl uppercase border-b-4 border-outline pb-2 w-fit">
              Optional add-ons
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {WEB_ADDONS.map((item) => (
                <li
                  key={item}
                  className="border-4 border-outline bg-[var(--color-surface)] p-4 font-body-md text-sm md:text-base leading-snug shadow-[4px_4px_0_0_var(--shadow-color)]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </motion.section>

          <motion.section aria-labelledby="web-gallery-heading" className="flex flex-col gap-6" variants={itemVariants}>
            <h2 id="web-gallery-heading" className="font-headline-md text-2xl md:text-3xl uppercase border-b-4 border-outline pb-2 w-fit">
              Live sites you can open
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {webGallery.map((site) => (
                <article
                  key={site.id}
                  data-build-card=""
                  className="border-4 border-outline bg-[var(--color-surface)] shadow-[6px_6px_0px_0px_var(--shadow-color)] flex flex-col overflow-hidden"
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
                      <h3 data-build-part="title" className="font-headline-md text-xl uppercase">
                        {site.title}
                      </h3>
                      <Link
                        to={site.projectPath}
                        className="font-label-bold text-xs uppercase underline underline-offset-4 shrink-0"
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
                          className="inline-flex items-center gap-2 font-label-bold text-xs uppercase border-2 border-outline px-3 py-2 shadow-[3px_3px_0_0_var(--shadow-color)]"
                        >
                          Live <FaExternalLinkAlt className="text-[10px]" aria-hidden />
                        </a>
                      )}
                      {site.github && (
                        <a
                          href={site.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 font-label-bold text-xs uppercase border-2 border-outline px-3 py-2 shadow-[3px_3px_0_0_var(--shadow-color)]"
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
            <h2 id="guides-heading" className="font-headline-md text-2xl md:text-3xl uppercase border-b-4 border-outline pb-2 w-fit">
              Short guides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SERVICES_GUIDES.map((guide) => (
                <Link
                  key={guide.slug}
                  to={`/guides/${guide.slug}`}
                  className="border-4 border-outline bg-[var(--color-surface)] p-5 shadow-[4px_4px_0_0_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_0_var(--shadow-color)] transition-all flex flex-col gap-2"
                >
                  <h3 className="font-headline-md text-lg uppercase">{guide.title}</h3>
                  <p className="font-body-md text-sm leading-snug">{guide.description}</p>
                </Link>
              ))}
            </div>
          </motion.section>
        </>
      )}

      <motion.section aria-labelledby="faq-heading" className="flex flex-col gap-5" variants={itemVariants}>
        <h2 id="faq-heading" className="font-headline-md text-2xl md:text-3xl uppercase border-b-4 border-outline pb-2 w-fit">
          FAQ
        </h2>
        <div className="flex flex-col gap-3">
          {visibleFaq.map((item, index) => {
            const open = expandedFaq === index;
            return (
              <div key={item.q} className="border-4 border-outline bg-[var(--color-surface)] shadow-[4px_4px_0_0_var(--shadow-color)]">
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-4 p-4 text-left font-label-bold uppercase text-sm md:text-base"
                  aria-expanded={open}
                  onClick={() => setExpandedFaq(open ? null : index)}
                >
                  <span>{item.q}</span>
                  <FaChevronDown className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 font-body-md text-sm md:text-base leading-snug border-t-4 border-outline pt-3">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </motion.section>

      <motion.section
        id="inquiry"
        aria-labelledby="inquiry-heading"
        className="flex flex-col gap-6 scroll-mt-24"
        variants={itemVariants}
      >
        <h2 id="inquiry-heading" className="font-headline-md text-2xl md:text-3xl uppercase border-b-4 border-outline pb-2 w-fit">
          Request a quote
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-2 border-4 border-outline bg-[var(--color-surface)] p-5 md:p-6 shadow-[8px_8px_0_0_var(--shadow-color)] flex flex-col gap-4 relative"
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
                <label htmlFor="services-name" className="font-label-bold uppercase text-sm">
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
                <label htmlFor="services-email" className="font-label-bold uppercase text-sm">
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

            <div className="flex flex-col gap-2">
              <label htmlFor="services-org" className="font-label-bold uppercase text-sm">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BrutalSelect
                id="services-type"
                name="projectType"
                label="Project type"
                value={formData.projectType}
                options={INQUIRY_PROJECT_TYPES}
                onChange={handleChange}
              />
              <BrutalSelect
                id="services-has-site"
                name="hasExistingSite"
                label="Do you already have a website or domain?"
                value={formData.hasExistingSite}
                options={INQUIRY_HAS_SITE}
                onChange={handleChange}
              />
            </div>

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
              <label htmlFor="services-message" className="font-label-bold uppercase text-sm">
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

            <div className="flex flex-col gap-2">
              <label htmlFor="services-links" className="font-label-bold uppercase text-sm">
                Optional links
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full border-4 border-outline px-6 py-4 font-headline-md text-xl uppercase flex items-center justify-center gap-3 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] shadow-[6px_6px_0px_0px_var(--shadow-color)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0px_0px_var(--shadow-color)] transition-all disabled:opacity-70"
            >
              {isSubmitting ? (
                "Sending..."
              ) : submitted ? (
                <>
                  <FaCheck aria-hidden /> Sent
                </>
              ) : (
                <>
                  <FaPaperPlane aria-hidden /> Send inquiry
                </>
              )}
            </button>
          </form>

          <aside className="flex flex-col gap-4">
            <div className="border-4 border-outline bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] p-5 shadow-[6px_6px_0_0_var(--shadow-color)] flex flex-col gap-4">
              <h3 className="font-headline-md text-xl uppercase">Direct email</h3>
              <p className="font-body-md text-sm leading-snug">
                I usually reply within 24 hours.
              </p>
              <a
                href={`mailto:${SERVICES_EMAIL}`}
                className="inline-flex items-center gap-2 font-body-md text-sm break-all underline underline-offset-4"
              >
                <FaEnvelope aria-hidden />
                {SERVICES_EMAIL}
              </a>
              <a
                href={scopingHref}
                {...(SCOPING_CALL_URL
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="border-4 border-outline bg-[var(--color-surface)] text-[var(--color-on-surface)] px-4 py-3 font-label-bold text-xs uppercase text-center shadow-[4px_4px_0_0_var(--shadow-color)]"
              >
                Book a 20 minute scoping call
              </a>
              {!SCOPING_CALL_URL && (
                <p className="font-body-md text-xs leading-snug opacity-90">
                  Booking link not set yet. The button jumps to the form on this page.
                </p>
              )}
            </div>
            <div
              className="border-4 border-outline p-5 flex flex-col gap-4 shadow-[4px_4px_0px_0px_var(--shadow-accent)]"
              style={{ background: "var(--color-on-background)", color: "var(--color-background)" }}
            >
              <div className="flex items-center gap-3 border-b-4 border-current pb-3">
                <FaFileDownload className="text-2xl text-current" aria-hidden />
                <div>
                  <div className="font-headline-md text-lg uppercase">My Resume</div>
                  <div className="font-body-md text-sm opacity-60">PDF • Latest Version</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsResumeOpen(true)}
                  className="bg-transparent text-[var(--color-background)] border-4 border-current px-3 py-3 font-label-bold text-sm uppercase flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_var(--color-background)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all cursor-none"
                >
                  <FaEye className="text-lg text-current" aria-hidden />
                  <span>View</span>
                </button>
                <a
                  href={getAssetPath(aboutInfo.resumeUrl)}
                  download="Aryan_Dani_Resume.pdf"
                  className="bg-transparent text-[var(--color-background)] border-4 border-current px-3 py-3 font-label-bold text-sm uppercase flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_var(--color-background)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all w-full cursor-none"
                >
                  <FaFileDownload className="text-lg text-current" aria-hidden />
                  <span>Download</span>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </motion.section>

      {isResumeOpen && (
        <Suspense fallback={null}>
          <ResumeModal isOpen={isResumeOpen} onClose={() => setIsResumeOpen(false)} />
        </Suspense>
      )}

      <CardBuildSwarm storageKey="services" scopeRef={scopeRef} enabled />
    </motion.section>
  );
});

export default Services;

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaEnvelope, FaLinkedin, FaGithub, FaInstagram, FaTwitter,
  FaFileDownload, FaPaperPlane, FaChevronDown, FaCheck, FaCopy,
} from "react-icons/fa";
import { aboutInfo, socialLinks } from "../../data/experience";
import { useToast } from "../../context/ToastContext";
import { getAssetPath } from "../../utils/paths";
import { containerVariants, itemVariants } from "../../utils/motionVariants";
import { socialIconMap } from "../../utils/socialIcons";

const SUBJECT_OPTIONS = [
  "Freelance Project", "Collaboration", "Job Opportunity",
  "Open Source", "Just Saying Hi 👋",
];

const FAQ_ITEMS = [
  {
    q: "What's your primary tech stack?",
    a: "React / Next.js for frontend, FastAPI / Node.js for backend, and Google Gemini / LangGraph for AI agents. I'm comfortable with TypeScript, Python, Supabase, Docker, and Vercel.",
  },
  {
    q: "Do you freelance?",
    a: "Yes! I'm open to freelance projects, especially full-stack web apps and AI-powered tools. Let's discuss your idea — I'd love to hear about it.",
  },
  {
    q: "What's your typical response time?",
    a: "I usually respond within 24 hours. For urgent projects, mention it in the subject and I'll prioritize.",
  },
  {
    q: "Can you work with a team?",
    a: "Absolutely. I've collaborated with cross-functional teams at Artem HealthTech and in hackathons like NASA Space Apps and RIFT 2026.",
  },
];

// ── Confetti burst on submit ──────────────────────────────────

function ConfettiBurst({ active }) {
  const colors = ["#F0FF00", "#00E5FF", "#FF5F56", "#27C93F", "#FFBD2E"];
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 confetti-particle"
          style={{
            background: colors[i % colors.length],
            left: `${50 + (Math.random() - 0.5) * 100}%`,
            top: "50%",
          }}
          initial={{ y: 0, x: 0, opacity: 1, scale: 1 }}
          animate={{
            y: -(Math.random() * 120 + 40),
            x: (Math.random() - 0.5) * 160,
            opacity: 0,
            scale: [1, 1.5, 0],
            rotate: Math.random() * 360,
          }}
          transition={{ duration: 0.8 + Math.random() * 0.4, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { showToast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const subject = encodeURIComponent(`[Portfolio] ${formData.subject || "Contact"} from ${formData.name}`);
    const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\nSubject: ${formData.subject}\n\nMessage:\n${formData.message}`);
    await new Promise((r) => setTimeout(r, 500));
    window.location.href = `mailto:${aboutInfo.email}?subject=${subject}&body=${body}`;
    setIsSubmitting(false);
    setSubmitted(true);
    setShowConfetti(true);
    showToast("Opening email client...", "info");
    setTimeout(() => { setSubmitted(false); setShowConfetti(false); }, 3500);
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(aboutInfo.email);
    setEmailCopied(true);
    showToast("Email copied to clipboard!", "success");
    setTimeout(() => setEmailCopied(false), 2000);
  };

  return (
    <motion.section
      className="flex flex-col gap-16 md:gap-20 w-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Hero */}
      <header className="mb-4 border-b-8 border-[var(--color-outline)] pb-8 mt-4">
        <motion.div variants={itemVariants} className="mb-6">
          <h1 className="font-headline-xl text-5xl md:text-7xl lg:text-headline-xl text-[var(--color-on-background)] uppercase tracking-tighter">
            LET&apos;S BUILD
            <br />
            <span
              className="border-4 border-[var(--color-outline)] px-4 inline-block shadow-[4px_4px_0px_0px_var(--shadow-color)]"
              style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}
            >
              SOMETHING EPIC
            </span>
          </h1>
        </motion.div>
        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
          <p className="font-body-lg text-base md:text-lg lg:text-body-lg text-[var(--color-on-surface)] max-w-2xl bg-[var(--color-surface)] border-4 border-[var(--color-outline)] p-4 shadow-[4px_4px_0px_0px_var(--shadow-color)]">
            Got a project idea? Want to collaborate? Or just want to geek out
            about tech and anime? I&apos;m all ears. Drop me a message.
          </p>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
        {/* Contact Form */}
        <motion.div className="lg:col-span-3 flex flex-col gap-8" variants={itemVariants}>
          <div
            className="border-4 border-[var(--color-outline)] p-6 md:p-8 shadow-[8px_8px_0px_0px_var(--shadow-color)]"
            style={{ background: "var(--color-surface)" }}
          >
            <h2 className="font-headline-md text-3xl uppercase mb-6 border-b-4 border-[var(--color-outline)] pb-4 flex items-center gap-3 text-[var(--color-on-surface)]">
              <FaPaperPlane className="text-2xl" />
              Send a Message
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { id: "contact-name",  name: "name",  type: "text",  label: "Your Name *",  placeholder: "John Doe",         required: true },
                  { id: "contact-email", name: "email", type: "email", label: "Your Email *", placeholder: "john@example.com", required: true },
                ].map((field) => (
                  <div key={field.id} className="flex flex-col gap-2">
                    <label htmlFor={field.id} className="font-label-bold uppercase text-sm text-[var(--color-on-surface)]">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      id={field.id}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="border-4 border-[var(--color-outline)] p-4 font-body-md text-lg focus:outline-none shadow-[2px_2px_0px_0px_var(--shadow-color)] form-input-glow transition-all cursor-none"
                      style={{ background: "var(--color-surface-variant)", color: "var(--color-on-surface)" }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="contact-subject" className="font-label-bold uppercase text-sm text-[var(--color-on-surface)]">
                  What&apos;s this about?
                </label>
                <div className="relative">
                  <select
                    id="contact-subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full border-4 border-[var(--color-outline)] p-4 font-body-md text-lg focus:outline-none shadow-[2px_2px_0px_0px_var(--shadow-color)] appearance-none pr-12 cursor-none"
                    style={{ background: "var(--color-surface-variant)", color: "var(--color-on-surface)" }}
                  >
                    <option value="">Select a topic...</option>
                    {SUBJECT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-on-surface)]" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="contact-message" className="font-label-bold uppercase text-sm text-[var(--color-on-surface)]">
                  Message *
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell me about your project, idea, or just say hi..."
                  rows="6"
                  required
                  className="border-4 border-[var(--color-outline)] p-4 font-body-md text-lg focus:outline-none shadow-[2px_2px_0px_0px_var(--shadow-color)] resize-none form-input-glow transition-all cursor-none"
                  style={{ background: "var(--color-surface-variant)", color: "var(--color-on-surface)" }}
                />
              </div>

              <div className="relative">
                <ConfettiBurst active={showConfetti} />
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full border-4 border-[var(--color-outline)] px-6 py-4 font-headline-md text-2xl uppercase flex items-center justify-center gap-3 shadow-[6px_6px_0px_0px_var(--shadow-color)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0px_0px_var(--shadow-color)] transition-all disabled:opacity-70 cursor-none relative overflow-hidden"
                  style={{
                    background: submitted ? "#22C55E" : "var(--color-primary-container)",
                    color: submitted ? "#fff" : "var(--color-on-primary-container)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <motion.div
                      className="w-6 h-6 border-3 border-current border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : submitted ? (
                    <><FaCheck className="text-xl" /><span>Sent!</span></>
                  ) : (
                    <><FaPaperPlane className="text-xl" /><span>Send Message</span></>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div className="lg:col-span-2 flex flex-col gap-8" variants={containerVariants}>
          {/* Quick Connect */}
          <motion.div
            className="border-4 border-[var(--color-outline)] p-6 shadow-[8px_8px_0px_0px_var(--shadow-color)]"
            style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}
            variants={itemVariants}
          >
            <h3 className="font-headline-md text-2xl uppercase mb-4 border-b-4 border-[var(--color-outline)] pb-3">
              Quick Connect
            </h3>
            <button
              onClick={copyEmail}
              className="w-full border-4 border-[var(--color-outline)] p-4 mb-4 flex items-center gap-3 shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-left cursor-none"
              style={{ background: "var(--color-surface)", color: "var(--color-on-surface)" }}
            >
              <FaEnvelope className="text-xl shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-label-bold text-xs uppercase text-[var(--color-secondary)]">Email</div>
                <div className="font-body-md text-sm truncate">{aboutInfo.email}</div>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={emailCopied ? "check" : "copy"}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {emailCopied
                    ? <FaCheck className="text-green-600 shrink-0" />
                    : <FaCopy className="opacity-50 shrink-0" />}
                </motion.div>
              </AnimatePresence>
            </button>

            <div className="grid grid-cols-2 gap-3">
              {socialLinks.map((link) => {
                const Icon = socialIconMap[link.name];
                if (!Icon) return null;
                return (
                  <motion.a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-4 border-[var(--color-outline)] p-3 flex items-center gap-2 font-label-bold text-sm uppercase shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-none"
                    style={{ background: "var(--color-surface)", color: "var(--color-on-surface)" }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Icon className="text-lg" />{link.name}
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Resume */}
          <motion.a
            href={getAssetPath(aboutInfo.resumeUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="border-4 border-[var(--color-outline)] p-6 flex items-center gap-4 shadow-[4px_4px_0px_0px_var(--shadow-accent)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-none"
            style={{ background: "var(--color-on-background)", color: "var(--color-background)" }}
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
          >
            <FaFileDownload className="text-3xl" style={{ color: "var(--color-primary-container)" }} />
            <div>
              <div className="font-headline-md text-xl uppercase">Download Resume</div>
              <div className="font-body-md text-sm opacity-60">PDF • Latest Version</div>
            </div>
          </motion.a>

          {/* FAQ */}
          <motion.div
            className="border-4 border-[var(--color-outline)] p-6 shadow-[8px_8px_0px_0px_var(--shadow-color)]"
            style={{ background: "var(--color-surface)" }}
            variants={itemVariants}
          >
            <h3 className="font-headline-md text-2xl uppercase mb-4 border-b-4 border-[var(--color-outline)] pb-3 text-[var(--color-on-surface)]">
              FAQ
            </h3>
            <div className="flex flex-col gap-3">
              {FAQ_ITEMS.map((faq, i) => (
                <div key={i} className="border-2 border-[var(--color-outline)]">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    className={`w-full text-left p-4 font-label-bold text-sm uppercase flex items-center justify-between transition-colors cursor-none ${
                      expandedFaq === i
                        ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]"
                        : "bg-[var(--color-surface)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-variant)]"
                    }`}
                  >
                    {faq.q}
                    <motion.div
                      animate={{ rotate: expandedFaq === i ? 180 : 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    >
                      <FaChevronDown className="shrink-0 ml-2" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {expandedFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 320, damping: 30 }}
                        className="overflow-hidden"
                      >
                        <div
                          className="p-4 font-body-md text-sm border-t-2 border-[var(--color-outline)] text-[var(--color-on-surface-variant)]"
                          style={{ background: "var(--color-surface-variant)" }}
                        >
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default memo(Contact);

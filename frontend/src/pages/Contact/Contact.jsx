import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaEnvelope,
  FaLinkedin,
  FaGithub,
  FaInstagram,
  FaTwitter,
  FaFileDownload,
  FaPaperPlane,
  FaChevronDown,
  FaCheck,
  FaCopy,
  FaCalendarAlt,
} from "react-icons/fa";
import { aboutInfo, socialLinks } from "../../data/experience";
import { useToast } from "../../context/ToastContext";
import { getAssetPath } from "../../utils/paths";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const socialIconMap = {
  LinkedIn: FaLinkedin,
  GitHub: FaGithub,
  Email: FaEnvelope,
  Instagram: FaInstagram,
  Twitter: FaTwitter,
};

const SUBJECT_OPTIONS = [
  "Freelance Project",
  "Collaboration",
  "Job Opportunity",
  "Open Source",
  "Just Saying Hi 👋",
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

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const { showToast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Fallback to mailto
    const subject = encodeURIComponent(
      `[Portfolio] ${formData.subject || "Contact"} from ${formData.name}`
    );
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nSubject: ${formData.subject}\n\nMessage:\n${formData.message}`
    );
    
    // Small delay for UX feel
    await new Promise((r) => setTimeout(r, 500));
    
    window.location.href = `mailto:${aboutInfo.email}?subject=${subject}&body=${body}`;
    setIsSubmitting(false);
    setSubmitted(true);
    showToast("Opening email client...", "info");
    
    setTimeout(() => setSubmitted(false), 3000);
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(aboutInfo.email);
    setEmailCopied(true);
    showToast("Email copied to clipboard!", "success");
    setTimeout(() => setEmailCopied(false), 2000);
  };

  return (
    <motion.section
      className="flex flex-col gap-16 md:gap-section-gap w-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* ── Hero ── */}
      <header className="mb-4 border-b-8 border-black pb-8 mt-4">
        <motion.div variants={itemVariants} className="mb-6">
          <h1 className="font-headline-xl text-5xl md:text-7xl lg:text-headline-xl text-black uppercase tracking-tighter">
            LET'S BUILD
            <br />
            <span className="bg-primary-container border-4 border-black px-4 inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              SOMETHING EPIC
            </span>
          </h1>
        </motion.div>
        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
          <p className="font-body-lg text-base md:text-lg lg:text-body-lg text-black max-w-2xl bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            Got a project idea? Want to collaborate? Or just want to geek out
            about tech and anime? I'm all ears. Drop me a message.
          </p>
          <div className="bg-black text-primary-container border-4 border-black px-4 py-2 font-label-bold text-sm uppercase shadow-[4px_4px_0px_0px_rgba(240,255,0,1)] flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Open to Opportunities
          </div>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
        {/* ── Contact Form (takes 3 cols) ── */}
        <motion.div className="lg:col-span-3 flex flex-col gap-8" variants={itemVariants}>
          <div className="bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="font-headline-md text-3xl uppercase mb-6 border-b-4 border-black pb-4 flex items-center gap-3">
              <FaPaperPlane className="text-2xl" />
              Send a Message
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="contact-name" className="font-label-bold uppercase text-sm">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="border-4 border-black p-4 font-body-md text-lg focus:outline-none focus:shadow-[inset_0_0_0_2px_#f0ff00] transition-shadow shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="contact-email" className="font-label-bold uppercase text-sm">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                    className="border-4 border-black p-4 font-body-md text-lg focus:outline-none focus:shadow-[inset_0_0_0_2px_#f0ff00] transition-shadow shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="contact-subject" className="font-label-bold uppercase text-sm">
                  What's this about?
                </label>
                <div className="relative">
                  <select
                    id="contact-subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full border-4 border-black p-4 font-body-md text-lg focus:outline-none focus:shadow-[inset_0_0_0_2px_#f0ff00] transition-shadow shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] appearance-none bg-white pr-12"
                  >
                    <option value="">Select a topic...</option>
                    {SUBJECT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-black pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="contact-message" className="font-label-bold uppercase text-sm">
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
                  className="border-4 border-black p-4 font-body-md text-lg focus:outline-none focus:shadow-[inset_0_0_0_2px_#f0ff00] transition-shadow shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] resize-none"
                />
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                className={`${
                  submitted
                    ? "bg-green-400"
                    : "bg-primary-container"
                } text-black border-4 border-black px-6 py-4 font-headline-md text-2xl uppercase flex items-center justify-center gap-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-70`}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? (
                  <motion.div
                    className="w-6 h-6 border-3 border-black border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                ) : submitted ? (
                  <>
                    <FaCheck className="text-xl" />
                    <span>Sent!</span>
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="text-xl" />
                    <span>Send Message</span>
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* ── Sidebar (takes 2 cols) ── */}
        <motion.div className="lg:col-span-2 flex flex-col gap-8" variants={containerVariants}>
          {/* Quick Connect */}
          <motion.div
            className="bg-primary-container border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            variants={itemVariants}
          >
            <h3 className="font-headline-md text-2xl uppercase mb-4 border-b-4 border-black pb-3">
              Quick Connect
            </h3>

            {/* Email */}
            <button
              onClick={copyEmail}
              className="w-full bg-white border-4 border-black p-4 mb-4 flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-left"
            >
              <FaEnvelope className="text-xl shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-label-bold text-xs uppercase text-secondary">Email</div>
                <div className="font-body-md text-sm truncate">{aboutInfo.email}</div>
              </div>
              {emailCopied ? (
                <FaCheck className="text-green-600 shrink-0" />
              ) : (
                <FaCopy className="text-black/50 shrink-0" />
              )}
            </button>

            {/* Social Links */}
            <div className="grid grid-cols-2 gap-3">
              {socialLinks.map((link) => {
                const Icon = socialIconMap[link.name];
                if (!Icon) return null;
                return (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-black border-4 border-black p-3 flex items-center gap-2 font-label-bold text-sm uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:bg-black hover:text-primary-container transition-all"
                  >
                    <Icon className="text-lg" />
                    {link.name}
                  </a>
                );
              })}
            </div>
          </motion.div>

          {/* Resume Download */}
          <motion.a
            href={getAssetPath(aboutInfo.resumeUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black text-white border-4 border-black p-6 flex items-center gap-4 shadow-[4px_4px_0px_0px_rgba(240,255,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            variants={itemVariants}
          >
            <FaFileDownload className="text-3xl text-primary-container" />
            <div>
              <div className="font-headline-md text-xl uppercase">Download Resume</div>
              <div className="font-body-md text-sm text-white/60">PDF • Latest Version</div>
            </div>
          </motion.a>

          {/* FAQ */}
          <motion.div
            className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            variants={itemVariants}
          >
            <h3 className="font-headline-md text-2xl uppercase mb-4 border-b-4 border-black pb-3">
              FAQ
            </h3>
            <div className="flex flex-col gap-3">
              {FAQ_ITEMS.map((faq, i) => (
                <div key={i} className="border-2 border-black">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    className={`w-full text-left p-4 font-label-bold text-sm uppercase flex items-center justify-between transition-colors ${
                      expandedFaq === i ? "bg-primary-container" : "bg-white hover:bg-surface-variant"
                    }`}
                  >
                    {faq.q}
                    <FaChevronDown
                      className={`shrink-0 ml-2 transition-transform ${
                        expandedFaq === i ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {expandedFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 font-body-md text-sm border-t-2 border-black bg-surface-variant">
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

export default Contact;

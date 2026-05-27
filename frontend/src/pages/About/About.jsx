import { useState, useRef, memo } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  FaEnvelope, FaLinkedin, FaGithub, FaInstagram, FaTwitter,
  FaFileDownload, FaArrowRight,
} from "react-icons/fa";
import { aboutInfo, socialLinks } from "../../data/experience";
import { useToast } from "../../context/ToastContext";
import { getAssetPath } from "../../utils/paths";
import GitHubStats from "../../components/GitHubStats/GitHubStats";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, staggerChildren: 0.12, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 22 } },
};

const iconMap = {
  LinkedIn: FaLinkedin, GitHub: FaGithub, Email: FaEnvelope,
  Instagram: FaInstagram, Twitter: FaTwitter,
};

function About() {
  const { showToast } = useToast();
  const photoRef = useRef(null);


  const copyEmail = () => {
    navigator.clipboard.writeText(aboutInfo.email);
    showToast("Email copied to clipboard!", "success");
  };

  return (
    <motion.section
      className="flex flex-col gap-16 md:gap-20 w-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <header className="mb-8 border-b-8 border-[var(--color-outline)] pb-8 flex flex-col justify-end items-start gap-8 mt-4 relative">
        <motion.div
          className="bg-[var(--color-primary-container)] border-4 border-[var(--color-outline)] px-6 py-4 shadow-[8px_8px_0px_0px_var(--shadow-color)] relative overflow-hidden"
          variants={itemVariants}
          whileHover={{ x: -3, y: -3, boxShadow: "14px 14px 0px 0px var(--shadow-color)" }}
        >
          <h1 className="font-headline-xl text-5xl md:text-7xl lg:text-headline-xl text-[var(--color-on-primary-container)] uppercase tracking-tighter">
            ABOUT ME
          </h1>
        </motion.div>
        <motion.p
          className="font-body-lg text-base md:text-lg lg:text-body-lg text-[var(--color-on-surface)] mt-4 max-w-2xl bg-[var(--color-surface)] border-4 border-[var(--color-outline)] p-4 shadow-[4px_4px_0px_0px_var(--shadow-color)]"
          variants={itemVariants}
        >
          Full-stack developer with a passion for clean code. Building
          innovative solutions across the tech stack.
        </motion.p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left: Photo + Bio */}
        <motion.div className="flex flex-col gap-12" variants={itemVariants}>
          <div className="relative group">
            <motion.div
              className="border-4 border-[var(--color-outline)] bg-[var(--color-surface-variant)] overflow-hidden shadow-[8px_8px_0px_0px_var(--shadow-color)]"
              whileHover={{
                x: -6,
                y: -6,
                boxShadow: "16px 16px 0px 0px var(--shadow-color)",
              }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
            >
              <img
                src={getAssetPath("Images/Home_Page.jpg")}
                alt={aboutInfo.name}
                className="w-full h-auto object-cover transition-all duration-700"
              />
            </motion.div>
            {/* Name badge */}
            <motion.div
              className="absolute -bottom-6 -right-6 border-4 border-[var(--color-outline)] px-6 py-3 font-headline-md text-2xl uppercase shadow-[4px_4px_0px_0px_var(--shadow-color)]"
              style={{ background: "var(--color-secondary)", color: "#fff" }}
              initial={{ opacity: 0, scale: 0.8, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 20 }}
            >
              {aboutInfo.name}
            </motion.div>
          </div>

          {/* Bio */}
          <motion.div
            className="bg-[var(--color-surface)] border-4 border-[var(--color-outline)] p-8 shadow-[8px_8px_0px_0px_var(--shadow-color)] mt-8"
            variants={itemVariants}
          >
            <h2 className="font-headline-md text-3xl uppercase mb-6 border-b-4 border-[var(--color-outline)] pb-4 text-[var(--color-on-surface)]">
              The Story
            </h2>
            <div className="font-body-md text-lg space-y-4 text-[var(--color-on-surface-variant)]">
              {aboutInfo.bio.split("\n\n").map((paragraph, i) => (
                <p key={i} className="leading-relaxed">{paragraph}</p>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Right: Title + Highlights + CTA */}
        <motion.div className="flex flex-col gap-12" variants={containerVariants}>
          {/* Title + social icons */}
          <motion.div
            className="border-4 border-[var(--color-outline)] p-8 shadow-[8px_8px_0px_0px_var(--shadow-color)]"
            style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}
            variants={itemVariants}
          >
            <h2 className="font-headline-md text-3xl uppercase mb-2">{aboutInfo.title}</h2>
            <p className="font-label-bold text-xl uppercase mb-8 border-b-4 border-[var(--color-outline)] pb-4 opacity-80">
              {aboutInfo.tagline}
            </p>
            <div className="flex flex-wrap gap-4">
              {socialLinks.map((link) => {
                const Icon = iconMap[link.name];
                return Icon ? (
                  <motion.a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[var(--color-surface)] text-[var(--color-on-surface)] border-4 border-[var(--color-outline)] w-12 h-12 flex items-center justify-center text-2xl shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none hover:bg-[var(--color-on-background)] hover:text-[var(--color-background)] transition-all cursor-none"
                    aria-label={link.name}
                    title={link.name}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon />
                  </motion.a>
                ) : null;
              })}
            </div>
          </motion.div>

          {/* Highlights */}
          <div className="flex flex-col gap-6">
            <motion.h2 className="font-headline-md text-3xl uppercase text-[var(--color-on-surface)]" variants={itemVariants}>
              Why work with me
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
              {aboutInfo.highlights.map((highlight, index) => (
                <HighlightCard key={index} highlight={highlight} index={index} />
              ))}
            </div>
          </div>

          {/* CTA */}
          <motion.div
            className="border-4 border-[var(--color-outline)] p-8 shadow-[8px_8px_0px_0px_var(--shadow-accent)] relative overflow-hidden"
            style={{ background: "var(--color-on-background)", color: "var(--color-background)" }}
            variants={itemVariants}
            whileHover={{ x: -2, y: -2, boxShadow: "14px 14px 0px 0px var(--shadow-accent)" }}
          >

            <h3 className="font-headline-md text-3xl uppercase mb-4">Let&apos;s Connect</h3>
            <p className="font-body-md text-lg mb-6 opacity-70">
              I&apos;m always open to discussing new projects, creative ideas,
              or opportunities to be part of your visions.
            </p>
            <div className="flex flex-col gap-4">
              <Link
                to="/contact"
                className="bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-4 border-[var(--color-outline)] px-6 py-4 font-headline-md text-xl uppercase flex items-center justify-center gap-3 shadow-[6px_6px_0px_0px_var(--shadow-color)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0px_0px_var(--shadow-color)] transition-all w-full cursor-none"
              >
                <FaArrowRight />
                <span>Get In Touch</span>
              </Link>
              <a
                href={getAssetPath(aboutInfo.resumeUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-transparent text-[var(--color-background)] border-4 border-current px-6 py-4 font-label-bold text-lg uppercase flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all w-full cursor-none"
              >
                <FaFileDownload />
                <span>Download Resume</span>
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* GitHub Stats */}
      <GitHubStats />
    </motion.section>
  );
}

// ── Highlight Card ────────────────────────────────────────────

function HighlightCard({ highlight, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      className="bg-[var(--color-surface)] border-4 border-[var(--color-outline)] p-6 shadow-[6px_6px_0px_0px_var(--shadow-color)] flex flex-col h-full"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ type: "spring", stiffness: 280, damping: 22, delay: index * 0.08 }}
      whileHover={{ y: -4, x: -4, boxShadow: "12px 12px 0px 0px var(--shadow-color)", transition: { type: "spring", stiffness: 400, damping: 20 } }}
    >
      <motion.span
        className="text-4xl mb-4 block border-2 border-[var(--color-outline)] w-fit p-2 bg-[var(--color-surface-variant)] shadow-[2px_2px_0px_0px_var(--shadow-color)]"
        whileHover={{ rotate: [0, -10, 10, -5, 5, 0], transition: { duration: 0.5 } }}
      >
        {highlight.icon}
      </motion.span>
      <h4 className="font-headline-md text-xl uppercase mb-2 text-[var(--color-on-surface)]">
        {highlight.title}
      </h4>
      <p className="font-body-md text-base text-[var(--color-on-surface-variant)]">
        {highlight.description}
      </p>
    </motion.div>
  );
}

export default memo(About);

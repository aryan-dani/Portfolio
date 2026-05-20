import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaLinkedin,
  FaGithub,
  FaInstagram,
  FaTwitter,
  FaFileDownload,
  FaArrowRight,
} from "react-icons/fa";
import { aboutInfo, socialLinks } from "../../data/experience";
import { useToast } from "../../context/ToastContext";
import { getAssetPath } from "../../utils/paths";
import GitHubStats from "../../components/GitHubStats/GitHubStats";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
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

function About() {
  const [showEmail, setShowEmail] = useState(false);
  const { showToast } = useToast();

  const handleEmailClick = () => {
    setShowEmail(!showEmail);
    if (!showEmail) {
      navigator.clipboard.writeText(aboutInfo.email);
      showToast("Email copied to clipboard!", "success");
    }
  };

  return (
    <motion.section
      className="flex flex-col gap-16 md:gap-section-gap w-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <header className="mb-8 border-b-8 border-black pb-8 flex flex-col justify-end items-start gap-8 mt-4 relative">
        <motion.div
          variants={itemVariants}
          className="bg-primary-container border-4 border-black px-6 py-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform"
        >
          <h1 className="font-headline-xl text-5xl md:text-7xl lg:text-headline-xl text-black uppercase tracking-tighter">
            ABOUT ME
          </h1>
        </motion.div>
        <motion.p
          variants={itemVariants}
          className="font-body-lg text-base md:text-lg lg:text-body-lg text-black mt-4 max-w-2xl bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          Full-stack developer with a passion for clean code. Building
          innovative solutions across the tech stack.
        </motion.p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left Column: Image & Bio */}
        <motion.div className="flex flex-col gap-12" variants={itemVariants}>
          <div className="relative group">
            <div className="border-4 border-black bg-surface-variant overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group-hover:-translate-y-2 group-hover:-translate-x-2 group-hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
              <img
                src={getAssetPath("Images/Home_Page.jpg")}
                alt={aboutInfo.name}
                className="w-full h-auto object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-secondary text-white border-4 border-black px-6 py-3 font-headline-md text-2xl uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {aboutInfo.name}
            </div>
          </div>

          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mt-8">
            <h2 className="font-headline-md text-3xl uppercase mb-6 border-b-4 border-black pb-4">
              The Story
            </h2>
            <div className="font-body-md text-lg space-y-4">
              {aboutInfo.bio.split("\n\n").map((paragraph, index) => (
                <p key={index} className="leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Column: Highlights, Socials & CTA */}
        <motion.div
          className="flex flex-col gap-12"
          variants={containerVariants}
        >
          <div className="bg-primary-container border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="font-headline-md text-3xl uppercase mb-2">
              {aboutInfo.title}
            </h2>
            <p className="font-label-bold text-xl uppercase mb-8 border-b-4 border-black pb-4">
              {aboutInfo.tagline}
            </p>

            <div className="flex flex-wrap gap-4 mb-2">
              {socialLinks.map((link) => {
                const iconMap = {
                  LinkedIn: FaLinkedin,
                  GitHub: FaGithub,
                  Email: FaEnvelope,
                  Instagram: FaInstagram,
                  Twitter: FaTwitter,
                };
                const IconComponent = iconMap[link.name];
                return IconComponent ? (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-black border-4 border-black w-12 h-12 flex items-center justify-center text-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none hover:bg-black hover:text-primary-container transition-all"
                    aria-label={link.name}
                    title={link.name}
                  >
                    <IconComponent />
                  </a>
                ) : null;
              })}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h2 className="font-headline-md text-3xl uppercase">
              Why work with me
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
              {aboutInfo.highlights.map((highlight, index) => (
                <motion.div
                  key={index}
                  className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col h-full"
                  variants={itemVariants}
                >
                  <span className="text-4xl mb-4 block border-2 border-black w-fit p-2 bg-surface-variant shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {highlight.icon}
                  </span>
                  <h4 className="font-headline-md text-xl uppercase mb-2">
                    {highlight.title}
                  </h4>
                  <p className="font-body-md text-base">
                    {highlight.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA to Contact Page */}
          <div className="bg-black border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(240,255,0,1)]">
            <h3 className="font-headline-md text-3xl uppercase mb-4 text-white">
              Let's Connect
            </h3>
            <p className="font-body-md text-lg mb-6 text-white/80">
              I'm always open to discussing new projects, creative ideas, or
              opportunities to be part of your visions.
            </p>
            <div className="flex flex-col gap-4">
              <Link
                to="/contact"
                className="bg-primary-container text-black border-4 border-black px-6 py-4 font-headline-md text-xl uppercase flex items-center justify-center gap-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all w-full"
              >
                <FaArrowRight />
                <span>Get In Touch</span>
              </Link>
              <motion.a
                href={getAssetPath(aboutInfo.resumeUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-black border-4 border-black px-6 py-4 font-label-bold text-lg uppercase flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all w-full"
              >
                <FaFileDownload />
                <span>Download Resume</span>
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* GitHub Stats Section */}
      <GitHubStats />
    </motion.section>
  );
}

export default About;

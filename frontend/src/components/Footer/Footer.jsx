import { memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaInstagram, FaEnvelope } from "react-icons/fa";

const currentYear = new Date().getFullYear();

const socialLinks = [
  { name: "Email",     icon: FaEnvelope,  url: "mailto:daniaryan212@gmail.com" },
  { name: "LinkedIn",  icon: FaLinkedin,  url: "https://www.linkedin.com/in/aryandani/" },
  { name: "GitHub",    icon: FaGithub,    url: "https://github.com/Aryan-Dani" },
  { name: "Instagram", icon: FaInstagram, url: "https://www.instagram.com/aryandani_06/" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const Footer = memo(function Footer() {
  return (
    <motion.footer
      className="w-full border-t-4 border-[var(--color-outline)] mt-20 relative z-10"
      style={{ backgroundColor: "var(--color-surface)" }}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >


      <div className="flex flex-col md:flex-row justify-between items-center py-8 px-4 md:px-8 gap-8 w-full max-w-[1440px] mx-auto">
        {/* Copyright */}
        <motion.div variants={itemVariants}>
          <Link
            to="/copyright"
            className="font-headline-md font-black uppercase text-base md:text-lg text-[var(--color-on-surface)] px-4 py-2 border-4 border-transparent hover:border-[var(--color-outline)] hover:bg-[var(--color-primary-container)] hover:text-[var(--color-on-primary-container)] hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:-translate-y-1 hover:-translate-x-1 active:translate-x-0 active:translate-y-0 active:shadow-none transition-all duration-200 cursor-none inline-block"
          >
            © {currentYear} ARYAN DANI
          </Link>
        </motion.div>

        {/* Social icons */}
        <motion.div
          className="flex flex-wrap gap-3 justify-center"
          variants={containerVariants}
        >
          {socialLinks.map((link, i) => {
            const Icon = link.icon;
            return (
              <motion.a
                key={link.name}
                className="text-[var(--color-on-surface)] bg-[var(--color-surface)] border-4 border-[var(--color-outline)] w-11 h-11 flex items-center justify-center text-lg shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:bg-[var(--color-primary-container)] hover:text-[var(--color-on-primary-container)] transition-all duration-150"
                href={link.url}
                target={link.name === "Email" ? undefined : "_blank"}
                rel={link.name === "Email" ? undefined : "noopener noreferrer"}
                aria-label={link.name}
                title={link.name}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon />
              </motion.a>
            );
          })}
        </motion.div>
      </div>
    </motion.footer>
  );
});

export default Footer;

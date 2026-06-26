import { memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { socialLinks } from "../../data/experience";
import { socialIconMap } from "../../utils/socialIcons";
import { containerVariants, itemVariants } from "../../utils/motionVariants";

const currentYear = new Date().getFullYear();

const socialItemVariants = {
  hidden: { opacity: 0, y: 24, rotate: -25 },
  visible: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

const footerNavLinks = [
  { to: "/projects", label: "Projects" },
  { to: "/about", label: "About" },
  { to: "/experience", label: "Experience" },
  { to: "/contact", label: "Contact" },
];

const Footer = memo(function Footer() {
  return (
    <motion.footer
      className="w-full border-t-4 border-outline mt-20 relative z-10"
      style={{ backgroundColor: "var(--color-surface)" }}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      <div className="flex flex-col md:flex-row justify-between items-center py-8 px-4 md:px-8 gap-8 w-full max-w-[1440px] mx-auto">
        {/* Copyright + Internal nav */}
        <motion.div className="flex flex-col items-center md:items-start gap-3" variants={itemVariants}>
          <Link
            to="/copyright"
            className="relative font-headline-md font-black uppercase text-base md:text-lg text-[var(--color-on-surface)] py-1 cursor-none inline-block group/copyright"
          >
            © {currentYear} ARYAN DANI
            <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-[var(--color-outline)] group-hover/copyright:w-full transition-all duration-300" />
          </Link>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-4 gap-y-1">
            {footerNavLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="font-label-bold text-xs uppercase text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors cursor-none"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </motion.div>

        {/* Social icons */}
        <motion.div
          className="flex flex-wrap gap-3 justify-center"
          role="list"
          aria-label="Social media links"
          variants={containerVariants}
        >
          {socialLinks.map((link) => {
            const Icon = socialIconMap[link.name];
            if (!Icon) return null;
            return (
              <motion.a
                key={link.name}
                role="listitem"
                className="text-[var(--color-on-surface)] bg-[var(--color-surface)] border-4 border-outline w-11 h-11 flex items-center justify-center text-lg shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:bg-[var(--color-primary-container)] hover:text-[var(--color-on-primary-container)] transition-all duration-150"
                href={link.url}
                target={link.name === "Email" ? undefined : "_blank"}
                rel={link.name === "Email" ? undefined : "noopener noreferrer"}
                aria-label={link.name}
                title={link.name}
                variants={socialItemVariants}
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

import { memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { socialLinks } from "../../data/experience";
import { socialIconMap } from "../../utils/socialIcons";
import { containerVariants, itemVariants } from "../../utils/motionVariants";

const currentYear = new Date().getFullYear();

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
          {socialLinks.map((link) => {
            const Icon = socialIconMap[link.name];
            if (!Icon) return null;
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

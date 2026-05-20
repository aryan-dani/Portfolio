import { memo } from "react";
import { Link } from "react-router-dom";
import { FaGithub, FaLinkedin, FaInstagram, FaEnvelope } from "react-icons/fa";

const currentYear = new Date().getFullYear();

const socialLinks = [
  { name: "Email", icon: FaEnvelope, url: "mailto:daniaryan212@gmail.com" },
  { name: "LinkedIn", icon: FaLinkedin, url: "https://www.linkedin.com/in/aryandani/" },
  { name: "GitHub", icon: FaGithub, url: "https://github.com/Aryan-Dani" },
  { name: "Instagram", icon: FaInstagram, url: "https://www.instagram.com/aryandani_06/" },
];

const Footer = memo(function Footer() {
  return (
    <footer className="bg-white w-full border-t-4 border-black mt-20 text-black font-headline-md font-bold uppercase z-10 relative">
      <div className="flex flex-col md:flex-row justify-between items-center py-12 px-4 md:px-8 gap-8 w-full max-w-360 mx-auto">
        <Link
          to="/copyright"
          className="text-xl md:text-2xl font-black text-black text-center md:text-left wrap-break-word hover:underline decoration-4 underline-offset-4"
        >
          © {currentYear} ARYAN DANI — BUILT FOR CREATORS
        </Link>
        
        <div className="flex flex-wrap gap-4 justify-center">
          {socialLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.name}
                className="text-black bg-white border-4 border-black w-11 h-11 flex items-center justify-center text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:bg-primary-container transition-all"
                href={link.url}
                target={link.name === "Email" ? undefined : "_blank"}
                rel={link.name === "Email" ? undefined : "noopener noreferrer"}
                aria-label={link.name}
                title={link.name}
              >
                <Icon />
              </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
});

export default Footer;

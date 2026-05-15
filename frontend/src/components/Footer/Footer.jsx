import { memo } from "react";
import { Link } from "react-router-dom";

const currentYear = new Date().getFullYear();

const Footer = memo(function Footer() {
  return (
    <footer className="bg-white w-full border-t-4 border-black mt-20 text-black font-headline-md font-bold uppercase z-10 relative">
      <div className="flex flex-col md:flex-row justify-between items-center py-12 px-4 md:px-8 gap-6 w-full max-w-360 mx-auto">
        <Link
          to="/copyright"
          className="text-xl md:text-2xl font-black text-black text-center md:text-left wrap-break-word hover:underline decoration-4 underline-offset-4"
        >
          © {currentYear} ARYAN DANI — BUILT FOR CREATORS
        </Link>
        <div className="flex flex-wrap gap-6 justify-center">
          <a
            className="text-black bg-white border-4 border-transparent hover:border-black hover:bg-[#F0FF00] hover:shadow-[4px_4px_0_0_#000000] px-4 py-2 transition-all font-label-bold"
            href="mailto:dani.aryan15@gmail.com"
          >
            Email
          </a>
          <a
            className="text-black bg-white border-4 border-transparent hover:border-black hover:bg-[#F0FF00] hover:shadow-[4px_4px_0_0_#000000] px-4 py-2 transition-all font-label-bold"
            href="https://www.linkedin.com/in/aryandani/"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a
            className="text-black bg-white border-4 border-transparent hover:border-black hover:bg-[#F0FF00] hover:shadow-[4px_4px_0_0_#000000] px-4 py-2 transition-all font-label-bold"
            href="https://github.com/Aryan-Dani"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            className="text-black bg-white border-4 border-transparent hover:border-black hover:bg-[#F0FF00] hover:shadow-[4px_4px_0_0_#000000] px-4 py-2 transition-all font-label-bold"
            href="https://www.instagram.com/aryandani_06/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
});

export default Footer;

import { memo } from "react";
import { Link } from "react-router-dom";
import "./Footer.scss";

const currentYear = new Date().getFullYear();

const Footer = memo(function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">
        <Link to="/copyright" className="footer__copyright">
          © {currentYear} Aryan Dani. All Rights Reserved
        </Link>
      </div>
    </footer>
  );
});

export default Footer;

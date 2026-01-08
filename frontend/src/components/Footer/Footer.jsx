import { Link } from "react-router-dom";
import "./Footer.scss";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__container">
        <Link to="/copyright" className="footer__copyright">
          © {currentYear} Aryan Dani. All Rights Reserved
        </Link>

        <div className="footer__shortcuts">
          <span className="footer__shortcut-hint">
            Press <kbd>Alt</kbd> + <kbd>M</kbd> for menu
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

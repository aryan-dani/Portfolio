import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VanillaTilt from "vanilla-tilt";
import {
  FaEnvelope,
  FaLinkedin,
  FaGithub,
  FaFileDownload,
  FaChevronDown,
  FaChevronUp,
  FaPaperPlane,
} from "react-icons/fa";
import { aboutInfo, socialLinks } from "../../data/experience";
import { useToast } from "../../context/ToastContext";
import { getAssetPath } from "../../utils/paths";
import "./About.scss";

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
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

function About() {
  const [showEmail, setShowEmail] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const imageRef = useRef(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (imageRef.current) {
      VanillaTilt.init(imageRef.current, {
        max: 15,
        speed: 400,
        glare: true,
        "max-glare": 0.3,
      });
    }

    return () => {
      if (imageRef.current?.vanillaTilt) {
        imageRef.current.vanillaTilt.destroy();
      }
    };
  }, []);

  const handleEmailClick = () => {
    setShowEmail(!showEmail);
    if (!showEmail) {
      navigator.clipboard.writeText(aboutInfo.email);
      showToast("Email copied to clipboard!", "success");
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Construct mailto link
    const subject = encodeURIComponent(
      `Portfolio Contact from ${formData.name}`
    );
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );
    window.location.href = `mailto:${aboutInfo.email}?subject=${subject}&body=${body}`;
    showToast("Opening email client...", "info");
  };

  return (
    <motion.section
      className="about-page"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="about-page__container">
        <motion.div className="about-page__hero" variants={itemVariants}>
          <div className="about-page__image-wrapper" ref={imageRef}>
            <img
              src={getAssetPath("Images/Home_Page.jpg")}
              alt={aboutInfo.name}
              className="about-page__image"
            />
          </div>

          <div className="about-page__intro">
            <h1 className="about-page__name">
              {aboutInfo.name.split(" ")[0]}{" "}
              <span>{aboutInfo.name.split(" ")[1]}</span>
            </h1>
            <h2 className="about-page__title">{aboutInfo.title}</h2>
            <p className="about-page__tagline">{aboutInfo.tagline}</p>

            <div className="about-page__social">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="about-page__social-link"
                  aria-label={link.name}
                >
                  {link.name === "LinkedIn" && <FaLinkedin />}
                  {link.name === "GitHub" && <FaGithub />}
                  {link.name === "Email" && <FaEnvelope />}
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div className="about-page__bio" variants={itemVariants}>
          <h3>About Me</h3>
          <p>{aboutInfo.bio}</p>
        </motion.div>

        <motion.div
          className="about-page__highlights"
          variants={containerVariants}
        >
          {aboutInfo.highlights.map((highlight, index) => (
            <motion.div
              key={index}
              className="about-page__highlight"
              variants={itemVariants}
            >
              <span className="about-page__highlight-icon">
                {highlight.icon}
              </span>
              <h4>{highlight.title}</h4>
              <p>{highlight.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div className="about-page__contact" variants={itemVariants}>
          <h3>Get In Touch</h3>
          <p className="about-page__contact-intro">
            I'm always open to discussing new projects, creative ideas, or
            opportunities to be part of your visions. Let's connect!
          </p>

          <div className="about-page__contact-buttons">
            <motion.button
              className="about-page__email-btn"
              onClick={handleEmailClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaEnvelope />
              <span>{showEmail ? aboutInfo.email : "Show Email"}</span>
            </motion.button>

            <motion.button
              className="about-page__form-toggle"
              onClick={() => setShowContactForm(!showContactForm)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {showContactForm ? <FaChevronUp /> : <FaChevronDown />}
              <span>{showContactForm ? "Hide Form" : "Contact Form"}</span>
            </motion.button>

            <motion.a
              href={getAssetPath(aboutInfo.resumeUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="about-page__resume-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaFileDownload />
              <span>Download Resume</span>
            </motion.a>
          </div>

          <AnimatePresence>
            {showContactForm && (
              <motion.form
                className="about-page__form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleFormSubmit}
              >
                <div className="about-page__form-group">
                  <label htmlFor="name">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="about-page__form-group">
                  <label htmlFor="email">Your Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div className="about-page__form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleFormChange}
                    placeholder="Tell me about your project or idea..."
                    rows="5"
                    required
                  />
                </div>

                <motion.button
                  type="submit"
                  className="about-page__submit-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaPaperPlane />
                  <span>Send Message</span>
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default About;

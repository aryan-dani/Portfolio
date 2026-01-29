import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaGithub, FaLinkedin, FaEnvelope, FaArrowLeft, FaBalanceScale } from "react-icons/fa";
import PageHero from "../../components/PageHero/PageHero";
import "./Copyright.scss";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const CopyrightVisual = () => (
  <div className="copyright-visual">
    <FaBalanceScale className="copyright-visual__icon" />
  </div>
);

function Copyright() {
  const currentYear = new Date().getFullYear();

  return (
    <motion.section
      className="copyright-page"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <PageHero
        category="Legal"
        title="Copyright"
        titleHighlight="& license"
        highlights={[
          "MIT License - Free to use and modify",
          "Open source portfolio template",
          "Built with modern web technologies",
        ]}
        visual={<CopyrightVisual />}
      />

      <div className="copyright-page__container">
        <motion.div className="copyright-page__back" variants={itemVariants}>
          <Link to="/" className="copyright-page__back-link">
            <FaArrowLeft />
            <span>Back to Home</span>
          </Link>
        </motion.div>



        <motion.div className="copyright-page__content" variants={itemVariants}>
          <motion.h1 className="copyright-page__title" variants={itemVariants}>
            <span>©</span> Copyright Notice
          </motion.h1>

          <motion.div className="copyright-page__card" variants={itemVariants}>
            <h2>MIT License</h2>
            <p className="copyright-page__year">
              Copyright © {currentYear} Aryan Hardik Dani
            </p>

            <div className="copyright-page__license-text">
              <p>
                Permission is hereby granted, free of charge, to any person
                obtaining a copy of this software and associated documentation
                files (the "Software"), to deal in the Software without
                restriction, including without limitation the rights to use,
                copy, modify, merge, publish, distribute, sublicense, and/or
                sell copies of the Software, and to permit persons to whom the
                Software is furnished to do so, subject to the following
                conditions:
              </p>

              <p>
                The above copyright notice and this permission notice shall be
                included in all copies or substantial portions of the Software.
              </p>

              <p className="copyright-page__disclaimer">
                THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
                EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
                OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
                NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
                HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
                WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
                FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
                OTHER DEALINGS IN THE SOFTWARE.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="copyright-page__attribution"
            variants={itemVariants}
          >
            <h3>Attribution</h3>
            <p>
              This portfolio was designed and developed by{" "}
              <strong>Aryan Dani</strong>.
            </p>
          </motion.div>

          <motion.div
            className="copyright-page__contact"
            variants={itemVariants}
          >
            <h3>Get in Touch</h3>
            <div className="copyright-page__links">
              <a
                href="https://github.com/aryan-dani"
                target="_blank"
                rel="noopener noreferrer"
                className="copyright-page__link"
              >
                <FaGithub />
                <span>GitHub</span>
              </a>
              <a
                href="https://linkedin.com/in/aryandani"
                target="_blank"
                rel="noopener noreferrer"
                className="copyright-page__link"
              >
                <FaLinkedin />
                <span>LinkedIn</span>
              </a>
              <a
                href="mailto:daniaryan212@gmail.com"
                className="copyright-page__link"
              >
                <FaEnvelope />
                <span>Email</span>
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default Copyright;

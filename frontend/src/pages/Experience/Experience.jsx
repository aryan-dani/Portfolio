import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaExternalLinkAlt } from "react-icons/fa";
import { experiences } from "../../data/experience";
import { getAssetPath } from "../../utils/paths";
import "./Experience.scss";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.25,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, rotateX: 5 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

function Experience() {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <motion.section
      className="experience"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="experience__container">
        <motion.div className="section-header" variants={cardVariants}>
          <h2>
            Professional <span>Experience</span>
          </h2>
          <p className="intro-text">
            My professional journey has been driven by a passion for blending
            technology with creativity. From AI engineering to frontend
            development, I've focused on creating meaningful solutions that
            merge cutting-edge innovation with user-friendly design. Below is a
            timeline of my professional growth.
          </p>
        </motion.div>

        <div className="experience__timeline">
          {experiences.map((exp) => (
            <motion.div
              key={exp.id}
              className={`experience__card ${
                expandedId === exp.id ? "experience__card--expanded" : ""
              }`}
              variants={cardVariants}
            >
              <div className="experience__header">
                <img
                  src={getAssetPath(exp.logo)}
                  alt={`${exp.company} logo`}
                  className="experience__logo"
                  loading="lazy"
                />
                <div className="experience__info">
                  <div className="experience__meta">
                    <span className="experience__period">{exp.period}</span>
                    <span className="experience__position">{exp.position}</span>
                  </div>
                  <h3 className="experience__company">
                    <a
                      href={exp.companyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {exp.company}
                      <FaExternalLinkAlt />
                    </a>
                  </h3>
                </div>
                <button
                  className={`experience__toggle ${
                    expandedId === exp.id ? "experience__toggle--active" : ""
                  }`}
                  onClick={() => toggleExpand(exp.id)}
                  aria-label="Toggle details"
                >
                  <FaChevronDown />
                </button>
              </div>

              <AnimatePresence>
                {expandedId === exp.id && (
                  <motion.div
                    className="experience__details"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="experience__tags">
                      {exp.technologies.map((tech) => (
                        <span key={tech} className="tag">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <ul className="experience__responsibilities">
                      {exp.responsibilities.map((resp, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          {resp}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export default Experience;

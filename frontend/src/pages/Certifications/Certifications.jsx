import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaTimes, FaEye, FaExternalLinkAlt } from "react-icons/fa";
import {
  certifications,
  certificationCategories,
} from "../../data/certifications";
import { getAssetPath } from "../../utils/paths";
import "./Certifications.scss";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

function Certifications() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [previewImage, setPreviewImage] = useState(null);

  const filteredCerts = useMemo(() => {
    return certifications.filter((cert) => {
      const matchesCategory =
        activeFilter === "all" || cert.category === activeFilter;
      const matchesSearch =
        searchTerm === "" ||
        cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.issuer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, activeFilter]);

  return (
    <motion.section
      className="certifications"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="certifications__container">
        <motion.div className="section-header" variants={cardVariants}>
          <h2>
            My <span>Certifications</span>
          </h2>
          <p className="intro-text">
            Welcome to my digital trophy cabinet "Yes, I actually did that."
            This is where my collection of shiny badges and fancy titles
            lives—proof that I've clicked "Next Lesson" more times than I care
            to admit. Browse away, and remember: behind every certificate is a
            lot of tea and questionable life choices!
          </p>
        </motion.div>

        <motion.div
          className="certifications__controls"
          variants={cardVariants}
        >
          <div className="certifications__search">
            <FaSearch className="certifications__search-icon" />
            <input
              type="search"
              placeholder="Search certificates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="certifications__search-input"
            />
            {searchTerm && (
              <button
                className="certifications__search-clear"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <div className="certifications__filters">
            {certificationCategories.map((category) => (
              <button
                key={category.id}
                className={`certifications__filter-btn ${
                  activeFilter === category.id
                    ? "certifications__filter-btn--active"
                    : ""
                }`}
                onClick={() => setActiveFilter(category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {filteredCerts.length > 0 ? (
            <motion.div
              className="certifications__grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredCerts.map((cert) => (
                <CertificationCard
                  key={cert.id}
                  cert={cert}
                  onImageClick={() => setPreviewImage(cert.image)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="certifications__empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FaSearch />
              <h3>No certificates found</h3>
              <p>
                Try selecting a different category or view all certificates.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            className="cert-preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              className="cert-preview__content"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="cert-preview__close"
                onClick={() => setPreviewImage(null)}
              >
                <FaTimes />
              </button>
              <img src={getAssetPath(previewImage)} alt="Certificate Preview" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function CertificationCard({ cert, onImageClick }) {
  return (
    <motion.article className="cert-card" variants={cardVariants} layout>
      <div className="cert-card__image" onClick={onImageClick}>
        <img src={getAssetPath(cert.image)} alt={cert.title} loading="lazy" />
        <span className="cert-card__badge">{cert.badge}</span>
        <div className="cert-card__overlay">
          <FaEye />
        </div>
      </div>

      <div className="cert-card__content">
        <span className="cert-card__date">{cert.date}</span>
        <h3 className="cert-card__title">{cert.title}</h3>
        <p className="cert-card__description">{cert.description}</p>

        <a
          href={cert.link}
          target="_blank"
          rel="noopener noreferrer"
          className="cert-card__link"
        >
          <FaExternalLinkAlt />
          View Certificate
        </a>

        <div className="cert-card__footer">
          <div className="cert-card__issuer">
            <img src={cert.issuerLogo} alt={cert.issuer} />
            <span>{cert.issuer}</span>
          </div>
          <span className="cert-card__tag">{cert.tag}</span>
        </div>
      </div>
    </motion.article>
  );
}

export default Certifications;

import { useState, useMemo, useEffect, memo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaTimes, FaEye, FaExternalLinkAlt } from "react-icons/fa";
import {
  certifications,
  certificationCategories,
} from "../../data/certifications";
import { getAssetPath } from "../../utils/paths";

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

  // Lock body scroll when modal is open
  useEffect(() => {
    if (previewImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [previewImage]);

  const clearSearch = () => setSearchTerm("");

  return (
    <>
      <motion.section
        className="flex flex-col gap-16 md:gap-section-gap w-full"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <header className="mb-8 border-b-8 border-black pb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mt-4">
          <div>
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="font-headline-xl text-5xl md:text-7xl lg:text-headline-xl text-black uppercase tracking-tighter">
                CERTIFICATIONS
              </h1>
              <span className="bg-primary-container border-4 border-black px-4 py-2 font-headline-md text-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                {certifications.length}
              </span>
            </div>
            <p className="font-body-lg text-base md:text-lg lg:text-body-lg text-black mt-4 max-w-2xl bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              Proof of grind. Credentials that validate expertise and continuous
              learning.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="flex items-center bg-white border-4 border-black p-2 w-full sm:w-64 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <FaSearch className="text-xl ml-2 mr-3" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none w-full font-body-md text-lg"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="mr-2 p-1 hover:bg-primary-container transition-colors"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {certificationCategories.map((category, index) => {
                const isSelected = activeFilter === category.id;

                return (
                  <button
                    key={category.id}
                    className={`border-4 border-black px-4 py-2 font-label-bold text-sm md:text-base uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all transform hover:shadow-none hover:translate-y-1 hover:translate-x-1 ${
                      isSelected
                        ? `bg-primary-container`
                        : "bg-white hover:bg-surface-variant"
                    }`}
                    onClick={() => setActiveFilter(category.id)}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {filteredCerts.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
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
              className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-12 text-center flex flex-col items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <FaSearch className="text-4xl" />
              <h3 className="font-headline-md text-3xl uppercase">
                No certificates found
              </h3>
              <p className="font-body-md text-lg">
                Try selecting a different category or view all certificates.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Image Preview Modal - Rendered via Portal */}
      {previewImage &&
        createPortal(
          <AnimatePresence>
            <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-8">
              <motion.div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setPreviewImage(null)}
              />
              <motion.div
                className="bg-white border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] max-w-5xl max-h-[90vh] relative z-10 flex flex-col"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="absolute -top-4 -right-4 md:-top-6 md:-right-6 z-20 bg-primary-container border-4 border-black w-12 h-12 flex items-center justify-center text-black text-2xl hover:bg-black hover:text-primary-container transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                  onClick={() => setPreviewImage(null)}
                  aria-label="Close modal"
                >
                  <FaTimes />
                </button>
                <img
                  src={getAssetPath(previewImage)}
                  alt="Certificate Preview"
                  className="max-w-full max-h-[85vh] object-contain border-4 border-black"
                />
              </motion.div>
            </div>
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

const CertificationCard = memo(function CertificationCard({
  cert,
  onImageClick,
}) {
  return (
    <motion.article
      className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col group hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
      variants={cardVariants}
    >
      <div
        className="aspect-4/3 border-b-4 border-black overflow-hidden relative cursor-pointer bg-white"
        onClick={onImageClick}
      >
        <img
          src={getAssetPath(cert.image)}
          alt={cert.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-contain p-2"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <FaEye className="text-white text-4xl" />
        </div>
        <div className="absolute top-4 right-4 bg-secondary text-white border-4 border-black px-3 py-1 font-label-bold text-sm uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {cert.badge || "Cert"}
        </div>
      </div>

      <div className="p-6 md:p-8 flex flex-col grow">
        <span className="font-label-bold text-sm md:text-base text-secondary uppercase tracking-widest mb-2 border-2 border-black w-fit px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {cert.date}
        </span>
        <h3 className="font-headline-md text-2xl md:text-3xl text-black mb-4 uppercase mt-2">
          {cert.title}
        </h3>
        <p className="font-body-md text-base text-black mb-6 grow">
          {cert.description}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t-4 border-black pt-4 mb-6 gap-4 sm:gap-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-black overflow-hidden bg-white shrink-0">
              <img
                src={cert.issuerLogo}
                alt={cert.issuer}
                className="w-full h-full object-contain p-1"
              />
            </div>
            <span className="font-label-bold text-sm md:text-base uppercase">
              {cert.issuer}
            </span>
          </div>
          <span className="font-label-bold text-xs bg-surface-variant border-2 border-black px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-center">
            {cert.tag || "Credential"}
          </span>
        </div>

        {cert.link && cert.link !== "#" ? (
          <a
            href={cert.link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary-container text-black border-4 border-black text-center py-3 font-label-bold text-sm md:text-base uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex justify-center items-center gap-2"
          >
            <FaExternalLinkAlt className="text-sm" />
            View Certificate
          </a>
        ) : (
          <button
            onClick={onImageClick}
            className="bg-primary-container text-black border-4 border-black text-center py-3 font-label-bold text-sm md:text-base uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex justify-center items-center gap-2 w-full cursor-pointer"
          >
            <FaEye className="text-sm" />
            View Certificate
          </button>
        )}
      </div>
    </motion.article>
  );
});

export default Certifications;

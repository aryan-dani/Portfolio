import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaTimes, FaEye, FaGithub, FaLinkedin, FaExternalLinkAlt } from "react-icons/fa";
import { projects, projectCategories } from "../../data/projects";
import { getAssetPath } from "../../utils/paths";
import "./Projects.scss";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const modalVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.25 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 }
  },
};

const modalContentVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 }
  },
};

// Custom hook for masonry layout
function useMasonry(containerRef, items, deps = []) {
  const [positions, setPositions] = useState([]);
  const [containerHeight, setContainerHeight] = useState(0);

  const calculatePositions = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    const gap = 24; // 1.5rem
    const minColWidth = 340;

    // Calculate number of columns
    const cols = Math.max(1, Math.floor((containerWidth + gap) / (minColWidth + gap)));
    const colWidth = (containerWidth - gap * (cols - 1)) / cols;

    // Track column heights
    const colHeights = new Array(cols).fill(0);

    // Get all card elements
    const cards = container.querySelectorAll('.project-card');
    const newPositions = [];

    cards.forEach((card, index) => {
      // Find shortest column
      const shortestCol = colHeights.indexOf(Math.min(...colHeights));

      // Calculate position
      const x = shortestCol * (colWidth + gap);
      const y = colHeights[shortestCol];

      newPositions.push({ x, y, width: colWidth });

      // Update column height
      colHeights[shortestCol] += card.offsetHeight + gap;
    });

    setPositions(newPositions);
    setContainerHeight(Math.max(...colHeights) - gap);
  }, [containerRef, items]);

  useEffect(() => {
    // Initial calculation after render
    const timer = setTimeout(calculatePositions, 100);

    // Recalculate on resize
    const handleResize = () => {
      calculatePositions();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [calculatePositions, ...deps]);

  // Recalculate when images load
  useEffect(() => {
    if (!containerRef.current) return;

    const images = containerRef.current.querySelectorAll('img');
    let loadedCount = 0;

    const handleImageLoad = () => {
      loadedCount++;
      if (loadedCount === images.length) {
        calculatePositions();
      }
    };

    images.forEach(img => {
      if (img.complete) {
        loadedCount++;
      } else {
        img.addEventListener('load', handleImageLoad);
      }
    });

    if (loadedCount === images.length) {
      calculatePositions();
    }

    return () => {
      images.forEach(img => {
        img.removeEventListener('load', handleImageLoad);
      });
    };
  }, [containerRef, items, calculatePositions]);

  return { positions, containerHeight, recalculate: calculatePositions };
}

function Projects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const gridRef = useRef(null);

  // Handle search query from URL
  useEffect(() => {
    const searchQuery = searchParams.get("search");
    if (searchQuery) {
      setSearchTerm(searchQuery);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Close modal on Escape key and lock body scroll
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setSelectedProject(null);
      }
    };
    if (selectedProject) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [selectedProject]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesCategory =
        activeFilter === "all" || project.category === activeFilter;
      const matchesSearch =
        searchTerm === "" ||
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, activeFilter]);

  // Use masonry layout
  const { positions, containerHeight, recalculate } = useMasonry(
    gridRef,
    filteredProjects,
    [activeFilter, searchTerm]
  );

  const clearSearch = () => {
    setSearchTerm("");
  };

  const openModal = (project) => {
    setSelectedProject(project);
  };

  const closeModal = () => {
    setSelectedProject(null);
  };

  return (
    <>
      <motion.section
        className="projects"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="projects__container">
          <motion.div className="projects__controls" variants={cardVariants}>
            <div className={`projects__search ${isSearchFocused ? 'projects__search--focused' : ''}`}>
              <div className="projects__search-inner">
                <FaSearch className="projects__search-icon" />
                <input
                  type="search"
                  placeholder="Search projects, tags, technologies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="projects__search-input"
                />
                {searchTerm && (
                  <button
                    className="projects__search-clear"
                    onClick={clearSearch}
                    aria-label="Clear search"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>

            <div className="projects__filters">
              {projectCategories.map((category) => (
                <button
                  key={category.id}
                  className={`projects__filter-btn ${activeFilter === category.id
                    ? "projects__filter-btn--active"
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
            {filteredProjects.length > 0 ? (
              <motion.div
                key={activeFilter + searchTerm}
                ref={gridRef}
                className="projects__grid"
                style={{ height: containerHeight || 'auto' }}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredProjects.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onOpenModal={openModal}
                    position={positions[index]}
                    onLoad={recalculate}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                className="projects__empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <FaSearch />
                <h3>No projects found</h3>
                <p>Try adjusting your search terms or filters.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* Project Modal - Rendered via Portal to document.body */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal project={selectedProject} onClose={closeModal} />
        )}
      </AnimatePresence>
    </>
  );
}

function ProjectCard({ project, onOpenModal, position, onLoad }) {
  const style = position ? {
    position: 'absolute',
    left: position.x,
    top: position.y,
    width: position.width,
  } : {};

  return (
    <motion.article
      className="project-card"
      variants={cardVariants}
      style={style}
      whileHover={{ y: -6 }}
      onClick={() => onOpenModal(project)}
    >
      <div className="project-card__image-wrapper">
        <img
          src={getAssetPath(project.image)}
          alt={project.title}
          loading="lazy"
          className="project-card__image"
          onLoad={onLoad}
        />
        <div className="project-card__image-overlay">
          <span className="project-card__view-hint">
            <FaExternalLinkAlt /> View Details
          </span>
        </div>
      </div>

      <div className="project-card__content">
        <div className="project-card__header">
          <span className="project-card__year">{project.year}</span>
          <div className="project-card__links" onClick={(e) => e.stopPropagation()}>
            {project.links.preview && (
              <a
                href={project.links.preview}
                target="_blank"
                rel="noopener noreferrer"
                className="project-card__link"
                title="Live Preview"
              >
                <FaEye />
              </a>
            )}
            {project.links.github && (
              <a
                href={project.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="project-card__link"
                title="GitHub"
              >
                <FaGithub />
              </a>
            )}
            {project.links.linkedin && (
              <a
                href={project.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="project-card__link"
                title="LinkedIn"
              >
                <FaLinkedin />
              </a>
            )}
          </div>
        </div>

        <h3 className="project-card__title">{project.title}</h3>

        <div className="project-card__tags">
          {project.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="tag tag--more">+{project.tags.length - 3}</span>
          )}
        </div>

        <p className="project-card__description">{project.description}</p>
      </div>
    </motion.article>
  );
}

function ProjectModal({ project, onClose }) {
  // Use Portal to render modal at document.body level
  return createPortal(
    <motion.div
      className="project-modal"
      variants={modalVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={onClose}
    >
      <motion.div
        className="project-modal__content"
        variants={modalContentVariants}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="project-modal__close" onClick={onClose} aria-label="Close modal">
          <FaTimes />
        </button>

        <div className="project-modal__image-section">
          <img
            src={getAssetPath(project.image)}
            alt={project.title}
            className="project-modal__image"
          />
        </div>

        <div className="project-modal__info">
          <div className="project-modal__header">
            <span className="project-modal__year">{project.year}</span>
            <h2 className="project-modal__title">{project.title}</h2>
          </div>

          <div className="project-modal__tags">
            {project.tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>

          <p className="project-modal__description">{project.description}</p>

          <div className="project-modal__actions">
            {project.links.preview && (
              <a
                href={project.links.preview}
                target="_blank"
                rel="noopener noreferrer"
                className="project-modal__btn project-modal__btn--primary"
              >
                <FaEye /> Live Preview
              </a>
            )}
            {project.links.github && (
              <a
                href={project.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="project-modal__btn project-modal__btn--secondary"
              >
                <FaGithub /> View Code
              </a>
            )}
            {project.links.linkedin && (
              <a
                href={project.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="project-modal__btn project-modal__btn--secondary"
              >
                <FaLinkedin /> LinkedIn
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

export default Projects;

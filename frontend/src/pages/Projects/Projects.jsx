import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaTimes, FaEye, FaGithub, FaLinkedin } from "react-icons/fa";
import { projects, projectCategories } from "../../data/projects";
import { getAssetPath } from "../../utils/paths";
import "./Projects.scss";

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
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
};

function Projects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

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

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <motion.section
      className="projects"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="projects__container">
        <motion.div className="section-header" variants={cardVariants}>
          <h2>
            My <span>Projects</span>
          </h2>
          <p className="intro-text">
            I know, I know, it's not the Netflix catalog of projects yet, but
            hey, greatness takes time! Most of these are still
            "work-in-progress" (aka me battling bugs at 2 AM), but I promise
            I'll blow your mind soon (hopefully). Stick around; we're just
            getting started!
          </p>
        </motion.div>

        <motion.div className="projects__controls" variants={cardVariants}>
          <div className="projects__search">
            <FaSearch className="projects__search-icon" />
            <input
              type="search"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

          <div className="projects__filters">
            {projectCategories.map((category) => (
              <button
                key={category.id}
                className={`projects__filter-btn ${
                  activeFilter === category.id
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
              className="projects__grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
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
  );
}

function ProjectCard({ project }) {
  return (
    <motion.article
      className="project-card"
      variants={cardVariants}
      layout
      whileHover={{ y: -5 }}
    >
      <div className="project-card__image">
        <img
          src={getAssetPath(project.image)}
          alt={project.title}
          loading="lazy"
        />
        <div className="project-card__overlay">
          <div className="project-card__links">
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
      </div>

      <div className="project-card__content">
        <div className="project-card__meta">
          <span className="project-card__year">{project.year}</span>
        </div>
        <h3 className="project-card__title">{project.title}</h3>

        <div className="project-card__tags">
          {project.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>

        <p className="project-card__description">{project.description}</p>
      </div>
    </motion.article>
  );
}

export default Projects;

import { useState, useMemo, useEffect, memo } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaTimes, FaEye, FaGithub, FaLinkedin } from "react-icons/fa";
import { projects, projectCategories } from "../../data/projects";
import { getAssetPath } from "../../utils/paths";

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
    transition: { duration: 0.25 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

const modalContentVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 },
  },
};

function Projects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState(null);

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
          tag.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, activeFilter]);

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
        className="flex flex-col gap-16 md:gap-section-gap w-full"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <header className="mb-8 border-b-8 border-black pb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mt-4">
          <div>
            <h1 className="font-headline-xl text-5xl md:text-7xl lg:text-headline-xl text-black uppercase tracking-tighter">
              PROJECTS
            </h1>
            <p className="font-body-lg text-base md:text-lg lg:text-body-lg text-black mt-4 max-w-2xl bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              Systems engineered to resist and adapt. Full-stack applications
              with modern architectures. AI-powered solutions and creative
              experiments.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="flex items-center bg-white neo-border p-2 w-full sm:w-64 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
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
              {projectCategories.map((category, index) => {
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
          {filteredProjects.length > 0 ? (
            <motion.div
              key={activeFilter + searchTerm}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpenModal={openModal}
                  index={index}
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
                No projects found
              </h3>
              <p className="font-body-md text-lg">
                Try adjusting your search terms or filters.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal project={selectedProject} onClose={closeModal} />
        )}
      </AnimatePresence>
    </>
  );
}

const ProjectCard = memo(function ProjectCard({ project, onOpenModal, index }) {
  const isFeatured = project.featured || false;

  return (
    <motion.article
      className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col group hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-pointer"
      variants={cardVariants}
      onClick={() => onOpenModal(project)}
    >
      <div className="h-48 md:h-64 border-b-4 border-black bg-surface-variant overflow-hidden relative">
        <img
          src={getAssetPath(project.image)}
          alt={project.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
        />
        {isFeatured && (
          <div className="absolute top-4 right-4 bg-primary-container border-4 border-black px-3 py-1 font-label-bold text-sm uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            Featured
          </div>
        )}
      </div>

      <div className="p-6 md:p-8 flex flex-col grow">
        <h2 className="font-headline-md text-2xl md:text-3xl text-black mb-4 uppercase">
          {project.title}
        </h2>
        <p className="font-body-md text-base text-black mb-6 grow line-clamp-3">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-8">
          {project.tags.slice(0, 3).map((tag, i) => {
            return (
              <span
                key={tag}
                className={`bg-black text-white border-2 border-black px-2 py-1 font-label-bold text-xs uppercase`}
              >
                {tag}
              </span>
            );
          })}
          {project.tags.length > 3 && (
            <span className="bg-white text-black border-2 border-black px-2 py-1 font-label-bold text-xs uppercase">
              +{project.tags.length - 3}
            </span>
          )}
        </div>

        <div
          className="flex gap-4 border-t-4 border-black pt-6"
          onClick={(e) => e.stopPropagation()}
        >
          {project.links?.preview && (
            <a
              href={project.links.preview}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-primary-container text-black border-4 border-black text-center py-2 md:py-3 font-label-bold text-sm md:text-base uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex justify-center items-center gap-2"
              title="Live Preview"
            >
              <FaEye /> Live
            </a>
          )}
          {project.links?.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-white text-black border-4 border-black text-center py-2 md:py-3 font-label-bold text-sm md:text-base uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex justify-center items-center gap-2"
              title="GitHub"
            >
              <FaGithub /> Source
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
});

const ProjectModal = memo(function ProjectModal({ project, onClose }) {
  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-8">
      <motion.div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
      />
      <motion.div
        className="bg-white border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10 flex flex-col"
        variants={modalContentVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 z-20 bg-primary-container border-4 border-black w-12 h-12 flex items-center justify-center text-black text-2xl hover:bg-black hover:text-primary-container transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          onClick={onClose}
          aria-label="Close modal"
        >
          <FaTimes />
        </button>

        <div className="h-48 md:h-80 border-b-8 border-black relative">
          <img
            src={getAssetPath(project.image)}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-6 md:p-10 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-4 border-black pb-6">
            <div>
              <span className="bg-black text-white font-label-bold px-3 py-1 border-2 border-black mb-2 inline-block shadow-[2px_2px_0px_0px_rgba(240,255,0,1)]">
                {project.year}
              </span>
              <h2 className="font-headline-xl text-4xl md:text-5xl uppercase leading-tight">
                {project.title}
              </h2>
            </div>

            <div className="flex gap-4">
              {project.links?.preview && (
                <a
                  href={project.links.preview}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary-container border-4 border-black p-3 text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                  title="Live Preview"
                >
                  <FaEye />
                </a>
              )}
              {project.links?.github && (
                <a
                  href={project.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border-4 border-black p-3 text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                  title="GitHub"
                >
                  <FaGithub />
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="bg-surface-variant text-black border-2 border-black px-3 py-1 font-label-bold text-sm uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                {tag}
              </span>
            ))}
          </div>

          <p className="font-body-lg text-lg border-4 border-black border-dashed p-6 bg-surface-variant">
            {project.description}
          </p>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
});

export default Projects;

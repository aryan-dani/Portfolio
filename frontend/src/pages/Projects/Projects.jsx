import { useState, useMemo, useEffect, useCallback, useRef, memo } from "react";
import { createPortal } from "react-dom";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { FaSearch, FaTimes, FaEye, FaGithub, FaArrowRight, FaChevronDown } from "react-icons/fa";
import { projects, projectCategories } from "../../data/projects";
import { getSkillsForProject } from "../../data/skills";
import { getAssetPath } from "../../utils/paths";
import { containerVariants, cardVariants, modalBackdropVariants, modalContentVariants } from "../../utils/motionVariants";
import { useModalLock } from "../../hooks/useModalLock";

const gridContainerVariants = containerVariants;

function Projects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm,   setSearchTerm]   = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [highlightedId, setHighlightedId]     = useState(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const navigate = useNavigate();

  const allTags = useMemo(() => {
    const s = new Set();
    projects.forEach((p) => p.tags.forEach((t) => s.add(t)));
    return Array.from(s);
  }, []);

  useEffect(() => {
    const searchQuery = searchParams.get("search");
    const highlightParam = searchParams.get("highlight");
    if (searchQuery) { setSearchTerm(searchQuery); setSearchParams({}, { replace: true }); }
    if (highlightParam) {
      const id = parseInt(highlightParam, 10);
      const project = projects.find((p) => p.id === id);
      if (project) { setSelectedProject(project); setHighlightedId(id); }
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (highlightedId) {
      const t = setTimeout(() => setHighlightedId(null), 3000);
      return () => clearTimeout(t);
    }
  }, [highlightedId]);

  // Modal scroll-lock + Escape key dismiss (shared hook)
  useModalLock(!!selectedProject, () => setSelectedProject(null));

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesCat  = activeFilter === "all" || p.category === activeFilter;
      const matchesTags = selectedTags.length === 0 || selectedTags.every((t) => p.tags.includes(t));
      const matchesSrch = searchTerm === "" ||
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCat && matchesTags && matchesSrch;
    });
  }, [searchTerm, activeFilter, selectedTags]);

  const toggleTag = (tag) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  return (
    <>
      <motion.section
        className="flex flex-col gap-12 md:gap-16 w-full"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <header className="mb-4 border-b-8 border-outline pb-8 flex flex-col justify-end items-start gap-8 mt-4 relative bg-hatch p-4 md:p-6 shadow-[4px_4px_0px_0px_var(--shadow-color)]">
          <motion.div
            className="flex items-center gap-4 flex-wrap"
            variants={cardVariants}
          >
            <div className="bg-[var(--color-primary-container)] border-4 border-outline px-6 py-4 shadow-[8px_8px_0px_0px_var(--shadow-color)] relative overflow-hidden">
              <h1 className="font-headline-xl text-5xl md:text-7xl lg:text-headline-xl text-[var(--color-on-primary-container)] uppercase tracking-tighter">
                PROJECTS
              </h1>
            </div>
            <span
              className="font-headline-md text-3xl border-4 border-outline px-5 py-4 shadow-[8px_8px_0px_0px_var(--shadow-color)] bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]"
            >
              {filteredProjects.length}
            </span>
          </motion.div>

          <motion.p
            className="font-body-lg text-base md:text-lg lg:text-body-lg text-[var(--color-on-surface)] mt-4 max-w-2xl bg-[var(--color-surface)] border-4 border-outline p-4 shadow-[4px_4px_0px_0px_var(--shadow-color)]"
            variants={cardVariants}
          >
            Systems engineered to resist and adapt. Full-stack applications
            with modern architectures. AI-powered solutions and creative
            experiments.
          </motion.p>

          {/* Search + Filters */}
          <motion.div
            className="flex flex-col xl:flex-row gap-6 w-full justify-between items-stretch xl:items-center mt-4"
            variants={cardVariants}
          >
            <div className="flex items-center bg-[var(--color-surface)] border-4 border-outline p-2 w-full xl:w-80 shadow-[4px_4px_0px_0px_var(--shadow-color)] focus-within:shadow-[4px_4px_0px_0px_var(--shadow-accent)] transition-all">
              <FaSearch className="text-xl ml-2 mr-3 text-[var(--color-on-surface)]" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none w-full font-body-md text-lg text-[var(--color-on-surface)] cursor-none placeholder:text-[var(--color-text-muted)]"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="mr-2 p-1 hover:bg-[var(--color-primary-container)] transition-colors">
                  <FaTimes className="text-[var(--color-on-surface)]" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {projectCategories.map((category) => {
                const isSelected = activeFilter === category.id;
                return (
                  <motion.button
                    key={category.id}
                    className={`border-4 border-outline px-4 py-2 font-label-bold text-sm md:text-base uppercase transition-all cursor-none ${
                      isSelected
                        ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] shadow-[2px_2px_0px_0px_var(--shadow-color)] translate-x-[2px] translate-y-[2px]"
                        : "bg-[var(--color-surface)] text-[var(--color-on-surface)] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 hover:bg-[var(--color-surface-variant)]"
                    }`}
                    onClick={() => setActiveFilter(category.id)}
                    whileTap={{ scale: 0.97 }}
                  >
                    {category.label}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Tech tag matrix */}
          <motion.div
            className="w-full bg-[var(--color-surface)] border-4 border-outline shadow-[4px_4px_0px_0px_var(--shadow-color)] flex flex-col overflow-hidden"
            variants={cardVariants}
          >
            <div 
              className={`flex justify-between items-center bg-[var(--color-surface)] px-6 py-4 cursor-pointer ${isFilterExpanded ? 'border-b-4 border-outline' : ''}`}
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            >
              <div className="flex items-center gap-3">
                <span className="font-label-bold text-sm uppercase tracking-wider text-[var(--color-on-surface)]">
                  Filter by Tech Stack {selectedTags.length > 0 && `(${selectedTags.length})`}
                </span>
                <motion.div animate={{ rotate: isFilterExpanded ? 180 : 0 }}>
                  <FaChevronDown className="text-outline" />
                </motion.div>
              </div>
              
              {selectedTags.length > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedTags([]); }}
                  className="text-xs uppercase font-label-bold text-red-500 hover:underline cursor-none"
                >
                  Clear
                </button>
              )}
            </div>
            
            <AnimatePresence initial={false}>
              {isFilterExpanded && (
                <motion.div
                  key="content"
                  initial="collapsed"
                  animate="open"
                  exit="collapsed"
                  variants={{
                    open: { opacity: 1, height: "auto" },
                    collapsed: { opacity: 0, height: 0 }
                  }}
                  transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                >
                  <div className="flex flex-wrap gap-2 px-6 py-4">
                    {allTags.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <motion.button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1 text-xs uppercase font-label-bold border-2 border-outline transition-all cursor-none ${
                            isSelected
                              ? "bg-[var(--color-on-background)] text-[var(--color-background)] shadow-[2px_2px_0px_0px_var(--shadow-color)] translate-x-[1px] translate-y-[1px]"
                              : "bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:shadow-none hover:translate-y-0.5 hover:translate-x-0.5 hover:bg-[var(--color-primary-container)] hover:text-[var(--color-on-primary-container)]"
                          }`}
                          whileTap={{ scale: 0.96 }}
                        >
                          {tag}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </header>

        {/* Grid */}
        <AnimatePresence mode="popLayout">
          {filteredProjects.length > 0 ? (
            <motion.div
              layout
              key={activeFilter + searchTerm + selectedTags.join("-")}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpenModal={setSelectedProject}
                  index={index}
                  isHighlighted={highlightedId === project.id}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="bg-[var(--color-surface)] border-4 border-outline shadow-[8px_8px_0px_0px_var(--shadow-color)] p-12 text-center flex flex-col items-center gap-4 w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <FaSearch className="text-5xl text-[var(--color-on-surface)]" />
              </motion.div>
              <h3 className="font-headline-md text-3xl uppercase text-[var(--color-on-surface)]">No projects found</h3>
              <p className="font-body-md text-lg text-[var(--color-text-muted)]">Try adjusting your search terms or filters.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            onSkillClick={(skillId) => { setSelectedProject(null); navigate(`/skills?skill=${encodeURIComponent(skillId)}`); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Project Card ───────────────────────────────────────────────

const ProjectCard = memo(function ProjectCard({ project, onOpenModal, index, isHighlighted }) {
  const isFeatured = project.featured || false;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ type: "spring", stiffness: 260, damping: 22, delay: (index % 3) * 0.06 }}
      className="w-full h-full"
    >
      <motion.article
        className={`bg-[var(--color-surface)] border-4 border-outline hover:border-secondary transition-[border-color] duration-300 shadow-[8px_8px_0px_0px_var(--shadow-color)] flex flex-col cursor-none relative overflow-hidden h-full ${
          isHighlighted ? "ring-4 ring-[var(--color-primary-container)] ring-offset-2" : ""
        }`}
        onClick={() => onOpenModal(project)}
        whileHover={{
          y: -6,
          x: -6,
          boxShadow: "16px 16px 0px 0px var(--shadow-color)",
          transition: { type: "spring", stiffness: 300, damping: 20 },
        }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Image */}
        <div className="h-48 md:h-56 border-b-4 border-outline bg-[var(--color-surface-variant)] overflow-hidden relative">
          <motion.img
            src={getAssetPath(project.image)}
            alt={project.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover pointer-events-none"
            initial={{ scale: 1, filter: "grayscale(100%)" }}
            whileHover={{ scale: 1.05, filter: "grayscale(0%)" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
          {isFeatured && (
            <motion.div
              className="absolute top-3 right-3 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-4 border-outline px-3 py-1 font-label-bold text-xs uppercase shadow-[2px_2px_0px_0px_var(--shadow-color)]"
              animate={{ rotate: [3, -3, 3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              Featured
            </motion.div>
          )}
          {/* Diagonal clip reveal on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[var(--color-primary-container)] opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" />
        </div>

        {/* Content */}
        <div className="p-6 md:p-7 flex flex-col grow">
          <h2 className="font-headline-md text-xl md:text-2xl text-[var(--color-on-surface)] mb-3 uppercase">
            {project.title}
          </h2>
          <p
            className="font-body-md text-sm text-[var(--color-text-muted)] mb-5 whitespace-normal"
            style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
          >
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="bg-[var(--color-on-background)] text-[var(--color-background)] border-2 border-outline px-2 py-1 font-label-bold text-xs uppercase"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] border-2 border-outline px-2 py-1 font-label-bold text-xs uppercase">
                +{project.tags.length - 3}
              </span>
            )}
          </div>

          <div
            className="flex gap-3 border-t-4 border-outline pt-5 mt-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {project.links?.preview && (
              <a
                href={project.links.preview}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-4 border-outline text-center py-2 md:py-3 font-label-bold text-sm uppercase shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex justify-center items-center gap-2 cursor-none"
              >
                <FaEye /> Live
              </a>
            )}
            {project.links?.github && (
              <a
                href={project.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[var(--color-surface)] text-[var(--color-on-surface)] border-4 border-outline text-center py-2 md:py-3 font-label-bold text-sm uppercase shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:bg-[var(--color-surface-variant)] transition-all flex justify-center items-center gap-2 cursor-none"
              >
                <FaGithub /> Source
              </a>
            )}
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
});

// ── Project Modal ──────────────────────────────────────────────

const ProjectModal = memo(function ProjectModal({ project, onClose, onSkillClick }) {
  const projectSkills = getSkillsForProject(project.id);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <motion.div
        className="absolute inset-0 backdrop-blur-md"
        style={{ background: "color-mix(in srgb, var(--color-background) 85%, transparent)" }}
        variants={modalBackdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
      />
      <motion.div
        className="bg-[var(--color-surface)] border-8 border-outline shadow-[24px_24px_0px_0px_var(--shadow-color)] w-full max-w-5xl max-h-[90vh] overflow-y-auto relative z-10 flex flex-col no-scrollbar"
        variants={modalContentVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Close Button exactly at top right */}
        <div className="sticky top-0 z-50 w-full flex justify-end h-0 pointer-events-none">
          <button
            className="pointer-events-auto bg-[var(--color-surface)] text-[var(--color-on-surface)] border-l-4 border-b-4 border-outline w-12 md:w-14 h-12 md:h-14 flex items-center justify-center text-xl hover:bg-[var(--color-primary)] hover:text-[var(--color-on-primary)] transition-colors cursor-none"
            onClick={onClose}
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>

        {/* Hero Image Without Gradient */}
        <div className="h-56 md:h-80 border-b-8 border-outline relative overflow-hidden bg-[var(--color-surface-variant)]">
          <motion.img
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            src={getAssetPath(project.image)}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-4 sm:p-6 md:p-10 flex flex-col gap-6 md:gap-8 bg-hatch overflow-x-hidden">
          {/* Main Header Card */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-[var(--color-surface)] border-4 border-outline p-5 sm:p-6 md:p-8 shadow-[4px_4px_0px_0px_var(--shadow-color)] md:shadow-[8px_8px_0px_0px_var(--shadow-color)] -mt-12 sm:-mt-16 md:-mt-24 z-10 relative">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="bg-[var(--color-on-background)] text-[var(--color-background)] font-label-bold px-3 py-1 border-2 border-outline uppercase shadow-[2px_2px_0px_0px_var(--shadow-accent)]">
                  {project.year}
                </span>
                {project.category && (
                  <span className="bg-[var(--color-secondary)] text-[var(--color-on-secondary)] font-label-bold px-3 py-1 border-2 border-outline uppercase shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                    {project.category}
                  </span>
                )}
              </div>
              <h2 className="font-headline-xl text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase leading-none tracking-tighter text-[var(--color-on-surface)] break-words w-full" style={{ wordBreak: 'break-word' }}>
                {project.title}
              </h2>
            </div>
            
            <div className="flex gap-4 w-full lg:w-auto">
              {project.links?.preview && (
                <a
                  href={project.links.preview}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 lg:flex-none bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-4 border-outline px-6 py-3 font-headline-md uppercase flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-none"
                >
                  Live <FaEye />
                </a>
              )}
              {project.links?.github && (
                <a
                  href={project.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 lg:flex-none bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] border-4 border-outline px-6 py-3 font-headline-md uppercase flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-none"
                >
                  Source <FaGithub />
                </a>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-3">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="bg-[var(--color-surface)] text-[var(--color-on-surface)] border-2 border-outline px-4 py-1.5 font-label-bold text-sm uppercase shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:-translate-y-1 hover:shadow-[2px_4px_0px_0px_var(--shadow-color)] transition-transform"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Description */}
            <div className="lg:col-span-2 bg-[var(--color-surface)] border-4 border-outline p-6 md:p-8 shadow-[8px_8px_0px_0px_var(--shadow-color)]">
              <h3 className="font-headline-md text-2xl uppercase border-b-4 border-outline pb-3 mb-6 text-[var(--color-on-surface)] inline-block">
                Overview
              </h3>
              <p className="font-body-lg text-lg md:text-xl leading-relaxed text-[var(--color-on-surface)] whitespace-pre-wrap">
                {project.description}
              </p>
            </div>

            {/* Skills */}
            {projectSkills.length > 0 && (
              <div className="bg-[var(--color-surface)] border-4 border-outline p-6 shadow-[8px_8px_0px_0px_var(--shadow-color)] sticky top-6">
                <h3 className="font-headline-md text-xl uppercase border-b-4 border-outline pb-3 mb-6 text-[var(--color-on-surface)]">
                  Tech Stack
                </h3>
                <div className="flex flex-col gap-3">
                  {projectSkills.map((skill) => (
                    <motion.button
                      key={skill.id}
                      onClick={() => onSkillClick(skill.id)}
                      className="bg-[var(--color-surface-variant)] border-2 border-outline px-4 py-2 font-label-bold text-sm uppercase flex items-center justify-between hover:bg-[var(--color-on-background)] hover:text-[var(--color-background)] transition-colors shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none group cursor-none w-full"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-headline-md opacity-70 group-hover:opacity-100 transition-opacity">
                          {skill.level}%
                        </span>
                        <span>{skill.name}</span>
                      </div>
                      <FaArrowRight className="text-[12px] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
});

export default Projects;

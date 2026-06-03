import { useState, useMemo, useEffect, useCallback, useRef, memo } from "react";
import { createPortal } from "react-dom";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { FaSearch, FaTimes, FaEye, FaGithub, FaArrowRight } from "react-icons/fa";
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
        <header className="mb-4 border-b-8 border-[var(--color-outline)] pb-8 flex flex-col justify-end items-start gap-8 mt-4 relative bg-hatch p-4 md:p-6 shadow-[4px_4px_0px_0px_var(--shadow-color)]">
          <motion.div
            className="flex items-center gap-4 flex-wrap"
            variants={cardVariants}
          >
            <div className="bg-[var(--color-primary-container)] border-4 border-[var(--color-outline)] px-6 py-4 shadow-[8px_8px_0px_0px_var(--shadow-color)] relative overflow-hidden">
              <h1 className="font-headline-xl text-5xl md:text-7xl lg:text-headline-xl text-[var(--color-on-primary-container)] uppercase tracking-tighter">
                PROJECTS
              </h1>
            </div>
            <span
              className="font-headline-md text-3xl border-4 border-[var(--color-outline)] px-5 py-4 shadow-[8px_8px_0px_0px_var(--shadow-color)] bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]"
            >
              {filteredProjects.length}
            </span>
          </motion.div>

          <motion.p
            className="font-body-lg text-base md:text-lg lg:text-body-lg text-[var(--color-on-surface)] mt-4 max-w-2xl bg-[var(--color-surface)] border-4 border-[var(--color-outline)] p-4 shadow-[4px_4px_0px_0px_var(--shadow-color)]"
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
            <div className="flex items-center bg-[var(--color-surface)] border-4 border-[var(--color-outline)] p-2 w-full xl:w-80 shadow-[4px_4px_0px_0px_var(--shadow-color)] focus-within:shadow-[4px_4px_0px_0px_var(--shadow-accent)] transition-all">
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
                    className={`border-4 border-[var(--color-outline)] px-4 py-2 font-label-bold text-sm md:text-base uppercase transition-all cursor-none ${
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
            className="w-full bg-hatch border-4 border-[var(--color-outline)] p-6 shadow-[4px_4px_0px_0px_var(--shadow-color)] flex flex-col gap-3 overflow-hidden"
            variants={cardVariants}
          >
            <div className="flex justify-between items-center bg-[var(--color-surface)] px-6 py-4 -mx-6 -mt-6 border-b-4 border-[var(--color-outline)] mb-2">
              <span className="font-label-bold text-sm uppercase tracking-wider text-[var(--color-on-surface)]">Filter by Tech Stack:</span>
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-xs uppercase font-label-bold text-red-500 hover:underline cursor-none"
                >
                  Clear ({selectedTags.length})
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <motion.button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 text-xs uppercase font-label-bold border-2 border-[var(--color-outline)] transition-all cursor-none ${
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
              className="bg-[var(--color-surface)] border-4 border-[var(--color-outline)] shadow-[8px_8px_0px_0px_var(--shadow-color)] p-12 text-center flex flex-col items-center gap-4 w-full"
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
        className={`bg-[var(--color-surface)] border-4 border-[var(--color-outline)] hover:border-[var(--color-secondary)] transition-[border-color] duration-300 shadow-[8px_8px_0px_0px_var(--shadow-color)] flex flex-col cursor-none relative overflow-hidden h-full ${
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
        <div className="h-48 md:h-56 border-b-4 border-[var(--color-outline)] bg-[var(--color-surface-variant)] overflow-hidden relative">
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
              className="absolute top-3 right-3 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-4 border-[var(--color-outline)] px-3 py-1 font-label-bold text-xs uppercase shadow-[2px_2px_0px_0px_var(--shadow-color)]"
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
                className="bg-[var(--color-on-background)] text-[var(--color-background)] border-2 border-[var(--color-outline)] px-2 py-1 font-label-bold text-xs uppercase"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] border-2 border-[var(--color-outline)] px-2 py-1 font-label-bold text-xs uppercase">
                +{project.tags.length - 3}
              </span>
            )}
          </div>

          <div
            className="flex gap-3 border-t-4 border-[var(--color-outline)] pt-5 mt-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {project.links?.preview && (
              <a
                href={project.links.preview}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-4 border-[var(--color-outline)] text-center py-2 md:py-3 font-label-bold text-sm uppercase shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex justify-center items-center gap-2 cursor-none"
              >
                <FaEye /> Live
              </a>
            )}
            {project.links?.github && (
              <a
                href={project.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[var(--color-surface)] text-[var(--color-on-surface)] border-4 border-[var(--color-outline)] text-center py-2 md:py-3 font-label-bold text-sm uppercase shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:bg-[var(--color-surface-variant)] transition-all flex justify-center items-center gap-2 cursor-none"
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
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: "color-mix(in srgb, var(--color-background) 75%, transparent)" }}
        variants={modalBackdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
      />
      <motion.div
        className="bg-[var(--color-surface)] border-8 border-[var(--color-outline)] shadow-[16px_16px_0px_0px_var(--shadow-color)] w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10 flex flex-col"
        variants={modalContentVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 z-20 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-4 border-[var(--color-outline)] w-12 h-12 flex items-center justify-center text-xl hover:bg-[var(--color-on-background)] hover:text-[var(--color-background)] transition-colors shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none cursor-none"
          onClick={onClose}
          aria-label="Close modal"
        >
          <FaTimes />
        </button>

        <div className="h-48 md:h-80 border-b-8 border-[var(--color-outline)] relative overflow-hidden">
          <img
            src={getAssetPath(project.image)}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          {/* Overlay gradient */}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, var(--color-surface) 0%, transparent 40%)" }}
          />
        </div>

        <div className="p-6 md:p-10 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-4 border-[var(--color-outline)] pb-6">
            <div>
              <span className="bg-[var(--color-on-background)] text-[var(--color-background)] font-label-bold px-3 py-1 border-2 border-[var(--color-outline)] mb-2 inline-block shadow-[2px_2px_0px_0px_var(--shadow-accent)]">
                {project.year}
              </span>
              <h2 className="font-headline-xl text-4xl md:text-5xl uppercase leading-tight text-[var(--color-on-surface)]">
                {project.title}
              </h2>
            </div>
            <div className="flex gap-4">
              {project.links?.preview && (
                <a
                  href={project.links.preview}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-4 border-[var(--color-outline)] p-3 text-xl shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-none"
                >
                  <FaEye />
                </a>
              )}
              {project.links?.github && (
                <a
                  href={project.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] border-4 border-[var(--color-outline)] p-3 text-xl shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-none"
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
                className="bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] border-2 border-[var(--color-outline)] px-3 py-1 font-label-bold text-sm uppercase shadow-[2px_2px_0px_0px_var(--shadow-color)]"
              >
                {tag}
              </span>
            ))}
          </div>

          <p
            className="font-body-lg text-lg border-4 border-[var(--color-outline)] border-dashed p-6 text-[var(--color-on-surface)]"
            style={{ background: "var(--color-surface-variant)" }}
          >
            {project.description}
          </p>

          {projectSkills.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="font-headline-md text-2xl uppercase border-b-2 border-[var(--color-outline)] pb-2 w-fit text-[var(--color-on-surface)]">
                Skills & Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {projectSkills.map((skill) => (
                  <motion.button
                    key={skill.id}
                    onClick={() => onSkillClick(skill.id)}
                    className="bg-[var(--color-surface)] border-2 border-[var(--color-outline)] px-3 py-1.5 font-label-bold text-xs uppercase flex items-center gap-2 hover:bg-[var(--color-primary-container)] hover:text-[var(--color-on-primary-container)] transition-colors shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_var(--shadow-color)] group cursor-none text-[var(--color-on-surface)]"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="font-headline-md">{skill.level}%</span>
                    {skill.name}
                    <FaArrowRight className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body,
  );
});

export default Projects;

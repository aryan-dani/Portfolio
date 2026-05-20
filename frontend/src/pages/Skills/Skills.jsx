import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaTimes, FaExternalLinkAlt, FaEye, FaGithub, FaArrowRight } from "react-icons/fa";
import {
  FaHtml5,
  FaCss3Alt,
  FaSass,
  FaJs,
  FaReact,
  FaAngular,
  FaNodeJs,
  FaPython,
  FaServer,
  FaChartLine,
  FaBrain,
  FaRobot,
  FaEye as FaEyeIcon,
  FaGitAlt,
} from "react-icons/fa";
import {
  SiTypescript,
  SiExpress,
  SiMongodb,
  SiTensorflow,
  SiPytorch,
  SiScikitlearn,
  SiNextdotjs,
  SiTailwindcss,
  SiFastapi,
  SiFlask,
  SiSupabase,
  SiOpencv,
  SiDocker,
  SiVite,
  SiFirebase,
  SiVercel,
} from "react-icons/si";
import { skills, skillCategories, getSkillById, getSkillCategory, getSkillCategoryId } from "../../data/skills";
import { getProjectById, getProjectsForSkill } from "../../data/projects";
import { getAssetPath } from "../../utils/paths";

const iconMap = {
  FaHtml5,
  FaCss3Alt,
  FaSass,
  FaJs,
  FaReact,
  FaAngular,
  FaNodeJs,
  FaPython,
  FaServer,
  FaChartLine,
  FaBrain,
  FaRobot,
  FaEye: FaEyeIcon,
  FaGitAlt,
  SiTypescript,
  SiExpress,
  SiMongodb,
  SiTensorflow,
  SiPytorch,
  SiScikitlearn,
  SiNextdotjs,
  SiTailwindcss,
  SiFastapi,
  SiFlask,
  SiSupabase,
  SiOpencv,
  SiDocker,
  SiVite,
  SiFirebase,
  SiVercel,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

// Proficiency label helper
function getProficiencyLabel(level) {
  if (level >= 85) return "Expert";
  if (level >= 70) return "Advanced";
  if (level >= 55) return "Intermediate";
  return "Learning";
}

// Color for level
function getLevelColor(level) {
  if (level >= 85) return "bg-primary-container";
  if (level >= 70) return "bg-black";
  if (level >= 55) return "bg-secondary";
  return "bg-surface-variant";
}

function getLevelTextColor(level) {
  if (level >= 85) return "text-black";
  if (level >= 70) return "text-white";
  if (level >= 55) return "text-white";
  return "text-black";
}

// View options
const VIEW_MODES = {
  GRID: "grid",
  LIST: "list",
};

// Sort options
const SORT_OPTIONS = [
  { id: "default", label: "Default" },
  { id: "level-desc", label: "Highest" },
  { id: "level-asc", label: "Lowest" },
  { id: "name-asc", label: "A → Z" },
  { id: "projects-desc", label: "Most Used" },
];

function Skills() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [viewMode, setViewMode] = useState(VIEW_MODES.LIST);
  const [sortBy, setSortBy] = useState("default");
  const navigate = useNavigate();

  // Handle URL param to auto-open a skill modal
  useEffect(() => {
    const skillParam = searchParams.get("skill");
    if (skillParam) {
      const skill = getSkillById(skillParam);
      if (skill) {
        setSelectedSkill(skill);
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    document.body.style.overflow = selectedSkill ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedSkill]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setSelectedSkill(null);
    };
    if (selectedSkill) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [selectedSkill]);

  const filteredAndSorted = useMemo(() => {
    const result = {};
    Object.entries(skills).forEach(([category, categorySkills]) => {
      if (activeCategory === "all" || activeCategory === category) {
        let filtered = categorySkills.filter(
          (skill) =>
            searchTerm === "" ||
            skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            skill.description.toLowerCase().includes(searchTerm.toLowerCase()),
        );

        // Sort
        if (sortBy === "level-desc") {
          filtered = [...filtered].sort((a, b) => b.level - a.level);
        } else if (sortBy === "level-asc") {
          filtered = [...filtered].sort((a, b) => a.level - b.level);
        } else if (sortBy === "name-asc") {
          filtered = [...filtered].sort((a, b) =>
            a.name.localeCompare(b.name),
          );
        } else if (sortBy === "projects-desc") {
          filtered = [...filtered].sort((a, b) =>
            (b.projectIds?.length || 0) - (a.projectIds?.length || 0),
          );
        }

        if (filtered.length > 0) {
          result[category] = filtered;
        }
      }
    });
    return result;
  }, [searchTerm, activeCategory, sortBy]);

  // Flat list for views
  const flatSkills = useMemo(() => {
    const all = [];
    Object.entries(filteredAndSorted).forEach(
      ([category, categorySkills]) => {
        const categoryLabel =
          skillCategories.find((c) => c.id === category)?.label || category;
        categorySkills.forEach((skill) => {
          all.push({ ...skill, category: categoryLabel, categoryId: category });
        });
      },
    );
    return all;
  }, [filteredAndSorted]);

  // Stats
  const totalSkills = useMemo(() => {
    return Object.values(skills).reduce((sum, cat) => sum + cat.length, 0);
  }, []);

  const avgLevel = useMemo(() => {
    const all = Object.values(skills).flat();
    if (all.length === 0) return 0;
    return Math.round(all.reduce((sum, s) => sum + s.level, 0) / all.length);
  }, []);

  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName] || FaServer;
    return <IconComponent />;
  };

  return (
    <motion.div
      className="flex flex-col gap-12 md:gap-16"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* ── Header ── */}
      <header className="mb-4 border-b-8 border-black pb-8 mt-4">
        <motion.h1
          className="font-headline-xl text-5xl md:text-7xl lg:text-headline-xl text-black uppercase tracking-tighter"
          variants={cardVariants}
        >
          SKILLS & TOOLS
        </motion.h1>
        <motion.p
          className="font-body-lg text-base md:text-lg lg:text-body-lg text-black mt-6 max-w-2xl bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          variants={cardVariants}
        >
          A chaotic sticker sheet of the technologies I use to build loud,
          unapologetic digital experiences. Function over form, but make it look
          cool.
        </motion.p>
      </header>

      {/* ── Stats Bar ── */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        variants={cardVariants}
      >
        <div className="bg-primary-container border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
          <div className="font-headline-xl text-4xl md:text-5xl">{totalSkills}</div>
          <div className="font-label-bold text-sm uppercase mt-1">Total Skills</div>
        </div>
        <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
          <div className="font-headline-xl text-4xl md:text-5xl">{Object.keys(skills).length}</div>
          <div className="font-label-bold text-sm uppercase mt-1">Categories</div>
        </div>
        <div className="bg-black text-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(240,255,0,1)] text-center">
          <div className="font-headline-xl text-4xl md:text-5xl">{avgLevel}%</div>
          <div className="font-label-bold text-sm uppercase mt-1">Avg Level</div>
        </div>
        <div className="bg-secondary text-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
          <div className="font-headline-xl text-4xl md:text-5xl">
            {Object.values(skills).flat().filter((s) => s.level >= 80).length}
          </div>
          <div className="font-label-bold text-sm uppercase mt-1">Expert Level</div>
        </div>
      </motion.div>

      {/* ── Controls ── */}
      <motion.div
        className="flex flex-col gap-6"
        variants={cardVariants}
      >
        {/* Search + View Mode */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center bg-white neo-border p-2 w-full md:w-96 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <FaSearch className="text-xl ml-2 mr-3" />
            <input
              type="text"
              placeholder="Search skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none w-full font-body-md text-lg"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mr-2 p-1 hover:bg-primary-container border-2 border-transparent hover:border-black transition-all"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setViewMode(VIEW_MODES.GRID)}
              className={`px-4 py-2 border-4 border-black font-label-bold uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none ${
                viewMode === VIEW_MODES.GRID ? "bg-primary-container" : "bg-white"
              }`}
              title="Grid View"
            >
              ▦ Grid
            </button>
            <button
              onClick={() => setViewMode(VIEW_MODES.LIST)}
              className={`px-4 py-2 border-4 border-black font-label-bold uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none ${
                viewMode === VIEW_MODES.LIST ? "bg-primary-container" : "bg-white"
              }`}
              title="List View"
            >
              ☰ List
            </button>
          </div>
        </div>

        {/* Category Filters + Sort */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-wrap gap-3">
            {skillCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2 border-4 border-black font-label-bold uppercase text-sm md:text-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none ${
                  activeCategory === cat.id
                    ? "bg-primary-container"
                    : "bg-white hover:bg-surface-variant"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-label-bold text-sm uppercase">Sort:</span>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSortBy(opt.id)}
                  className={`px-3 py-1 border-2 border-black font-label-bold text-xs uppercase transition-all hover:bg-surface-variant ${
                    sortBy === opt.id ? "bg-black text-white" : "bg-white"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Content ── */}
      <AnimatePresence mode="wait">
        {viewMode === VIEW_MODES.LIST ? (
          <motion.div
            key="list-view"
            className="flex flex-col gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {flatSkills.length > 0 ? (
              flatSkills.map((skill) => (
                <SkillListItem
                  key={skill.id}
                  skill={skill}
                  icon={getIcon(skill.icon)}
                  onClick={() => setSelectedSkill(skill)}
                  levelColor={getLevelColor(skill.level)}
                  levelTextColor={getLevelTextColor(skill.level)}
                />
              ))
            ) : (
              <EmptyState />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="grid-view"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {flatSkills.length > 0 ? (
              flatSkills.map((skill) => (
                <SkillGridCard
                  key={skill.id}
                  skill={skill}
                  icon={getIcon(skill.icon)}
                  onClick={() => setSelectedSkill(skill)}
                  levelColor={getLevelColor(skill.level)}
                  levelTextColor={getLevelTextColor(skill.level)}
                />
              ))
            ) : (
              <EmptyState />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Skill Levels Overview ── */}
      <motion.section
        className="bg-white border-4 border-black p-8 md:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        variants={cardVariants}
      >
        <h2 className="font-headline-md text-3xl md:text-4xl uppercase border-b-4 border-black pb-4 mb-8">
          Skill Levels
        </h2>
        <div className="flex flex-col gap-6">
          {[
            { label: "Frontend Dev", level: 82, color: "bg-primary-container" },
            { label: "Backend Dev", level: 72, color: "bg-secondary" },
            { label: "AI & Machine Learning", level: 78, color: "bg-black" },
            { label: "Agentic AI & LLMs", level: 86, color: "bg-primary-container" },
            { label: "DevOps & Cloud", level: 68, color: "bg-surface-variant" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-label-bold uppercase text-sm md:text-base">
                  {item.label}
                </span>
                <span className="font-headline-md text-lg md:text-xl">{item.level}%</span>
              </div>
              <div className="h-6 md:h-8 w-full border-4 border-black bg-surface-variant overflow-hidden">
                <motion.div
                  className={`h-full ${item.color}`}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${item.level}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── Modal ── */}
      <AnimatePresence>
        {selectedSkill && (
          <SkillModal
            skill={selectedSkill}
            icon={getIcon(selectedSkill.icon)}
            onClose={() => setSelectedSkill(null)}
            onProjectClick={(projectId) => {
              setSelectedSkill(null);
              navigate(`/projects?highlight=${projectId}`);
            }}
            iconMap={iconMap}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── List Item ──────────────────────────────────────────────────────────────

function SkillListItem({ skill, icon, onClick, levelColor, levelTextColor }) {
  const projectCount = skill.projectIds?.length || 0;

  return (
    <motion.button
      className="w-full text-left bg-white border-2 border-black p-3 md:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer group"
      variants={cardVariants}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {/* Icon + Name */}
        <div className="flex items-center gap-3 w-48 md:w-56 shrink-0">
          <div className="text-xl bg-black text-primary-container p-2 border-2 border-black group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <div className="min-w-0">
            <h3 className="font-headline-md text-base md:text-lg uppercase truncate">
              {skill.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="font-label-bold text-[10px] uppercase text-secondary">
                {skill.category}
              </span>
              {projectCount > 0 && (
                <span className="font-label-bold text-[10px] uppercase bg-surface-variant border border-black px-1">
                  {projectCount} {projectCount === 1 ? "project" : "projects"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="hidden sm:flex flex-1 items-center gap-4">
          <div className="flex-1 h-3 border-2 border-black bg-surface-variant overflow-hidden">
            <motion.div
              className={`h-full ${levelColor}`}
              initial={{ width: 0 }}
              animate={{ width: `${skill.level}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <span className="font-headline-md text-sm md:text-base w-10 text-right">
            {skill.level}%
          </span>
        </div>

        {/* Badge */}
        <div
          className={`${levelColor} ${levelTextColor} border-2 border-black px-2 py-0.5 font-label-bold text-[10px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0 ml-auto`}
        >
          {getProficiencyLabel(skill.level)}
        </div>

        {/* Click indicator */}
        <span className="hidden md:block text-base font-black group-hover:translate-x-1 transition-transform">
          →
        </span>
      </div>
    </motion.button>
  );
}

// ── Grid Card ──────────────────────────────────────────────────────────────

function SkillGridCard({ skill, icon, onClick, levelColor, levelTextColor }) {
  const projectCount = skill.projectIds?.length || 0;

  return (
    <motion.button
      className="w-full text-left bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer group flex flex-col gap-3"
      variants={cardVariants}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-xl bg-black text-primary-container p-2 border-2 border-black group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <div>
            <h3 className="font-headline-md text-base md:text-lg uppercase">
              {skill.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="font-label-bold text-[10px] uppercase text-secondary">
                {skill.category}
              </span>
              {projectCount > 0 && (
                <span className="font-label-bold text-[10px] uppercase bg-surface-variant border border-black px-1">
                  {projectCount}
                </span>
              )}
            </div>
          </div>
        </div>
        <div
          className={`${levelColor} ${levelTextColor} border-2 border-black px-2 py-0.5 font-label-bold text-[10px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
        >
          {getProficiencyLabel(skill.level)}
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-3 border-2 border-black bg-surface-variant overflow-hidden">
          <motion.div
            className={`h-full ${levelColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${skill.level}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        <span className="font-headline-md text-sm w-8 text-right">
          {skill.level}%
        </span>
      </div>

      {/* Description preview */}
      <p className="font-body-md text-xs text-on-surface-variant overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {skill.description}
      </p>

      {/* Click hint */}
      <div className="flex items-center gap-2 font-label-bold text-[10px] uppercase text-secondary opacity-0 group-hover:opacity-100 transition-opacity mt-auto pt-2 border-t-2 border-dashed border-black">
        <FaExternalLinkAlt className="text-[10px]" />
        Click for details
      </div>
    </motion.button>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="col-span-full bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
      <FaSearch className="text-3xl mx-auto mb-3" />
      <h3 className="font-headline-md text-xl uppercase">No skills found</h3>
      <p className="font-body-md text-sm mt-2">
        Try a different search term or category.
      </p>
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────

function SkillModal({ skill, icon, onClose, onProjectClick, iconMap }) {
  const category = getSkillCategory(skill.id);
  const relatedProjects = getProjectsForSkill(skill.id);

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full p-6 md:p-8 relative z-10 flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-primary-container border-2 border-black w-10 h-10 flex items-center justify-center text-black text-xl hover:bg-black hover:text-primary-container transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
        >
          <FaTimes />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 border-b-2 border-black pb-4">
          <div className="text-3xl bg-black text-white p-3 border-2 border-black shadow-[3px_3px_0px_0px_rgba(240,255,0,1)]">
            {icon}
          </div>
          <div className="min-w-0">
            <h2 className="font-headline-xl text-2xl md:text-3xl uppercase truncate">
              {skill.name}
            </h2>
            <span className="font-label-bold bg-secondary text-white px-2 py-0.5 text-xs border-2 border-black inline-block mt-1">
              {category}
            </span>
          </div>
        </div>

        {/* Proficiency */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between font-label-bold uppercase text-sm">
            <span>Proficiency</span>
            <span>{skill.level}% — {getProficiencyLabel(skill.level)}</span>
          </div>
          <div className="h-6 w-full border-2 border-black bg-surface-variant flex">
            <motion.div
              className="h-full bg-primary-container border-r-2 border-black"
              initial={{ width: 0 }}
              animate={{ width: `${skill.level}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Description */}
        <p className="font-body-md text-base bg-surface-variant p-4 border-2 border-black border-dashed">
          {skill.description}
        </p>

        {/* Projects */}
        {relatedProjects.length > 0 && (
          <div className="flex flex-col gap-4 mt-1">
            <h4 className="font-headline-md text-xl uppercase border-b-2 border-black inline-block w-fit pb-1">
              Used in {relatedProjects.length} {relatedProjects.length === 1 ? "Project" : "Projects"}
            </h4>
            <div className="flex flex-col gap-3">
              {relatedProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => onProjectClick(project.id)}
                  className="bg-white border-2 border-black p-3 flex items-center gap-4 hover:bg-surface-variant transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] group text-left w-full"
                >
                  <div className="w-14 h-14 border-2 border-black overflow-hidden shrink-0 bg-surface-variant">
                    <img
                      src={getAssetPath(project.image)}
                      alt={project.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-headline-md text-sm uppercase truncate">
                      {project.title}
                    </h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-label-bold text-[10px] text-secondary uppercase">
                        {project.year}
                      </span>
                      <span className="font-label-bold text-[10px] bg-black text-white px-1">
                        {project.category === "web-dev" ? "Web Dev" : "AI & ML"}
                      </span>
                    </div>
                  </div>
                  <FaArrowRight className="text-sm shrink-0 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>,
    document.body,
  );
}

export default Skills;

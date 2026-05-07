import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaTimes, FaExternalLinkAlt } from "react-icons/fa";
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
  FaEye,
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
} from "react-icons/si";
import { skills, skillCategories } from "../../data/skills";

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
  FaEye,
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
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
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
];

function Skills() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [viewMode, setViewMode] = useState(VIEW_MODES.LIST);
  const [sortBy, setSortBy] = useState("default");
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = selectedSkill ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
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
        }

        if (filtered.length > 0) {
          result[category] = filtered;
        }
      }
    });
    return result;
  }, [searchTerm, activeCategory, sortBy]);

  // Flat list for list view
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
                  key={skill.name}
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
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {flatSkills.length > 0 ? (
              flatSkills.map((skill) => (
                <SkillGridCard
                  key={skill.name}
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
            { label: "Frontend Dev", level: 90, color: "bg-primary-container" },
            { label: "Backend Dev", level: 75, color: "bg-secondary" },
            { label: "AI & Machine Learning", level: 80, color: "bg-black" },
            { label: "UI/UX Design", level: 65, color: "bg-surface-variant" },
            { label: "DevOps & Cloud", level: 60, color: "bg-primary-container" },
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
            onProjectClick={(projectName) => {
              setSelectedSkill(null);
              navigate(`/projects?search=${encodeURIComponent(projectName)}`);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── List Item ──────────────────────────────────────────────────────────────

function SkillListItem({ skill, icon, onClick, levelColor, levelTextColor }) {
  return (
    <motion.button
      className="w-full text-left bg-white border-4 border-black p-4 md:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer group"
      variants={cardVariants}
      onClick={onClick}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Icon + Name */}
        <div className="flex items-center gap-4 md:w-64 shrink-0">
          <div className="text-2xl bg-black text-primary-container p-2 border-2 border-black group-hover:rotate-6 transition-transform">
            {icon}
          </div>
          <div>
            <h3 className="font-headline-md text-lg md:text-xl uppercase">
              {skill.name}
            </h3>
            <span className="font-label-bold text-xs uppercase text-secondary">
              {skill.category}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex-1 flex items-center gap-4">
          <div className="flex-1 h-5 md:h-6 border-3 border-black bg-surface-variant overflow-hidden">
            <motion.div
              className={`h-full ${levelColor}`}
              initial={{ width: 0 }}
              whileInView={{ width: `${skill.level}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <span className="font-headline-md text-lg md:text-xl w-14 text-right">
            {skill.level}%
          </span>
        </div>

        {/* Badge */}
        <div
          className={`${levelColor} ${levelTextColor} border-2 border-black px-3 py-1 font-label-bold text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0`}
        >
          {getProficiencyLabel(skill.level)}
        </div>

        {/* Click indicator */}
        <span className="hidden md:block text-lg font-black group-hover:translate-x-1 transition-transform">
          →
        </span>
      </div>
    </motion.button>
  );
}

// ── Grid Card ──────────────────────────────────────────────────────────────

function SkillGridCard({ skill, icon, onClick, levelColor, levelTextColor }) {
  return (
    <motion.button
      className="w-full text-left bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer group flex flex-col gap-4"
      variants={cardVariants}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl bg-black text-primary-container p-3 border-2 border-black group-hover:rotate-12 transition-transform">
            {icon}
          </div>
          <div>
            <h3 className="font-headline-md text-xl uppercase">
              {skill.name}
            </h3>
            <span className="font-label-bold text-xs uppercase text-secondary">
              {skill.category}
            </span>
          </div>
        </div>
        <div
          className={`${levelColor} ${levelTextColor} border-2 border-black px-2 py-1 font-label-bold text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
        >
          {getProficiencyLabel(skill.level)}
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-4 border-2 border-black bg-surface-variant overflow-hidden">
          <motion.div
            className={`h-full ${levelColor}`}
            initial={{ width: 0 }}
            whileInView={{ width: `${skill.level}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <span className="font-headline-md text-base w-12 text-right">
          {skill.level}%
        </span>
      </div>

      {/* Description preview */}
      <p className="font-body-md text-sm text-on-surface-variant overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {skill.description}
      </p>

      {/* Click hint */}
      <div className="flex items-center gap-2 font-label-bold text-xs uppercase text-secondary opacity-0 group-hover:opacity-100 transition-opacity mt-auto pt-2 border-t-2 border-dashed border-black">
        <FaExternalLinkAlt className="text-xs" />
        Click to view details & projects
      </div>
    </motion.button>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="col-span-full bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
      <FaSearch className="text-4xl mx-auto mb-4" />
      <h3 className="font-headline-md text-2xl uppercase">No skills found</h3>
      <p className="font-body-md mt-4">
        Try a different search term or category.
      </p>
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────

function SkillModal({ skill, icon, onClose, onProjectClick }) {
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
        className="bg-white border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full p-8 relative z-10 flex flex-col gap-6 max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
      >
        <button
          onClick={onClose}
          className="absolute -top-6 -right-6 bg-primary-container border-4 border-black w-12 h-12 flex items-center justify-center text-black text-2xl hover:bg-black hover:text-primary-container transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
        >
          <FaTimes />
        </button>

        <div className="flex items-center gap-4 border-b-4 border-black pb-4">
          <div className="text-4xl bg-black text-white p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(240,255,0,1)] -rotate-3">
            {icon}
          </div>
          <div>
            <h2 className="font-headline-xl text-3xl md:text-4xl uppercase">
              {skill.name}
            </h2>
            <span className="font-label-bold bg-secondary text-white px-3 py-1 border-2 border-black inline-block mt-2">
              {skill.category}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between font-label-bold uppercase text-lg">
            <span>Proficiency</span>
            <span>{skill.level}% — {getProficiencyLabel(skill.level)}</span>
          </div>
          <div className="h-8 w-full border-4 border-black bg-surface-variant flex shadow-[inset_0px_4px_0px_0px_rgba(0,0,0,0.1)]">
            <motion.div
              className="h-full bg-primary-container border-r-4 border-black"
              initial={{ width: 0 }}
              animate={{ width: `${skill.level}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        <p className="font-body-lg text-lg bg-surface-variant p-4 border-4 border-black border-dashed">
          {skill.description}
        </p>

        {skill.projects && skill.projects.length > 0 && (
          <div className="flex flex-col gap-4 mt-2">
            <h4 className="font-headline-md text-2xl uppercase border-b-4 border-black inline-block w-fit">
              Used in
            </h4>
            <div className="flex flex-wrap gap-3">
              {skill.projects.map((project) => (
                <button
                  key={project}
                  onClick={() => onProjectClick(project)}
                  className="bg-white border-2 border-black px-4 py-2 font-label-bold uppercase flex items-center gap-2 hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                  {project}
                  <FaExternalLinkAlt className="text-sm" />
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

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

// Map categories to brutalist colors and rotations
const categoryStyles = {
  webdev: {
    bg: "bg-white",
    badgeBg: "bg-primary-container",
    badgeText: "text-black",
    badgeRotate: "",
    pillColors: [
      "bg-black text-white shadow-[4px_4px_0px_0px_rgba(240,255,0,1)]",
      "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
      "bg-secondary text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
      "bg-primary-container text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
    ],
  },
  machinelearning: {
    bg: "bg-surface-variant",
    badgeBg: "bg-black",
    badgeText: "text-white",
    badgeRotate: "",
    pillColors: [
      "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
      "bg-primary-container text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
      "bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
      "bg-secondary text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
    ],
  },
};

function Skills() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedSkill, setSelectedSkill] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = selectedSkill ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedSkill]);

  const filteredCategories = useMemo(() => {
    const result = {};
    Object.entries(skills).forEach(([category, categorySkills]) => {
      if (activeCategory === "all" || activeCategory === category) {
        const filtered = categorySkills.filter(
          (skill) =>
            searchTerm === "" ||
            skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            skill.description.toLowerCase().includes(searchTerm.toLowerCase()),
        );
        if (filtered.length > 0) {
          result[category] = filtered;
        }
      }
    });
    return result;
  }, [searchTerm, activeCategory]);

  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName] || FaServer;
    return <IconComponent />;
  };

  return (
    <div className="flex flex-col gap-16 md:gap-section-gap">
      <section className="flex flex-col gap-6 w-full">
        <h1 className="font-headline-xl text-5xl md:text-7xl lg:text-[64px] text-black uppercase wrap-break-word border-b-8 border-black pb-4 inline-block self-start shadow-[8px_8px_0px_0px_rgba(240,255,0,1)]">
          SKILLS & TOOLS
        </h1>
        <p className="font-body-lg text-base md:text-lg max-w-2xl border-l-4 border-black pl-4 py-2 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-4">
          A chaotic sticker sheet of the technologies I use to build loud,
          unapologetic digital experiences. Function over form, but make it look
          cool.
        </p>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-6 mt-8 items-start md:items-center justify-between">
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

          <div className="flex flex-wrap gap-4">
            {skillCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-2 border-4 border-black font-label-bold uppercase text-sm md:text-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none ${
                  activeCategory === cat.id
                    ? "bg-primary-container"
                    : "bg-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Sticker Grid Layout */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-12 mt-4">
        {Object.entries(filteredCategories).length > 0 ? (
          Object.entries(filteredCategories).map(
            ([category, categorySkills]) => {
              const style = categoryStyles[category] || categoryStyles.webdev;
              const categoryLabel =
                skillCategories.find((c) => c.id === category)?.label ||
                category;

              return (
                <div
                  key={category}
                  className={`${style.bg} border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col gap-6 relative group hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all mt-4`}
                >
                  <div
                    className={`absolute -top-6 -left-4 ${style.badgeBg} border-4 border-black px-4 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${style.badgeRotate} z-10`}
                  >
                    <h2
                      className={`font-headline-md text-2xl ${style.badgeText} uppercase`}
                    >
                      {categoryLabel}
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-4">
                    {categorySkills.map((skill, index) => {
                      const pillColor =
                        style.pillColors[index % style.pillColors.length];

                      return (
                        <button
                          key={skill.name}
                          onClick={() =>
                            setSelectedSkill({
                              ...skill,
                              category: categoryLabel,
                            })
                          }
                          className={`${pillColor} font-label-bold text-sm md:text-base px-4 py-2 border-2 border-black flex items-center gap-2 hover:scale-105 transition-transform hover:z-20 active:scale-95`}
                        >
                          <span className="text-xl">{getIcon(skill.icon)}</span>
                          {skill.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            },
          )
        ) : (
          <div className="col-span-full bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
            <h3 className="font-headline-md text-2xl uppercase">
              No skills found
            </h3>
            <p className="font-body-md mt-4">
              Try a different search term or category.
            </p>
          </div>
        )}
      </section>

      {/* Brutalist Modal */}
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
    </div>
  );
}

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
        className="bg-white border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full p-8 relative z-10 flex flex-col gap-6"
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
            <h2 className="font-headline-xl text-4xl uppercase">
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
            <span>{skill.level}%</span>
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
          <div className="flex flex-col gap-4 mt-4">
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

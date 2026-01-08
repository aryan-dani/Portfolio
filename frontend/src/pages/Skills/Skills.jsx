import { useState, useMemo } from "react";
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
  FaComments,
  FaBrain,
  FaCloud,
} from "react-icons/fa";
import {
  SiTypescript,
  SiExpress,
  SiMongodb,
  SiTensorflow,
  SiPytorch,
  SiScikitlearn,
} from "react-icons/si";
import { skills, skillCategories } from "../../data/skills";
import { projects } from "../../data/projects";
import "./Skills.scss";

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
  FaComments,
  FaBrain,
  FaCloud,
  SiTypescript,
  SiExpress,
  SiMongodb,
  SiTensorflow,
  SiPytorch,
  SiScikitlearn,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

function Skills() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedSkill, setSelectedSkill] = useState(null);
  const navigate = useNavigate();

  const filteredSkills = useMemo(() => {
    const allSkills = [];

    Object.entries(skills).forEach(([category, categorySkills]) => {
      categorySkills.forEach((skill) => {
        if (activeCategory === "all" || activeCategory === category) {
          if (
            searchTerm === "" ||
            skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            skill.description.toLowerCase().includes(searchTerm.toLowerCase())
          ) {
            allSkills.push({ ...skill, category });
          }
        }
      });
    });

    return allSkills;
  }, [searchTerm, activeCategory]);

  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent /> : <FaServer />;
  };

  return (
    <motion.section
      className="skills-page"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="skills-page__container">
        <motion.div className="section-header" variants={cardVariants}>
          <h2>
            Technical <span>Skills</span>
          </h2>
          <p className="intro-text">
            Here's a showcase of the tools and technologies I wield. From
            crafting sleek web interfaces to diving deep into data and AI, this
            is where my digital toolkit lives. Explore the skills I've honed
            through projects and continuous learning.
          </p>
        </motion.div>

        <motion.div className="skills-page__controls" variants={cardVariants}>
          <div className="skills-page__search">
            <FaSearch className="skills-page__search-icon" />
            <input
              type="search"
              placeholder="Search skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="skills-page__search-input"
            />
            {searchTerm && (
              <button
                className="skills-page__search-clear"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <div className="skills-page__tabs">
            {skillCategories.map((category) => (
              <button
                key={category.id}
                className={`skills-page__tab ${
                  activeCategory === category.id
                    ? "skills-page__tab--active"
                    : ""
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {filteredSkills.length > 0 ? (
            <motion.div
              className="skills-page__grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredSkills.map((skill) => (
                <SkillCard
                  key={`${skill.category}-${skill.name}`}
                  skill={skill}
                  icon={getIcon(skill.icon)}
                  onClick={() => setSelectedSkill(skill)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="skills-page__empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FaSearch />
              <h3>No skills match your search</h3>
              <p>
                Try adjusting your search or selecting a different category.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skill Modal */}
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
    </motion.section>
  );
}

function SkillCard({ skill, icon, onClick }) {
  return (
    <motion.div
      className="skill-card"
      variants={cardVariants}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <div className="skill-card__front">
        <span className="skill-card__icon">{icon}</span>
        <h3 className="skill-card__name">{skill.name}</h3>
      </div>
      <div className="skill-card__back">
        <div className="skill-card__progress">
          <div
            className="skill-card__progress-bar"
            style={{ width: `${skill.level}%` }}
          />
        </div>
        <p className="skill-card__level">{skill.level}%</p>
      </div>
    </motion.div>
  );
}

function SkillModal({ skill, icon, onClose, onProjectClick }) {
  return (
    <motion.div
      className="skill-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="skill-modal__content"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="skill-modal__close" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="skill-modal__header">
          <span className="skill-modal__icon">{icon}</span>
          <h2 className="skill-modal__title">{skill.name}</h2>
        </div>

        <div className="skill-modal__progress">
          <div className="skill-modal__progress-bar">
            <motion.div
              className="skill-modal__progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${skill.level}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <span className="skill-modal__level">{skill.level}% Proficiency</span>
        </div>

        <p className="skill-modal__description">{skill.description}</p>

        {skill.projects && skill.projects.length > 0 && (
          <div className="skill-modal__projects">
            <h4>Used in:</h4>
            <ul>
              {skill.projects.map((project) => (
                <li
                  key={project}
                  onClick={() => onProjectClick(project)}
                  className="skill-modal__project-link"
                >
                  <span>{project}</span>
                  <FaExternalLinkAlt className="skill-modal__project-icon" />
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default Skills;

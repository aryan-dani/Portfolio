import { memo } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { FaTimes, FaEye, FaGithub, FaArrowRight } from "react-icons/fa";
import { getSkillsForProject } from "../../data/skills";
import { getAssetPath } from "../../utils/paths";
import { modalBackdropVariants, modalContentVariants } from "../../utils/motionVariants";

const ProjectModal = memo(function ProjectModal({ project, onClose, onSkillClick }) {
  const projectSkills = getSkillsForProject(project.id);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 gpu-layer">
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
        className="bg-[var(--color-surface)] border-8 border-outline shadow-[24px_24px_0px_0px_var(--shadow-color)] w-full max-w-5xl max-h-[90vh] overflow-y-auto overscroll-contain relative z-10 flex flex-col no-scrollbar paint-isolate"
        data-lenis-prevent
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
        <div className="h-56 md:h-80 border-b-8 border-outline relative overflow-hidden bg-[var(--color-surface-variant)] shrink-0">
          <motion.img
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            src={getAssetPath(project.image)}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-4 sm:p-6 md:p-10 flex flex-col gap-6 md:gap-8 bg-hatch">
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

export default ProjectModal;

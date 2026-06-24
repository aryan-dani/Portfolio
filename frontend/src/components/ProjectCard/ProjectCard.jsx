import { useRef, memo } from "react";
import { motion, useInView } from "framer-motion";
import { FaEye, FaGithub } from "react-icons/fa";
import { getAssetPath } from "../../utils/paths";

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

export default ProjectCard;

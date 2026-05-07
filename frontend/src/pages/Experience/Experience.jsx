import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaExternalLinkAlt } from "react-icons/fa";
import { experiences } from "../../data/experience";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.25,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const stylesList = [
  { bg: "bg-black", text: "text-white", dotBg: "bg-primary-container" },
  { bg: "bg-secondary", text: "text-white", dotBg: "bg-secondary" },
  { bg: "bg-white", text: "text-black", dotBg: "bg-white" },
];

function Experience() {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <motion.div
      className="flex flex-col gap-16 md:gap-section-gap relative"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <header className="relative w-full mt-4">
        <motion.div
          variants={cardVariants}
          className="inline-block bg-primary-container border-4 border-black px-6 md:px-8 py-4 md:py-6 mb-8 transition-transform"
        >
          <h1 className="font-headline-xl text-5xl md:text-7xl lg:text-headline-xl uppercase text-black">
            EXPERIENCE
          </h1>
        </motion.div>
        <motion.p
          variants={cardVariants}
          className="font-body-lg text-base md:text-lg lg:text-body-lg max-w-3xl bg-white border-4 border-black p-4 md:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        >
          A timeline of raw code, loud design, and shipped products. Building
          stuff that matters.
        </motion.p>
      </header>

      <section className="relative py-8 w-full">
        {/* Timeline Center Line */}
        <div className="absolute left-5 md:left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-2 bg-black z-0"></div>

        {experiences.map((exp, index) => {
          const isEven = index % 2 === 0;
          const style = stylesList[index % stylesList.length];
          const isExpanded = expandedId === exp.id;

          return (
            <motion.div
              key={exp.id}
              className={`relative z-10 w-full mb-10 md:mb-16 flex flex-col md:flex-row md:justify-between items-start md:items-center ${isEven ? "" : "md:flex-row-reverse"}`}
              variants={cardVariants}
            >
              {/* Desktop Timeline Period */}
              <div
                className={`hidden md:block md:w-5/12 ${isEven ? "text-right pr-12" : "text-left pl-12"}`}
              >
                <div
                  className={`inline-block ${style.bg} ${style.text} font-headline-md text-2xl border-4 border-black px-6 py-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all cursor-default uppercase`}
                >
                  {exp.period}
                </div>
              </div>

              {/* Center Dot */}
              <div
                className={`absolute left-5 md:left-1/2 transform -translate-x-1/2 w-9 h-9 ${style.dotBg} border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-20 top-4 md:top-auto md:translate-y-0`}
              />

              {/* Mobile Timeline Period & Card Content */}
              <div
                className={`w-full pl-16 md:pl-0 md:w-5/12 ${isEven ? "md:text-left md:pl-12" : "md:text-right md:pr-12"}`}
              >
                <div className="md:hidden mb-4">
                  <div
                    className={`inline-block ${style.bg} ${style.text} font-label-bold text-sm px-4 py-2 border-2 border-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
                  >
                    {exp.period}
                  </div>
                </div>

                <div
                  className={`bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all ${isEven ? "text-left" : "text-left md:text-right"}`}
                >
                  <div className="border-b-4 border-black pb-4 mb-6 flex justify-between items-start">
                    <div>
                      <h3 className="font-headline-md text-2xl md:text-3xl mb-2 uppercase">
                        {exp.position}
                      </h3>
                      <h4 className="font-label-bold text-sm md:text-base text-secondary uppercase tracking-widest">
                        <a
                          href={exp.companyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center gap-2 w-fit"
                        >
                          {exp.company}
                          <FaExternalLinkAlt className="text-xs" />
                        </a>
                      </h4>
                    </div>
                    <button
                      className={`text-2xl hover:text-secondary transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      onClick={() => toggleExpand(exp.id)}
                      aria-label="Toggle details"
                    >
                      <FaChevronDown />
                    </button>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <ul className="list-none space-y-4 font-body-md text-base mt-4">
                          {exp.responsibilities.map((resp, i) => (
                            <li
                              key={i}
                              className={`flex items-start gap-3 ${isEven ? "" : "md:flex-row-reverse"}`}
                            >
                              <span className="text-primary-container bg-black border-2 border-black font-black px-2 py-0 mt-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                {isEven ? "→" : "←"}
                              </span>
                              <span
                                dangerouslySetInnerHTML={{ __html: resp }}
                              />
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div
                    className={`mt-8 flex flex-wrap gap-2 ${isEven ? "" : "md:justify-end"}`}
                  >
                    {exp.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="bg-surface-variant text-black font-label-bold text-xs md:text-sm px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </section>
    </motion.div>
  );
}

export default Experience;

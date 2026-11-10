import { memo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getGuideBySlug } from "../../data/services";
import { usePageSEO } from "../../utils/seo";
import { containerVariants, itemVariants } from "../../utils/motionVariants";

const Guide = memo(function Guide() {
  const { slug } = useParams();
  const guide = getGuideBySlug(slug);
  const seoPath = guide ? `/guides/${guide.slug}` : null;
  usePageSEO(undefined, seoPath || undefined);

  if (!guide) {
    return <Navigate to="/services" replace />;
  }

  return (
    <motion.article
      className="flex flex-col gap-10 md:gap-14 w-full pb-8"
      initial={false}
      animate="visible"
      variants={containerVariants}
    >
      <motion.header
        className="mt-4 border-4 border-outline bg-hatch p-5 md:p-6 shadow-[6px_6px_0_0_var(--shadow-color)] flex flex-col gap-4"
        variants={itemVariants}
      >
        <p className="font-label-bold text-xs uppercase tracking-[0.16em]">
          <Link to="/services" className="underline underline-offset-4">
            Services
          </Link>
          <span aria-hidden> / </span>
          Guide
        </p>
        <h1 className="font-headline-xl text-3xl md:text-5xl uppercase tracking-tighter leading-tight bg-[var(--color-surface)] border-4 border-outline p-4 shadow-[8px_8px_0_0_var(--shadow-color)] w-fit max-w-4xl">
          {guide.title}
        </h1>
        <p className="font-body-lg text-base md:text-lg max-w-3xl bg-[var(--color-surface)] border-4 border-outline p-4 shadow-[4px_4px_0_0_var(--shadow-color)] leading-snug">
          {guide.description}
        </p>
      </motion.header>

      <div className="flex flex-col gap-6">
        {guide.sections.map((section) => (
          <motion.section
            key={section.title}
            className="border-4 border-outline bg-[var(--color-surface)] p-5 md:p-6 shadow-[4px_4px_0_0_var(--shadow-color)] flex flex-col gap-3"
            variants={itemVariants}
          >
            <h2 className="font-headline-md text-xl md:text-2xl uppercase">{section.title}</h2>
            <p className="font-body-md text-sm md:text-base leading-snug">{section.body}</p>
          </motion.section>
        ))}
      </div>

      <motion.div variants={itemVariants}>
        <Link
          to="/services#inquiry"
          className="inline-flex border-4 border-outline bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] px-6 py-3 font-label-bold text-sm uppercase shadow-[6px_6px_0_0_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[3px_3px_0_0_var(--shadow-color)] transition-all"
        >
          Request a quote
        </Link>
      </motion.div>
    </motion.article>
  );
});

export default Guide;

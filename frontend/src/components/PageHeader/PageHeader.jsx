import { memo } from "react";
import { motion } from "framer-motion";
import { cardVariants } from "../../utils/motionVariants";

const PageHeader = memo(function PageHeader({ title, description, count, children, className = "" }) {
  return (
    <header
      className={`relative isolate overflow-hidden mb-4 border-b-8 border-outline pb-8 mt-4 bg-hatch p-4 md:p-6 shadow-[4px_4px_0px_0px_var(--shadow-color)] flex flex-col items-start gap-6 ${className}`}
    >
      <motion.div className="flex items-center gap-4 flex-wrap" variants={cardVariants}>
        <div className="bg-[var(--color-primary-container)] border-4 border-outline px-6 py-4 shadow-[8px_8px_0px_0px_var(--shadow-color)] relative overflow-hidden">
          <div className="absolute inset-0 animate-shimmer opacity-20 pointer-events-none" />
          <h1 className="font-headline-xl text-5xl md:text-7xl lg:text-headline-xl text-[var(--color-on-primary-container)] uppercase tracking-tighter leading-none">
            {title}
          </h1>
        </div>
        {count !== undefined && (
          <span className="font-headline-md text-2xl md:text-3xl border-4 border-outline px-4 py-3 shadow-[4px_4px_0px_0px_var(--shadow-color)] bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]">
            {count}
          </span>
        )}
      </motion.div>

      {description && (
        <motion.p
          className="font-body-lg text-base md:text-lg lg:text-body-lg text-[var(--color-on-surface)] max-w-3xl bg-[var(--color-surface)] border-4 border-outline p-4 md:p-5 shadow-[4px_4px_0px_0px_var(--shadow-color)]"
          variants={cardVariants}
        >
          {description}
        </motion.p>
      )}

      {children}
    </header>
  );
});

export default PageHeader;

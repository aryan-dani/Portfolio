/**
 * Shared Framer Motion animation variant presets.
 * Import these instead of re-declaring per-file.
 */

/** Stagger container — fades in and staggers children */
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

/**
 * Standard stagger container with tighter children spacing.
 * Use for grids of cards.
 */
export const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, staggerChildren: 0.07, delayChildren: 0.03 },
  },
};

/** Slide-up item — spring-based reveal */
export const itemVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 280, damping: 22 },
  },
};

/** Card variant — same as itemVariants, but lighter spring for grids */
export const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 280, damping: 22 },
  },
};

/** Modal backdrop — fast opacity fade */
export const modalBackdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

/** Modal content — spring scale-in from slightly below */
export const modalContentVariants = {
  hidden: { opacity: 0, scale: 0.93, y: 36 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 380, damping: 28 },
  },
  exit: { opacity: 0, scale: 0.97, y: 20, transition: { duration: 0.18 } },
};

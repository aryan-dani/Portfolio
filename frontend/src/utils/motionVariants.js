/**
 * Shared Framer Motion animation variant presets.
 * Import these instead of re-declaring per-file.
 * Tuned for smooth, cohesive motion across the portfolio.
 */

/** Shared easing curves - match CSS tokens in index.css */
export const motionEase = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.45, 0, 0.55, 1],
  in: [0.4, 0, 1, 1],
};

/** Default spring - soft landing with minimal bounce */
export const defaultSpring = {
  type: "spring",
  stiffness: 135,
  damping: 34,
  mass: 0.85,
};

/** Snappier spring for micro-interactions (buttons, toggles) */
export const snappySpring = {
  type: "spring",
  stiffness: 300,
  damping: 26,
  mass: 0.65,
};

/** Standard hover spring */
export const hoverSpring = {
  type: "spring",
  stiffness: 210,
  damping: 32,
};

/** Stagger container - children still animate; parent stays visible for FCP. */
export const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
      staggerChildren: 0.018,
      delayChildren: 0.01,
      ease: motionEase.out,
    },
  },
};

/** Slide-up item - soft reveal without starting fully invisible on first paint. */
export const itemVariants = {
  hidden: { opacity: 0.01, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: motionEase.out },
  },
};

/** Card variant - alias of itemVariants for grid children */
export const cardVariants = itemVariants;

/** Route/page transition — enter-only opacity fade (no x/y exit). */
export const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.2, ease: motionEase.out },
  },
  exit: {
    opacity: 1,
    transition: { duration: 0 },
  },
};

/** Modal backdrop - smooth opacity fade */
export const modalBackdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.32, ease: motionEase.out } },
  exit: { opacity: 0, transition: { duration: 0.24, ease: motionEase.in } },
};

/** Modal content - refined spring scale-in from slightly below */
export const modalContentVariants = {
  hidden: { opacity: 0, scale: 0.98, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { ...defaultSpring, stiffness: 200 },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 8,
    transition: { duration: 0.16, ease: motionEase.in },
  },
};

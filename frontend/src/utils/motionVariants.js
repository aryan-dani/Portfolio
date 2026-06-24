/**
 * Shared Framer Motion animation variant presets.
 * Import these instead of re-declaring per-file.
 * Tuned for smooth, cohesive motion across the portfolio.
 */

/** Shared easing curves — match CSS tokens in index.css */
export const motionEase = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.45, 0, 0.55, 1],
  in: [0.4, 0, 1, 1],
};

/** Default spring — soft landing with minimal bounce */
export const defaultSpring = {
  type: "spring",
  stiffness: 170,
  damping: 30,
  mass: 0.75,
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
  stiffness: 260,
  damping: 30,
};

/** Stagger container — fades in and staggers children */
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.045,
      delayChildren: 0.035,
      ease: motionEase.out,
    },
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
    transition: {
      duration: 0.45,
      staggerChildren: 0.035,
      delayChildren: 0.025,
      ease: motionEase.out,
    },
  },
};

/** Slide-up item — smooth spring-based reveal */
export const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: defaultSpring,
  },
};

/** Card variant — gentle spring for grids */
export const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: defaultSpring,
  },
};

/** Route/page transition — directional slide with soft spring */
export const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transitionEnd: { transform: "none" },
    transition: { duration: 0.24, ease: motionEase.out },
  },
  exit: { opacity: 0, y: -6, transition: { duration: 0.14, ease: motionEase.in } },
};

/** Modal backdrop — smooth opacity fade */
export const modalBackdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.32, ease: motionEase.out } },
  exit: { opacity: 0, transition: { duration: 0.24, ease: motionEase.in } },
};

/** Modal content — refined spring scale-in from slightly below */
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

/** Fade-in scale — gentler modal variant */
export const fadeInScaleVariants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: defaultSpring,
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.24, ease: motionEase.in },
  },
};

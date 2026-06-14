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
  stiffness: 180,
  damping: 32,
  mass: 0.85,
};

/** Snappier spring for micro-interactions (buttons, toggles) */
export const snappySpring = {
  type: "spring",
  stiffness: 260,
  damping: 28,
  mass: 0.7,
};

/** Stagger container — fades in and staggers children */
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
      delayChildren: 0.06,
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
      staggerChildren: 0.07,
      delayChildren: 0.04,
      ease: motionEase.out,
    },
  },
};

/** Slide-up item — smooth spring-based reveal */
export const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: defaultSpring,
  },
};

/** Card variant — gentle spring for grids */
export const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: defaultSpring,
  },
};

/** Route/page transition — directional slide with soft spring */
export const pageVariants = {
  initial: (direction) => ({
    x: direction > 0 ? 24 : -24,
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
    transitionEnd: { transform: "none" },
    transition: defaultSpring,
  },
  exit: (direction) => ({
    x: direction > 0 ? -18 : 18,
    opacity: 0,
    transition: { duration: 0.28, ease: motionEase.in },
  }),
};

/** Modal backdrop — smooth opacity fade */
export const modalBackdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.32, ease: motionEase.out } },
  exit: { opacity: 0, transition: { duration: 0.24, ease: motionEase.in } },
};

/** Modal content — refined spring scale-in from slightly below */
export const modalContentVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 28, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { ...defaultSpring, stiffness: 200 },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 16,
    filter: "blur(4px)",
    transition: { duration: 0.26, ease: motionEase.in },
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

import { useState, useEffect, useCallback, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowUp } from "react-icons/fa";
import { smoothScrollToTop } from "../../utils/smoothScroll";
import { snappySpring } from "../../utils/motionVariants";

function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

const BackToTop = memo(function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    const handleScroll = throttle(() => {
      if (isScrollingRef.current) return;
      setIsVisible(window.scrollY > 400);
    }, 60);

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    if (isScrollingRef.current) return;

    isScrollingRef.current = true;
    setIsScrolling(true);

    smoothScrollToTop().finally(() => {
      isScrollingRef.current = false;
      setIsScrolling(false);
      setIsVisible(window.scrollY > 400);
    });
  }, []);

  const showButton = isVisible || isScrolling;

  return (
    <AnimatePresence>
      {showButton && (
        <motion.div
          className="fixed bottom-8 right-8 z-[999]"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={snappySpring}
        >
          <motion.button
            className="back-to-top"
            onClick={scrollToTop}
            aria-label="Back to top"
            title="Back to top"
            disabled={isScrolling}
            whileHover={isScrolling ? undefined : { scale: 1.06 }}
            whileTap={isScrolling ? undefined : { scale: 0.94 }}
          >
            <motion.div
              animate={isScrolling ? { y: 0 } : { y: [0, -4, 0] }}
              transition={
                isScrolling
                  ? { duration: 0.2 }
                  : { duration: 2.2, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }
              }
            >
              <FaArrowUp />
            </motion.div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default BackToTop;

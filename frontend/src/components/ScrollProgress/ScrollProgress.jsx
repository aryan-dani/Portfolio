import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import "./ScrollProgress.scss";

function ScrollProgress() {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      className={`scroll-progress ${
        isVisible ? "scroll-progress--visible" : ""
      }`}
      style={{ scaleX }}
    />
  );
}

export default ScrollProgress;

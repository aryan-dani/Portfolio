import { useEffect, useState, useRef, memo } from "react";
import { createPortal } from "react-dom";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

const CustomCursor = memo(function CustomCursor() {
  const [cursorType, setCursorType] = useState("default"); // 'default' | 'hover' | 'text' | 'image'
  const [isVisible, setIsVisible] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 28, stiffness: 380, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const updateMousePosition = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleHoverChange = (e) => {
      const target = e.target;
      const el = target.closest("a, button, [role='button'], .cursor-pointer, .nb-carousel-arrow");
      const img = target.closest("img, .cursor-image");
      const input = target.closest("input, textarea, select");
      const isCliText = target.closest(".nb-cli-container") && !target.closest("input");

      if (input || isCliText) {
        setCursorType("text");
      } else if (img) {
        setCursorType("image");
      } else if (el) {
        setCursorType("hover");
      } else {
        setCursorType("default");
      }
    };

    window.addEventListener("mousemove", updateMousePosition);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mouseover", handleHoverChange);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mouseover", handleHoverChange);
    };
  }, [isVisible, cursorX, cursorY]);

  if (!isVisible) return null;

  const isHovering = cursorType === "hover" || cursorType === "image";
  const isText = cursorType === "text";

  return createPortal(
    <div style={{ pointerEvents: "none", zIndex: 99999, position: "fixed", top: 0, left: 0, width: "100%", height: "100%" }}>
      {/* Inner dot — tracks instantly */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          position: "absolute",
        }}
        animate={{
          scale: isHovering ? 1.6 : isText ? 0.3 : 1,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 900, damping: 40 }}
      >
        <div
          style={{
            width: isText ? "6px" : "16px",
            height: isText ? "22px" : "16px",
            background: "var(--color-primary-container)",
            border: "2px solid var(--color-outline)",
            boxShadow: "2px 2px 0 var(--shadow-color)",
            borderRadius: "0",
          }}
        />
      </motion.div>

      {/* Outer ring — trails with spring */}
      <motion.div
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: "-50%",
          translateY: "-50%",
          position: "absolute",
        }}
        animate={{
          scale: isHovering ? 1.4 : 1,
          opacity: isVisible ? (isText ? 0.3 : 1) : 0,
        }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            border: "2px solid var(--color-outline)",
            background: "transparent",
            boxShadow: "4px 4px 0 var(--shadow-color)",
            borderRadius: "0",
          }}
        />
      </motion.div>
    </div>,
    document.body
  );
});

export default CustomCursor;

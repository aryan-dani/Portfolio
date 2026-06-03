import { useEffect, useState, useRef, memo } from "react";
import { createPortal } from "react-dom";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

const CustomCursor = memo(function CustomCursor() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const cursorScaleOuter = useMotionValue(0);
  const cursorScaleInner = useMotionValue(0);
  const cursorOpacity = useMotionValue(0);
  const cursorInnerWidth = useMotionValue("16px");
  const cursorInnerHeight = useMotionValue("16px");

  const springConfig = { damping: 32, stiffness: 300, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const isVisibleRef = useRef(false);
  const cursorTypeRef = useRef("default");

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const updateCursorType = (type) => {
      if (cursorTypeRef.current !== type) {
        cursorTypeRef.current = type;
        const isHover = type === "hover" || type === "image";
        const isText = type === "text";
        
        cursorScaleInner.set(isHover ? 1.6 : isText ? 0.3 : 1);
        cursorScaleOuter.set(isHover ? 1.4 : 1);
        cursorInnerWidth.set(isText ? "6px" : "16px");
        cursorInnerHeight.set(isText ? "22px" : "16px");
        cursorOpacity.set(isVisibleRef.current ? (isText ? 0.3 : 1) : 0);
      }
    };

    const updateMousePosition = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        cursorOpacity.set(cursorTypeRef.current === "text" ? 0.3 : 1);
        cursorScaleInner.set(1);
        cursorScaleOuter.set(1);
      }
    };

    const handleMouseLeave = () => {
      isVisibleRef.current = false;
      cursorOpacity.set(0);
    };
    const handleMouseEnter = () => {
      isVisibleRef.current = true;
      cursorOpacity.set(cursorTypeRef.current === "text" ? 0.3 : 1);
    };

    const handleHoverChange = (e) => {
      const target = e.target;
      if (!target || !target.closest) return;
      const el = target.closest("a, button, [role='button'], .cursor-pointer, .nb-carousel-arrow");
      const img = target.closest("img, .cursor-image");
      const input = target.closest("input, textarea, select");
      const isCliText = target.closest(".nb-cli-container") && !target.closest("input");

      if (input || isCliText) {
        updateCursorType("text");
      } else if (img) {
        updateCursorType("image");
      } else if (el) {
        updateCursorType("hover");
      } else {
        updateCursorType("default");
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
  }, [cursorX, cursorY, cursorScaleInner, cursorScaleOuter, cursorOpacity, cursorInnerWidth, cursorInnerHeight]);

  const innerSpringScale = useSpring(cursorScaleInner, springConfig);
  const outerSpringScale = useSpring(cursorScaleOuter, springConfig);
  const springOpacity = useSpring(cursorOpacity, { stiffness: 400, damping: 30 });

  return createPortal(
    <div style={{ pointerEvents: "none", zIndex: 99999, position: "fixed", top: 0, left: 0, width: "100%", height: "100%" }}>
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          translateZ: 0,
          scale: innerSpringScale,
          opacity: springOpacity,
          willChange: "transform, opacity",
          position: "absolute",
        }}
      >
        <motion.div
          style={{
            width: cursorInnerWidth,
            height: cursorInnerHeight,
            background: "var(--color-primary-container)",
            border: "1.5px solid var(--color-outline)",
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
          translateZ: 0,
          scale: outerSpringScale,
          opacity: springOpacity,
          willChange: "transform, opacity",
          position: "absolute",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            border: "1.5px solid var(--color-outline)",
            background: "transparent",
            borderRadius: "0",
          }}
        />
      </motion.div>
    </div>,
    document.body
  );
});

export default CustomCursor;

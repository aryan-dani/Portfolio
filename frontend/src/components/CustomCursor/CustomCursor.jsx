import { useEffect, useRef, memo } from "react";
import { createPortal } from "react-dom";
import { motion, useMotionValue, useSpring, animate } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

/* ────────────────────────────────────────────────────────────
   Monochrome cursor with RUNTIME luminance detection.
   Instead of hardcoded CSS selectors, the cursor reads the
   actual computed background color of the element beneath it,
   computes relative luminance, and swaps to the contrasting
   color. This guarantees visibility on ANY surface.
   ──────────────────────────────────────────────────────────── */
const LIGHT = "#f8f7f4";
const DARK  = "#131316";

/* ── Parse a CSS color string into {r,g,b,a} ── */
const parseColor = (str) => {
  if (!str || str === "transparent" || str === "rgba(0, 0, 0, 0)") return null;
  const m = str.match(/rgba?\(\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
  if (!m) return null;
  return { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? +m[4] : 1 };
};

/* ── Walk up the DOM to find the first opaque background color ── */
const getEffectiveBgLuminance = (el) => {
  let node = el;
  while (node && node !== document.documentElement) {
    // Skip the cursor's own overlay container
    const style = window.getComputedStyle(node);
    if (style.pointerEvents === "none" && parseInt(style.zIndex) >= 9999) {
      node = node.parentElement;
      continue;
    }
    const color = parseColor(style.backgroundColor);
    if (color && color.a > 0.4) {
      // Relative luminance (sRGB)
      const toLinear = (c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * toLinear(color.r) + 0.7152 * toLinear(color.g) + 0.0722 * toLinear(color.b);
    }
    node = node.parentElement;
  }
  return null; // couldn't determine — fall back to theme
};

const CustomCursor = memo(function CustomCursor() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isDarkRef = useRef(isDark);
  isDarkRef.current = isDark;

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const cursorScaleOuter = useMotionValue(0);
  const cursorScaleInner = useMotionValue(0);
  const cursorOpacity = useMotionValue(0);
  const cursorInnerWidth = useMotionValue("16px");
  const cursorInnerHeight = useMotionValue("16px");
  const cursorRotateInner = useMotionValue(0);
  const cursorRotateOuter = useMotionValue(0);

  const cursorBg = useMotionValue(isDark ? LIGHT : DARK);
  const cursorBorderColor = useMotionValue(isDark ? LIGHT : DARK);
  const cursorOuterBorderColor = useMotionValue(isDark ? LIGHT : DARK);

  const springConfig = { damping: 28, stiffness: 450, mass: 0.35 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);
  const rotateSpringInner = useSpring(cursorRotateInner, springConfig);
  const rotateSpringOuter = useSpring(cursorRotateOuter, springConfig);

  const isVisibleRef = useRef(false);
  const cursorTypeRef = useRef("default");
  const onDarkBgRef = useRef(false); // true when cursor is on a dark background

  /* ── Compute cursor colors based on background darkness & cursor type ── */
  const getColors = (type, onDarkBg) => {
    // The cursor should contrast with whatever it's sitting on.
    // onDarkBg=true  → cursor should be white (LIGHT)
    // onDarkBg=false → cursor should be black (DARK)
    const primary = onDarkBg ? LIGHT : DARK;
    const inverted = onDarkBg ? DARK : LIGHT;

    const border = primary;
    const outerBorder = primary;

    // Default/text: solid fill matches border
    // Hover/image: fill inverts so you get a visible framed square
    const isHover = type === "hover" || type === "image";
    const bg = isHover ? inverted : primary;

    return { bg, border, outerBorder };
  };

  /* ── Animate to new colors ── */
  const applyColors = (type, onDarkBg, instant = false) => {
    const { bg, border, outerBorder } = getColors(type, onDarkBg);
    if (instant) {
      cursorBg.set(bg);
      cursorBorderColor.set(border);
      cursorOuterBorderColor.set(outerBorder);
    } else {
      animate(cursorBg, bg, { duration: 0.12, ease: "easeInOut" });
      animate(cursorBorderColor, border, { duration: 0.12, ease: "easeInOut" });
      animate(cursorOuterBorderColor, outerBorder, { duration: 0.12, ease: "easeInOut" });
    }
  };

  /* ── Sync when theme toggles ── */
  useEffect(() => {
    applyColors(cursorTypeRef.current, onDarkBgRef.current, true);
  }, [theme, isDark]);

  /* ── Main effect: mouse tracking + hover detection ── */
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const updateCursorType = (type, onDarkBg) => {
      const typeChanged = cursorTypeRef.current !== type;
      const bgChanged = onDarkBgRef.current !== onDarkBg;

      if (typeChanged || bgChanged) {
        cursorTypeRef.current = type;
        onDarkBgRef.current = onDarkBg;

        if (typeChanged) {
          const isHover = type === "hover" || type === "image";
          const isText = type === "text";

          cursorScaleInner.set(isHover ? 1.6 : isText ? 0.3 : 1);
          cursorScaleOuter.set(isHover ? 1.4 : 1);
          cursorInnerWidth.set(isText ? "6px" : "16px");
          cursorInnerHeight.set(isText ? "22px" : "16px");
          cursorOpacity.set(isVisibleRef.current ? (isText ? 0.3 : 1) : 0);
          cursorRotateInner.set(isHover ? 45 : 0);
          cursorRotateOuter.set(isHover ? -45 : 0);
        }

        applyColors(type, onDarkBg);
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

      // Determine cursor type
      const el = target.closest("a, button, [role='button'], .cursor-pointer, .nb-carousel-arrow");
      const img = target.closest("img, .cursor-image");
      const input = target.closest("input, textarea, select");
      const isCliText = target.closest(".nb-cli-container") && !target.closest("input");

      let type = "default";
      if (input || isCliText) type = "text";
      else if (img) type = "image";
      else if (el) type = "hover";

      // Determine background darkness via luminance sampling
      const lum = getEffectiveBgLuminance(target);
      // If luminance is null, fall back to theme default:
      //   light theme → light bg → cursor should be dark (onDarkBg=false)
      //   dark theme  → dark bg  → cursor should be light (onDarkBg=true)
      const onDarkBg = lum !== null ? lum < 0.4 : isDarkRef.current;

      updateCursorType(type, onDarkBg);
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
  }, [cursorX, cursorY, cursorScaleInner, cursorScaleOuter, cursorOpacity, cursorInnerWidth, cursorInnerHeight, cursorRotateInner, cursorRotateOuter]);

  const innerSpringScale = useSpring(cursorScaleInner, springConfig);
  const outerSpringScale = useSpring(cursorScaleOuter, springConfig);
  const springOpacity = useSpring(cursorOpacity, { stiffness: 400, damping: 30 });

  return createPortal(
    <div style={{ pointerEvents: "none", zIndex: 99999, position: "fixed", top: 0, left: 0, width: "100%", height: "100%" }}>
      {/* Inner dot */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          translateZ: 0,
          scale: innerSpringScale,
          rotate: rotateSpringInner,
          opacity: springOpacity,
          willChange: "transform, opacity",
          position: "absolute",
        }}
      >
        <motion.div
          style={{
            width: cursorInnerWidth,
            height: cursorInnerHeight,
            background: cursorBg,
            borderWidth: "2px",
            borderStyle: "solid",
            borderColor: cursorBorderColor,
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
          rotate: rotateSpringOuter,
          opacity: springOpacity,
          willChange: "transform, opacity",
          position: "absolute",
        }}
      >
        <motion.div
          style={{
            width: "36px",
            height: "36px",
            borderWidth: "2px",
            borderStyle: "solid",
            borderColor: cursorOuterBorderColor,
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

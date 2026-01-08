import { useEffect, useState, useRef, useCallback } from "react";
import "./CustomCursor.scss";

function CustomCursor() {
  const cursorRef = useRef(null);
  const cursorDotRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [cursorState, setCursorState] = useState("default");
  const [isEnabled, setIsEnabled] = useState(true);
  const [isClicking, setIsClicking] = useState(false);

  // Use refs for animation values to avoid re-renders
  const mousePos = useRef({ x: 0, y: 0 });
  const cursorPos = useRef({ x: 0, y: 0 });
  const dotPos = useRef({ x: 0, y: 0 });
  const animationRef = useRef(null);
  const isVisibleRef = useRef(false);

  const checkIfTouchDevice = useCallback(() => {
    // Check if device has fine pointer (mouse)
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    // Also check screen width as backup
    const isLargeScreen = window.innerWidth > 768;
    return !hasFinePointer && !isLargeScreen;
  }, []);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      setIsEnabled(false);
      return;
    }

    // Check for touch-only device
    if (checkIfTouchDevice()) {
      setIsEnabled(false);
      return;
    }

    // Add custom-cursor-active class to body
    document.body.classList.add("custom-cursor-active");

    const cursor = cursorRef.current;
    const cursorDot = cursorDotRef.current;

    if (!cursor || !cursorDot) return;

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }
    };

    const handleMouseEnter = () => {
      isVisibleRef.current = true;
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      isVisibleRef.current = false;
      setIsVisible(false);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleElementHover = (e) => {
      const target = e.target;

      if (
        target.closest(
          'a, button, [role="button"], .clickable, .nav__link, .home__social-link, .home__cta, .project-card, .skill-card, .cert-card, .experience__card, .menu-btn, input, textarea, select'
        )
      ) {
        if (
          target.closest('input, textarea, select, [contenteditable="true"]')
        ) {
          setCursorState("text");
        } else {
          setCursorState("link");
        }
      } else {
        setCursorState("default");
      }
    };

    // Smooth cursor animation with easing using requestAnimationFrame
    const animateCursor = () => {
      const ease = 0.12;
      const dotEase = 0.25;

      // Calculate eased positions
      cursorPos.current.x += (mousePos.current.x - cursorPos.current.x) * ease;
      cursorPos.current.y += (mousePos.current.y - cursorPos.current.y) * ease;
      dotPos.current.x += (mousePos.current.x - dotPos.current.x) * dotEase;
      dotPos.current.y += (mousePos.current.y - dotPos.current.y) * dotEase;

      // Apply transforms directly using transform
      if (cursor) {
        cursor.style.left = `${cursorPos.current.x}px`;
        cursor.style.top = `${cursorPos.current.y}px`;
      }
      if (cursorDot) {
        cursorDot.style.left = `${dotPos.current.x}px`;
        cursorDot.style.top = `${dotPos.current.y}px`;
      }

      animationRef.current = requestAnimationFrame(animateCursor);
    };

    // Add event listeners
    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseover", handleElementHover, {
      passive: true,
    });
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    // Start animation loop
    animateCursor();

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseover", handleElementHover);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.classList.remove("custom-cursor-active");
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [checkIfTouchDevice]);

  if (!isEnabled) return null;

  return (
    <>
      <div
        ref={cursorRef}
        className={`custom-cursor custom-cursor--${cursorState} ${
          isVisible ? "custom-cursor--visible" : ""
        } ${isClicking ? "custom-cursor--clicking" : ""}`}
      />
      <div
        ref={cursorDotRef}
        className={`custom-cursor-dot ${
          isVisible ? "custom-cursor-dot--visible" : ""
        } ${isClicking ? "custom-cursor-dot--clicking" : ""}`}
      />
    </>
  );
}

export default CustomCursor;

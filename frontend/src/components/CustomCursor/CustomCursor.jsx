import { useEffect, useState, useRef, useCallback } from "react";
import "./CustomCursor.scss";

function CustomCursor() {
  const cursorRef = useRef(null);
  const cursorDotRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [cursorState, setCursorState] = useState("default");
  const [isEnabled, setIsEnabled] = useState(true);
  const [isClicking, setIsClicking] = useState(false);

  const checkIfTouchDevice = useCallback(() => {
    // More reliable: check if device has fine pointer (mouse)
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    // If device has a fine pointer, it's likely a desktop/laptop with mouse
    return !hasFinePointer;
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
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let dotX = 0;
    let dotY = 0;
    let animationId;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleElementHover = (e) => {
      const target = e.target;

      if (
        target.closest(
          'a, button, [role="button"], .clickable, .nav__link, .home__social-link, .home__cta, .project-card, .skill-card, .cert-card, .experience__card'
        )
      ) {
        setCursorState("link");
      } else if (
        target.closest('input, textarea, select, [contenteditable="true"]')
      ) {
        setCursorState("text");
      } else {
        setCursorState("default");
      }
    };

    // Smooth cursor animation with easing
    const animateCursor = () => {
      const ease = 0.15;
      const dotEase = 0.3;

      cursorX += (mouseX - cursorX) * ease;
      cursorY += (mouseY - cursorY) * ease;
      dotX += (mouseX - dotX) * dotEase;
      dotY += (mouseY - dotY) * dotEase;

      if (cursor) {
        cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
      }
      if (cursorDot) {
        cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;
      }

      animationId = requestAnimationFrame(animateCursor);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseover", handleElementHover);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    animateCursor();

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseover", handleElementHover);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.classList.remove("custom-cursor-active");
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isVisible, checkIfTouchDevice]);

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

import { useEffect, useState, useRef } from "react";
import "./CustomCursor.scss";

function CustomCursor() {
  const cursorRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [cursorState, setCursorState] = useState("default");
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      setIsEnabled(false);
      return;
    }

    // Check for touch device
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      setIsEnabled(false);
      return;
    }

    // Add custom-cursor-active class to body
    document.body.classList.add("custom-cursor-active");

    const cursor = cursorRef.current;
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let animationId;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    const handleElementHover = (e) => {
      const target = e.target;

      if (
        target.closest(
          'a, button, [role="button"], .clickable, .nav__link, .home__social-link, .home__cta'
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
      const ease = 0.12;
      cursorX += (mouseX - cursorX) * ease;
      cursorY += (mouseY - cursorY) * ease;

      if (cursor) {
        cursor.style.transform = `translate3d(${cursorX - 15}px, ${
          cursorY - 15
        }px, 0)`;
      }

      animationId = requestAnimationFrame(animateCursor);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseover", handleElementHover);

    animateCursor();

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseover", handleElementHover);
      document.body.classList.remove("custom-cursor-active");
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isVisible]);

  if (!isEnabled) return null;

  return (
    <div
      ref={cursorRef}
      className={`custom-cursor custom-cursor--${cursorState} ${
        isVisible ? "custom-cursor--visible" : ""
      }`}
    >
      <div className="custom-cursor__inner" />
    </div>
  );
}

export default CustomCursor;

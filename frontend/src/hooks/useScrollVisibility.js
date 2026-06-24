import { useEffect, useRef, useState } from "react";

export function useScrollVisibility({
  topThreshold = 72,
  deltaThreshold = 12,
  revealOnBottomProximity = false,
  bottomProximity = 120,
} = {}) {
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastYRef = useRef(typeof window === "undefined" ? 0 : window.scrollY);
  const tickingRef = useRef(false);
  const visibleRef = useRef(true);

  useEffect(() => {
    const setVisible = (next) => {
      if (visibleRef.current === next) return;
      visibleRef.current = next;
      setIsVisible(next);
    };

    const update = () => {
      const currentY = Math.max(0, window.scrollY || window.pageYOffset || 0);
      const previousY = lastYRef.current;
      const delta = currentY - previousY;

      setIsScrolled(currentY > topThreshold * 0.6);

      if (currentY <= topThreshold) {
        setVisible(true);
      } else if (Math.abs(delta) >= deltaThreshold) {
        setVisible(delta < 0);
        lastYRef.current = currentY;
      }

      tickingRef.current = false;
    };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(update);
    };

    const onMouseMove = (event) => {
      if (revealOnBottomProximity && window.innerHeight - event.clientY < bottomProximity) {
        setVisible(true);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [bottomProximity, deltaThreshold, revealOnBottomProximity, topThreshold]);

  return { isVisible, isScrolled };
}

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Custom hook for mouse-reactive effects (parallax tilt, magnetic buttons).
 * Returns { x, y } normalized from -1 to 1 relative to the element.
 */
export function useMousePosition(ref, { sensitivity = 1, smoothing = 0.15 } = {}) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const animRef = useRef(null);
  const targetRef = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2 * sensitivity;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2 * sensitivity;
      targetRef.current = { x, y };
    },
    [ref, sensitivity]
  );

  const handleMouseLeave = useCallback(() => {
    targetRef.current = { x: 0, y: 0 };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    // Smooth interpolation loop
    const animate = () => {
      setPosition((prev) => ({
        x: prev.x + (targetRef.current.x - prev.x) * smoothing,
        y: prev.y + (targetRef.current.y - prev.y) * smoothing,
      }));
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [ref, handleMouseMove, handleMouseLeave, smoothing]);

  return position;
}

/**
 * Custom hook for magnetic button effect.
 * Pulls the element slightly toward the cursor when hovering nearby.
 */
export function useMagnetic(ref, { strength = 0.3, radius = 100 } = {}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const distance = Math.sqrt(distX * distX + distY * distY);

      if (distance < radius) {
        const factor = (1 - distance / radius) * strength;
        setOffset({ x: distX * factor, y: distY * factor });
      } else {
        setOffset({ x: 0, y: 0 });
      }
    };

    const handleMouseLeave = () => {
      setOffset({ x: 0, y: 0 });
    };

    window.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [ref, strength, radius]);

  return offset;
}

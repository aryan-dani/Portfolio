import { useState, useEffect, useRef } from "react";

/**
 * Animated counter that counts from `start` to `end` when triggered.
 * Returns the current display value.
 *
 * @param {number} end - Target number
 * @param {object} options
 * @param {number} options.start - Starting number (default 0)
 * @param {number} options.duration - Animation duration in ms (default 2000)
 * @param {boolean} options.trigger - When true, starts counting (default true)
 * @param {string} options.suffix - Suffix to append (e.g. "+", "%")
 */
export function useCountUp(end, { start = 0, duration = 2000, trigger = true, suffix = "" } = {}) {
  const [value, setValue] = useState(start);
  const startTime = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (!trigger) {
      setValue(start);
      return;
    }

    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      
      // Ease-out cubic for satisfying deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      
      setValue(current);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    startTime.current = null;
    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [end, start, duration, trigger]);

  return suffix ? `${value}${suffix}` : value;
}

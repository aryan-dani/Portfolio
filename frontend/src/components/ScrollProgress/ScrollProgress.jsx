import { memo, useEffect, useRef } from "react";

/**
 * Hairline reading-progress bar pinned to the top edge. One scroll listener,
 * one transform write per frame; hidden at the very top of the page.
 */
const ScrollProgress = memo(function ScrollProgress() {
  const barRef = useRef(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return undefined;

    let raf = 0;
    const paint = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.transform = `scaleX(${ratio.toFixed(4)})`;
      bar.style.opacity = window.scrollY > 24 ? "1" : "0";
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[99990] h-[3px] w-full origin-left bg-on-background transition-opacity duration-300"
      style={{ transform: "scaleX(0)", opacity: 0 }}
    />
  );
});

export default ScrollProgress;

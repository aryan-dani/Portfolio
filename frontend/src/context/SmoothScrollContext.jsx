import Lenis from "lenis";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const SmoothScrollContext = createContext(null);

export function SmoothScrollProvider({ children }) {
  const lenisRef = useRef(null);
  const rafRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.11,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1,
      infinite: false,
      autoResize: true,
      virtualScroll: ({ event }) => !event.ctrlKey,
    });

    lenisRef.current = lenis;
    window.__portfolioLenis = lenis;
    document.documentElement.classList.add("lenis", "lenis-smooth");
    setReady(true);

    const raf = (time) => {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };

    rafRef.current = requestAnimationFrame(raf);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lenis.destroy();
      lenisRef.current = null;
      window.__portfolioLenis = null;
      document.documentElement.classList.remove("lenis", "lenis-smooth", "lenis-stopped");
      setReady(false);
    };
  }, []);

  const value = useMemo(
    () => ({
      lenis: lenisRef.current,
      ready,
      scrollTo: (target, options) => {
        const top = typeof target === "number" ? target : 0;
        if (lenisRef.current) {
          lenisRef.current.scrollTo(top, {
            duration: options?.immediate ? 0 : 0.68,
            ...options,
          });
          return;
        }
        window.scrollTo({ top, behavior: options?.immediate ? "auto" : "smooth" });
      },
    }),
    [ready],
  );

  return <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>;
}

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}

import Lenis from "lenis";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { shouldUseSmoothScroll } from "../utils/device";

const SmoothScrollContext = createContext(null);

/** How long after the last input before the RAF loop can sleep. */
const IDLE_STOP_MS = 220;

function shouldKeepLenisLoopAlways() {
  if (typeof window === "undefined") return false;
  if (window.__LENIS_ALWAYS__) return true;
  try {
    return window.localStorage?.getItem("portfolio_lenis_always") === "1";
  } catch {
    return false;
  }
}

export function SmoothScrollProvider({ children }) {
  const lenisRef = useRef(null);
  const rafRef = useRef(null);
  const idleTimerRef = useRef(null);
  const loopingRef = useRef(false);
  const kickRef = useRef(() => {});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!shouldUseSmoothScroll()) {
      setReady(true);
      return undefined;
    }

    const lenis = new Lenis({
      lerp: 0.16,
      smoothWheel: true,
      wheelMultiplier: 0.92,
      touchMultiplier: 0.95,
      infinite: false,
      autoResize: true,
      // Do not use Lenis autoRaf: the loop below starts on input and sleeps
      // when idle, so a continuous RAF is not left running forever.
      virtualScroll: ({ event }) => !event.ctrlKey,
    });

    lenisRef.current = lenis;
    window.__portfolioLenis = lenis;
    document.documentElement.classList.add("lenis", "lenis-smooth");
    setReady(true);

    const lenisLoopAlways = shouldKeepLenisLoopAlways();

    const stopLoop = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      loopingRef.current = false;
    };

    const raf = (time) => {
      lenis.raf(time);
      if (lenisLoopAlways || loopingRef.current) {
        rafRef.current = requestAnimationFrame(raf);
      } else {
        rafRef.current = null;
      }
    };

    const ensureLoop = () => {
      if (rafRef.current) return;
      loopingRef.current = true;
      rafRef.current = requestAnimationFrame(raf);
    };

    /**
     * Lenis only emits "scroll" from inside raf(), so an idle-stopped loop
     * can never wake itself from wheel input alone. Kick the loop from the
     * same gestures that feed Lenis, then let it sleep again once settled.
     */
    const kick = () => {
      loopingRef.current = true;
      ensureLoop();
      if (lenisLoopAlways) return;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = window.setTimeout(() => {
        loopingRef.current = false;
      }, IDLE_STOP_MS);
    };

    kickRef.current = kick;

    if (lenisLoopAlways) {
      ensureLoop();
    } else {
      // wheel / touch / keys: Lenis handles the gesture; we only keep raf alive.
      window.addEventListener("wheel", kick, { passive: true });
      window.addEventListener("touchstart", kick, { passive: true });
      window.addEventListener("touchmove", kick, { passive: true });
      window.addEventListener("keydown", kick, { passive: true });
      lenis.on("scroll", kick);
      kick();
    }

    return () => {
      kickRef.current = () => {};
      if (!lenisLoopAlways) {
        window.removeEventListener("wheel", kick);
        window.removeEventListener("touchstart", kick);
        window.removeEventListener("touchmove", kick);
        window.removeEventListener("keydown", kick);
        lenis.off("scroll", kick);
      }
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      stopLoop();
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
          kickRef.current();
          lenisRef.current.scrollTo(top, {
            duration: options?.immediate ? 0 : 0.55,
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

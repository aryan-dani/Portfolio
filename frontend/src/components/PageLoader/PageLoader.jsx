import { useState, useEffect, useCallback, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTerminal, FaVolumeMute, FaVolumeUp, FaForward } from "react-icons/fa";
import { getAssetPath } from "../../utils/paths";

const SESSION_KEY = "portfolio_visited";
const PHASES = {
  VIDEO: 0,
  TERMINAL: 1,
  EXIT: 2,
  DONE: 3,
};

function shouldSkipBootLoader() {
  if (typeof navigator === "undefined") return true;
  if (navigator.webdriver) return true;
  const ua = navigator.userAgent || "";
  return /bot|crawl|spider|lighthouse|pagespeed|chrome-lighthouse|headless/i.test(ua);
}

const PageLoader = memo(function PageLoader() {
  const skipBoot = shouldSkipBootLoader();
  const hasVisited = skipBoot || (typeof window !== "undefined" && Boolean(sessionStorage.getItem(SESSION_KEY)));
  const [isLoading, setIsLoading] = useState(!hasVisited);
  const [phase, setPhase] = useState(hasVisited ? PHASES.DONE : PHASES.VIDEO);

  // Video State
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);

  // Terminal State
  const [terminalStep, setTerminalStep] = useState(0);
  const [memSize, setMemSize] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Prefers-reduced-motion check
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  // Save session on finish
  useEffect(() => {
    if (!isLoading && !hasVisited) {
      sessionStorage.setItem(SESSION_KEY, "true");
    }
  }, [isLoading, hasVisited]);

  const advanceToTerminal = useCallback(() => {
    setPhase((prev) => {
      if (prev === PHASES.VIDEO) {
        return PHASES.TERMINAL;
      }
      return prev;
    });
  }, []);

  const skipLoader = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setPhase(PHASES.EXIT);
    setTimeout(() => {
      setIsLoading(false);
      setPhase(PHASES.DONE);
      sessionStorage.setItem(SESSION_KEY, "true");
    }, 350);
  }, []);

  // Listen for replay-intro custom event
  useEffect(() => {
    const handleReplay = () => {
      sessionStorage.removeItem(SESSION_KEY);
      setPhase(PHASES.VIDEO);
      setIsLoading(true);
      setTerminalStep(0);
      setMemSize(0);
      setVideoProgress(0);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    };
    window.addEventListener("replay-intro", handleReplay);
    return () => window.removeEventListener("replay-intro", handleReplay);
  }, []);

  // Keyboard shortcut: Escape to skip
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isLoading) {
        skipLoader();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoading, skipLoader]);

  // Phase 0: VIDEO PLAYBACK
  useEffect(() => {
    if (phase !== PHASES.VIDEO) return;
    if (hasVisited) {
      setPhase(PHASES.DONE);
      setIsLoading(false);
      return;
    }

    if (reduceMotion) {
      advanceToTerminal();
      return;
    }

    const vid = videoRef.current;
    if (vid) {
      vid.currentTime = 0;
      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay was prevented (e.g. low power mode), continue muted
          vid.muted = true;
          vid.play().catch(() => {
            // If still blocked, advance directly to terminal after brief pause
            setTimeout(advanceToTerminal, 600);
          });
        });
      }
    }

    // Safety timeout: video is ~4.8s, fallback after 5.5s so user is never stuck
    const fallbackTimer = setTimeout(() => {
      advanceToTerminal();
    }, 5500);

    return () => {
      clearTimeout(fallbackTimer);
    };
  }, [phase, hasVisited, reduceMotion, advanceToTerminal]);

  // Phase 1: TERMINAL BIOS BOOTING
  useEffect(() => {
    if (phase !== PHASES.TERMINAL) return;

    // Fast memory count up: 0 -> 1024MB
    let currentMem = 0;
    const memInterval = setInterval(() => {
      currentMem += Math.floor(Math.random() * 160) + 96;
      if (currentMem >= 1024) {
        currentMem = 1024;
        clearInterval(memInterval);
      }
      setMemSize(currentMem);
    }, 60);

    const timers = [
      setTimeout(() => setTerminalStep(1), 80),
      setTimeout(() => setTerminalStep(2), 320),
      setTimeout(() => setTerminalStep(3), 560),
      setTimeout(() => setTerminalStep(4), 800),
      setTimeout(() => setTerminalStep(5), 1040),
      setTimeout(() => setPhase(PHASES.EXIT), 1320),
    ];

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(memInterval);
    };
  }, [phase]);

  // Phase 2: EXIT SHUTTER TRANSITION
  useEffect(() => {
    if (phase !== PHASES.EXIT) return;
    const exitTimer = setTimeout(() => {
      setIsLoading(false);
      setPhase(PHASES.DONE);
      sessionStorage.setItem(SESSION_KEY, "true");
    }, 620);

    return () => clearTimeout(exitTimer);
  }, [phase]);

  const toggleSound = () => {
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(Math.min(pct, 100));
    }
  };

  if (!isLoading || phase === PHASES.DONE) {
    return null;
  }

  const terminalProgress = Math.min((terminalStep / 5) * 100, 100);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-99999 flex items-center justify-center bg-[#070707] text-[#f4f4f0] select-none overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="status"
          aria-live="polite"
          aria-label="Aryan Dani Portfolio Loading Sequence"
        >
          {/* Subtle CRT scanline overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20 z-10"
            style={{
              backgroundImage:
                "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.45) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.04), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.04))",
              backgroundSize: "100% 3px, 6px 100%",
            }}
          />

          {/* Top Header Bar */}
          <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 border-b-2 border-white/10 bg-black/70 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-widest text-white/90">
                ARYAN_DANI // {phase === PHASES.VIDEO ? "MATCH_CUT_INTRO" : "SYSTEM_BIOS_V4.0"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {phase === PHASES.VIDEO && (
                <button
                  type="button"
                  onClick={toggleSound}
                  className="border border-white/20 hover:border-white/60 bg-white/5 hover:bg-white/10 px-2.5 py-1 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                  aria-label={isMuted ? "Unmute video sound" : "Mute video sound"}
                >
                  {isMuted ? (
                    <>
                      <FaVolumeMute className="text-red-400" />
                      <span className="hidden sm:inline">Unmute</span>
                    </>
                  ) : (
                    <>
                      <FaVolumeUp className="text-green-400" />
                      <span className="hidden sm:inline">Muted off</span>
                    </>
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={skipLoader}
                className="border-2 border-outline bg-[var(--color-surface)] text-[var(--color-on-surface)] px-3 py-1.5 font-label-bold text-xs uppercase tracking-wider shadow-[3px_3px_0_var(--shadow-color)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer flex items-center gap-1.5"
                aria-label="Skip introduction animation"
              >
                <span>Skip</span>
                <FaForward className="text-[10px]" />
              </button>
            </div>
          </header>

          {/* STAGE 1: 16:9 MATCH-CUT VIDEO */}
          {phase === PHASES.VIDEO && (
            <motion.div
              className="relative z-20 w-full max-w-5xl px-4 flex flex-col items-center justify-center"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <div className="relative w-full aspect-video max-h-[75vh] border-4 border-white/20 bg-black shadow-[12px_12px_0_0_#000] overflow-hidden group">
                <video
                  ref={videoRef}
                  src={getAssetPath("/videos/textmatchcut.mp4")}
                  playsInline
                  autoPlay
                  muted={isMuted}
                  preload="auto"
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={advanceToTerminal}
                  onError={advanceToTerminal}
                  className="w-full h-full object-contain bg-black"
                />

                {/* 16:9 Corner Reticles */}
                <span className="absolute top-2 left-2 text-[10px] font-mono text-white/40 select-none">
                  [+ 16:9 REC]
                </span>
                <span className="absolute top-2 right-2 text-[10px] font-mono text-white/40 select-none">
                  [1080P // 30FPS]
                </span>
                <span className="absolute bottom-2 left-2 text-[10px] font-mono text-white/40 select-none">
                  [CHRONICLE_CUT]
                </span>
                <span className="absolute bottom-2 right-2 text-[10px] font-mono text-white/40 select-none">
                  [OPTICAL_LOCK]
                </span>

                {/* Bottom Scrub Progress Line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-100 ease-linear"
                    style={{ width: `${videoProgress}%` }}
                  />
                </div>
              </div>

              {/* Sub-bar captions */}
              <div className="w-full flex items-center justify-between mt-3 text-xs font-mono text-white/60">
                <span>PRESS ESC TO SKIP</span>
                <span className="uppercase tracking-widest text-yellow-400 font-semibold">
                  MATCH CUT BROADSHEET ARCHIVE
                </span>
                <span>STAGE 1 / 3</span>
              </div>
            </motion.div>
          )}

          {/* STAGE 2: ORIGINAL TERMINAL BIOS BOOT */}
          {phase === PHASES.TERMINAL && (
            <motion.div
              className="relative z-20 w-full max-w-2xl px-4"
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 1.03 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="nb-loader shadow-[12px_12px_0_0_#000]">
                {/* BIOS Header */}
                <div className="nb-loader__header">
                  <div className="nb-loader__header-dots">
                    <span className="nb-loader__header-dot" />
                    <span className="nb-loader__header-dot" />
                    <span className="nb-loader__header-dot" />
                  </div>
                  <div className="nb-loader__title">
                    <FaTerminal className="text-sm shrink-0" />
                    <span>ARYAN_DANI // SYSTEM_BIOS_V4.0</span>
                  </div>
                  <div className="nb-loader__badge">BOOTING</div>
                </div>

                {/* Console Output */}
                <div className="nb-loader__body min-h-[200px]">
                  <div className="nb-loader__line nb-loader__line--command">
                    &gt; INITIALIZING SYSTEM BOOT SEQUENCE...
                  </div>

                  <div className="nb-loader__line">
                    ↳ SYSTEM MEMORY CHECK: {memSize}MB OK
                  </div>

                  {terminalStep >= 1 && (
                    <motion.div
                      className="nb-loader__line nb-loader__line--success"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                    >
                      ✔ HYDRATING CORE COMPONENT REGISTRY... DONE
                    </motion.div>
                  )}
                  {terminalStep >= 2 && (
                    <motion.div
                      className="nb-loader__line text-xs opacity-70 ml-4"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, delay: 0.04, ease: "easeOut" }}
                    >
                      ↳ [React v18.2.0, Framer Motion v11.0.0, Tailwind v4.0.0]
                    </motion.div>
                  )}
                  {terminalStep >= 3 && (
                    <motion.div
                      className="nb-loader__line nb-loader__line--success"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                    >
                      ✔ SPINNING UP DATA LAYERS & PLAYGROUND SANDBOX... DONE
                    </motion.div>
                  )}
                  {terminalStep >= 4 && (
                    <motion.div
                      className="nb-loader__line nb-loader__line--success"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                    >
                      ✔ SPARKING NEURAL HANDSHAKE ACCELERATORS... DONE
                    </motion.div>
                  )}
                  {terminalStep >= 5 && (
                    <motion.div
                      className="nb-loader__line nb-loader__line--final w-full text-yellow-300 font-bold"
                      initial={{ opacity: 0, scale: 0.96, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    >
                      [ SYSTEM ONLINE ] Boot sequence successful. Redirecting to portfolio...
                    </motion.div>
                  )}
                  {terminalStep < 5 && <span className="nb-loader__cursor" />}
                </div>

                {/* Progress fill */}
                <div className="nb-loader__progress-track">
                  <div
                    className="nb-loader__progress-fill"
                    style={{
                      transform: `translateX(${terminalProgress - 100}%)`,
                      willChange: "transform",
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STAGE 3: SHUTTER EXIT TRANSITION PANELS */}
          {phase === PHASES.EXIT && (
            <div className="fixed inset-0 z-99999 flex pointer-events-none">
              {Array.from({ length: 6 }).map((_, index) => {
                const isEven = index % 2 === 0;
                return (
                  <motion.div
                    key={index}
                    className="page-loader__shutter"
                    style={{
                      left: `${(index / 6) * 100}%`,
                      width: "calc(100% / 6 + 1.5px)",
                    }}
                    initial={{ y: 0 }}
                    animate={{ y: isEven ? "-100%" : "100%" }}
                    transition={{
                      duration: 0.52,
                      ease: [0.76, 0, 0.24, 1],
                      delay: index * 0.02,
                    }}
                  />
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default PageLoader;

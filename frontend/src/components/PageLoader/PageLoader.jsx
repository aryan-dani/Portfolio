import { useState, useEffect, useCallback, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaVolumeMute, FaVolumeUp, FaForward } from "react-icons/fa";
import { getAssetPath } from "../../utils/paths";
import { readStorage, writeStorage, removeStorage } from "../../utils/storage";
import { useSound } from "../../context/SoundContext";
import "./PageLoader.scss";

const SESSION_KEY = "portfolio_visited";
const VIDEO_PLAYBACK_RATE = 1.08;
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
  const hasVisited =
    skipBoot || Boolean(readStorage(SESSION_KEY, null, "session"));
  const { enabled: soundEnabled, toggleSound, unlockAudio } = useSound();
  const [isLoading, setIsLoading] = useState(!hasVisited);
  const [phase, setPhase] = useState(hasVisited ? PHASES.DONE : PHASES.VIDEO);

  // Video State: unmuted by default
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(() => !soundEnabled);
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
      writeStorage(SESSION_KEY, "true", "session");
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
  }, []);

  const completeLoader = useCallback(() => {
    window.dispatchEvent(new CustomEvent("portfolio-intro-complete"));
    setIsLoading(false);
    setPhase(PHASES.DONE);
    writeStorage(SESSION_KEY, "true", "session");
  }, []);

  // Listen for replay-intro custom event
  useEffect(() => {
    const handleReplay = () => {
      removeStorage(SESSION_KEY, "session");
      setPhase(PHASES.VIDEO);
      setIsLoading(true);
      setTerminalStep(0);
      setMemSize(0);
      setVideoProgress(0);
      setIsMuted(!soundEnabled);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.playbackRate = VIDEO_PLAYBACK_RATE;
        videoRef.current.muted = !soundEnabled;
        videoRef.current.play().catch(() => {});
      }
    };
    window.addEventListener("replay-intro", handleReplay);
    return () => window.removeEventListener("replay-intro", handleReplay);
  }, [soundEnabled]);

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

  // Phase 0: VIDEO PLAYBACK (Fullscreen & Unmuted)
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
      vid.playbackRate = VIDEO_PLAYBACK_RATE;
      vid.muted = !soundEnabled;

      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // If browser blocks unmuted autoplay without prior interaction, fallback to muted so it doesn't freeze
          console.warn("Autoplay with sound was blocked by browser policy, continuing muted with unmute badge:", err);
          vid.muted = true;
          setIsMuted(true);
          vid.play().catch(() => {
            advanceToTerminal();
          });
        });
      }
    }

    const enableSoundFromGesture = () => {
      if (!videoRef.current?.muted) return;
      if (!soundEnabled) toggleSound();
      void unlockAudio({ allowDisabled: true }).then((ctx) => {
        if (!ctx || !videoRef.current) return;
        videoRef.current.muted = false;
        setIsMuted(false);
      });
    };

    const onIntroKeyDown = (event) => {
      if (event.key === "Enter" || event.key === " ") enableSoundFromGesture();
    };

    document.addEventListener("keydown", onIntroKeyDown);

    // Safety timeout: video is ~4.8s, fallback after 5.5s so loader never hangs
    const fallbackTimer = setTimeout(() => {
      advanceToTerminal();
    }, 5500);

    return () => {
      clearTimeout(fallbackTimer);
      document.removeEventListener("keydown", onIntroKeyDown);
    };
  }, [phase, hasVisited, reduceMotion, soundEnabled, advanceToTerminal, toggleSound, unlockAudio]);

  useEffect(() => {
    if (!isLoading) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isLoading]);

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
      setTimeout(() => setPhase(PHASES.EXIT), 1350),
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
      completeLoader();
    }, 620);

    return () => clearTimeout(exitTimer);
  }, [phase, completeLoader]);

  const toggleIntroSound = async (e) => {
    e?.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.muted) {
        if (!soundEnabled) toggleSound();
        await unlockAudio({ allowDisabled: true });
        videoRef.current.muted = false;
        setIsMuted(false);
        videoRef.current.play().catch(() => {});
        return;
      }

      videoRef.current.muted = true;
      setIsMuted(true);
      if (soundEnabled) toggleSound();
    }
  };

  const handleVideoInteraction = (e) => {
    if (e.target.closest?.("button") || !videoRef.current?.muted) return;
    void toggleIntroSound(e);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      const nextProgress = Math.min(Math.round(pct), 100);
      setVideoProgress((previousProgress) =>
        previousProgress === nextProgress ? previousProgress : nextProgress,
      );
    }
  };

  if (!isLoading || phase === PHASES.DONE) {
    return null;
  }

  const terminalProgress = Math.round((Math.min(terminalStep, 5) / 5) * 100);
  const globalProgress =
    phase === PHASES.VIDEO
      ? Math.round(videoProgress * 0.5)
      : phase === PHASES.TERMINAL
      ? Math.round(50 + (Math.min(terminalStep, 5) / 5) * 50)
      : 100;

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className={`page-loader ${phase === PHASES.EXIT ? "page-loader--exit" : ""}`}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, ease: "easeInOut" } }}
          role="status"
          aria-live="polite"
          aria-label="Aryan Dani Portfolio Loading Sequence"
        >
          {/* Authentic neo-brutalist animated backgrounds */}
          <div className="page-loader__grid" />
          <div className="page-loader__scanline" />
          <div className="page-loader__orbital" aria-hidden="true" />

          {/* Central Stage with mode="wait" for smooth crossfade */}
          <AnimatePresence mode="wait">
            {/* STAGE 1: FULLSCREEN UNMUTED 16:9 MATCH-CUT VIDEO */}
            {phase === PHASES.VIDEO && (
              <motion.div
                key="video-fullscreen-stage"
                className="page-loader__video-stage fixed inset-0 z-30 w-full h-full flex items-center justify-center overflow-hidden"
                onPointerDown={handleVideoInteraction}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
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
                  className="w-full h-full object-cover"
                />

                <div className="page-loader__video-vignette" aria-hidden="true" />
                <div className="page-loader__video-brand" aria-hidden="true">
                  <span className="page-loader__video-title">BUILDING USEFUL INTELLIGENCE</span>
                </div>

                {/* Minimal Fullscreen Floating Controls */}
                <motion.div
                  className="page-loader__controls absolute top-4 right-4 z-40 flex items-center gap-2"
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.42, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
                >
                  {isMuted && (
                    <button
                      type="button"
                      onClick={toggleIntroSound}
                      className="page-loader__control page-loader__control--primary"
                      aria-label="Unmute audio"
                    >
                      <FaVolumeMute className="text-yellow-400" />
                      <span>Enable sound</span>
                    </button>
                  )}
                  {!isMuted && (
                    <button
                      type="button"
                      onClick={toggleIntroSound}
                      className="page-loader__control page-loader__control--quiet"
                      aria-label="Mute audio"
                    >
                      <FaVolumeUp className="text-green-400" />
                      <span>Sound on</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={skipLoader}
                    className="page-loader__control page-loader__control--skip"
                    aria-label="Skip intro"
                  >
                    <span>Enter site</span>
                    <FaForward className="text-[10px]" />
                  </button>
                </motion.div>

                {/* Corner Video HUD Badges */}
                {/* Bottom Scrub Progress Line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-40">
                  <div
                    className="h-full origin-left bg-white transition-transform duration-100 ease-linear"
                    style={{ transform: `scaleX(${videoProgress / 100})` }}
                  />
                </div>
              </motion.div>
            )}

            {/* STAGE 2: ORIGINAL TERMINAL BIOS BOOT WITH THEME BACKGROUND */}
            {phase === PHASES.TERMINAL && (
              <motion.div
                key="terminal-stage"
                className="w-full h-full flex items-center justify-center relative z-10 p-4"
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -16, filter: "blur(2px)" }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="nb-loader max-w-180 w-full">
                  {/* BIOS Header */}
                  <div className="nb-loader__header">
                    <div className="nb-loader__header-dots">
                      <span className="nb-loader__header-dot" />
                      <span className="nb-loader__header-dot" />
                      <span className="nb-loader__header-dot" />
                    </div>
                    <span className="nb-loader__title">
                      ARYAN_DANI // SYSTEM_BIOS_V4.0
                    </span>
                    <span className="nb-loader__badge">
                      BOOTING
                    </span>
                  </div>

                  {/* Console Output */}
                  <div className="nb-loader__body text-left min-h-55">
                    {terminalStep >= 1 && (
                      <motion.div
                        className="nb-loader__line nb-loader__line--command"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                      >
                        &gt; INITIALIZING SYSTEM BOOT SEQUENCE...
                      </motion.div>
                    )}

                    {terminalStep >= 1 && (
                      <motion.div
                        className="nb-loader__line text-xs opacity-75 ml-4"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18, delay: 0.04, ease: "easeOut" }}
                      >
                        ↳ SYSTEM MEMORY CHECK: {memSize}MB / 1024MB OK
                      </motion.div>
                    )}

                    {terminalStep >= 2 && (
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
                        className="nb-loader__line text-xs opacity-75 ml-4"
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

                {/* Skip button on terminal stage */}
                <button
                  type="button"
                  onClick={skipLoader}
                  className="absolute right-4 top-4 z-30 border-2 border-outline bg-surface px-3 py-1.5 font-label-bold text-xs uppercase tracking-widest text-on-surface shadow-[3px_3px_0_var(--shadow-color)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer"
                >
                  Skip
                </button>
              </motion.div>
            )}
          </AnimatePresence>

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

          {/* Global progress tracker */}
          <div className="page-loader__global-progress">
            <motion.div
              className="page-loader__global-progress-fill w-full origin-left"
              style={{ willChange: "transform" }}
              animate={{ scaleX: globalProgress / 100 }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default PageLoader;

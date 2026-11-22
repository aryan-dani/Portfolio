import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useAchievements } from "../../context/AchievementContext";
import { useTheme } from "../../context/ThemeContext";
import { useSound } from "../../context/SoundContext";
import { isFinePointerDevice } from "../../utils/device";
import { useMotionPolicy } from "../../hooks/useMotionPolicy";
import { useSiteIdle } from "../../hooks/useSiteIdle";
import { useModalLock } from "../../hooks/useModalLock";
import { executeKuroActions, describeKuroActions } from "../../utils/kuroActions";
import { getDynamicPlaceholder, getDynamicSuggestionChips } from "../../utils/kuroTips";
import { KURO_EMPTY_CHIPS } from "../../data/kuroFacts";
import {
  getKuroWelcomeLine,
  getKuroPageLine,
  hasMetKuro,
  hasVisitedPage,
  markKuroMet,
  markPageVisited,
} from "../../data/kuroRouteLines";
import { KuroFace, KuroTail, SleepSnore } from "./KuroFace";
import ChatPanel from "./ChatPanel";
import { useKuroChat, preloadKuroRouter } from "./useKuroChat";

const EYE_RANGE = 3.2;
const PET_LINES = ["*tail wag*", "*happy pant*", "Good boy.", "*ear flop*", "*lean*", "More pets please."];
const PANEL_PREFS_KEY = "portfolio_kuro_panel";
const DEFAULT_PANEL_W = 380;
const DEFAULT_PANEL_H = 460;
const MIN_PANEL_W = 320;
const MIN_PANEL_H = 300;

function loadPanelPrefs() {
  try {
    const raw = sessionStorage.getItem(PANEL_PREFS_KEY);
    if (!raw) return { pinned: false, size: null };
    const parsed = JSON.parse(raw);
    return {
      pinned: Boolean(parsed.pinned),
      size:
        parsed.size &&
        Number.isFinite(parsed.size.w) &&
        Number.isFinite(parsed.size.h)
          ? { w: parsed.size.w, h: parsed.size.h }
          : null,
    };
  } catch {
    return { pinned: false, size: null };
  }
}

function savePanelPrefs({ pinned, size }) {
  try {
    sessionStorage.setItem(
      PANEL_PREFS_KEY,
      JSON.stringify({ pinned: Boolean(pinned), size: size || null }),
    );
  } catch {
    /* ignore */
  }
}

function clampPanelSize(w, h) {
  const maxW = Math.max(MIN_PANEL_W, window.innerWidth - 48);
  const maxH = Math.max(MIN_PANEL_H, window.innerHeight - 120);
  return {
    w: Math.min(maxW, Math.max(MIN_PANEL_W, Math.round(w))),
    h: Math.min(maxH, Math.max(MIN_PANEL_H, Math.round(h))),
  };
}

/** Welcome / pet bubble above the dog. Offset to left-12 so it never covers the availability chip. */
function RouteBubble({ text }) {
  return (
    <motion.div
      className="absolute bottom-full left-12 mb-3 w-[min(260px,calc(100vw-4rem))] border border-outline bg-surface px-3 py-2.5 shadow-[4px_4px_0_var(--shadow-color)] z-0 pointer-events-none"
      initial={{ opacity: 0, y: 8, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
    >
      <p className="font-body-md text-sm text-on-surface leading-snug whitespace-normal">{text}</p>
      <span
        className="absolute -bottom-2 left-8 h-3 w-3 rotate-45 border-r-2 border-b-2 border-outline bg-surface"
        aria-hidden="true"
      />
    </motion.div>
  );
}

/** Panel open/close motion: springs out of the dog (bottom-left), fade-only when motion is reduced. */
function panelMotion(policy) {
  if (policy === "reduced") {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.12 },
    };
  }
  return {
    initial: { opacity: 0, scale: policy === "full" ? 0.5 : 0.8, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.7, y: 14, transition: { duration: 0.16, ease: "easeIn" } },
    transition: { type: "spring", stiffness: 380, damping: 26, mass: 0.9 },
  };
}

const ChatWidget = memo(function ChatWidget() {
  const finePointer = isFinePointerDevice();
  const motionPolicy = useMotionPolicy();
  const fx = motionPolicy === "full";
  const isIdle = useSiteIdle(9000);
  const initialPrefs = useRef(loadPanelPrefs()).current;
  const [chatOpen, setChatOpen] = useState(() => Boolean(initialPrefs.pinned));
  const [welcomeBubble, setWelcomeBubble] = useState(null);
  const [petBubble, setPetBubble] = useState(null);
  const [petting, setPetting] = useState(false);
  const [dogHovered, setDogHovered] = useState(false);
  const [input, setInput] = useState("");
  const [placeholder] = useState(() => getDynamicPlaceholder());
  const [pageChips, setPageChips] = useState(() => getDynamicSuggestionChips("/", 2));
  const [inputFocused, setInputFocused] = useState(false);
  const [pinned, setPinned] = useState(() => Boolean(initialPrefs.pinned));
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [panelSize, setPanelSize] = useState(() => initialPrefs.size);
  const [resizing, setResizing] = useState(false);
  const [swarmPhase, setSwarmPhase] = useState(null);
  const [tailFlick, setTailFlick] = useState(0);
  const swarmTimerRef = useRef(null);

  const { track } = useAchievements();
  const { toggleTheme, setCrtMode, setAccent, theme, crtMode, accent } = useTheme();
  const { enabled: soundEnabled, toggleSound } = useSound();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setPageChips(getDynamicSuggestionChips(location.pathname, 2));
  }, [location.pathname]);

  const inputRef = useRef(null);
  const widgetRef = useRef(null);
  const dogRef = useRef(null);
  const pupilsRef = useRef(null);
  const closeTimerRef = useRef(0);
  const bubbleTimerRef = useRef(0);
  const petTimerRef = useRef(0);
  const welcomeShownRef = useRef(hasMetKuro());
  const sleepingRef = useRef(false);
  const blissRef = useRef(false);
  const eyeRafRef = useRef(0);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const lastActionRef = useRef(null);
  const pointerInsideRef = useRef(false);
  const inputFocusedRef = useRef(false);
  const holdOpenRef = useRef(false);
  const resizeStartRef = useRef(null);
  const seenMessageRef = useRef(null);
  const welcomeLine = useRef(getKuroWelcomeLine()).current;
  const bounce = useAnimationControls();

  const holdOpen = pinned || isFullscreen || Boolean(panelSize) || resizing;
  holdOpenRef.current = holdOpen;

  useModalLock(isFullscreen, () => setIsFullscreen(false));

  const showBubble = useCallback((text, ms = 6500) => {
    setWelcomeBubble(text);
    clearTimeout(bubbleTimerRef.current);
    bubbleTimerRef.current = window.setTimeout(() => setWelcomeBubble(null), ms);
  }, []);

  const showFirstVisitWelcome = useCallback(() => {
    if (welcomeShownRef.current) return;
    welcomeShownRef.current = true;
    markKuroMet();
    showBubble(getKuroWelcomeLine(), 7000);
  }, [showBubble]);

  useEffect(() => {
    const path = location.pathname;
    if (hasVisitedPage(path)) return undefined;
    markPageVisited(path);
    const timer = window.setTimeout(() => {
      showBubble(getKuroPageLine(path), 6000);
    }, 400);
    return () => clearTimeout(timer);
  }, [location.pathname, showBubble]);

  const petDog = useCallback(() => {
    setPetting(true);
    setTailFlick((n) => n + 1);
    setPetBubble(PET_LINES[Math.floor(Math.random() * PET_LINES.length)]);
    clearTimeout(petTimerRef.current);
    petTimerRef.current = window.setTimeout(() => {
      setPetting(false);
      setPetBubble(null);
    }, 1400);
  }, []);

  /* ----------------------------------------------------------- site actions */

  const setThemeTo = useCallback(
    (target) => {
      if (crtMode) {
        // Leaving CRT lands on the stored theme; only flip again when it differs.
        if (target === theme) setCrtMode(false);
        else toggleTheme();
        return;
      }
      if (target !== theme) toggleTheme();
    },
    [crtMode, theme, setCrtMode, toggleTheme],
  );

  const setSoundTo = useCallback(
    (enabled) => {
      if (enabled === undefined || enabled !== soundEnabled) toggleSound();
    },
    [soundEnabled, toggleSound],
  );

  const runActions = useCallback(
    (actions) => {
      executeKuroActions(actions, {
        navigate,
        toggleTheme,
        setTheme: setThemeTo,
        setSound: setSoundTo,
        setCrtMode,
        setAccent,
        petKuro: petDog,
        track,
        onAction: (executed) => {
          if (executed.length) {
            lastActionRef.current = {
              type: executed[0].type,
              enabled: executed[0].enabled,
              page: executed[0].page,
              label: executed[0].label,
              at: Date.now(),
            };
          }
        },
      });
      return describeKuroActions(actions);
    },
    [navigate, toggleTheme, setThemeTo, setSoundTo, setCrtMode, setAccent, petDog, track],
  );

  const getSiteState = useCallback(
    () => ({
      theme,
      hackMode: crtMode,
      accent: accent || "mono",
      sound: soundEnabled,
      lastAction: lastActionRef.current,
    }),
    [theme, crtMode, accent, soundEnabled],
  );

  const chat = useKuroChat({
    pathname: location.pathname,
    motionPolicy,
    getSiteState,
    runActions,
  });
  const { messages, pending, send, markStreamDone } = chat;
  const loading = pending !== null;

  const sleeping = isIdle && !chatOpen && !petting && !dogHovered && !loading && !isFullscreen;
  const bliss = petting || dogHovered;

  useEffect(() => {
    sleepingRef.current = sleeping;
    blissRef.current = bliss;
    if ((sleeping || bliss) && pupilsRef.current) {
      pupilsRef.current.setAttribute("transform", "translate(0 0)");
    }
  }, [sleeping, bliss]);

  // New assistant message: the dog bounces and flicks its tail.
  const lastMessage = messages[messages.length - 1];
  useEffect(() => {
    if (!lastMessage) return;
    if (seenMessageRef.current === null) {
      seenMessageRef.current = lastMessage.id;
      return;
    }
    if (seenMessageRef.current === lastMessage.id) return;
    seenMessageRef.current = lastMessage.id;
    if (lastMessage.role !== "assistant" || motionPolicy === "reduced") return;
    setTailFlick((n) => n + 1);
    bounce.start({
      y: [0, -10, 0, -3, 0],
      scaleY: [1, 1.05, 0.96, 1.01, 1],
      transition: { duration: 0.5, ease: "easeOut" },
    });
  }, [lastMessage, motionPolicy, bounce]);

  /* ------------------------------------------------------------ eye tracking */

  useEffect(() => {
    if (!finePointer) return undefined;

    // Welcome bubble can still fire on pointer move under lite/reduced;
    // eye tracking (RAF + transform writes) is full-policy only.
    const aimEyes = () => {
      eyeRafRef.current = 0;
      if (!fx || sleepingRef.current || blissRef.current) return;
      const dog = dogRef.current;
      const pupils = pupilsRef.current;
      if (!dog || !pupils) return;
      const rect = dog.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height * 0.38;
      const dx = lastPointerRef.current.x - cx;
      const dy = lastPointerRef.current.y - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const scale = Math.min(EYE_RANGE, dist / 20);
      const px = (dx / dist) * scale;
      const py = (dy / dist) * scale;
      pupils.setAttribute("transform", `translate(${px.toFixed(2)} ${py.toFixed(2)})`);
    };

    const onPointerMove = (event) => {
      lastPointerRef.current.x = event.clientX;
      lastPointerRef.current.y = event.clientY;
      showFirstVisitWelcome();
      if (!fx) return;
      if (!eyeRafRef.current) {
        eyeRafRef.current = requestAnimationFrame(aimEyes);
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      clearTimeout(petTimerRef.current);
      clearTimeout(bubbleTimerRef.current);
      if (eyeRafRef.current) cancelAnimationFrame(eyeRafRef.current);
    };
  }, [finePointer, fx, showFirstVisitWelcome]);

  /* ------------------------------------------------------------ open / close */

  const openChat = useCallback(() => {
    clearTimeout(closeTimerRef.current);
    clearTimeout(bubbleTimerRef.current);
    setWelcomeBubble(null);
    setPetBubble(null);
    setChatOpen(true);
    preloadKuroRouter();
  }, []);

  const scheduleCloseChat = useCallback(() => {
    if (holdOpenRef.current) return;
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      if (holdOpenRef.current || inputFocusedRef.current || pointerInsideRef.current) return;
      setChatOpen(false);
    }, 280);
  }, []);

  /** Close for good; hand focus back to the dog when it was inside the panel. */
  const forceCloseChat = useCallback(() => {
    clearTimeout(closeTimerRef.current);
    const active = document.activeElement;
    if (widgetRef.current?.contains(active) || active?.closest?.('[aria-label="Kuro chat fullscreen"]')) {
      dogRef.current?.focus({ preventScroll: true });
    }
    inputFocusedRef.current = false;
    pointerInsideRef.current = false;
    setInputFocused(false);
    setIsFullscreen(false);
    setPinned(false);
    setPanelSize(null);
    savePanelPrefs({ pinned: false, size: null });
    setChatOpen(false);
  }, []);

  const togglePinned = useCallback(() => {
    setPinned((prev) => {
      const next = !prev;
      savePanelPrefs({ pinned: next, size: panelSize });
      if (next) openChat();
      return next;
    });
  }, [openChat, panelSize]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => {
      const next = !prev;
      if (next) {
        openChat();
        setPinned(true);
        savePanelPrefs({ pinned: true, size: panelSize });
      }
      return next;
    });
  }, [openChat, panelSize]);

  const handleWidgetEnter = useCallback(() => {
    pointerInsideRef.current = true;
    openChat();
  }, [openChat]);

  const handleWidgetLeave = useCallback(() => {
    pointerInsideRef.current = false;
    scheduleCloseChat();
  }, [scheduleCloseChat]);

  const handleInputFocus = useCallback(() => {
    inputFocusedRef.current = true;
    setInputFocused(true);
    clearTimeout(closeTimerRef.current);
  }, []);

  const handleInputBlur = useCallback(() => {
    inputFocusedRef.current = false;
    setInputFocused(false);
    window.requestAnimationFrame(() => {
      const focusInside = widgetRef.current?.contains(document.activeElement);
      if (!focusInside && !pointerInsideRef.current) {
        scheduleCloseChat();
      }
    });
  }, [scheduleCloseChat]);

  /* ------------------------------------------------------------------ resize */

  const onResizePointerDown = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      openChat();
      setPinned(true);
      setResizing(true);
      const startW = panelSize?.w ?? Math.min(DEFAULT_PANEL_W, window.innerWidth - 32);
      const startH = panelSize?.h ?? Math.min(DEFAULT_PANEL_H, window.innerHeight * 0.54);
      resizeStartRef.current = {
        x: event.clientX,
        y: event.clientY,
        w: startW,
        h: startH,
      };
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    [openChat, panelSize],
  );

  const onResizePointerMove = useCallback((event) => {
    const start = resizeStartRef.current;
    if (!start) return;
    // Panel grows up/right from bottom-left dock: drag SE increases w and h.
    const next = clampPanelSize(
      start.w + (event.clientX - start.x),
      start.h + (event.clientY - start.y),
    );
    setPanelSize(next);
  }, []);

  const onResizePointerUp = useCallback((event) => {
    resizeStartRef.current = null;
    setResizing(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    setPanelSize((current) => {
      savePanelPrefs({ pinned: true, size: current });
      return current;
    });
    setPinned(true);
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(closeTimerRef.current);
      clearTimeout(bubbleTimerRef.current);
      clearTimeout(petTimerRef.current);
      clearTimeout(swarmTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const onSwarm = (event) => {
      const phase = event?.detail?.phase;
      if (phase !== "launch" && phase !== "absorb") return;
      setSwarmPhase(phase);
      clearTimeout(swarmTimerRef.current);
      swarmTimerRef.current = window.setTimeout(() => setSwarmPhase(null), 1600);
    };
    window.addEventListener("portfolio:kuro-swarm", onSwarm);
    return () => {
      window.removeEventListener("portfolio:kuro-swarm", onSwarm);
      clearTimeout(swarmTimerRef.current);
    };
  }, []);

  // Esc closes the docked panel (fullscreen exit is handled by useModalLock).
  useEffect(() => {
    if (!chatOpen) return undefined;
    const onKey = (event) => {
      if (event.key !== "Escape") return;
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      forceCloseChat();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chatOpen, forceCloseChat]);

  useEffect(() => {
    if (!chatOpen) return undefined;
    const timer = window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 220);
    return () => clearTimeout(timer);
  }, [chatOpen]);

  /* ----------------------------------------------------------------- sending */

  const submit = useCallback(() => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    track("ai_ask");
    void send(text);
  }, [input, loading, send, track]);

  const openUrl = useCallback((url, label) => runActions([{ type: "open_url", url, label }]), [runActions]);
  const goTo = useCallback((path) => runActions([{ type: "navigate", path, label: path }]), [runActions]);

  const handleChip = useCallback(
    (chip) => {
      if (chip.ai) {
        track("ai_ask");
        void send(chip.query, { forceLlm: true, echo: false });
      } else if (chip.send) {
        track("ai_ask");
        void send(chip.send);
      } else if (chip.to) {
        goTo(chip.to);
      } else if (chip.href) {
        openUrl(chip.href, chip.label);
      } else if (chip.action) {
        runActions([chip.action]);
      }
    },
    [goTo, openUrl, runActions, send, track],
  );

  const emptyChips = useMemo(() => {
    const seen = new Set();
    return [...KURO_EMPTY_CHIPS.slice(0, 4), ...pageChips].filter((chip) => {
      if (seen.has(chip.label)) return false;
      seen.add(chip.label);
      return true;
    });
  }, [pageChips]);

  if (!finePointer) return null;

  const typing = chatOpen && (input.length > 0 || loading);
  const mood = loading ? "thinking" : chatOpen ? "excited" : "happy";
  const wagging = (dogHovered || petting) && fx;
  const motionProps = panelMotion(motionPolicy);

  const dockedWidth = panelSize
    ? `${panelSize.w}px`
    : `min(calc(100vw - 2rem), ${DEFAULT_PANEL_W}px)`;
  const dockedHeight = panelSize
    ? `${panelSize.h}px`
    : `min(54vh, ${DEFAULT_PANEL_H}px)`;

  const panel = (
    <ChatPanel
      messages={messages}
      pending={pending}
      thinkingLine={chat.thinkingLine}
      hasUserMessages={chat.hasUserMessages}
      hadStoredChat={chat.hadStoredChat}
      welcome={welcomeLine}
      emptyChips={emptyChips}
      placeholder={placeholder}
      policy={motionPolicy}
      crtMode={crtMode}
      mood={mood}
      pinned={pinned}
      isFullscreen={isFullscreen}
      input={input}
      inputFocused={inputFocused}
      inputRef={inputRef}
      onInput={setInput}
      onSubmit={submit}
      onInputFocus={handleInputFocus}
      onInputBlur={handleInputBlur}
      onTogglePin={togglePinned}
      onToggleFullscreen={toggleFullscreen}
      onClose={forceCloseChat}
      onChip={handleChip}
      onNavigate={goTo}
      onOpenUrl={openUrl}
      onStreamDone={markStreamDone}
      onResizeDown={onResizePointerDown}
      onResizeMove={onResizePointerMove}
      onResizeUp={onResizePointerUp}
    />
  );

  return createPortal(
    <>
      <div className="fixed left-7 bottom-4 z-[68] hidden md:block pointer-events-none">
        <div className="relative flex flex-col items-start">
          <motion.div
            ref={widgetRef}
            className="relative flex flex-col items-start pointer-events-auto"
            onMouseEnter={handleWidgetEnter}
            onMouseLeave={handleWidgetLeave}
          >
            <AnimatePresence>
              {chatOpen && !isFullscreen && (
                <motion.div
                  id="kuro-chat-panel"
                  className="relative z-20 mb-3 flex flex-col border-4 border-outline bg-surface shadow-[10px_10px_0_var(--shadow-color)] overflow-hidden"
                  style={{
                    width: dockedWidth,
                    height: dockedHeight,
                    maxWidth: "calc(100vw - 2rem)",
                    transformOrigin: "12% 100%",
                  }}
                  initial={motionProps.initial}
                  animate={motionProps.animate}
                  exit={motionProps.exit}
                  transition={motionProps.transition}
                  role="dialog"
                  aria-label="Kuro chat"
                >
                  {panel}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {(welcomeBubble || petBubble) && !chatOpen && (
                <RouteBubble text={petBubble || welcomeBubble} />
              )}
            </AnimatePresence>

            <div className="relative z-10">
              <button
                ref={dogRef}
                type="button"
                data-kuro-dock
                onClick={(event) => {
                  petDog();
                  // Keyboard activation (detail 0) opens the chat; hover handles pointer users.
                  if (event.detail === 0) openChat();
                }}
                onMouseEnter={() => setDogHovered(true)}
                onMouseLeave={() => setDogHovered(false)}
                onFocus={() => setDogHovered(true)}
                onBlur={() => setDogHovered(false)}
                className="relative block cursor-pointer bg-transparent border-0 p-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-on-surface"
                aria-expanded={chatOpen}
                aria-controls="kuro-chat-panel"
                aria-label={
                  crtMode
                    ? sleeping
                      ? "Kuro-bot is idle. Press Enter to chat"
                      : "Open Kuro-bot chat"
                    : sleeping
                      ? "Kuro is sleeping. Press Enter to chat"
                      : "Open Kuro chat"
                }
              >
                <KuroTail wagging={wagging} flick={tailFlick} animated={motionPolicy !== "reduced"} robot={crtMode} />
                <motion.div
                  animate={{ rotate: typing && motionPolicy !== "reduced" ? -7 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  style={{ transformOrigin: "50% 92%" }}
                >
                  <motion.div animate={bounce} style={{ transformOrigin: "50% 100%" }}>
                    <KuroFace
                      pupilsRef={pupilsRef}
                      mood={mood}
                      bliss={bliss}
                      sleeping={sleeping}
                      robot={crtMode}
                      size={68}
                      swarmPhase={swarmPhase}
                    />
                  </motion.div>
                </motion.div>
              </button>
            </div>
          </motion.div>

          <div
            className="absolute bottom-0 left-0 z-30 pointer-events-none"
            aria-hidden={!sleeping || chatOpen}
          >
            <div className="relative w-[68px] h-[68px]">
              <SleepSnore
                active={sleeping && !chatOpen}
                robot={crtMode}
                onPop={petDog}
              />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isFullscreen && chatOpen && (
          <motion.div
            className="fixed inset-0 z-[90] hidden md:flex items-center justify-center p-4 sm:p-6 pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-on-background/50 border-0 cursor-pointer"
              aria-label="Exit fullscreen chat"
              onClick={() => setIsFullscreen(false)}
            />
            <motion.div
              className="relative z-10 flex flex-col w-[min(920px,calc(100vw-2rem))] h-[min(860px,calc(100vh-3rem))] border-4 border-outline bg-surface shadow-[12px_12px_0_var(--shadow-color)] overflow-hidden"
              initial={motionProps.initial}
              animate={motionProps.animate}
              exit={motionProps.exit}
              transition={motionProps.transition}
              style={{ transformOrigin: "50% 50%" }}
              role="dialog"
              aria-modal="true"
              aria-label="Kuro chat fullscreen"
              onClick={(event) => event.stopPropagation()}
            >
              {panel}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body,
  );
});

export default ChatWidget;

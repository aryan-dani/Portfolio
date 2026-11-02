import { memo, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  FINE_POINTER_QUERY,
  REDUCED_MOTION_QUERY,
} from "../../utils/device";
import { getPortfolioScrollY, smoothScrollTo, smoothScrollToTop } from "../../utils/smoothScroll";

const INTRO_Z = 100008;
const CURSOR_DARK = "#131316";
const CURSOR_LIGHT = "#f8f7f4";
const STORAGE_PREFIX = "portfolio_card_build:";
const BLURB_MAX = 90;
const FULL_TYPE_LIMIT = 9;
const FAST_SWEEP_KEYS = new Set(["skills", "achievements"]);
const ROW_TOLERANCE = 56;
const PEN_MS = 52;
const CHAOS_PEN_MS = 48;
const CHAOS_FLY_MS = 160;
const CHAOS_EDGE_STEPS = 6;
const CHAOS_MEDIA_STEPS = 8;
const TYPE_CHUNK = 2;
const TYPE_MS = 32;
const META_TAP_MS = 55;
const IDLE_POLL_MS = 160;

const AGENTS = [
  { id: "bot-01", label: "Bot 01", accent: "#131316" },
  { id: "bot-02", label: "Bot 02", accent: "#3d3a36" },
  { id: "bot-03", label: "Bot 03", accent: "#5c574f" },
  { id: "bot-04", label: "Bot 04", accent: "#1a1a1a" },
];

function storageKeyFor(id) {
  return `${STORAGE_PREFIX}${id}`;
}

function isAutomationClient() {
  if (typeof navigator === "undefined") return true;
  if (navigator.webdriver) return true;
  const ua = navigator.userAgent || "";
  return /bot|crawl|spider|lighthouse|pagespeed|chrome-lighthouse|headless/i.test(ua);
}

function waitForBootDone() {
  return new Promise((resolve) => {
    const check = () => {
      if (!document.querySelector(".page-loader")) {
        resolve();
        return;
      }
      window.setTimeout(check, 80);
    };
    check();
  });
}

function spawnPoint(index, vw, vh) {
  const pads = [
    { x: vw * 0.1, y: vh * 0.2 },
    { x: vw * 0.82, y: vh * 0.18 },
    { x: vw * 0.14, y: vh * 0.7 },
    { x: vw * 0.78, y: vh * 0.66 },
  ];
  return pads[index % pads.length];
}

function exitPoint(index, vw, vh) {
  const exits = [
    { x: -90, y: vh * 0.28 },
    { x: vw + 90, y: vh * 0.22 },
    { x: vw * 0.18, y: vh + 90 },
    { x: vw * 0.88, y: -90 },
  ];
  return exits[index % exits.length];
}

function getKuroDockPoint(index = 0) {
  const el = document.querySelector("[data-kuro-dock]");
  const jitter = [
    { x: -6, y: -4 },
    { x: 8, y: -2 },
    { x: -2, y: 6 },
    { x: 5, y: 4 },
  ][index % 4];
  if (el) {
    const r = el.getBoundingClientRect();
    if (r.width > 2 && r.height > 2) {
      return {
        x: r.left + r.width * 0.5 + jitter.x,
        y: r.top + r.height * 0.55 + jitter.y,
      };
    }
  }
  return {
    x: 56 + jitter.x,
    y: Math.max(80, window.innerHeight - 56) + jitter.y,
  };
}

function docTop(el) {
  return el.getBoundingClientRect().top + getPortfolioScrollY();
}

function isInViewport(el, margin = 80) {
  const rect = el.getBoundingClientRect();
  if (rect.width < 4 || rect.height < 4) return false;
  return (
    rect.bottom >= -margin &&
    rect.top <= window.innerHeight + margin &&
    rect.right >= -margin &&
    rect.left <= window.innerWidth + margin
  );
}

function collectAllCards(scope) {
  if (!scope) return [];
  return [...scope.querySelectorAll("[data-build-card]")].filter((el) => {
    const rect = el.getBoundingClientRect();
    return rect.width > 4 && rect.height > 4;
  });
}

function groupIntoRows(cards) {
  const sorted = [...cards].sort((a, b) => {
    const dy = docTop(a) - docTop(b);
    if (Math.abs(dy) > ROW_TOLERANCE) return dy;
    return a.getBoundingClientRect().left - b.getBoundingClientRect().left;
  });

  const rows = [];
  for (const card of sorted) {
    const top = docTop(card);
    const last = rows[rows.length - 1];
    if (last && Math.abs(last.top - top) <= ROW_TOLERANCE) {
      last.cards.push(card);
    } else {
      rows.push({ top, cards: [card] });
    }
  }
  return rows.map((row) => row.cards);
}

function setPhase(card, phase) {
  if (!card) return;
  if (phase) card.setAttribute("data-build-phase", phase);
  else card.removeAttribute("data-build-phase");
}

function resetDrawVars(card) {
  if (!card) return;
  card.style.setProperty("--draw-top", "0%");
  card.style.setProperty("--draw-right", "0%");
  card.style.setProperty("--draw-bottom", "0%");
  card.style.setProperty("--draw-left", "0%");
  card.style.removeProperty("--media-reveal");
  card.removeAttribute("data-framed");
}

function clearBuildAttrs(card) {
  if (!card) return;
  resetDrawVars(card);
  card.classList.remove("build-typing");
  card.querySelectorAll("[data-writing], [data-written], [data-built], [data-media-open]").forEach((el) => {
    el.removeAttribute("data-writing");
    el.removeAttribute("data-written");
    el.removeAttribute("data-built");
    el.removeAttribute("data-media-open");
  });
  const media = card.querySelector('[data-build-part="media"]');
  if (media) media.style.removeProperty("clip-path");
}

function isPlainTextPart(el) {
  if (!el) return false;
  const nodes = [...el.childNodes].filter(
    (n) => !(n.nodeType === Node.TEXT_NODE && !(n.textContent || "").trim()),
  );
  if (nodes.length === 0) return true;
  return nodes.length === 1 && nodes[0].nodeType === Node.TEXT_NODE;
}

function stashOriginals(card, store) {
  const title = card.querySelector('[data-build-part="title"]');
  const blurb = card.querySelector('[data-build-part="blurb"]');
  store.set(card, {
    title: title?.textContent ?? "",
    blurb: blurb?.textContent ?? "",
    titlePlain: isPlainTextPart(title),
    blurbPlain: isPlainTextPart(blurb),
  });
}

function restoreOriginals(card, store) {
  const saved = store.get(card);
  if (!saved) return;
  const title = card.querySelector('[data-build-part="title"]');
  const blurb = card.querySelector('[data-build-part="blurb"]');
  const media = card.querySelector('[data-build-part="media"]');
  if (title) {
    if (saved.titlePlain) title.textContent = saved.title;
    title.removeAttribute("data-writing");
    title.setAttribute("data-written", "");
  }
  if (blurb) {
    if (saved.blurbPlain) blurb.textContent = saved.blurb;
    blurb.removeAttribute("data-writing");
    blurb.setAttribute("data-written", "");
  }
  card.querySelectorAll('[data-build-part="meta"] > *').forEach((el) => {
    el.setAttribute("data-built", "");
  });
  if (media) {
    media.style.removeProperty("clip-path");
    media.setAttribute("data-media-open", "");
  }
  card.setAttribute("data-framed", "");
  resetDrawVars(card);
  card.classList.remove("build-typing");
}

function truncateBlurb(text) {
  const raw = (text || "").trim();
  if (raw.length <= BLURB_MAX) return raw;
  return `${raw.slice(0, BLURB_MAX).trimEnd()}…`;
}

function caretPoint(el) {
  if (!el) return { x: 0, y: 0 };
  const rect = el.getBoundingClientRect();
  let textNode = el.firstChild;
  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
    return { x: rect.left + 6, y: rect.top + rect.height * 0.55 };
  }
  const len = textNode.textContent?.length ?? 0;
  if (len === 0) {
    return { x: rect.left + 4, y: rect.top + rect.height * 0.55 };
  }
  const range = document.createRange();
  range.setStart(textNode, len);
  range.setEnd(textNode, len);
  const rects = range.getClientRects();
  const tip = rects[rects.length - 1];
  if (!tip || (tip.width === 0 && tip.height === 0)) {
    return {
      x: rect.left + Math.min(rect.width - 4, 8 + len * 7),
      y: rect.top + rect.height * 0.55,
    };
  }
  return { x: tip.right, y: tip.top + tip.height * 0.55 };
}

function centerOf(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.5 };
}

function diagonalVia(from, to, bias = 1, amount = 0.34) {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.max(1, Math.hypot(dx, dy));
  const shove = Math.min(140, len * amount) * bias;
  return {
    x: mx - (dy / len) * shove,
    y: my + (dx / len) * shove,
  };
}

function headingBetween(from, to) {
  return (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
}

const BOT_EASE = [0.16, 1, 0.3, 1];
const KURO_SWARM_EVENT = "portfolio:kuro-swarm";
const KURO_LAUNCH_MS = 720;
const KURO_DOCK_MS = 820;
const KURO_STAGGER_MS = 110;

function emitKuroSwarm(phase) {
  window.dispatchEvent(
    new CustomEvent(KURO_SWARM_EVENT, { detail: { phase } }),
  );
}

function PaperPlaneMark({ accent, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="drop-shadow-[2px_2px_0_rgba(0,0,0,0.35)]"
      aria-hidden="true"
    >
      <path
        d="M2 12 L22 3 L14 21 L11 13 Z"
        fill={CURSOR_LIGHT}
        stroke={accent || CURSOR_DARK}
        strokeWidth="2"
        strokeLinejoin="miter"
      />
      <path
        d="M11 13 L22 3"
        fill="none"
        stroke={accent || CURSOR_DARK}
        strokeWidth="2"
      />
    </svg>
  );
}

function AgentCursorSprite({
  label,
  accent,
  x,
  y,
  opacity,
  scale,
  rotate,
  pulse,
  flight = "work",
  moveMs = 140,
}) {
  const flying = flight === "launch" || flight === "dock";
  const planeAngle = flying ? rotate : rotate * 0.12;
  const duration = Math.max(0.08, (moveMs || 140) / 1000);

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none will-change-transform"
      style={{ zIndex: INTRO_Z }}
      initial={false}
      animate={{
        x,
        y,
        opacity,
        scale: pulse ? scale * 1.08 : scale,
        rotate: planeAngle,
      }}
      transition={{ duration, ease: BOT_EASE }}
    >
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        {flying ? (
          <motion.div
            className="flex flex-col items-center"
            animate={pulse ? { scale: [1, 1.08, 1] } : { scale: 1 }}
            transition={{ duration: 0.35, ease: BOT_EASE }}
          >
            <PaperPlaneMark accent={accent} size={30} />
          </motion.div>
        ) : (
          <>
            <motion.div
              className="h-3.5 w-3.5 border-2 shadow-[2px_2px_0_0_rgba(0,0,0,0.35)]"
              style={{ background: accent || CURSOR_DARK, borderColor: CURSOR_LIGHT }}
              aria-hidden="true"
              animate={pulse ? { scale: [1, 1.35, 1] } : { scale: 1 }}
              transition={{ duration: 0.22, ease: BOT_EASE }}
            />
            <motion.div
              className="absolute left-3.5 top-3.5 whitespace-nowrap border-2 px-1.5 py-0.5 font-label-bold text-[10px] uppercase tracking-[0.14em] shadow-[2px_2px_0_0_rgba(0,0,0,0.35)]"
              style={{
                background: CURSOR_LIGHT,
                color: CURSOR_DARK,
                borderColor: accent || CURSOR_DARK,
              }}
              animate={pulse ? { y: [0, -2, 0] } : { y: 0 }}
              transition={{ duration: 0.22, ease: BOT_EASE }}
            >
              {label}
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
}

function prepareCardForBuild(card, store) {
  let saved = store.get(card);
  if (!saved || (!saved.title && !saved.blurb)) {
    stashOriginals(card, store);
    saved = store.get(card) || {
      title: "",
      blurb: "",
      titlePlain: true,
      blurbPlain: true,
    };
  }
  clearBuildAttrs(card);
  resetDrawVars(card);
  const title = card.querySelector('[data-build-part="title"]');
  const blurb = card.querySelector('[data-build-part="blurb"]');
  if (title && saved.titlePlain) title.textContent = "";
  if (blurb && saved.blurbPlain) blurb.textContent = "";
  const media = card.querySelector('[data-build-part="media"]');
  if (media) media.style.clipPath = "inset(0 100% 0 0)";
  return saved;
}

function maybeFinishCard(card, progress) {
  const p = progress.get(card);
  if (!p || p.done) return;
  const edgesOk = p.edges.top && p.edges.right && p.edges.bottom && p.edges.left;
  if (edgesOk && !p.framed) {
    p.framed = true;
    card.setAttribute("data-framed", "");
    card.style.setProperty("--draw-top", "100%");
    card.style.setProperty("--draw-right", "100%");
    card.style.setProperty("--draw-bottom", "100%");
    card.style.setProperty("--draw-left", "100%");
  }
  if (
    edgesOk &&
    p.media &&
    p.title &&
    p.blurb &&
    p.metaLeft <= 0
  ) {
    p.done = true;
    setPhase(card, "done");
  }
}

function enqueueCardJobs(card, queue, progress, store, activeCards) {
  if (progress.has(card) || activeCards.has(card)) return;
  const saved = prepareCardForBuild(card, store);
  setPhase(card, "chaos");
  activeCards.add(card);

  const mediaEl = card.querySelector('[data-build-part="media"]');
  const titleEl = card.querySelector('[data-build-part="title"]');
  const blurbEl = card.querySelector('[data-build-part="blurb"]');
  const metaEl = card.querySelector('[data-build-part="meta"]');
  const metaKids = metaEl ? [...metaEl.children] : [];

  progress.set(card, {
    edges: { top: false, right: false, bottom: false, left: false },
    framed: false,
    media: !mediaEl,
    title: !titleEl,
    blurb: !blurbEl,
    metaLeft: metaKids.length,
    done: false,
    busy: 0,
    saved,
  });

  const edges = ["top", "right", "bottom", "left"];
  for (const edge of edges) {
    queue.push({ type: "edge", edge, card });
  }
  if (mediaEl) queue.push({ type: "media", card, el: mediaEl });
  if (titleEl) queue.push({ type: "title", card, el: titleEl });
  if (blurbEl) queue.push({ type: "blurb", card, el: blurbEl });
  metaKids.forEach((el, index) => {
    queue.push({ type: "meta", card, el, index });
  });
}

function claimJob(queue, progress, preferCard) {
  if (queue.length === 0) return null;
  if (preferCard) {
    const idx = queue.findIndex((j) => j.card === preferCard);
    if (idx >= 0) return queue.splice(idx, 1)[0];
  }
  // Prefer a card that already has another pen on it.
  const busyIdx = queue.findIndex((j) => (progress.get(j.card)?.busy || 0) > 0);
  if (busyIdx >= 0) return queue.splice(busyIdx, 1)[0];
  return queue.shift();
}

const CardBuildSwarm = memo(function CardBuildSwarm({
  storageKey,
  scopeRef,
  enabled = true,
  mode = "chaos",
}) {
  const chaos = mode === "chaos";
  const timersRef = useRef([]);
  const playingRef = useRef(false);
  const generationRef = useRef(0);
  const enabledRef = useRef(enabled);
  const eligibleRef = useRef(false);
  const ignoreAbortRef = useRef(false);
  const originalsRef = useRef(new WeakMap());
  const observerRef = useRef(null);
  const revealedRef = useRef(new WeakSet());
  const cursorPosRef = useRef(AGENTS.map(() => ({ x: -120, y: -120 })));
  const [eligible, setEligible] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [cursors, setCursors] = useState(() =>
    AGENTS.map((agent, index) => ({
      ...agent,
      index,
      x: -120,
      y: -120,
      opacity: 0,
      scale: 0.85,
      rotate: 0,
      pulse: false,
      flight: "work",
    })),
  );

  enabledRef.current = enabled;
  eligibleRef.current = eligible;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((entry) => {
      window.clearTimeout(entry.id);
      entry.resolve();
    });
    timersRef.current = [];
  }, []);

  const delay = useCallback(
    (ms) =>
      new Promise((resolve) => {
        const entry = { id: 0, resolve };
        entry.id = window.setTimeout(() => {
          timersRef.current = timersRef.current.filter((t) => t !== entry);
          resolve();
        }, ms);
        timersRef.current.push(entry);
      }),
    [],
  );

  const resolveScope = useCallback(() => {
    if (scopeRef?.current) return scopeRef.current;
    return document.querySelector(`[data-build-grid="${storageKey}"]`);
  }, [scopeRef, storageKey]);

  const finish = useCallback(() => {
    playingRef.current = false;
    setPlaying(false);
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    setCursors((prev) =>
      prev.map((c) => ({ ...c, opacity: 0, scale: 0.85, pulse: false })),
    );
  }, []);

  const revealAll = useCallback(
    (scope) => {
      const root = scope || resolveScope();
      if (!root) return;
      root.querySelectorAll("[data-build-card]").forEach((card) => {
        restoreOriginals(card, originalsRef.current);
        setPhase(card, "done");
        window.requestAnimationFrame(() => {
          clearBuildAttrs(card);
          setPhase(card, null);
        });
      });
    },
    [resolveScope],
  );

  const revealOneCard = useCallback((card) => {
    if (!card) return;
    revealedRef.current.add(card);
    restoreOriginals(card, originalsRef.current);
    setPhase(card, "done");
    window.requestAnimationFrame(() => {
      clearBuildAttrs(card);
      setPhase(card, null);
    });
  }, []);

  const abortAndReveal = useCallback(() => {
    generationRef.current += 1;
    clearTimers();
    playingRef.current = false;
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    revealAll(resolveScope());
    finish();
  }, [clearTimers, finish, resolveScope, revealAll]);

  const buildOneCard = useCallback(
    async (card, agentIndex, { fast = false, stillActive, moveCursor }) => {
      let saved = originalsRef.current.get(card);
      if (!saved || (!saved.title && !saved.blurb)) {
        stashOriginals(card, originalsRef.current);
        saved = originalsRef.current.get(card) || {
          title: "",
          blurb: "",
          titlePlain: true,
          blurbPlain: true,
        };
      }
      clearBuildAttrs(card);
      resetDrawVars(card);
      setPhase(card, "blueprint");

      const titleEl = card.querySelector('[data-build-part="title"]');
      const blurbEl = card.querySelector('[data-build-part="blurb"]');
      const mediaEl = card.querySelector('[data-build-part="media"]');
      const metaEl = card.querySelector('[data-build-part="meta"]');

      if (titleEl && saved.titlePlain) titleEl.textContent = "";
      if (blurbEl && saved.blurbPlain) blurbEl.textContent = "";

      setPhase(card, "frame");
      const edgeSteps = fast ? 3 : 7;
      const walkEdge = async (from, to, setVar) => {
        for (let i = 0; i <= edgeSteps; i += 1) {
          if (!stillActive()) return;
          const t = i / edgeSteps;
          setVar(t * 100);
          await moveCursor(agentIndex, {
            x: from.x + (to.x - from.x) * t,
            y: from.y + (to.y - from.y) * t,
          });
        }
      };

      let rect = card.getBoundingClientRect();
      const pad = 2;
      await walkEdge(
        { x: rect.left + pad, y: rect.top + pad },
        { x: rect.right - pad, y: rect.top + pad },
        (pct) => card.style.setProperty("--draw-top", `${pct}%`),
      );
      if (!stillActive()) return;

      rect = card.getBoundingClientRect();
      await walkEdge(
        { x: rect.right - pad, y: rect.top + pad },
        { x: rect.right - pad, y: rect.bottom - pad },
        (pct) => card.style.setProperty("--draw-right", `${pct}%`),
      );
      if (!stillActive()) return;

      rect = card.getBoundingClientRect();
      await walkEdge(
        { x: rect.right - pad, y: rect.bottom - pad },
        { x: rect.left + pad, y: rect.bottom - pad },
        (pct) => card.style.setProperty("--draw-bottom", `${pct}%`),
      );
      if (!stillActive()) return;

      rect = card.getBoundingClientRect();
      await walkEdge(
        { x: rect.left + pad, y: rect.bottom - pad },
        { x: rect.left + pad, y: rect.top + pad },
        (pct) => card.style.setProperty("--draw-left", `${pct}%`),
      );
      if (!stillActive()) return;

      card.style.setProperty("--draw-top", "100%");
      card.style.setProperty("--draw-right", "100%");
      card.style.setProperty("--draw-bottom", "100%");
      card.style.setProperty("--draw-left", "100%");
      card.setAttribute("data-framed", "");

      setPhase(card, "media");
      if (mediaEl) {
        mediaEl.style.clipPath = "inset(0 100% 0 0)";
        const mRect = mediaEl.getBoundingClientRect();
        const sweepSteps = fast ? 4 : 10;
        for (let i = 0; i <= sweepSteps; i += 1) {
          if (!stillActive()) return;
          const t = i / sweepSteps;
          mediaEl.style.clipPath = `inset(0 ${(1 - t) * 100}% 0 0)`;
          card.style.setProperty("--media-reveal", `${t * 100}%`);
          await moveCursor(agentIndex, {
            x: mRect.left + mRect.width * t,
            y: mRect.top + mRect.height * 0.45,
          });
        }
        mediaEl.style.clipPath = "none";
        mediaEl.setAttribute("data-media-open", "");
      } else {
        await delay(fast ? 40 : 80);
      }
      if (!stillActive()) return;

      if (fast) {
        if (titleEl) {
          if (saved.titlePlain) titleEl.textContent = saved.title;
          titleEl.setAttribute("data-written", "");
        }
        if (blurbEl) {
          if (saved.blurbPlain) blurbEl.textContent = saved.blurb;
          blurbEl.setAttribute("data-written", "");
        }
        setPhase(card, "meta");
        const kids = metaEl ? [...metaEl.children] : [];
        for (const kid of kids) {
          if (!stillActive()) return;
          await moveCursor(agentIndex, centerOf(kid));
          kid.setAttribute("data-built", "");
          await delay(35);
        }
        setPhase(card, "done");
        return;
      }

      card.classList.add("build-typing");
      if (titleEl) titleEl.setAttribute("data-writing", "");
      setPhase(card, "type");

      if (titleEl) {
        if (saved.titlePlain) {
          titleEl.textContent = "";
          await moveCursor(agentIndex, caretPoint(titleEl), 36);
          for (let i = 0; i < saved.title.length; i += 1) {
            if (!stillActive()) return;
            titleEl.textContent = saved.title.slice(0, i + 1);
            await moveCursor(agentIndex, caretPoint(titleEl), 28);
          }
        } else {
          await moveCursor(agentIndex, centerOf(titleEl), 40);
        }
        titleEl.removeAttribute("data-writing");
        titleEl.setAttribute("data-written", "");
      }
      if (!stillActive()) return;

      if (blurbEl) {
        if (saved.blurbPlain) {
          const text = truncateBlurb(saved.blurb);
          blurbEl.textContent = "";
          blurbEl.setAttribute("data-writing", "");
          await moveCursor(agentIndex, caretPoint(blurbEl), 36);
          for (let i = 0; i < text.length; i += 1) {
            if (!stillActive()) return;
            blurbEl.textContent = text.slice(0, i + 1);
            await moveCursor(agentIndex, caretPoint(blurbEl), 22);
          }
          blurbEl.textContent = saved.blurb;
        } else {
          await moveCursor(agentIndex, centerOf(blurbEl), 40);
        }
        blurbEl.removeAttribute("data-writing");
        blurbEl.setAttribute("data-written", "");
      }
      if (!stillActive()) return;

      card.classList.remove("build-typing");
      setPhase(card, "meta");
      const kids = metaEl ? [...metaEl.children] : [];
      for (const kid of kids) {
        if (!stillActive()) return;
        await moveCursor(agentIndex, centerOf(kid));
        kid.setAttribute("data-built", "");
        await delay(60);
      }
      if (!stillActive()) return;

      if (titleEl && saved.titlePlain) titleEl.textContent = saved.title;
      if (blurbEl && saved.blurbPlain) blurbEl.textContent = saved.blurb;
      setPhase(card, "done");
    },
    [delay],
  );

  const runChaosBuild = useCallback(
    async ({ force = false } = {}) => {
      if (playingRef.current) return;
      if (!eligibleRef.current) return;
      if (!enabledRef.current && !force) return;

      await waitForBootDone();

      let scope = resolveScope();
      let cards = [];
      for (let attempt = 0; attempt < 14; attempt += 1) {
        scope = resolveScope();
        cards = collectAllCards(scope);
        if (cards.length > 0) break;
        await delay(100);
      }
      if (!scope || cards.length === 0) return;

      const generation = generationRef.current + 1;
      generationRef.current = generation;
      playingRef.current = true;
      clearTimers();
      setPlaying(true);

      const queue = [];
      const progress = new Map();
      const activeCards = new Set();
      const enqueued = new WeakSet();
      const wakeWaiters = new Set();
      revealedRef.current = new WeakSet();

      const wake = () => {
        wakeWaiters.forEach((fn) => fn());
        wakeWaiters.clear();
      };

      const waitForWake = () =>
        new Promise((resolve) => {
          const entry = { id: 0, resolve: () => resolve() };
          const wrapped = () => {
            timersRef.current = timersRef.current.filter((t) => t !== entry);
            resolve();
          };
          entry.resolve = wrapped;
          entry.id = window.setTimeout(wrapped, IDLE_POLL_MS);
          timersRef.current.push(entry);
          wakeWaiters.add(wrapped);
        });

      cards.forEach((card) => {
        stashOriginals(card, originalsRef.current);
        clearBuildAttrs(card);
        resetDrawVars(card);
        setPhase(card, "blueprint");
        const saved = originalsRef.current.get(card);
        const title = card.querySelector('[data-build-part="title"]');
        const blurb = card.querySelector('[data-build-part="blurb"]');
        if (title && saved?.titlePlain) title.textContent = "";
        if (blurb && saved?.blurbPlain) blurb.textContent = "";
      });

      const stillActive = () =>
        playingRef.current && generationRef.current === generation;

      const moveCursor = async (agentIndex, point, ms = CHAOS_PEN_MS, opts = {}) => {
        const from = cursorPosRef.current[agentIndex] || point;
        const rotate = opts.rotate ?? headingBetween(from, point);
        cursorPosRef.current[agentIndex] = { x: point.x, y: point.y, rotate };
        setCursors((prev) =>
          prev.map((c, idx) => {
            if (idx !== agentIndex) return c;
            return {
              ...c,
              x: point.x,
              y: point.y,
              opacity: opts.opacity ?? 1,
              scale: opts.scale ?? c.scale ?? 1,
              rotate,
              pulse: Boolean(opts.pulse),
              flight: opts.flight ?? c.flight ?? "work",
              moveMs: ms,
            };
          }),
        );
        await delay(ms);
        if (opts.pulse) {
          setCursors((prev) =>
            prev.map((c, idx) => (idx === agentIndex ? { ...c, pulse: false } : c)),
          );
        }
      };

      const flyDiagonal = async (agentIndex, to, flight = "work") => {
        const from = cursorPosRef.current[agentIndex] || to;
        const bias = agentIndex % 2 === 0 ? 1 : -1;
        const via = diagonalVia(from, to, bias, flight === "work" ? 0.45 : 0.5);
        if (flight === "launch") via.y -= 42 + agentIndex * 6;
        if (flight === "dock") via.y -= 30;
        const total = flight === "work" ? CHAOS_FLY_MS : flight === "launch" ? KURO_LAUNCH_MS : KURO_DOCK_MS;
        const midMs = Math.round(total * 0.45);
        const endMs = total - midMs;
        await moveCursor(agentIndex, via, midMs, { flight });
        if (!stillActive()) return;
        await moveCursor(agentIndex, to, endMs, {
          flight,
          scale: flight === "dock" ? 0.12 : 1,
          opacity: flight === "dock" ? 0 : 1,
        });
      };

      const docked = AGENTS.map(() => false);

      const dockIntoKuro = async (agentIndex) => {
        if (docked[agentIndex]) return;
        emitKuroSwarm("absorb");
        await delay(agentIndex * KURO_STAGGER_MS);
        if (!stillActive()) return;
        const kuro = getKuroDockPoint(agentIndex);
        const from = cursorPosRef.current[agentIndex] || kuro;
        setCursors((prev) =>
          prev.map((c, idx) =>
            idx === agentIndex
              ? { ...c, flight: "dock", scale: 1.05, pulse: false, opacity: 1, moveMs: 180 }
              : c,
          ),
        );
        await delay(120);
        if (!stillActive()) return;
        // One smooth arc into Kuro — no stepped hops.
        const peak = {
          x: from.x + (kuro.x - from.x) * 0.45,
          y: Math.min(from.y, kuro.y) - 48,
        };
        await moveCursor(agentIndex, peak, Math.round(KURO_DOCK_MS * 0.4), {
          flight: "dock",
          scale: 0.85,
        });
        if (!stillActive()) return;
        await moveCursor(agentIndex, kuro, Math.round(KURO_DOCK_MS * 0.6), {
          scale: 0.08,
          flight: "dock",
          opacity: 0,
        });
        cursorPosRef.current[agentIndex] = kuro;
        docked[agentIndex] = true;
      };

      const emergeFromKuro = async (agentIndex) => {
        emitKuroSwarm("launch");
        await delay(agentIndex * KURO_STAGGER_MS);
        if (!stillActive()) return;
        const kuro = getKuroDockPoint(agentIndex);
        const lift = {
          x: kuro.x + 28 + agentIndex * 12,
          y: kuro.y - (78 + agentIndex * 10),
        };
        cursorPosRef.current[agentIndex] = { ...kuro, rotate: headingBetween(kuro, lift) };
        setCursors((prev) =>
          prev.map((c, idx) =>
            idx === agentIndex
              ? {
                  ...c,
                  x: kuro.x,
                  y: kuro.y,
                  opacity: 1,
                  scale: 0.15,
                  rotate: headingBetween(kuro, lift),
                  pulse: false,
                  flight: "launch",
                  moveMs: 80,
                }
              : c,
          ),
        );
        await delay(40);
        if (!stillActive()) return;
        // One smooth climb out of Kuro.
        await moveCursor(agentIndex, lift, KURO_LAUNCH_MS, {
          scale: 1,
          flight: "launch",
        });
        if (!stillActive()) return;
        setCursors((prev) =>
          prev.map((c, idx) =>
            idx === agentIndex
              ? { ...c, flight: "work", scale: 1, pulse: false, moveMs: 160 }
              : c,
          ),
        );
        docked[agentIndex] = false;
      };

      // Start tucked inside Kuro; workers pop out when they claim work.
      setCursors(
        AGENTS.map((agent, index) => {
          const p = getKuroDockPoint(index);
          cursorPosRef.current[index] = p;
          docked[index] = true;
          return {
            ...agent,
            index,
            x: p.x,
            y: p.y,
            opacity: 0,
            scale: 0.08,
            rotate: 0,
            pulse: false,
            flight: "dock",
          };
        }),
      );

      await delay(60);
      if (!stillActive()) return;

      const tryEnqueue = (card) => {
        if (!card || enqueued.has(card) || revealedRef.current.has(card)) return;
        enqueued.add(card);
        enqueueCardJobs(card, queue, progress, originalsRef.current, activeCards);
        wake();
      };

      cards.forEach((card) => {
        if (isInViewport(card, 80)) tryEnqueue(card);
      });

      observerRef.current?.disconnect();
      const observer = new IntersectionObserver(
        (entries) => {
          if (!stillActive()) return;
          entries.forEach((entry) => {
            if (entry.isIntersecting) tryEnqueue(entry.target);
          });
        },
        { root: null, rootMargin: "80px 0px", threshold: 0.08 },
      );
      observerRef.current = observer;
      cards.forEach((card) => observer.observe(card));

      const runJob = async (agentIndex, job) => {
        const { card } = job;
        if (revealedRef.current.has(card)) return;
        const p = progress.get(card);
        if (!p || p.done) return;
        p.busy += 1;

        try {
          if (revealedRef.current.has(card)) return;
          if (job.type === "edge") {
            const pad = 2;
            const rect = card.getBoundingClientRect();
            const map = {
              top: [
                { x: rect.left + pad, y: rect.top + pad },
                { x: rect.right - pad, y: rect.top + pad },
                "--draw-top",
              ],
              right: [
                { x: rect.right - pad, y: rect.top + pad },
                { x: rect.right - pad, y: rect.bottom - pad },
                "--draw-right",
              ],
              bottom: [
                { x: rect.right - pad, y: rect.bottom - pad },
                { x: rect.left + pad, y: rect.bottom - pad },
                "--draw-bottom",
              ],
              left: [
                { x: rect.left + pad, y: rect.bottom - pad },
                { x: rect.left + pad, y: rect.top + pad },
                "--draw-left",
              ],
            };
            const [from, to, prop] = map[job.edge];
            await flyDiagonal(agentIndex, from);
            for (let i = 0; i <= CHAOS_EDGE_STEPS; i += 1) {
              if (!stillActive()) return;
              const t = i / CHAOS_EDGE_STEPS;
              card.style.setProperty(prop, `${t * 100}%`);
              await moveCursor(agentIndex, {
                x: from.x + (to.x - from.x) * t,
                y: from.y + (to.y - from.y) * t,
              });
            }
            p.edges[job.edge] = true;
            maybeFinishCard(card, progress);
            return;
          }

          if (job.type === "media") {
            const el = job.el;
            el.style.clipPath = "inset(0 100% 0 0)";
            const mRect = el.getBoundingClientRect();
            await flyDiagonal(agentIndex, {
              x: mRect.left,
              y: mRect.top + mRect.height * 0.45,
            });
            for (let i = 0; i <= CHAOS_MEDIA_STEPS; i += 1) {
              if (!stillActive()) return;
              const t = i / CHAOS_MEDIA_STEPS;
              el.style.clipPath = `inset(0 ${(1 - t) * 100}% 0 0)`;
              card.style.setProperty("--media-reveal", `${t * 100}%`);
              await moveCursor(agentIndex, {
                x: mRect.left + mRect.width * t,
                y: mRect.top + mRect.height * 0.45,
              });
            }
            el.style.clipPath = "none";
            el.setAttribute("data-media-open", "");
            p.media = true;
            maybeFinishCard(card, progress);
            return;
          }

          if (job.type === "title") {
            const el = job.el;
            const saved = p.saved;
            el.setAttribute("data-writing", "");
            if (saved.titlePlain) {
              el.textContent = "";
              await flyDiagonal(agentIndex, caretPoint(el));
              for (let i = 0; i < saved.title.length; i += TYPE_CHUNK) {
                if (!stillActive()) return;
                el.textContent = saved.title.slice(0, i + TYPE_CHUNK);
                await moveCursor(agentIndex, caretPoint(el), TYPE_MS);
              }
              el.textContent = saved.title;
            } else {
              await flyDiagonal(agentIndex, centerOf(el));
              await moveCursor(agentIndex, centerOf(el), META_TAP_MS, { pulse: true });
              await delay(60);
            }
            el.removeAttribute("data-writing");
            el.setAttribute("data-written", "");
            p.title = true;
            maybeFinishCard(card, progress);
            return;
          }

          if (job.type === "blurb") {
            const el = job.el;
            const saved = p.saved;
            el.setAttribute("data-writing", "");
            if (saved.blurbPlain) {
              const text = truncateBlurb(saved.blurb);
              el.textContent = "";
              await flyDiagonal(agentIndex, caretPoint(el));
              for (let i = 0; i < text.length; i += TYPE_CHUNK) {
                if (!stillActive()) return;
                el.textContent = text.slice(0, i + TYPE_CHUNK);
                await moveCursor(agentIndex, caretPoint(el), TYPE_MS);
              }
              el.textContent = saved.blurb;
            } else {
              await flyDiagonal(agentIndex, centerOf(el));
              await moveCursor(agentIndex, centerOf(el), META_TAP_MS, { pulse: true });
              await delay(60);
            }
            el.removeAttribute("data-writing");
            el.setAttribute("data-written", "");
            p.blurb = true;
            maybeFinishCard(card, progress);
            return;
          }

          if (job.type === "meta") {
            await flyDiagonal(agentIndex, centerOf(job.el));
            if (!stillActive()) return;
            await moveCursor(agentIndex, centerOf(job.el), META_TAP_MS, { pulse: true, scale: 1.08 });
            job.el.setAttribute("data-built", "");
            p.metaLeft = Math.max(0, p.metaLeft - 1);
            await delay(40);
            maybeFinishCard(card, progress);
          }
        } finally {
          p.busy = Math.max(0, p.busy - 1);
        }
      };

      const restampWaitingBlueprints = () => {
        cards.forEach((card) => {
          if (revealedRef.current.has(card)) return;
          if (progress.get(card)?.done) return;
          if (enqueued.has(card)) {
            // Active chaos card — React may have wiped the phase attr.
            if (!card.getAttribute("data-build-phase")) {
              setPhase(card, "chaos");
              if (progress.get(card)?.framed) card.setAttribute("data-framed", "");
            }
            return;
          }
          setPhase(card, "blueprint");
          const saved = originalsRef.current.get(card);
          const title = card.querySelector('[data-build-part="title"]');
          const blurb = card.querySelector('[data-build-part="blurb"]');
          if (title && saved?.titlePlain && title.textContent) title.textContent = "";
          if (blurb && saved?.blurbPlain && blurb.textContent) blurb.textContent = "";
        });
      };

      const worker = async (agentIndex) => {
        let preferCard = null;
        while (stillActive()) {
          // Drop jobs for cards the user already opened.
          while (queue.length && revealedRef.current.has(queue[0].card)) {
            queue.shift();
          }
          const job = claimJob(queue, progress, preferCard);
          if (job) {
            if (revealedRef.current.has(job.card)) continue;
            if (docked[agentIndex]) {
              await emergeFromKuro(agentIndex);
              if (!stillActive()) return;
            }
            preferCard = job.card;
            await runJob(agentIndex, job);
            continue;
          }

          const pending = cards.some(
            (c) => !revealedRef.current.has(c) && !progress.get(c)?.done,
          );
          if (!pending) break;

          if (agentIndex === 0) restampWaitingBlueprints();
          if (!docked[agentIndex]) {
            await dockIntoKuro(agentIndex);
            if (!stillActive()) return;
          }
          await waitForWake();
        }

        if (stillActive() && !docked[agentIndex]) {
          await dockIntoKuro(agentIndex);
        }
      };

      await Promise.all(AGENTS.map((_, index) => worker(index)));
      if (!stillActive()) return;

      await Promise.all(
        AGENTS.map(async (_, index) => {
          if (!docked[index]) await dockIntoKuro(index);
        }),
      );
      await delay(180);
      if (!stillActive()) return;

      cards.forEach((card) => {
        restoreOriginals(card, originalsRef.current);
        clearBuildAttrs(card);
        setPhase(card, null);
      });
      finish();
    },
    [resolveScope, delay, clearTimers, finish],
  );

  const runSyncBuild = useCallback(
    async ({ force = false } = {}) => {
      if (playingRef.current) return;
      if (!eligibleRef.current) return;
      if (!enabledRef.current && !force) return;

      const key = storageKeyFor(storageKey);
      if (!force && sessionStorage.getItem(key)) return;

      await waitForBootDone();

      let scope = resolveScope();
      let cards = [];
      for (let attempt = 0; attempt < 14; attempt += 1) {
        scope = resolveScope();
        cards = collectAllCards(scope);
        if (cards.length > 0) break;
        await delay(100);
      }
      if (!scope || cards.length === 0) return;

      const generation = generationRef.current + 1;
      generationRef.current = generation;
      playingRef.current = true;
      clearTimers();
      setPlaying(true);

      cards.forEach((card) => {
        stashOriginals(card, originalsRef.current);
        clearBuildAttrs(card);
        resetDrawVars(card);
        setPhase(card, "blueprint");
        const title = card.querySelector('[data-build-part="title"]');
        const blurb = card.querySelector('[data-build-part="blurb"]');
        const saved = originalsRef.current.get(card);
        if (title && saved?.titlePlain !== false) title.textContent = "";
        if (blurb && saved?.blurbPlain !== false) blurb.textContent = "";
      });

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const stillActive = () =>
        playingRef.current && generationRef.current === generation;

      const moveCursor = async (agentIndex, point, ms = PEN_MS) => {
        setCursors((prev) =>
          prev.map((c, idx) => {
            if (idx !== agentIndex) return c;
            return { ...c, x: point.x, y: point.y, opacity: 1, scale: 1 };
          }),
        );
        await delay(ms);
      };

      setCursors(
        AGENTS.map((agent, index) => {
          const p = spawnPoint(index, vw, vh);
          return { ...agent, index, x: p.x, y: p.y, opacity: 1, scale: 1 };
        }),
      );

      await delay(160);
      if (!stillActive()) return;

      const rows = groupIntoRows(cards);
      const useFastSweep = FAST_SWEEP_KEYS.has(storageKey);
      let builtCount = 0;

      try {
        for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
          if (!stillActive()) return;
          const row = rows[rowIndex];

          ignoreAbortRef.current = true;
          await smoothScrollTo(Math.max(0, docTop(row[0]) - 110));
          ignoreAbortRef.current = false;
          if (!stillActive()) return;
          await delay(60);

          setCursors((prev) =>
            prev.map((c, idx) => ({
              ...c,
              opacity: idx < row.length ? 1 : 0.15,
            })),
          );

          await Promise.all(
            row.map((card, idx) => {
              const fast = useFastSweep && builtCount + idx >= FULL_TYPE_LIMIT;
              const agentIndex = idx % AGENTS.length;
              return buildOneCard(card, agentIndex, {
                fast,
                stillActive,
                moveCursor,
              });
            }),
          );

          builtCount += row.length;
          if (!stillActive()) return;
          await delay(50);
        }

        if (!stillActive()) return;

        setCursors((prev) =>
          prev.map((c, i) => {
            const p = exitPoint(i, vw, vh);
            return { ...c, x: p.x, y: p.y, opacity: 0, scale: 0.9 };
          }),
        );

        await delay(240);
        if (!stillActive()) return;

        ignoreAbortRef.current = true;
        await smoothScrollToTop();
        ignoreAbortRef.current = false;
        if (!stillActive()) return;

        sessionStorage.setItem(key, "true");
        cards.forEach((card) => {
          restoreOriginals(card, originalsRef.current);
          clearBuildAttrs(card);
          setPhase(card, null);
        });
        finish();
      } finally {
        ignoreAbortRef.current = false;
      }
    },
    [storageKey, resolveScope, delay, clearTimers, finish, buildOneCard],
  );

  const runBuild = chaos ? runChaosBuild : runSyncBuild;

  useEffect(() => {
    if (isAutomationClient()) {
      setEligible(false);
      return undefined;
    }
    const fine = window.matchMedia(FINE_POINTER_QUERY);
    const reduced = window.matchMedia(REDUCED_MOTION_QUERY);
    const sync = () => setEligible(fine.matches && !reduced.matches);
    sync();
    fine.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      fine.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!eligible || !enabled) return undefined;
    if (!chaos && sessionStorage.getItem(storageKeyFor(storageKey))) {
      return undefined;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      runBuild({ force: chaos });
    }, chaos ? 60 : 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [eligible, enabled, storageKey, runBuild, chaos]);

  useEffect(() => {
    if (!enabled && playingRef.current) {
      abortAndReveal();
    }
    if (!enabled) {
      revealAll(resolveScope());
    }
  }, [enabled, abortAndReveal, resolveScope, revealAll]);

  useEffect(() => {
    if (!playing) return undefined;

    if (chaos) {
      const onClickReveal = (event) => {
        if (!playingRef.current) return;
        const card = event.target?.closest?.("[data-build-card]");
        if (card) revealOneCard(card);
      };
      window.addEventListener("pointerdown", onClickReveal, { passive: true });
      return () => {
        window.removeEventListener("pointerdown", onClickReveal);
      };
    }

    const onAbort = (event) => {
      if (!playingRef.current) return;
      if (ignoreAbortRef.current) return;
      abortAndReveal();
    };

    window.addEventListener("wheel", onAbort, { passive: true });
    window.addEventListener("touchmove", onAbort, { passive: true });
    window.addEventListener("pointerdown", onAbort, { passive: true });

    return () => {
      window.removeEventListener("wheel", onAbort);
      window.removeEventListener("touchmove", onAbort);
      window.removeEventListener("pointerdown", onAbort);
    };
  }, [playing, abortAndReveal, chaos, revealOneCard]);

  useEffect(
    () => () => {
      generationRef.current += 1;
      clearTimers();
      playingRef.current = false;
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      const scope =
        scopeRef?.current ||
        document.querySelector(`[data-build-grid="${storageKey}"]`);
      if (scope) {
        scope.querySelectorAll("[data-build-card]").forEach((card) => {
          restoreOriginals(card, originalsRef.current);
          clearBuildAttrs(card);
          setPhase(card, null);
        });
      }
    },
    [clearTimers, scopeRef, storageKey],
  );

  if (!eligible) return null;

  return createPortal(
    <>
      {playing &&
        cursors.map((c) => (
          <AgentCursorSprite
            key={c.id}
            label={c.label}
            accent={c.accent}
            x={c.x}
            y={c.y}
            opacity={c.opacity}
            scale={c.scale}
            rotate={c.rotate || 0}
            pulse={c.pulse}
            flight={c.flight || "work"}
            moveMs={c.moveMs || 140}
          />
        ))}
    </>,
    document.body,
  );
});

export default CardBuildSwarm;

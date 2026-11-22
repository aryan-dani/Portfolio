import { memo } from "react";
import { motion } from "framer-motion";

// Illustration colors are fixed on purpose: Kuro is a character, not a themed surface.
const OUTLINE = "#131316";
const FUR = "#f0d4a8";
const FUR_EAR = "#b8894f";
const SNOUT = "#faecd8";
const ROBOT_BODY = "#1c2420";
const ROBOT_PANEL = "#2a3830";
const ROBOT_EAR = "#16331f";
const ROBOT_SNOUT = "#24302a";
const ROBOT_LED = "#39ff14";
const ROBOT_DIM = "#1a4d28";

/** Single CSS-driven snore glyph: no setInterval / Framer spawn loop. */
export function SleepSnore({ active, onPop, robot = false }) {
  if (!active) return null;

  return (
    <div className="absolute -inset-6 pointer-events-none overflow-visible z-20">
      <button
        type="button"
        className={`kuro-snore absolute font-label-bold leading-none select-none pointer-events-auto border-2 border-outline px-1 shadow-[2px_2px_0_var(--shadow-color)] ${
          robot ? "kuro-snore--robot bg-[#0d1a10] text-[#39ff14]" : "bg-surface text-on-surface"
        }`}
        onClick={(event) => {
          event.stopPropagation();
          onPop?.();
        }}
        aria-label="Wake Kuro"
      >
        Z
      </button>
    </div>
  );
}

/**
 * Tail that peeks out behind the head. Transform-only wag; `wagging` loops, otherwise a single
 * flick plays when `flick` changes (new message, pet).
 */
export const KuroTail = memo(function KuroTail({ wagging = false, flick = 0, animated = true, robot = false }) {
  const fill = robot ? ROBOT_PANEL : FUR_EAR;
  const swing = animated ? [0, 26, -6, 26, 0] : 0;
  return (
    <motion.span
      key={wagging ? "wag" : `flick-${flick}`}
      aria-hidden="true"
      className="absolute left-[74%] bottom-[16%] block h-[22px] w-[8px] border-2 border-[#131316]"
      style={{ background: fill, transformOrigin: "0% 100%", zIndex: 0 }}
      initial={{ rotate: 0 }}
      animate={{ rotate: swing }}
      transition={
        wagging && animated
          ? { duration: 0.55, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.5, ease: "easeInOut" }
      }
    />
  );
});

export const KuroFace = memo(function KuroFace({
  pupilsRef,
  mood,
  bliss,
  sleeping,
  size = 68,
  robot = false,
  swarmPhase = null,
}) {
  const thinking = mood === "thinking";
  const asleep = sleeping && !bliss && !thinking;
  const launching = swarmPhase === "launch";
  const absorbing = swarmPhase === "absorb";
  const body = robot ? ROBOT_BODY : FUR;
  const ear = robot ? ROBOT_EAR : FUR_EAR;
  const snout = robot ? ROBOT_SNOUT : SNOUT;
  const eyeFill = robot ? ROBOT_DIM : "#fff";
  const pupil = robot ? ROBOT_LED : OUTLINE;
  const highlight = robot ? "#0a120a" : "#fff";

  return (
    <motion.svg
      viewBox="18 6 60 56"
      width={size}
      height={size}
      className={`relative z-[1] shrink-0 drop-shadow-[3px_3px_0_var(--shadow-color)]${asleep ? " kuro-sleeping" : ""}`}
      aria-hidden="true"
      animate={
        asleep
          ? false
          : launching
            ? { y: -6, scale: 1.08 }
            : absorbing
              ? { y: 3, scale: 0.92 }
              : bliss
                ? { y: -4, scale: 1.04 }
                : robot
                  ? { y: [0, -1, 0] }
                  : { y: 0, scale: 1 }
      }
      transition={
        asleep
          ? { duration: 0 }
          : launching || absorbing
            ? { type: "spring", stiffness: 520, damping: 18 }
            : robot && !bliss && !thinking
              ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
              : { type: "spring", stiffness: 420, damping: 24 }
      }
    >
      {robot && (
        <>
          <line x1="48" y1="8" x2="48" y2="16" stroke={ROBOT_LED} strokeWidth="2" />
          <rect x="46" y="6" width="4" height="4" fill={ROBOT_LED} stroke={OUTLINE} strokeWidth="1.5" />
        </>
      )}

      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
        animate={
          launching
            ? { rotate: -22, y: -4 }
            : absorbing
              ? { rotate: -22, y: 2 }
              : bliss
                ? { rotate: -22, y: -3 }
                : thinking
                  ? { rotate: -30, y: -2 }
                  : { rotate: -22, y: 0 }
        }
        transition={{ type: "spring", stiffness: 420, damping: 24 }}
      >
        <rect x="21" y="14" width="11" height="20" fill={ear} stroke={OUTLINE} strokeWidth="2" />
        {robot && <rect x="24" y="18" width="5" height="8" fill={ROBOT_LED} opacity="0.85" />}
      </motion.g>
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
        animate={
          launching
            ? { rotate: 22, y: -4 }
            : absorbing
              ? { rotate: 22, y: 2 }
              : bliss
                ? { rotate: 22, y: -3 }
                : thinking
                  ? { rotate: 14, y: -3 }
                  : { rotate: 22, y: 0 }
        }
        transition={{ type: "spring", stiffness: 420, damping: 24 }}
      >
        <rect x="64" y="14" width="11" height="20" fill={ear} stroke={OUTLINE} strokeWidth="2" />
        {robot && <rect x="67" y="18" width="5" height="8" fill={ROBOT_LED} opacity="0.85" />}
      </motion.g>

      <rect x="28" y="20" width="40" height="36" fill={body} stroke={OUTLINE} strokeWidth="2.5" />
      {robot && (
        <>
          <rect x="31" y="23" width="34" height="8" fill={ROBOT_PANEL} stroke={OUTLINE} strokeWidth="1.5" />
          <rect x="33" y="25" width="4" height="4" fill={ROBOT_LED} />
          <rect x="40" y="25" width="4" height="4" fill={ROBOT_DIM} />
          <rect x="47" y="25" width="4" height="4" fill={ROBOT_LED} opacity="0.55" />
        </>
      )}

      {bliss && !robot && (
        <>
          <rect x="29" y="39" width="7" height="4" fill="#e8a898" opacity="0.55" />
          <rect x="60" y="39" width="7" height="4" fill="#e8a898" opacity="0.55" />
        </>
      )}

      <rect x="34" y="42" width="28" height="14" fill={snout} stroke={OUTLINE} strokeWidth="2" />
      {robot && <rect x="38" y="45" width="20" height="3" fill={ROBOT_DIM} />}

      {asleep ? (
        <>
          <line x1="33" y1="35" x2="41" y2="35" stroke={robot ? ROBOT_LED : OUTLINE} strokeWidth="2" strokeLinecap="square" />
          <line x1="55" y1="35" x2="63" y2="35" stroke={robot ? ROBOT_LED : OUTLINE} strokeWidth="2" strokeLinecap="square" />
        </>
      ) : bliss ? (
        <>
          <polyline points="32,36 37,31 42,36" fill="none" stroke={robot ? ROBOT_LED : OUTLINE} strokeWidth="2.25" strokeLinejoin="miter" strokeLinecap="square" />
          <polyline points="54,36 59,31 64,36" fill="none" stroke={robot ? ROBOT_LED : OUTLINE} strokeWidth="2.25" strokeLinejoin="miter" strokeLinecap="square" />
        </>
      ) : (
        <motion.g
          animate={thinking ? { opacity: 1 } : { scaleY: [1, 1, 0.08, 1, 1] }}
          transition={
            thinking
              ? { duration: 0.2 }
              : { duration: 0.26, times: [0, 0.44, 0.5, 0.56, 1], repeat: Infinity, repeatDelay: 4.5 }
          }
          style={{ transformOrigin: "48px 33px" }}
        >
          <rect x="31" y="27" width="12" height="12" fill={eyeFill} stroke={OUTLINE} strokeWidth="2" />
          <rect x="53" y="27" width="12" height="12" fill={eyeFill} stroke={OUTLINE} strokeWidth="2" />
          <motion.g
            animate={
              launching
                ? { x: 3, y: -2 }
                : absorbing
                  ? { x: -2, y: 2 }
                  : { x: 0, y: 0 }
            }
            transition={{ type: "spring", stiffness: 500, damping: 16 }}
          >
            <g ref={pupilsRef}>
              <rect x="35" y="31" width="5" height="5" fill={pupil} />
              <rect x="57" y="31" width="5" height="5" fill={pupil} />
              <rect x="36" y="32" width="2" height="2" fill={highlight} />
              <rect x="58" y="32" width="2" height="2" fill={highlight} />
            </g>
          </motion.g>
        </motion.g>
      )}

      {/* Tiny planes shooting from the eyes on launch / sucking in on absorb */}
      {(launching || absorbing) && (
        <>
          <motion.path
            d="M34 30 L44 26 L38 36 Z"
            fill="#f8f7f4"
            stroke={OUTLINE}
            strokeWidth="1.5"
            initial={
              launching
                ? { x: 0, y: 0, opacity: 1, scale: 0.4 }
                : { x: 18, y: -14, opacity: 0.9, scale: 0.9 }
            }
            animate={
              launching
                ? { x: 22, y: -18, opacity: 0, scale: 1.1 }
                : { x: 0, y: 0, opacity: 0, scale: 0.3 }
            }
            transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.path
            d="M56 30 L66 26 L60 36 Z"
            fill="#f8f7f4"
            stroke={OUTLINE}
            strokeWidth="1.5"
            initial={
              launching
                ? { x: 0, y: 0, opacity: 1, scale: 0.4 }
                : { x: 20, y: -12, opacity: 0.9, scale: 0.9 }
            }
            animate={
              launching
                ? { x: 26, y: -16, opacity: 0, scale: 1.1 }
                : { x: 0, y: 0, opacity: 0, scale: 0.3 }
            }
            transition={{ duration: 0.95, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          />
        </>
      )}

      <rect x="44" y="44" width="8" height="6" fill={robot ? ROBOT_LED : OUTLINE} />
      {bliss && !robot && <rect x="46" y="45" width="2" height="1.5" fill="#5a5960" opacity="0.45" />}

      {!asleep && thinking && (
        <line x1="43" y1="52" x2="53" y2="52" stroke={robot ? ROBOT_LED : OUTLINE} strokeWidth="2" strokeLinecap="square" />
      )}

      {thinking && !asleep && (
        <text x="64" y="24" fontSize="9" fontWeight="bold" fill={robot ? ROBOT_LED : OUTLINE}>
          ?
        </text>
      )}
    </motion.svg>
  );
});

export default KuroFace;

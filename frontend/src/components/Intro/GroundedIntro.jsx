import { memo, useLayoutEffect, useRef, useState } from "react";
import { writeStorage } from "../../utils/storage";
import { MOBILE_LITE_QUERY } from "../../utils/device";
import { CLIPPINGS, NAME, PHONE_CLIP_INDEXES } from "./clippings";
import "./GroundedIntro.scss";

const VISITED_KEY = "portfolio_visited";
const QUERY = `> retrieve "${NAME}"`;

/** How long each document stays up before the hard cut to the next one (ms). */
const DESKTOP_CUTS = [170, 160, 150, 130, 120, 120];
const PHONE_CUTS = [180, 160, 140, 120];

const TYPE_STEP_MS = 11;
const FIRST_CUT_AT = 120;
const FRAME_DELAY_MS = 30;
const AGENT_IN_MS = 170;
const FRAME_MS = 280;
const HOLD_MS = 90;
const FLY_MS = 420;
const REVEAL_MS = 160;
const LAP_MS = 320;
const DOCK_MS = 440;
const DOCK_STAGGER_MS = 45;
const SKIP_FADE_MS = 120;
const HARD_CAP_MS = 3800;

const EASE_TRAVEL = "cubic-bezier(0.65, 0, 0.2, 1)";
const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
const EASE_DRAW = "cubic-bezier(0.45, 0, 0.2, 1)";

const AGENT_LABELS = ["Bot 01", "Bot 02", "Bot 03", "Bot 04"];

function isPhoneLite() {
  return typeof window !== "undefined" && window.matchMedia(MOBILE_LITE_QUERY).matches;
}

function inViewport(rect) {
  return (
    rect.width > 0
    && rect.height > 0
    && rect.top >= 0
    && rect.left >= 0
    && rect.bottom <= window.innerHeight
    && rect.right <= window.innerWidth
  );
}

function el(className, text) {
  const node = document.createElement("div");
  node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

/** `translate(x, y) scale(sx, sy)` with a top-left origin. */
function place(x, y, sx = 1, sy = sx) {
  return `translate(${x}px, ${y}px) scale(${sx}, ${sy})`;
}

/** Plain rectangle with the fields the intro reads from a DOMRect. */
function rectOf(left, top, width, height) {
  return { left, top, width, height, right: left + width, bottom: top + height };
}

/** Clockwise from the top-left. */
function cornersOf(r) {
  return [
    [r.left, r.top],
    [r.right, r.top],
    [r.right, r.bottom],
    [r.left, r.bottom],
  ];
}

/**
 * The four sides of a frame, clockwise. Each side grows from the corner its
 * agent starts on (`rev` sides grow backwards), and only its length is ever
 * scaled, so the stroke keeps the same thickness while the frame travels.
 */
function edgesOf(r, bw) {
  return [
    { x: r.left, y: r.top, w: r.width, h: bw, axis: "X", rev: false },
    { x: r.right - bw, y: r.top, w: bw, h: r.height, axis: "Y", rev: false },
    { x: r.left, y: r.bottom - bw, w: r.width, h: bw, axis: "X", rev: true },
    { x: r.left, y: r.top, w: bw, h: r.height, axis: "Y", rev: true },
  ];
}

/** Copies the type styles that decide how a line of text is drawn. */
function copyType(from, to) {
  const cs = getComputedStyle(from);
  Object.assign(to.style, {
    fontFamily: cs.fontFamily,
    fontSize: cs.fontSize,
    fontWeight: cs.fontWeight,
    fontStyle: cs.fontStyle,
    fontStretch: cs.fontStretch,
    fontVariationSettings: cs.fontVariationSettings,
    fontFeatureSettings: cs.fontFeatureSettings,
    letterSpacing: cs.letterSpacing,
    textTransform: cs.textTransform,
    lineHeight: cs.lineHeight,
  });
  return cs;
}

/**
 * Grounded intro.
 *
 * A query is typed, seven retrieved documents hard-cut past with the name
 * fixed dead centre, then four agents draw a frame around it. The framed name
 * travels into the hero heading and lands on its box corner for corner; the
 * agents lap that box and dock into Kuro. The query line becomes the
 * availability chip.
 *
 * The hero is rendered underneath the whole time. Only transform and opacity
 * are tweened. Any key, click, scroll or touch skips to the finished page.
 * Reduced motion never mounts this component (see BootIntro in App.jsx).
 */
const GroundedIntro = memo(function GroundedIntro() {
  const [gone, setGone] = useState(false);
  const [phone] = useState(isPhoneLite);
  const [clips] = useState(() =>
    (phone ? PHONE_CLIP_INDEXES.map((i) => CLIPPINGS[i]) : CLIPPINGS),
  );

  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const queryRef = useRef(null);
  const sourceRef = useRef(null);
  const nameRef = useRef(null);
  const layerRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const html = document.documentElement;
    const stage = stageRef.current;
    const queryEl = queryRef.current;
    const sourceEl = sourceRef.current;
    const nameEl = nameRef.current;
    const layer = layerRef.current;
    const docsEl = root.querySelector(".gi__docs");
    const docs = [...root.querySelectorAll(".gi__doc")];
    const cuts = phone ? PHONE_CUTS : DESKTOP_CUTS;

    html.classList.add("intro-v2-playing");
    html.classList.remove("intro-mark-ready");

    const timers = new Set();
    const restorers = [];
    let typeTimer = 0;
    let done = false;
    let unmounted = false;

    const at = (ms, fn) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        if (!done) fn();
      }, ms);
      timers.add(id);
    };

    const animate = (node, keyframes, options) =>
      node.animate(keyframes, { fill: "both", ...options });

    const stopListening = () => {
      window.removeEventListener("keydown", onSkip, true);
      window.removeEventListener("pointerdown", onSkip, true);
      window.removeEventListener("wheel", onSkip, true);
      window.removeEventListener("touchmove", onSkip, true);
    };

    /** Lands on the finished page: hero name visible, chip in place. */
    const finish = ({ fade = 0 } = {}) => {
      if (done) return;
      done = true;
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();
      window.clearInterval(typeTimer);
      stopListening();
      restorers.forEach((restore) => restore());
      html.classList.remove("intro-v2-playing");
      html.classList.add("intro-mark-ready");
      writeStorage(VISITED_KEY, "true");
      window.dispatchEvent(new CustomEvent("portfolio-intro-complete"));

      const remove = () => {
        if (!unmounted) setGone(true);
      };
      if (fade > 0) {
        root.style.pointerEvents = "none";
        animate(root, [{ opacity: 1 }, { opacity: 0 }], { duration: fade, easing: "linear" })
          .finished.then(remove, remove);
      } else {
        remove();
      }
    };

    function onSkip(event) {
      // Modifier-only presses (Ctrl, Alt, Shift) are not a decision to skip.
      if (event.type === "keydown" && ["Control", "Alt", "Shift", "Meta"].includes(event.key)) {
        return;
      }
      finish({ fade: SKIP_FADE_MS });
    }

    window.addEventListener("keydown", onSkip, true);
    window.addEventListener("pointerdown", onSkip, true);
    window.addEventListener("wheel", onSkip, { capture: true, passive: true });
    window.addEventListener("touchmove", onSkip, { capture: true, passive: true });

    // ── 1. The query line types ───────────────────────────────────────────
    let typed = 0;
    queryEl.textContent = "";
    typeTimer = window.setInterval(() => {
      typed += 1;
      queryEl.textContent = QUERY.slice(0, typed);
      if (typed >= QUERY.length) window.clearInterval(typeTimer);
    }, TYPE_STEP_MS);

    // ── 2. Retrieved documents hard-cut past; the name never moves ────────
    const show = (index) => {
      docs.forEach((doc, i) => doc.classList.toggle("is-active", i === index));
      sourceEl.textContent = `source ${index + 1}/${docs.length} · ${clips[index].source}`;
      nameEl.classList.add("is-visible");
    };

    let t = FIRST_CUT_AT;
    cuts.forEach((duration, index) => {
      at(t, () => show(index));
      t += duration;
    });
    at(t, () => show(cuts.length));

    // ── 3. Four agents draw a frame around the name ───────────────────────
    // The frame is the same shape the hero heading's box will have, only
    // smaller and centred, so it can travel there without any redrawing.
    const frame = { rect: null, bars: [], agents: [], border: 4 };

    const drawFrame = () => {
      const heroBox = document.querySelector("[data-intro-name-target]");
      if (heroBox) {
        frame.border = parseFloat(getComputedStyle(heroBox).borderTopWidth) || 4;
      }
      const name = nameEl.getBoundingClientRect();
      const size = parseFloat(getComputedStyle(nameEl).fontSize) || 48;
      const padX = size * 0.3;
      const padY = size * 0.02;
      frame.rect = rectOf(
        name.left - padX,
        name.top - padY,
        name.width + padX * 2,
        name.height + padY * 2,
      );

      const corners = cornersOf(frame.rect);
      const edges = edgesOf(frame.rect, frame.border);
      const borderColor = heroBox ? getComputedStyle(heroBox).borderTopColor : "";

      edges.forEach((edge, i) => {
        const bar = el("gi__fly gi__edge");
        Object.assign(bar.style, { width: `${edge.w}px`, height: `${edge.h}px` });
        if (borderColor) bar.style.background = borderColor;
        layer.append(bar);
        const zero = edge.axis === "X" ? [0, 1] : [1, 0];
        const startX = edge.rev && edge.axis === "X" ? edge.x + edge.w : edge.x;
        const startY = edge.rev && edge.axis === "Y" ? edge.y + edge.h : edge.y;
        animate(
          bar,
          [
            { transform: place(startX, startY, ...zero) },
            { transform: place(edge.x, edge.y, 1, 1) },
          ],
          { duration: FRAME_MS, delay: FRAME_DELAY_MS + AGENT_IN_MS * 0.4, easing: EASE_DRAW },
        );
        frame.bars.push({ bar, edge });

        if (phone) return;
        const agent = el("gi__fly gi__agent");
        agent.append(el("gi__agent-dot"), el("gi__agent-label", AGENT_LABELS[i]));
        layer.append(agent);
        const [cx, cy] = corners[i];
        const [nx, ny] = corners[(i + 1) % 4];
        // Pop in at the start corner, then ride the edge that is being drawn.
        animate(
          agent,
          [
            { transform: place(cx, cy, 0), opacity: 0, offset: 0, easing: EASE_OUT },
            { transform: place(cx, cy, 1), opacity: 1, offset: AGENT_IN_MS / (AGENT_IN_MS + FRAME_MS) },
            { transform: place(nx, ny, 1), opacity: 1, offset: 1 },
          ],
          { duration: AGENT_IN_MS + FRAME_MS, delay: FRAME_DELAY_MS, easing: EASE_DRAW },
        );
        frame.agents.push(agent);
      });
    };

    at(t + FRAME_DELAY_MS, drawFrame);

    // ── 4. The framed name travels into the hero heading ──────────────────
    // The documents cut out fast; the paper behind them lifts more slowly, so
    // the page is never read through a layer of half-faded text.
    const liftStage = () => {
      const quick = { duration: 110, easing: "linear" };
      [docsEl, sourceEl].forEach((node) => animate(node, [{ opacity: 1 }, { opacity: 0 }], quick));
      animate(stage, [{ opacity: 1 }, { opacity: 0 }], {
        duration: FLY_MS * 0.8,
        easing: "linear",
      });
    };

    /**
     * Query line → availability chip, when a chip is on screen to land on.
     * The query lifts off as a solid label, travels to the chip and hands over
     * to it. With no chip in view it simply fades with the stage.
     */
    const flyQueryToChip = () => {
      const chip = [...document.querySelectorAll("[data-availability-chip]")].find((node) =>
        inViewport(node.getBoundingClientRect()),
      );
      if (!chip) return;

      const from = queryEl.getBoundingClientRect();
      const to = chip.getBoundingClientRect();
      const flyQuery = el("gi__fly gi__fly-query", QUERY);
      layer.append(flyQuery);
      const label = flyQuery.getBoundingClientRect();
      const inset = (label.width - from.width) / 2;
      queryEl.parentElement.style.visibility = "hidden";

      const duration = FLY_MS + 100;
      animate(
        flyQuery,
        [
          {
            transform: place(from.left - inset, from.top + (from.height - label.height) / 2),
            opacity: 1,
          },
          { opacity: 1, offset: 0.75 },
          {
            transform: place(to.left - inset, to.top + (to.height - label.height) / 2),
            opacity: 0,
          },
        ],
        { duration, easing: EASE_TRAVEL },
      );
      // The real chip stays hidden until the label is nearly on it. No final
      // keyframe: it fades up to whatever opacity its own styles give it.
      const handover = chip.animate(
        [
          { opacity: 0, offset: 0 },
          { opacity: 0, offset: 0.7 },
        ],
        { duration, easing: "linear" },
      );
      restorers.push(() => handover.cancel());
    };

    const fly = () => {
      const target = document.querySelector("[data-intro-name-target]");
      const targetText = target?.querySelector("[data-intro-name-text]");
      const box = target?.getBoundingClientRect();

      // The page is usable from here on; everything left is decoration.
      root.style.pointerEvents = "none";

      // Hero not mounted yet, or scrolled out of view: just lift the stage.
      if (!target || !targetText || !frame.rect || !inViewport(box)) {
        finish({ fade: FLY_MS * 0.8 });
        return;
      }

      const source = nameEl.getBoundingClientRect();
      const text = targetText.getBoundingClientRect();
      const from = frame.rect;
      const timing = { duration: FLY_MS, easing: EASE_TRAVEL };

      // Paper: fills the frame as it lands so the box reads as a card.
      const flyPlate = el("gi__fly gi__fly-plate");
      flyPlate.style.width = `${box.width}px`;
      flyPlate.style.height = `${box.height}px`;

      // Name: the serif setting fades out while the heading's own setting
      // fades in. Both ride the same box, so they stay registered.
      const flySerif = el("gi__fly gi__fly-serif", NAME);
      const nameType = getComputedStyle(nameEl);
      Object.assign(flySerif.style, {
        width: `${source.width}px`,
        fontSize: nameType.fontSize,
        lineHeight: `${source.height}px`,
      });

      const flyHeading = el("gi__fly gi__fly-heading", targetText.textContent);
      copyType(targetText, flyHeading);
      flyHeading.style.width = `${text.width}px`;
      flyHeading.style.height = `${text.height}px`;

      layer.prepend(flyPlate);
      layer.append(flySerif, flyHeading);
      nameEl.style.visibility = "hidden";

      animate(
        flyPlate,
        [
          {
            transform: place(from.left, from.top, from.width / box.width, from.height / box.height),
            opacity: 0,
          },
          { opacity: 1, offset: 0.55 },
          { transform: place(box.left, box.top), opacity: 1 },
        ],
        timing,
      );

      // The frame's sides slide to the heading's sides, lengthening as they go.
      const targetEdges = edgesOf(box, frame.border);
      frame.bars.forEach(({ bar, edge }, i) => {
        const to = targetEdges[i];
        animate(
          bar,
          [
            { transform: place(edge.x, edge.y, 1, 1) },
            {
              transform: place(
                to.x,
                to.y,
                edge.axis === "X" ? to.w / edge.w : 1,
                edge.axis === "Y" ? to.h / edge.h : 1,
              ),
            },
          ],
          timing,
        );
      });

      animate(
        flySerif,
        [
          { transform: place(source.left, source.top), opacity: 1 },
          { opacity: 0, offset: 0.7 },
          {
            transform: place(
              text.left,
              text.top,
              text.width / source.width,
              text.height / source.height,
            ),
            opacity: 0,
          },
        ],
        timing,
      );
      animate(
        flyHeading,
        [
          {
            transform: place(
              source.left,
              source.top,
              source.width / text.width,
              source.height / text.height,
            ),
            opacity: 0,
          },
          { opacity: 1, offset: 0.8 },
          { transform: place(text.left, text.top), opacity: 1 },
        ],
        timing,
      );

      const corners = cornersOf(box);
      frame.agents.forEach((agent, i) => {
        const [fx, fy] = cornersOf(from)[(i + 1) % 4];
        const [tx, ty] = corners[(i + 1) % 4];
        animate(
          agent,
          [{ transform: place(fx, fy) }, { transform: place(tx, ty) }],
          timing,
        );
      });

      liftStage();
      flyQueryToChip();

      // The real heading takes over from the travelling layers.
      const reveal = () => {
        html.classList.remove("intro-v2-playing");
        html.classList.add("intro-mark-ready");
        target.animate(
          [
            { opacity: 0, transform: "scale(1.035)" },
            { opacity: 1, transform: "scale(1)" },
          ],
          { duration: REVEAL_MS + 120, easing: EASE_OUT },
        );
      };
      const dropTravellers = () => {
        layer
          .querySelectorAll(".gi__fly-plate, .gi__fly-serif, .gi__fly-heading, .gi__edge")
          .forEach((node) => node.remove());
      };

      // Phones and reduced-capability devices: no agents, the box just arrives.
      const dock = phone ? null : document.querySelector("[data-kuro-dock]");
      const dockRect = dock?.getBoundingClientRect();
      if (!dockRect || !inViewport(dockRect) || !frame.agents.length) {
        at(FLY_MS, reveal);
        at(FLY_MS + REVEAL_MS, () => {
          dropTravellers();
          finish();
        });
        return;
      }

      // ── 5. The agents lap the heading's box, then dock into Kuro ─────────
      at(FLY_MS, () => {
        reveal();
        frame.agents.forEach((agent, i) => {
          const [ax, ay] = corners[(i + 1) % 4];
          const [bx, by] = corners[(i + 2) % 4];
          animate(
            agent,
            [{ transform: place(ax, ay) }, { transform: place(bx, by) }],
            { duration: LAP_MS, easing: EASE_DRAW },
          );
        });
      });

      // The real box is fully in: only the agents remain.
      at(FLY_MS + REVEAL_MS, dropTravellers);

      at(FLY_MS + LAP_MS, () => {
        const toX = dockRect.left + dockRect.width / 2;
        const toY = dockRect.top + dockRect.height / 2;
        frame.agents.forEach((agent, i) => {
          const [bx, by] = corners[(i + 2) % 4];
          animate(
            agent,
            [
              { transform: place(bx, by), opacity: 1 },
              { opacity: 1, offset: 0.8 },
              { transform: place(toX, toY, 0.35), opacity: 0 },
            ],
            { duration: DOCK_MS, delay: i * DOCK_STAGGER_MS, easing: EASE_TRAVEL },
          );
        });
      });

      at(FLY_MS + LAP_MS + DOCK_MS + DOCK_STAGGER_MS * 3, () => {
        window.dispatchEvent(
          new CustomEvent("portfolio:kuro-swarm", { detail: { phase: "absorb" } }),
        );
        finish();
      });
    };

    at(t + FRAME_DELAY_MS + AGENT_IN_MS + FRAME_MS + HOLD_MS, fly);
    at(HARD_CAP_MS, () => finish());

    return () => {
      unmounted = true;
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();
      window.clearInterval(typeTimer);
      stopListening();
      restorers.forEach((restore) => restore());
      html.classList.remove("intro-v2-playing");
      // Leave a clean slate for a remount (React StrictMode runs effects twice).
      root.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
      layer.replaceChildren();
      docs.forEach((doc) => doc.classList.remove("is-active"));
      nameEl.classList.remove("is-visible");
      nameEl.style.visibility = "";
      queryEl.parentElement.style.visibility = "";
      root.style.pointerEvents = "";
      if (!done) {
        // Unmounted mid-intro: never leave the hero hidden.
        html.classList.add("intro-mark-ready");
      }
      done = true;
    };
  }, [clips, phone]);

  if (gone) return null;

  return (
    <div className="gi" ref={rootRef} aria-hidden="true">
      <div className="gi__stage" ref={stageRef}>
        <div className="gi__docs">
          {clips.map((clip, index) => (
            <div className="gi__doc" key={clip.source} data-variant={index % 3}>
              <p className="gi__line gi__line--far">{clip.above[0]}</p>
              <p className="gi__line gi__line--near">{clip.above[1]}</p>
              <p className="gi__row">
                <span className="gi__side gi__side--before">
                  <span>{clip.before}</span>
                </span>
                <span className="gi__slot">{NAME}</span>
                <span className="gi__side gi__side--after">
                  <span>{clip.after}</span>
                </span>
              </p>
              <p className="gi__line gi__line--near">{clip.below[0]}</p>
              <p className="gi__line gi__line--far">{clip.below[1]}</p>
            </div>
          ))}
        </div>

        <p className="gi__hud gi__hud--query">
          <span ref={queryRef} />
          <span className="gi__caret" />
        </p>
        <p className="gi__hud gi__hud--source" ref={sourceRef} />

        <div className="gi__name-anchor">
          <div className="gi__name" ref={nameRef}>
            <span className="gi__name-text">{NAME}</span>
          </div>
        </div>
      </div>

      <div className="gi__layer" ref={layerRef} />
    </div>
  );
});

export default GroundedIntro;

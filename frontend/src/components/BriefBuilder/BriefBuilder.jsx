import { memo, useCallback, useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { BRIEF_AGENTS, BRIEF_CHIPS, getBriefChip } from "./briefOptions";
import { trackActionClick, trackBriefSent, trackBriefStarted } from "../../utils/funnel";
import { saveBriefPrefill } from "../../utils/briefPrefill";
import { PRIMARY_CTA } from "../../data/availability";

const FILL_ORDER = ["scope", "stack", "timeline", "price"];
const TOTAL_MS = 2400;

const BriefBuilder = memo(function BriefBuilder({ className = "" }) {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const labelId = useId();
  const timersRef = useRef([]);
  const [activeChip, setActiveChip] = useState(null);
  const [filled, setFilled] = useState({});
  const [agentsVisible, setAgentsVisible] = useState(false);
  const [briefReady, setBriefReady] = useState(false);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const runFill = useCallback(
    (chipId) => {
      clearTimers();
      const chip = getBriefChip(chipId);
      if (!chip) return;

      setActiveChip(chipId);
      setFilled({});
      setBriefReady(false);
      setAgentsVisible(true);
      trackBriefStarted(chip.label);

      if (reduceMotion) {
        setFilled({
          scope: chip.scope,
          stack: chip.stack,
          timeline: chip.timeline,
          price: chip.priceLabel,
        });
        setBriefReady(true);
        return;
      }

      const step = Math.floor(TOTAL_MS / FILL_ORDER.length);
      FILL_ORDER.forEach((key, index) => {
        const id = window.setTimeout(() => {
          const value =
            key === "price"
              ? chip.priceLabel
              : chip[key];
          setFilled((prev) => ({ ...prev, [key]: value }));
          if (index === FILL_ORDER.length - 1) setBriefReady(true);
        }, step * (index + 1));
        timersRef.current.push(id);
      });
    },
    [clearTimers, reduceMotion],
  );

  const handleChip = useCallback(
    (chipId) => {
      if (activeChip === chipId && briefReady) return;
      runFill(chipId);
    },
    [activeChip, briefReady, runFill],
  );

  const handleSend = useCallback(() => {
    const chip = getBriefChip(activeChip);
    if (!chip || !briefReady) return;

    const prefill = {
      projectType: chip.projectType,
      message: chip.message,
      timeline: chip.inquiryTimeline,
      budgetRange: chip.budgetRange,
      source: "brief_builder",
      chipId: chip.id,
    };

    const fields = ["projectType", "message", "timeline", "budgetRange"].filter(
      (k) => Boolean(prefill[k]),
    );
    saveBriefPrefill(prefill);
    trackBriefSent(fields.length);
    trackActionClick("Send this brief", PRIMARY_CTA.to);

    const params = new URLSearchParams();
    params.set("projectType", chip.projectType);
    params.set("timeline", chip.inquiryTimeline);
    params.set("budgetRange", chip.budgetRange);
    navigate(`/services?${params.toString()}#inquiry`);
  }, [activeChip, briefReady, navigate]);

  const chip = getBriefChip(activeChip);

  return (
    <div
      className={`flex flex-col gap-4 w-full ${className}`.trim()}
      role="region"
      aria-labelledby={labelId}
    >
      <div className="flex flex-col gap-2">
        <p
          id={labelId}
          className="font-label-bold text-xs uppercase tracking-[0.18em] text-text-muted"
        >
          What do you need?
        </p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Project need chips">
          {BRIEF_CHIPS.map((item) => {
            const selected = activeChip === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                onClick={() => handleChip(item.id)}
                className={`border-4 border-outline px-3 py-2 font-label-bold text-xs md:text-sm uppercase transition-all cursor-none ${
                  selected
                    ? "bg-primary-container text-on-primary-container shadow-[2px_2px_0_0_var(--shadow-color)] translate-x-[2px] translate-y-[2px]"
                    : "bg-surface text-on-surface shadow-[4px_4px_0_0_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_0_var(--shadow-color)]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="flex flex-wrap gap-2 min-h-[40px]"
        aria-live="polite"
        aria-atomic="false"
      >
        {BRIEF_AGENTS.map((agent, index) => {
          const hasValue = Boolean(filled[agent.id]);
          const show = agentsVisible;
          return (
            <motion.div
              key={agent.id}
              initial={false}
              animate={
                show
                  ? { opacity: 1, scale: 1, y: 0 }
                  : { opacity: 0, scale: 0.85, y: 6 }
              }
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { delay: index * 0.08, type: "spring", stiffness: 320, damping: 22 }
              }
              className={`w-16 h-10 border-4 border-outline flex items-center justify-center font-label-bold text-[10px] uppercase ${
                hasValue
                  ? "bg-primary-container text-on-primary-container"
                  : "bg-surface text-on-surface"
              }`}
              aria-hidden={!show}
            >
              {agent.label}
            </motion.div>
          );
        })}
      </div>

      {/* Reserved height — zero layout shift while agents fill */}
      <div
        className="border-4 border-outline bg-surface p-4 md:p-5 shadow-[6px_6px_0_0_var(--shadow-color)] min-h-[280px] md:min-h-[300px] flex flex-col gap-3"
        aria-live="polite"
      >
        <p className="font-label-bold text-xs uppercase tracking-[0.16em] text-text-muted">
          Scoped brief
        </p>
        {!chip ? (
          <p className="font-body-md text-sm md:text-base text-text-muted leading-snug">
            Pick a chip. Four agents draft scope, stack, timeline, and price from real packages —
            under three seconds.
          </p>
        ) : (
          <>
            <h3 className="font-headline-md text-lg md:text-xl uppercase leading-tight">
              {chip.packageName}
            </h3>
            <dl className="grid grid-cols-1 gap-2.5 flex-1">
              {FILL_ORDER.map((key) => (
                <div key={key} className="min-h-[2.75rem]">
                  <dt className="font-label-bold text-[10px] uppercase tracking-[0.14em] text-text-muted">
                    {key}
                  </dt>
                  <dd className="font-body-md text-sm md:text-base leading-snug text-on-surface">
                    {filled[key] || (
                      <span
                        className="inline-block h-3 mt-1 bg-surface-variant animate-pulse"
                        style={{ width: "75%" }}
                        aria-hidden="true"
                      />
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </>
        )}

        <button
          type="button"
          disabled={!briefReady}
          onClick={handleSend}
          className={`mt-auto self-start border-4 border-outline px-5 py-3 font-label-bold text-sm uppercase transition-all cursor-none ${
            briefReady
              ? "bg-primary-container text-on-primary-container shadow-[6px_6px_0_0_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_0_var(--shadow-color)]"
              : "bg-surface-variant text-text-muted opacity-60 cursor-not-allowed shadow-none"
          }`}
        >
          Send this brief
        </button>
      </div>
    </div>
  );
});

export default BriefBuilder;

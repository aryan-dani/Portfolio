import { useEffect, useRef, useState, memo } from "react";

/**
 * Role typewriter — plain timers (no Framer Motion).
 * Under prefers-reduced-motion, shows the first string statically.
 */
const TypeWriter = memo(function TypeWriter({
  texts = [],
  speed = 120,
  deleteSpeed = 60,
  pauseTime = 3200,
  className = "",
}) {
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const firstText = Array.isArray(texts) && texts.length ? texts[0] : "";
  const [displayText, setDisplayText] = useState(prefersReduced ? firstText : "");
  const indexRef = useRef(0);
  const phaseRef = useRef("typing"); // typing | pausing | deleting
  const textRef = useRef("");
  const textsRef = useRef(texts);
  textsRef.current = texts;

  useEffect(() => {
    const roles = textsRef.current;
    if (!Array.isArray(roles) || roles.length === 0) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDisplayText(roles[0] || "");
      return undefined;
    }

    let timer = 0;
    textRef.current = "";
    indexRef.current = 0;
    phaseRef.current = "typing";
    setDisplayText("");

    const schedule = (ms) => {
      clearTimeout(timer);
      timer = window.setTimeout(step, ms);
    };

    const step = () => {
      const list = textsRef.current;
      if (!list.length) return;

      const i = indexRef.current % list.length;
      const full = list[i] || "";
      const phase = phaseRef.current;
      const current = textRef.current;

      if (phase === "pausing") {
        phaseRef.current = "deleting";
        schedule(deleteSpeed);
        return;
      }

      if (phase === "deleting") {
        if (current.length <= 1) {
          textRef.current = "";
          setDisplayText("");
          phaseRef.current = "typing";
          indexRef.current = (indexRef.current + 1) % list.length;
          schedule(speed);
          return;
        }
        const next = current.slice(0, -1);
        textRef.current = next;
        setDisplayText(next);
        schedule(deleteSpeed);
        return;
      }

      // typing
      if (current.length >= full.length) {
        textRef.current = full;
        setDisplayText(full);
        phaseRef.current = "pausing";
        schedule(pauseTime);
        return;
      }
      const next = full.slice(0, current.length + 1);
      textRef.current = next;
      setDisplayText(next);
      schedule(speed);
    };

    schedule(320);
    return () => clearTimeout(timer);
  }, [speed, deleteSpeed, pauseTime]);

  return (
    <span className={`typewriter ${className}`} aria-live="polite">
      <span className="typewriter__text">{displayText || "\u00A0"}</span>
      {!prefersReduced && (
        <span className="typewriter__cursor" aria-hidden="true">
          |
        </span>
      )}
    </span>
  );
});

export default TypeWriter;

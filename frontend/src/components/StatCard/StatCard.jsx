import { useRef, memo } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useCountUp } from "../../hooks/useCountUp";
import { hoverSpring, defaultSpring } from "../../utils/motionVariants";

function StatCard({ value, isPlus, label, bg, text, shadow, delay = 0, to }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const displayVal = useCountUp(typeof value === "number" ? value : parseInt(value), {
    duration: 1600,
    trigger: inView,
  });
  const Component = to ? motion(Link) : motion.div;

  return (
    <Component
      ref={ref}
      to={to}
      className={`block border-4 border-outline p-4 md:p-6 text-center ${to ? "cursor-none group" : ""}`}
      style={{
        background: bg,
        color: text,
        boxShadow: `4px 4px 0px 0px ${shadow || 'var(--shadow-color)'}`
      }}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ ...defaultSpring, delay }}
      whileHover={{
        y: -4,
        x: -4,
        boxShadow: `8px 8px 0px 0px ${shadow || 'var(--shadow-color)'}`,
        transition: hoverSpring,
      }}
      aria-label={to ? `Open ${label}` : undefined}
    >
      <div className="font-headline-xl text-3xl md:text-5xl font-black">
        {displayVal}{isPlus && "+"}
      </div>
      <div className="font-label-bold text-xs uppercase mt-1 opacity-80 tracking-wider">
        {label}
      </div>
      {to && (
        <div className="mt-3 font-label-bold text-[10px] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-80 transition-opacity">
          Open
        </div>
      )}
    </Component>
  );
}

export default memo(StatCard);

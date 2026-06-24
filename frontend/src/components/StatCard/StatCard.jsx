import { useRef, memo } from "react";
import { motion, useInView } from "framer-motion";
import { useCountUp } from "../../hooks/useCountUp";
import { hoverSpring, defaultSpring } from "../../utils/motionVariants";

function StatCard({ value, isPlus, label, bg, text, shadow, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const displayVal = useCountUp(typeof value === "number" ? value : parseInt(value), {
    duration: 1600,
    trigger: inView,
  });

  return (
    <motion.div
      ref={ref}
      className="border-4 border-outline p-4 md:p-6 text-center"
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
    >
      <div className="font-headline-xl text-3xl md:text-5xl font-black">
        {displayVal}{isPlus && "+"}
      </div>
      <div className="font-label-bold text-xs uppercase mt-1 opacity-80 tracking-wider">
        {label}
      </div>
    </motion.div>
  );
}

export default memo(StatCard);

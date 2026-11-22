import { memo } from "react";
import { motion } from "framer-motion";
import { useMotionPolicy } from "../../hooks/useMotionPolicy";

const Reveal = memo(function Reveal({
  as: Tag = "div",
  children,
  className = "",
  delay = 0,
  y = 12,
  ...rest
}) {
  const policy = useMotionPolicy();
  const MotionTag = motion[Tag] || motion.div;

  if (policy === "reduced") {
    const Static = Tag;
    return (
      <Static className={className} {...rest}>
        {children}
      </Static>
    );
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: policy === "lite" ? 6 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: policy === "lite" ? 0.28 : 0.42,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
});

export default Reveal;

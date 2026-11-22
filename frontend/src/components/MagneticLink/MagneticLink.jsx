import { useRef, useState, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { defaultSpring } from "../../utils/motionVariants";
import { trackActionClick } from "../../utils/funnel";

function MagneticLink({ to, className, children, trackLabel }) {
  const ref = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.25;
    const dy = (e.clientY - cy) * 0.25;
    setOffset({ x: dx, y: dy });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 });
  }, []);

  const handleClick = useCallback(() => {
    if (trackLabel) trackActionClick(trackLabel, to);
  }, [trackLabel, to]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ ...defaultSpring, stiffness: 350, damping: 20 }}
    >
      <Link to={to} className={className} onClick={handleClick}>
        {children}
      </Link>
    </motion.div>
  );
}

export default memo(MagneticLink);

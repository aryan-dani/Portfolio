import { memo } from "react";

/**
 * Evidence emphasis for numbers and short proof phrases.
 * Plain heavy weight — the highlighter treatment was retired.
 */
const Mark = memo(function Mark({ children, className = "" }) {
  return (
    <strong className={`font-bold text-inherit ${className}`.trim()}>{children}</strong>
  );
});

export default Mark;

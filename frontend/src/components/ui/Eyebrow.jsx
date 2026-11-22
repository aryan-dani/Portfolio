import { memo } from "react";

const Eyebrow = memo(function Eyebrow({ children, className = "" }) {
  return (
    <p
      className={`font-label-bold text-[10px]  tracking-[0.2em] text-text-muted ${className}`.trim()}
    >
      {children}
    </p>
  );
});

export default Eyebrow;

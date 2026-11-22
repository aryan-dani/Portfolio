import { memo } from "react";

const TONES = {
  default: "border-outline bg-surface text-on-surface",
  solid: "border-outline bg-primary-container text-on-primary-container",
  accent: "border-outline bg-primary-container text-on-primary-container",
};

const Tag = memo(function Tag({ children, className = "", tone = "default", ...rest }) {
  return (
    <span
      className={`inline-flex items-center border-2 px-2 py-1 font-label-bold text-[10px]  tracking-[0.14em] ${TONES[tone] || TONES.default} ${className}`.trim()}
      {...rest}
    >
      {children}
    </span>
  );
});

export default Tag;

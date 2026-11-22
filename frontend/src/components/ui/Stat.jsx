import { memo } from "react";
import Mark from "../Mark/Mark";

const Stat = memo(function Stat({ value, label, marked = true, className = "" }) {
  return (
    <div className={`flex flex-col gap-1 min-w-0 ${className}`.trim()}>
      <p className="font-headline-md text-3xl md:text-4xl leading-none tracking-tight">
        {marked ? <Mark>{value}</Mark> : value}
      </p>
      <p className="font-label-bold text-[10px] uppercase tracking-[0.16em] text-text-muted">
        {label}
      </p>
    </div>
  );
});

export default Stat;

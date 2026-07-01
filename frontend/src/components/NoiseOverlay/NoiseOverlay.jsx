import { memo, useEffect, useState } from "react";

const noiseDataUrl = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const NoiseOverlay = memo(function NoiseOverlay() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const narrow = window.matchMedia("(max-width: 768px)").matches;
    setEnabled(!coarse && !reduced && !narrow);
  }, []);

  if (!enabled) return null;

  return (
    <div
      className="noise-overlay"
      style={{ backgroundImage: noiseDataUrl }}
      aria-hidden="true"
    />
  );
});

export default NoiseOverlay;

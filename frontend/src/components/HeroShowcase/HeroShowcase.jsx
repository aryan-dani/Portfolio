import { memo } from "react";

const HeroShowcase = memo(function HeroShowcase() {
  return (
    <div className="relative w-full max-w-xl">
      <div className="absolute -inset-3 border-4 border-outline bg-[var(--color-accent-electric)] opacity-70 pointer-events-none" />
      <div className="relative h-[380px] w-full overflow-hidden border-4 border-outline bg-[var(--color-surface)] shadow-[12px_12px_0px_0px_var(--shadow-color)]">
        <div className="absolute inset-0 bg-hatch opacity-70" />

        <div className="absolute inset-x-6 top-6 flex items-center justify-between border-4 border-outline bg-[var(--color-primary-container)] px-4 py-2 text-[var(--color-on-primary-container)]">
          <span className="font-label-bold text-xs uppercase tracking-[0.28em]">Portfolio Interface</span>
          <span className="h-3 w-3 bg-[var(--color-on-primary-container)] border-2 border-outline" />
        </div>

        <div className="absolute bottom-8 left-6 right-6">
          <p className="font-headline-xl text-5xl sm:text-7xl uppercase leading-none tracking-tighter text-[var(--color-on-surface)]">
            Aryan
            <br />
            Dani
          </p>
          <p className="mt-4 border-4 border-outline bg-[var(--color-background)] p-3 font-label-bold text-xs uppercase tracking-[0.2em] text-[var(--color-on-background)] shadow-[4px_4px_0_var(--shadow-color)]">
            Web Developer / AI Engineer / Builder
          </p>
        </div>
      </div>

      <div className="absolute left-4 top-4 border-4 border-outline bg-[var(--color-surface)] px-3 py-2 font-label-bold text-[10px] uppercase tracking-[0.24em] text-[var(--color-on-surface)] shadow-[4px_4px_0_var(--shadow-color)] pointer-events-none">
        Monochrome
      </div>
      <div className="absolute bottom-4 right-4 border-4 border-outline bg-[var(--color-on-background)] px-3 py-2 font-label-bold text-[10px] uppercase tracking-[0.24em] text-[var(--color-background)] pointer-events-none">
        Fast Render
      </div>
    </div>
  );
});

export default HeroShowcase;

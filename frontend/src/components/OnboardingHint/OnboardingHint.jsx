import { memo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "portfolio_onboarding_hint_dismissed";

function isTouchOrCoarsePointer() {
  if (typeof window === "undefined") return true;
  return (
    window.matchMedia("(pointer: coarse)").matches
    || window.matchMedia("(hover: none)").matches
  );
}

const OnboardingHint = memo(function OnboardingHint() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Never cover primary CTAs on touch devices; Phase 1 removes the hint there entirely.
    if (isTouchOrCoarsePointer()) return undefined;
    const dismissed = localStorage.getItem(STORAGE_KEY) === "true";
    if (dismissed) return undefined;
    const timer = setTimeout(() => setIsVisible(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed left-auto right-6 bottom-36 z-[60] max-w-sm border-4 border-outline bg-surface p-4 shadow-[8px_8px_0_var(--shadow-color)] pointer-events-auto"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          role="status"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-label-bold text-[10px]  tracking-[0.24em] text-text-muted">
                Tip
              </p>
              <p className="mt-1 font-body-md text-sm text-on-surface">
                Press <strong>Ctrl/Alt+K</strong> to search,{" "}
                <strong>Alt+1–9</strong> or <strong>Alt+Arrows</strong> to navigate, or{" "}
                <strong>?</strong> for shortcuts.
              </p>
            </div>
            <button
              type="button"
              onClick={dismiss}
              className="shrink-0 border-2 border-outline bg-primary-container px-2 py-1 font-label-bold text-xs  text-on-primary-container shadow-[2px_2px_0_var(--shadow-color)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-none"
            >
              Got it
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default OnboardingHint;

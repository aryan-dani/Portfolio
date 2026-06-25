import { memo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "portfolio_onboarding_hint_dismissed";

const OnboardingHint = memo(function OnboardingHint() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
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
          className="fixed left-4 right-4 bottom-24 sm:left-auto sm:right-6 sm:bottom-28 z-[60] max-w-md border-4 border-outline bg-[var(--color-surface)] p-4 shadow-[8px_8px_0_var(--shadow-color)]"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-label-bold text-[10px] uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
                First time here?
              </p>
              <p className="mt-1 font-body-md text-sm text-[var(--color-on-surface)]">
                Click any card to open details. Press <strong>Ctrl/Alt+K</strong> to search,
                <strong> Alt+1-8</strong> or <strong>Alt+Arrows</strong> to navigate, or <strong>?</strong> for shortcuts.
              </p>
            </div>
            <button
              type="button"
              onClick={dismiss}
              className="shrink-0 border-2 border-outline bg-[var(--color-primary-container)] px-2 py-1 font-label-bold text-xs uppercase text-[var(--color-on-primary-container)] shadow-[2px_2px_0_var(--shadow-color)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-none"
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

import { memo, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { keyboardRoutes } from "../../hooks/useKeyboardNav";

const SHORTCUTS = [
  { keys: "Ctrl/Alt + K", label: "Open search palette" },
  { keys: "?", label: "Show this shortcut guide" },
  { keys: "Alt + ← / →", label: "Move between portfolio pages" },
  { keys: "Esc", label: "Close overlays" },
  { keys: "Arrow keys", label: "Move through command results / terminal history" },
  { keys: "Tab", label: "Autocomplete CLI commands" },
];

const ShortcutsOverlay = memo(function ShortcutsOverlay({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 w-full max-w-2xl bg-[var(--color-surface)] border-4 border-outline shadow-[16px_16px_0px_0px_var(--shadow-color)] p-5 md:p-7"
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
          >
            <div className="flex items-start justify-between gap-4 border-b-4 border-outline pb-4 mb-5">
              <div>
                <p className="font-label-bold text-xs uppercase tracking-[0.28em] text-[var(--color-text-muted)]">
                  Navigation Hints
                </p>
                <h2 className="font-headline-md text-3xl uppercase text-[var(--color-on-surface)]">
                  Keyboard Shortcuts
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-4 border-outline px-3 py-2 font-label-bold uppercase shadow-[3px_3px_0_var(--shadow-color)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-none"
              >
                Close
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {keyboardRoutes.map((route) => (
                <div key={route.key} className="flex items-center justify-between gap-3 border-2 border-outline bg-[var(--color-surface-variant)] p-3">
                  <span className="font-label-bold uppercase text-[var(--color-on-surface)]">{route.label}</span>
                  <kbd className="border-2 border-outline bg-[var(--color-surface)] px-2 py-1 font-sans text-xs font-bold shadow-[2px_2px_0_var(--shadow-color)]">
                    Alt+{route.key}
                  </kbd>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3">
              {SHORTCUTS.map((item) => (
                <div key={item.keys} className="flex items-center justify-between gap-3 border-2 border-dashed border-outline-variant p-3">
                  <span className="font-body-md text-sm text-[var(--color-on-surface)]">{item.label}</span>
                  <kbd className="border-2 border-outline bg-[var(--color-on-background)] px-2 py-1 font-sans text-xs font-bold text-[var(--color-background)]">
                    {item.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
});

export default ShortcutsOverlay;

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";

/**
 * Neo-brutalist listbox that matches site borders/shadows.
 * Submits the same string values a native <select> would.
 */
export default function BrutalSelect({
  id,
  name,
  label,
  value,
  options,
  onChange,
  placeholder = "Select...",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const rootRef = useRef(null);
  const listId = useId();
  const labelId = useId();

  const items = ["", ...options];
  const display = value || placeholder;

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const idx = items.findIndex((item) => item === value);
    setHighlight(idx >= 0 ? idx : 0);
    // options length is stable for a given field; value resets highlight when reopened
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, value, options]);

  const commit = (next) => {
    onChange?.({ target: { name, value: next } });
    setOpen(false);
  };

  const onTriggerKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen((prev) => !prev);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setHighlight(0);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setHighlight(items.length - 1);
    }
  };

  const onListKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlight((prev) => Math.min(items.length - 1, prev + 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((prev) => Math.max(0, prev - 1));
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (highlight >= 0) commit(items[highlight]);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      event.currentTarget.blur();
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`} ref={rootRef}>
      {label && (
        <label id={labelId} htmlFor={id} className="font-label-bold uppercase text-sm">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          id={id}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={label ? labelId : undefined}
          aria-controls={listId}
          onClick={() => setOpen((prev) => !prev)}
          onKeyDown={onTriggerKeyDown}
          className="w-full border-4 border-outline p-3 md:p-4 font-body-md text-base md:text-lg shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] focus:outline-none focus:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all duration-200 cursor-none flex justify-between items-center gap-3 bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] text-left"
        >
          <span className={value ? "opacity-100" : "opacity-60"}>{display}</span>
          <motion.span animate={{ y: open ? -2 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 24 }}>
            <FaChevronDown className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
          </motion.span>
        </button>

        <AnimatePresence>
          {open && (
            <motion.ul
              id={listId}
              role="listbox"
              tabIndex={-1}
              aria-labelledby={label ? labelId : undefined}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
              onKeyDown={onListKeyDown}
              className="absolute top-full left-0 right-0 mt-2 z-50 border-4 border-outline bg-[var(--color-surface)] shadow-[8px_8px_0px_0px_var(--shadow-color)] flex flex-col max-h-64 overflow-y-auto overscroll-contain"
            >
              {items.map((item, index) => {
                const selected = item === value;
                const active = index === highlight;
                const text = item || placeholder;
                return (
                  <li
                    key={`${name}-${item || "empty"}`}
                    role="option"
                    aria-selected={selected}
                    tabIndex={0}
                    onMouseEnter={() => setHighlight(index)}
                    onClick={() => commit(item)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        commit(item);
                      }
                    }}
                    className={`p-3 md:p-4 font-body-md text-base md:text-lg border-b-2 border-outline last:border-b-0 cursor-none transition-colors ${
                      active || selected
                        ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]"
                        : "bg-[var(--color-surface)] text-[var(--color-on-surface)] hover:bg-[var(--color-primary-container)] hover:text-[var(--color-on-primary-container)]"
                    }`}
                  >
                    {text}
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
      <input type="hidden" name={name} value={value || ""} />
    </div>
  );
}

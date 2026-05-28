import { useEffect } from "react";

/**
 * Locks body scroll and adds Escape key dismissal when a modal/overlay is open.
 *
 * @param {boolean} isOpen  - Whether the modal is currently open.
 * @param {function} onClose - Callback to close the modal (called on Escape).
 */
export function useModalLock(isOpen, onClose) {
  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Escape key dismiss
  useEffect(() => {
    if (!isOpen || !onClose) return;
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);
}

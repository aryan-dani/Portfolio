import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { keyboardRoutes } from "../config/routes";

export { keyboardRoutes };
function isTypingTarget(target) {
  if (!target) return false;
  return (
    target.closest?.("input, textarea, select, [contenteditable='true']") ||
    target.getAttribute?.("role") === "textbox"
  );
}

export function useKeyboardNav({ onShowShortcuts }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isTypingTarget(event.target)) return;

      if (event.key === "?" && !event.altKey && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        onShowShortcuts?.();
        return;
      }

      if (!event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        const currentIndex = Math.max(0, keyboardRoutes.findIndex((item) => item.path === location.pathname));
        const delta = event.key === "ArrowRight" ? 1 : -1;
        const nextIndex = (currentIndex + delta + keyboardRoutes.length) % keyboardRoutes.length;
        navigate(keyboardRoutes[nextIndex].path);
        return;
      }

      const route = keyboardRoutes.find((item) => item.key === event.key);
      if (!route) return;

      event.preventDefault();
      navigate(route.path);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [location.pathname, navigate, onShowShortcuts]);
}

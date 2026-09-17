import { useEffect } from "react";
import { projects } from "../data/projects";
import { getAssetPath } from "../utils/paths";

const ABOUT_FIRST = "Images/About/pic_1.jpg";
const PREFETCH_COUNT = 6;

function shouldPrefetch() {
  if (typeof navigator === "undefined") return false;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection?.saveData) return false;
  if (connection?.effectiveType && ["slow-2g", "2g"].includes(connection.effectiveType)) {
    return false;
  }
  return true;
}

/**
 * Warm project + about image cache while the user is on Home,
 * so Projects/About feel faster on first navigation.
 * Deferred to idle so it does not compete with first paint.
 */
export function usePrefetchPortfolioImages({ enabled = true } = {}) {
  useEffect(() => {
    if (!enabled || !shouldPrefetch()) return undefined;

    const urls = [
      ...projects.slice(0, PREFETCH_COUNT).map((project) => getAssetPath(project.image)),
      getAssetPath(ABOUT_FIRST),
    ];

    let cancelled = false;
    let idleId = 0;
    let timeoutId = 0;
    const loaders = [];

    const run = () => {
      if (cancelled) return;
      urls.forEach((url) => {
        const img = new Image();
        img.decoding = "async";
        img.src = url;
        loaders.push(img);
      });
    };

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(run, { timeout: 2500 });
    } else {
      timeoutId = window.setTimeout(run, 1200);
    }

    return () => {
      cancelled = true;
      if (idleId && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) window.clearTimeout(timeoutId);
      loaders.forEach((img) => {
        img.onload = null;
        img.onerror = null;
        img.src = "";
      });
    };
  }, [enabled]);
}

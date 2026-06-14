let activeScrollFrame = null;

/** Strong ease-out — fast start, long gentle deceleration into the destination */
const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function cancelActiveScroll() {
  if (activeScrollFrame !== null) {
    cancelAnimationFrame(activeScrollFrame);
    activeScrollFrame = null;
  }
}

function getScrollY() {
  return window.scrollY || document.documentElement.scrollTop || 0;
}

function setScrollY(y) {
  const top = Math.max(0, y);
  window.scrollTo({ top, left: 0, behavior: "instant" });
}

/**
 * Smoothly scroll the window to `top`.
 * Duration scales with distance so short hops feel quick and long pages glide up slowly.
 */
export function smoothScrollTo(top = 0) {
  cancelActiveScroll();

  if (prefersReducedMotion()) {
    setScrollY(top);
    return Promise.resolve();
  }

  const startY = getScrollY();
  const distance = Math.abs(startY - top);

  if (distance < 1) {
    setScrollY(top);
    return Promise.resolve();
  }

  // ~1.4s minimum, up to ~3.2s on very long pages
  const duration = Math.min(3200, Math.max(1400, distance * 1.25));
  const startTime = performance.now();

  return new Promise((resolve) => {
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      const nextY = startY + (top - startY) * eased;

      setScrollY(nextY);

      if (progress < 1) {
        activeScrollFrame = requestAnimationFrame(step);
      } else {
        setScrollY(top);
        activeScrollFrame = null;
        resolve();
      }
    };

    activeScrollFrame = requestAnimationFrame(step);
  });
}

export function smoothScrollToTop() {
  return smoothScrollTo(0);
}

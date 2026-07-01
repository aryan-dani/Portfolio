function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Current scroll offset, accounting for Lenis virtual scroll. */
export function getPortfolioScrollY() {
  const lenisScroll = window.__portfolioLenis?.scroll;
  if (typeof lenisScroll === "number") return Math.max(0, lenisScroll);
  return Math.max(0, window.scrollY || document.documentElement.scrollTop || 0);
}

/** Subscribe to scroll updates without dispatching native scroll events (avoids Lenis loops). */
export function subscribePortfolioScroll(handler) {
  const lenis = window.__portfolioLenis;
  if (lenis) {
    lenis.on("scroll", handler);
    return () => lenis.off("scroll", handler);
  }

  window.addEventListener("scroll", handler, { passive: true });
  return () => window.removeEventListener("scroll", handler);
}

export function smoothScrollTo(top = 0) {
  return new Promise((resolve) => {
    if (window.__portfolioLenis) {
      window.__portfolioLenis.scrollTo(top, {
        duration: 0.68,
        onComplete: resolve,
      });
      return;
    }

    const startY = window.scrollY || document.documentElement.scrollTop || 0;
    const distance = top - startY;
    const duration = 520; // Faster native fallback for snappier feel
    let startTime = null;

    if (distance === 0) {
      resolve();
      return;
    }

    function step(currentTime) {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easedProgress = easeInOutCubic(progress);
      const nextY = startY + distance * easedProgress;

      window.scrollTo(0, nextY);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        window.scrollTo(0, top);
        resolve();
      }
    }

    requestAnimationFrame(step);
  });
}

export function smoothScrollToTop() {
  return smoothScrollTo(0);
}

export function scrollToTopImmediate() {
  if (window.__portfolioLenis) {
    window.__portfolioLenis.scrollTo(0, { immediate: true });
  }
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

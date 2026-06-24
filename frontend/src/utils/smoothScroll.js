function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function smoothScrollTo(top = 0) {
  return new Promise((resolve) => {
    const startY = window.scrollY || document.documentElement.scrollTop || 0;
    const distance = top - startY;
    const duration = 800; // Fixed 800ms for a consistent, smooth feel
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

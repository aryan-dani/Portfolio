/** Shared device / capability checks for mobile-first performance paths. */

export const MOBILE_LITE_QUERY = "(max-width: 768px), (pointer: coarse)";
export const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function isMobileLiteDevice() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia(MOBILE_LITE_QUERY).matches
    || window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
}

export function isFinePointerDevice() {
  if (typeof window === "undefined") return true;
  return window.matchMedia(FINE_POINTER_QUERY).matches;
}

export function shouldUseSmoothScroll() {
  if (typeof window === "undefined") return false;
  return !isMobileLiteDevice();
}

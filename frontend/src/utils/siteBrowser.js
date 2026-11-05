import { projects } from "../data/projects.js";

export const OPEN_SITE_EVENT = "portfolio:open-site";

const previewHosts = new Set(
  projects
    .map((project) => project.links?.preview)
    .filter(Boolean)
    .map((url) => {
      try {
        return new URL(url).hostname.toLowerCase();
      } catch {
        return null;
      }
    })
    .filter(Boolean),
);

export function isProjectPreviewUrl(url) {
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.protocol === "https:" && previewHosts.has(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export function openSiteBrowser({ url, title = "" }) {
  if (!url || typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(OPEN_SITE_EVENT, { detail: { url, title } }),
  );
}

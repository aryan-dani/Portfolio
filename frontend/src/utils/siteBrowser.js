import { projects } from "../data/projects.js";

export const OPEN_SITE_EVENT = "portfolio:open-site";

const previewHosts = new Set(
  projects
    .map((project) => project.links?.preview)
    .filter(Boolean)
    .flatMap((url) => {
      try {
        const host = new URL(url).hostname.toLowerCase();
        return [host, host.replace(/^www\./, "")];
      } catch {
        return [];
      }
    })
    .filter(Boolean),
);

export function isProjectPreviewUrl(url) {
  try {
    const parsed = new URL(url, window.location.origin);
    const host = parsed.hostname.toLowerCase();
    return (
      (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      (previewHosts.has(host) || previewHosts.has(host.replace(/^www\./, "")))
    );
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

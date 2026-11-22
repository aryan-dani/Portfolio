const KEY = "portfolio_brief_prefill";

export function saveBriefPrefill(data) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function consumeBriefPrefill() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    window.sessionStorage.removeItem(KEY);
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    try {
      window.sessionStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    return null;
  }
}

export { KEY as BRIEF_PREFILL_KEY };

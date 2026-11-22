/**
 * Hire-funnel events for Vercel Analytics / Speed Insights.
 * Safe no-ops when analytics is unavailable.
 */
const EVENTS = {
  ACTION_CLICK: "action_click",
  BRIEF_STARTED: "brief_started",
  BRIEF_SENT: "brief_sent",
  INQUIRY_SUBMITTED: "inquiry_submitted",
};

export function trackFunnel(event, props = {}) {
  if (typeof window === "undefined") return;
  try {
    // Vercel Analytics custom events
    if (typeof window.va === "function") {
      window.va("event", { name: event, data: props });
    }
    // Also dispatch for local audit / debugging
    window.dispatchEvent(
      new CustomEvent("portfolio-funnel", { detail: { event, props, at: Date.now() } }),
    );
  } catch {
    // ignore
  }
}

export function trackActionClick(label, destination) {
  trackFunnel(EVENTS.ACTION_CLICK, { label, destination });
}

export function trackBriefStarted(chip) {
  trackFunnel(EVENTS.BRIEF_STARTED, { chip });
}

export function trackBriefSent(fields) {
  trackFunnel(EVENTS.BRIEF_SENT, { fields: String(fields) });
}

export function trackInquirySubmitted(source) {
  trackFunnel(EVENTS.INQUIRY_SUBMITTED, { source });
}

export { EVENTS as FUNNEL_EVENTS };

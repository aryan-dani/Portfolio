import { playgroundRouteMap } from "../config/routes";
import { aboutInfo } from "../data/experience";
import { smoothScrollTo, smoothScrollToTop } from "./smoothScroll";

const PALETTE_EVENT = "portfolio:open-palette";
const REPLAY_SWARM_EVENT = "portfolio:replay-swarm";

async function copyEmailToClipboard() {
  const email = aboutInfo?.email;
  if (!email || !navigator?.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(email);
    return true;
  } catch {
    return false;
  }
}

/** Only http(s) and mailto links may be opened from a chat action. */
function isSafeExternalUrl(url) {
  return typeof url === "string" && /^(https?:\/\/|mailto:)/i.test(url);
}

/**
 * Run Kuro site actions. Handlers come from the widget: navigate, toggleTheme, setTheme,
 * setSound, setCrtMode, setAccent, petKuro, track, onAction.
 * @returns {object[]} the actions that were executed
 */
export function executeKuroActions(actions, handlers) {
  if (!Array.isArray(actions) || !actions.length) return [];

  const { navigate, toggleTheme, setTheme, setSound, setCrtMode, setAccent, petKuro, track, onAction } = handlers;

  const executed = [];

  for (const action of actions) {
    switch (action.type) {
      case "navigate": {
        const path = action.path || playgroundRouteMap[action.page];
        if (path && navigate) navigate(path);
        executed.push(action);
        break;
      }
      case "toggle_theme":
        toggleTheme?.();
        executed.push(action);
        break;
      case "set_theme":
        if (action.theme === "dark" || action.theme === "light") setTheme?.(action.theme);
        executed.push(action);
        break;
      case "set_sound":
        setSound?.(typeof action.enabled === "boolean" ? action.enabled : undefined);
        executed.push(action);
        break;
      case "set_hack_mode":
        if (action.enabled) {
          track?.("hack");
          setCrtMode?.(true);
        } else {
          setCrtMode?.(false);
        }
        executed.push(action);
        break;
      case "scroll_to_top":
        smoothScrollToTop();
        executed.push(action);
        break;
      case "scroll_to_bottom":
        smoothScrollTo(Math.max(0, document.documentElement.scrollHeight - window.innerHeight));
        executed.push(action);
        break;
      case "set_accent":
        if (action.palette) setAccent?.(action.palette);
        executed.push(action);
        break;
      case "open_palette":
        window.dispatchEvent(new CustomEvent(PALETTE_EVENT));
        executed.push(action);
        break;
      case "copy_email":
        void copyEmailToClipboard();
        executed.push(action);
        break;
      case "open_resume": {
        const version = action?.version || "classic";
        const match = aboutInfo?.resumes?.find((r) => r.id === version);
        const url =
          match?.url ||
          (version === "latex"
            ? aboutInfo?.resumeLatexUrl || "/resume-latex.pdf"
            : aboutInfo?.resumeUrl || "/resume.pdf");
        window.open(url, "_blank", "noopener,noreferrer");
        executed.push(action);
        break;
      }
      case "open_url":
        if (isSafeExternalUrl(action.url)) window.open(action.url, "_blank", "noopener,noreferrer");
        executed.push(action);
        break;
      case "replay_swarm":
        window.dispatchEvent(new CustomEvent(REPLAY_SWARM_EVENT));
        executed.push(action);
        break;
      case "pet_kuro":
        petKuro?.();
        // Cosmetic only: not worth an "action" caption in the transcript.
        break;
      default:
        break;
    }
  }

  onAction?.(executed);
  return executed;
}

const DESCRIPTIONS = {
  navigate: (a) => `-> Opened ${a.label || a.page}`,
  toggle_theme: () => "-> Toggled theme",
  set_theme: (a) => `-> ${a.theme === "dark" ? "Dark" : "Light"} mode`,
  set_sound: (a) => (a.enabled === true ? "-> Sound on" : a.enabled === false ? "-> Sound off" : "-> Toggled sound"),
  set_hack_mode: (a) => (a.enabled ? "-> Hack mode on" : "-> Hack mode off"),
  scroll_to_top: () => "-> Scrolled to top",
  scroll_to_bottom: () => "-> Scrolled to bottom",
  set_accent: (a) => `-> Accent: ${a.palette}`,
  open_palette: () => "-> Opened command palette",
  copy_email: () => "-> Copied email",
  open_resume: (a) => (a.version === "latex" ? "-> Opened LaTeX resume" : "-> Opened classic resume"),
  open_url: (a) => `-> Opened ${a.label || "link"}`,
  replay_swarm: () => "-> Replayed cursor swarm",
};

export function describeKuroActions(actions) {
  if (!Array.isArray(actions) || !actions.length) return "";
  return actions
    .filter((a) => a.type !== "pet_kuro")
    .map((a) => (DESCRIPTIONS[a.type] || (() => "-> Done"))(a))
    .join(" ");
}

export { PALETTE_EVENT, REPLAY_SWARM_EVENT };

/**
 * Kuro's deterministic engine (public entry). The router lives in ./kuro/*.
 * Imported by ChatWidget (client) and api/kuroChat.js (server), so keep it free of React/DOM.
 */
export {
  routeKuro,
  scoreIntents,
  buildKuroContext,
  KURO_THRESHOLDS,
  KURO_AI_CHIP_LABEL,
} from "./kuro/router.js";

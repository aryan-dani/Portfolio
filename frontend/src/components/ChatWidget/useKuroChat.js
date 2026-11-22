import { useCallback, useEffect, useRef, useState } from "react";
import { askKuro, kuroVoiceError } from "../../utils/askKuro";
import { getKuroWelcomeLine } from "../../data/kuroRouteLines";

export const CHAT_STORAGE_KEY = "portfolio_kuro_chat";
const MAX_STORED = 24;
const THINKING_LINES = [
  "*sniffing the question*",
  "*tail wag while processing*",
  "*ears perk up*",
  "*consulting the portfolio*",
];

// The rule engine pulls in most of src/data, so it loads on first use instead of with the widget.
let routerPromise = null;
const loadRouter = () => {
  routerPromise ||= import("../../utils/kuroRules");
  return routerPromise;
};
export function preloadKuroRouter() {
  void loadRouter();
}

let idCounter = 0;
const nextId = () => `m${Date.now().toString(36)}${(idCounter++).toString(36)}`;

function loadChatHistory() {
  try {
    const raw = sessionStorage.getItem(CHAT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed.map((m) => ({ ...m, id: m.id || nextId(), stream: false }));
      }
    }
  } catch {
    /* ignore */
  }
  return [{ id: nextId(), role: "assistant", text: getKuroWelcomeLine() }];
}

function saveChatHistory(messages) {
  try {
    const slim = messages.slice(-MAX_STORED).map((m) => {
      const copy = { ...m };
      delete copy.stream;
      return copy;
    });
    sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(slim));
  } catch {
    /* ignore */
  }
}

const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

/** Human-feeling pause before a rule reply: ~220-420ms, scaled by reply length. */
function replyDelay(text) {
  return Math.round(Math.min(420, Math.max(220, 190 + text.length * 0.8)));
}

/**
 * Chat state + send flow. Rules answer first (no network); only unmatched questions, or the
 * "Ask the AI" chip, go to /api/chat.
 */
export function useKuroChat({ pathname, motionPolicy, getSiteState, runActions }) {
  const [messages, setMessages] = useState(loadChatHistory);
  const [pending, setPending] = useState(null); // null | "rule" | "llm"
  const [thinkingLine, setThinkingLine] = useState(THINKING_LINES[0]);
  const messagesRef = useRef(messages);
  const busyRef = useRef(false);
  const mountedRef = useRef(true);
  const policyRef = useRef(motionPolicy);
  const hadStoredChat = useRef(sessionStorage.getItem(CHAT_STORAGE_KEY) != null);

  messagesRef.current = messages;
  policyRef.current = motionPolicy;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    saveChatHistory(messages);
  }, [messages]);

  const append = useCallback((message) => {
    if (!mountedRef.current) return;
    setMessages((list) => [...list, { id: nextId(), ...message }]);
  }, []);

  const markStreamDone = useCallback((id) => {
    setMessages((list) => list.map((m) => (m.id === id && m.stream ? { ...m, stream: false } : m)));
  }, []);

  const send = useCallback(
    async (text, { forceLlm = false, echo = true } = {}) => {
      const clean = String(text ?? "").trim();
      if (!clean || busyRef.current) return false;
      busyRef.current = true;

      let history = messagesRef.current;
      if (echo) {
        append({ role: "user", text: clean });
      } else {
        // "Ask the AI" retry: hide the rule reply and the original question from the model history.
        const lastAssistant = history.map((m) => m.role).lastIndexOf("assistant");
        const trimmed = history.filter((_, i) => i !== lastAssistant);
        const lastUser = trimmed.map((m) => m.role).lastIndexOf("user");
        history = trimmed.filter((_, i) => i !== lastUser);
      }

      setPending("rule");
      const siteState = getSiteState();

      try {
        let local = null;
        if (!forceLlm) {
          const { routeKuro } = await loadRouter();
          local = routeKuro(clean, { history, currentPath: pathname, siteState });
        }

        if (local) {
          if (policyRef.current !== "reduced") await sleep(replyDelay(local.reply));
          const actionLabel = local.actions.length ? runActions(local.actions) : "";
          append({
            role: "assistant",
            text: local.reply,
            cards: local.cards,
            chips: local.chips,
            intent: local.intent,
            meta: local.meta,
            actionLabel: actionLabel || undefined,
          });
          return true;
        }

        setThinkingLine(THINKING_LINES[Math.floor(Math.random() * THINKING_LINES.length)]);
        setPending("llm");
        const result = await askKuro(clean, {
          history: history.slice(-12),
          currentPath: pathname,
          siteState,
          forceLlm,
        });
        const actionLabel = result.actions.length ? runActions(result.actions) : "";
        append({
          role: "assistant",
          text: result.reply,
          cards: result.cards,
          chips: result.chips,
          intent: result.intent,
          meta: result.meta,
          actionLabel: actionLabel || undefined,
          stream: result.source === "llm",
        });
        return true;
      } catch (error) {
        append({ role: "assistant", text: kuroVoiceError(error) });
        return false;
      } finally {
        busyRef.current = false;
        if (mountedRef.current) setPending(null);
      }
    },
    [append, getSiteState, pathname, runActions],
  );

  return {
    messages,
    pending,
    thinkingLine,
    send,
    markStreamDone,
    hasUserMessages: messages.some((m) => m.role === "user"),
    hadStoredChat: hadStoredChat.current,
  };
}

import { useCallback, useEffect, useRef } from "react";
import { MessageBubble, TypingIndicator, EmptyState } from "./ChatParts";
import { KuroFace } from "./KuroFace";

const STICK_THRESHOLD = 96;

/** Header, conversation log, quick replies, and composer. Rendered docked or fullscreen. */
export default function ChatPanel({
  messages,
  pending,
  thinkingLine,
  hasUserMessages,
  hadStoredChat,
  welcome,
  emptyChips,
  placeholder,
  policy,
  crtMode,
  mood,
  pinned,
  isFullscreen,
  input,
  inputFocused,
  inputRef,
  onInput,
  onSubmit,
  onInputFocus,
  onInputBlur,
  onTogglePin,
  onToggleFullscreen,
  onClose,
  onChip,
  onNavigate,
  onOpenUrl,
  onStreamDone,
  onResizeDown,
  onResizeMove,
  onResizeUp,
}) {
  const scrollRef = useRef(null);
  const contentRef = useRef(null);
  const stickRef = useRef(true);
  const initialMountRef = useRef(true);
  const recallRef = useRef(-1);
  const loading = pending !== null;
  const canSend = Boolean(input.trim()) && !loading;

  const scrollToEnd = useCallback(
    (smooth) => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollTo({ top: el.scrollHeight, behavior: smooth && policy !== "reduced" ? "smooth" : "auto" });
    },
    [policy],
  );

  // Stagger only the messages present at first paint, never new ones.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      initialMountRef.current = false;
    }, 700);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    const onScroll = () => {
      stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_THRESHOLD;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // New message or typing indicator: always follow. Streaming growth: follow while near the bottom.
  useEffect(() => {
    stickRef.current = true;
    scrollToEnd(true);
  }, [messages.length, pending, isFullscreen, scrollToEnd]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(() => {
      if (stickRef.current) scrollToEnd(false);
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, [scrollToEnd]);

  const userTexts = messages.filter((m) => m.role === "user").map((m) => m.text);
  const lastMessageId = messages[messages.length - 1]?.id;

  const handleKeyDown = (event) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter") {
      event.preventDefault();
      recallRef.current = -1;
      onSubmit();
      return;
    }
    if (event.key === "ArrowUp" && userTexts.length && (!input || recallRef.current >= 0)) {
      event.preventDefault();
      recallRef.current = Math.min(userTexts.length - 1, recallRef.current + 1);
      onInput(userTexts[userTexts.length - 1 - recallRef.current]);
      return;
    }
    if (event.key === "ArrowDown" && recallRef.current >= 0) {
      event.preventDefault();
      recallRef.current -= 1;
      onInput(recallRef.current >= 0 ? userTexts[userTexts.length - 1 - recallRef.current] : "");
    }
  };

  return (
    <>
      <div className="flex shrink-0 items-center gap-2 border-b-4 border-outline bg-primary-container px-3 py-2.5 text-on-primary-container sm:gap-3 sm:px-3.5 sm:py-3">
        <div className="relative shrink-0">
          <div className="border-2 border-on-primary-container bg-surface p-0.5">
            <KuroFace pupilsRef={null} mood={mood} bliss={false} sleeping={false} robot={crtMode} size={36} />
          </div>
          <span
            className={`absolute -right-1 -bottom-1 h-2.5 w-2.5 border-2 border-primary-container ${
              loading ? "animate-pulse bg-surface-variant" : "bg-[#7dcea0]"
            }`}
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h2 className="font-label-bold text-sm uppercase tracking-[0.14em]">Kuro</h2>
            <span className="font-mono text-[9px] uppercase opacity-65" aria-live="off">
              {loading ? "typing" : pinned ? "pinned" : "online"}
            </span>
          </div>
          <p className="truncate font-mono text-[9px] uppercase tracking-[0.12em] opacity-70">copilot</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onTogglePin}
            className={`h-8 min-w-8 border-2 border-on-primary-container px-1.5 font-mono text-[10px] uppercase transition-transform hover:translate-x-px hover:translate-y-px ${
              pinned ? "bg-on-primary-container text-primary-container" : "bg-surface text-on-surface"
            }`}
            aria-pressed={pinned}
            aria-label={pinned ? "Unpin chat" : "Pin chat"}
            title={pinned ? "Unpin" : "Pin"}
          >
            Pin
          </button>
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="h-8 min-w-8 border-2 border-on-primary-container bg-surface px-1.5 font-mono text-[10px] uppercase text-on-surface transition-transform hover:translate-x-px hover:translate-y-px"
            aria-pressed={isFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen chat"}
            title={isFullscreen ? "Collapse" : "Fullscreen"}
          >
            {isFullscreen ? "↙" : "⛶"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 border-2 border-on-primary-container bg-surface font-label-bold text-xs text-on-surface transition-transform hover:translate-x-px hover:translate-y-px"
            aria-label="Close chat (Esc)"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto bg-surface px-3.5 py-3.5 text-sm focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-on-surface"
        data-lenis-prevent
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        aria-label="Conversation with Kuro"
        tabIndex={0}
      >
        <div ref={contentRef} className="space-y-3.5">
          {!hasUserMessages ? (
            <EmptyState welcome={welcome} chips={emptyChips} policy={policy} crtMode={crtMode} onChip={onChip} />
          ) : (
            <>
              {hadStoredChat && messages.length > 1 && (
                <p className="text-center font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted">
                  Kuro remembers this visit
                </p>
              )}
              {messages.map((message, i) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  index={i}
                  isLast={message.id === lastMessageId && !loading}
                  initialMount={initialMountRef.current}
                  policy={policy}
                  onNavigate={onNavigate}
                  onOpenUrl={onOpenUrl}
                  onChip={onChip}
                  onStreamDone={onStreamDone}
                />
              ))}
              {loading && <TypingIndicator policy={policy} label={pending === "llm" ? thinkingLine : ""} />}
            </>
          )}
        </div>
      </div>

      <form
        className="shrink-0 border-t-4 border-outline bg-surface-variant p-2.5"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div
          className={`flex gap-2 border-2 border-outline bg-surface p-1.5 transition-shadow ${
            inputFocused ? "shadow-[4px_4px_0_var(--shadow-color)]" : "shadow-[3px_3px_0_var(--shadow-color)]"
          }`}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => {
              recallRef.current = -1;
              onInput(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            placeholder={placeholder}
            maxLength={500}
            enterKeyHint="send"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent px-2 py-2 font-body-md text-sm text-on-surface outline-none placeholder:text-text-muted"
            aria-label="Message Kuro"
          />
          <button
            type="submit"
            disabled={!canSend}
            className={`shrink-0 border-2 border-outline px-3.5 py-2 font-label-bold text-xs uppercase tracking-wide transition-[background-color,color,transform,box-shadow] ${
              canSend
                ? "bg-primary-container text-on-primary-container shadow-[2px_2px_0_var(--shadow-color)] hover:translate-x-px hover:translate-y-px hover:shadow-none"
                : "cursor-not-allowed bg-surface text-text-muted"
            }`}
          >
            Send
          </button>
        </div>
      </form>

      {!isFullscreen && (
        <button
          type="button"
          aria-label="Resize chat"
          onPointerDown={onResizeDown}
          onPointerMove={onResizeMove}
          onPointerUp={onResizeUp}
          onPointerCancel={onResizeUp}
          className="absolute bottom-0 right-0 z-30 h-5 w-5 cursor-se-resize border-0 bg-transparent p-0"
          style={{ touchAction: "none" }}
        >
          <span
            className="absolute bottom-1 right-1 h-2.5 w-2.5 border-r-2 border-b-2 border-outline opacity-70"
            aria-hidden="true"
          />
        </button>
      )}
    </>
  );
}

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaArrowRight, FaExternalLinkAlt, FaRedo, FaTimes } from "react-icons/fa";
import { useModalLock } from "../../hooks/useModalLock";
import { OPEN_SITE_EVENT } from "../../utils/siteBrowser";

function displayUrl(url) {
  try {
    const parsed = new URL(url);
    const path = `${parsed.pathname}${parsed.search}`;
    return `${parsed.hostname}${path === "/" ? "" : path}`;
  } catch {
    return url;
  }
}

export default function SiteBrowser() {
  const [session, setSession] = useState(null);

  const close = useCallback(() => setSession(null), []);
  useModalLock(Boolean(session), close);

  useEffect(() => {
    const onOpen = (event) => {
      const url = event.detail?.url;
      if (!url) return;
      setSession({
        url,
        title: event.detail?.title || "",
        status: "checking",
        frameKey: 0,
      });
    };
    window.addEventListener(OPEN_SITE_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_SITE_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!session || session.status !== "checking") return undefined;
    const token = session.frameKey;
    const url = session.url;
    let cancelled = false;

    (async () => {
      let embeddable = true;
      try {
        const response = await fetch(`/api/frame-check?url=${encodeURIComponent(url)}`);
        if (response.ok) {
          const data = await response.json();
          embeddable = data.embeddable !== false;
        }
      } catch {
        embeddable = true;
      }
      if (cancelled) return;
      setSession((current) => {
        if (!current || current.url !== url || current.frameKey !== token) return current;
        return { ...current, status: embeddable ? "loading" : "blocked" };
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [session]);

  const reload = () => {
    setSession((current) =>
      current
        ? { ...current, status: "checking", frameKey: current.frameKey + 1 }
        : current,
    );
  };

  const browse = (delta) => {
    const frame = document.getElementById("portfolio-site-frame");
    try {
      frame?.contentWindow?.history.go(delta);
    } catch {
      /* cross-origin history may refuse */
    }
  };

  if (!session) return null;

  const showFrame = session.status === "loading" || session.status === "ready";

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-stretch justify-center p-2 sm:p-4 md:p-6">
      <motion.button
        type="button"
        aria-label="Close site browser"
        className="absolute inset-0 cursor-none border-0 bg-black/55"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={close}
      />
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-label={session.title ? `${session.title} preview` : "Site preview"}
        className="relative z-10 flex h-full w-full max-w-6xl flex-col border-4 border-outline bg-[var(--color-surface)] shadow-[12px_12px_0_0_var(--shadow-color)]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-2 border-b-4 border-outline bg-[var(--color-surface-variant)] px-2 py-2 sm:px-3">
          <button
            type="button"
            onClick={close}
            className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-outline bg-[var(--color-surface)] text-[var(--color-on-surface)] shadow-[2px_2px_0_0_var(--shadow-color)] cursor-none"
            aria-label="Close preview"
          >
            <FaTimes />
          </button>
          <button
            type="button"
            onClick={() => browse(-1)}
            className="hidden h-9 w-9 shrink-0 items-center justify-center border-2 border-outline bg-[var(--color-surface)] cursor-none sm:flex"
            aria-label="Back"
          >
            <FaArrowLeft />
          </button>
          <button
            type="button"
            onClick={() => browse(1)}
            className="hidden h-9 w-9 shrink-0 items-center justify-center border-2 border-outline bg-[var(--color-surface)] cursor-none sm:flex"
            aria-label="Forward"
          >
            <FaArrowRight />
          </button>
          <button
            type="button"
            onClick={reload}
            className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-outline bg-[var(--color-surface)] cursor-none"
            aria-label="Reload"
          >
            <FaRedo />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2 border-2 border-outline bg-[var(--color-surface)] px-3 py-1.5">
            {session.title ? (
              <span className="hidden shrink-0 font-label-bold text-[10px] uppercase tracking-[0.14em] text-[var(--color-on-surface)] sm:inline">
                {session.title}
              </span>
            ) : null}
            <span className="truncate font-mono text-xs text-[var(--color-on-surface)]">
              {displayUrl(session.url)}
            </span>
          </div>
          <a
            href={session.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 shrink-0 items-center gap-2 border-2 border-outline bg-[var(--color-primary-container)] px-2.5 font-label-bold text-[10px] uppercase tracking-wide text-[var(--color-on-primary-container)] shadow-[2px_2px_0_0_var(--shadow-color)] cursor-none"
          >
            <FaExternalLinkAlt aria-hidden="true" />
            <span className="hidden sm:inline">Open out</span>
          </a>
        </div>

        <div className="relative min-h-0 flex-1 bg-[var(--color-background)]">
          {session.status === "checking" || session.status === "loading" ? (
            <div className="absolute inset-x-0 top-0 z-10 h-1 overflow-hidden bg-[var(--color-surface-variant)]">
              <div className="h-full w-1/3 animate-[site-browser-scan_1s_ease-in-out_infinite] bg-[var(--color-primary-container)]" />
            </div>
          ) : null}

          {session.status === "blocked" ? (
            <div className="flex h-full flex-col items-start justify-center gap-4 p-6 sm:p-10">
              <p className="font-headline-md text-2xl uppercase text-[var(--color-on-surface)] sm:text-4xl">
                This site won&apos;t load in here
              </p>
              <p className="max-w-xl font-body-md text-base text-[var(--color-on-surface)]">
                {session.title || "This demo"} blocks embedding, so the portfolio browser can&apos;t show it. Open it in its own tab instead.
              </p>
              <a
                href={session.url}
                target="_blank"
                rel="noopener noreferrer"
                className="border-4 border-outline bg-[var(--color-primary-container)] px-5 py-3 font-label-bold uppercase text-[var(--color-on-primary-container)] shadow-[4px_4px_0_0_var(--shadow-color)] cursor-none"
              >
                Open in a new tab
              </a>
            </div>
          ) : null}

          {showFrame ? (
            <iframe
              id="portfolio-site-frame"
              key={session.frameKey}
              title={session.title ? `${session.title} live site` : "Project live site"}
              src={session.url}
              className={`h-full w-full border-0 bg-white ${session.status === "ready" ? "opacity-100" : "opacity-0"}`}
              referrerPolicy="origin"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals"
              onLoad={() => {
                setSession((current) =>
                  current && current.status === "loading" ? { ...current, status: "ready" } : current,
                );
              }}
            />
          ) : null}
        </div>
      </motion.section>
      <style>{`
        @keyframes site-browser-scan {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(360%); }
        }
      `}</style>
    </div>,
    document.body,
  );
}

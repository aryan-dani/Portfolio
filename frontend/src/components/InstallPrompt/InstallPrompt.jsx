import { memo, useEffect, useState } from "react";
import { useSiteIdleState } from "../../context/SiteIdleContext";
import { readStorage, writeStorage } from "../../utils/storage";

const InstallPrompt = memo(function InstallPrompt() {
  const { hideChrome } = useSiteIdleState();
  const [deferred, setDeferred] = useState(null);
  const [dismissed, setDismissed] = useState(
    () => readStorage("portfolio_pwa_dismissed") === "true",
  );

  useEffect(() => {
    const onBeforeInstall = (e) => {
      if (dismissed) return;
      if (window.matchMedia("(display-mode: standalone)").matches) return;
      if (!window.matchMedia("(min-width: 768px)").matches) return;
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, [dismissed]);

  if (!deferred || dismissed || hideChrome) return null;

  return (
    <div className="fixed bottom-28 left-4 z-[70] max-w-xs border-4 border-outline bg-surface p-4 shadow-[8px_8px_0_var(--shadow-color)] hidden md:block">
      <p className="font-label-bold uppercase text-xs tracking-widest">Install This Site</p>
      <p className="font-body-md text-sm mt-2 text-on-surface">
        Add the portfolio to your home screen for offline shell access.
      </p>
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          className="border-2 border-outline px-3 py-2 font-label-bold uppercase text-[10px] bg-primary-container text-on-primary-container"
          onClick={async () => {
            await deferred.prompt();
            setDeferred(null);
          }}
        >
          Install
        </button>
        <button
          type="button"
          className="border-2 border-outline px-3 py-2 font-label-bold uppercase text-[10px]"
          onClick={() => {
            writeStorage("portfolio_pwa_dismissed", "true");
            setDismissed(true);
          }}
        >
          Later
        </button>
      </div>
    </div>
  );
});

export default InstallPrompt;

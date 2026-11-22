import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource-variable/space-grotesk/wght.css";
import "@fontsource-variable/inter/wght.css";
import "@fontsource-variable/source-serif-4/wght.css";
import App from "./App.jsx";
import "./index.css";

document.documentElement.classList.add("js");
/** Remove the Phase 7 crawlable content snapshot so the live app owns the only h1/main. */
function removeSeoPrerender() {
  document.getElementById("prerender-content")?.remove();
  document.getElementById("seo-prerender")?.remove();
  document.querySelectorAll("[data-prerender='true']").forEach((node) => node.remove());
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

removeSeoPrerender();

// Register immediately so returning visitors can detect a deployment without
// waiting for an idle callback or a hard refresh.
if (typeof window !== "undefined") {
  const register = () => {
    import("virtual:pwa-register")
      .then(({ registerSW }) => {
        let registration;

        const checkForUpdate = () => {
          if (document.visibilityState !== "visible" || !registration) return;
          registration.update().catch((error) => {
            console.warn("Service worker update check failed:", error);
          });
        };

        const onRegisteredSW = (_swUrl, currentRegistration) => {
          registration = currentRegistration;
          if (!registration) return;

          checkForUpdate();
          window.setInterval(checkForUpdate, 5 * 60 * 1000);
          window.addEventListener("focus", checkForUpdate);
          document.addEventListener("visibilitychange", checkForUpdate);
        };

        registerSW({
          immediate: true,
          onRegisteredSW,
        });
      })
      .catch((error) => {
        console.warn("Service worker registration failed:", error);
      });
  };
  register();
}

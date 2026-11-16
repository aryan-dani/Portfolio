import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

document.documentElement.classList.add("js");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

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

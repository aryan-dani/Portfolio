import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Register the service worker after first paint so it does not contend with FCP.
if (typeof window !== "undefined") {
  const register = () => {
    import("virtual:pwa-register")
      .then(({ registerSW }) => registerSW({ immediate: true }))
      .catch(() => {});
  };
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(register, { timeout: 4000 });
  } else {
    window.setTimeout(register, 2000);
  }
}

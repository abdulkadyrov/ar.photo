import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

if (sessionStorage.redirect) {
  const redirected = new URL(sessionStorage.redirect);
  sessionStorage.removeItem("redirect");
  history.replaceState(null, "", redirected.pathname + redirected.search + redirected.hash);
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

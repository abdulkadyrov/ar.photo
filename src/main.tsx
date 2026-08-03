import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { installGlobalErrorReporting } from "./shared/observability/errorReporter";
import "./styles.css";

installGlobalErrorReporting();

if (sessionStorage.redirect) {
  const redirected = new URL(sessionStorage.redirect);
  sessionStorage.removeItem("redirect");
  history.replaceState(null, "", redirected.pathname + redirected.search + redirected.hash);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

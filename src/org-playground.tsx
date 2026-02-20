import "@babel/runtime/regenerator";
import React from "react";
import ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";
import Root from "./root.component";
import { initMfeErrorReporter } from "./mfe-error-reporter";

const reporter = initMfeErrorReporter("@org/playground-react");

const isTrustedOrigin = (origin: string) =>
  origin === window.location.origin ||
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

const applyToggleMessage = () => {
  window.addEventListener("message", (event) => {
    if (!isTrustedOrigin(event.origin)) return;
    const data = event.data;
    if (!data || data.type !== "mfe-toggle" || !Array.isArray(data.disabled)) {
      return;
    }
    try {
      window.localStorage.setItem("mfe-disabled", JSON.stringify(data.disabled));
    } catch {
      return;
    }
    if (!window.location.search.includes("mfe-bridge=1")) {
      window.location.reload();
    }
  });
};

applyToggleMessage();
window.addEventListener("storage", (event) => {
  if (event.key === "mfe-disabled") {
    window.location.reload();
  }
});

const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: Root,
  errorBoundary(err, info, props) {
    // Customize the root error boundary for your microfrontend here.
    const detail = [err?.stack || String(err), info?.componentStack]
      .filter(Boolean)
      .join("\n");
    reporter.report("error", "React render error", detail);
    return null;
  },
});

export const { bootstrap, mount, unmount } = lifecycles;

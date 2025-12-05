/**
 * Demo2 entry point
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Demo2 } from "./pages/Demo2";

const elem = document.getElementById("root")!;
const app = (
  <StrictMode>
    <Demo2 />
  </StrictMode>
);

if (import.meta.hot) {
  const root = (import.meta.hot.data.root ??= createRoot(elem));
  root.render(app);
} else {
  createRoot(elem).render(app);
}


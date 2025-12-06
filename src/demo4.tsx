/**
 * Demo4 entry point
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Demo4 } from "./pages/Demo4";

const elem = document.getElementById("root")!;
const app = (
  <StrictMode>
    <Demo4 />
  </StrictMode>
);

if (import.meta.hot) {
  const root = (import.meta.hot.data.root ??= createRoot(elem));
  root.render(app);
} else {
  createRoot(elem).render(app);
}


/**
 * Demo1 entry point
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Demo1 } from "./pages/Demo1";

const elem = document.getElementById("root")!;
const app = (
  <StrictMode>
    <Demo1 />
  </StrictMode>
);

if (import.meta.hot) {
  const root = (import.meta.hot.data.root ??= createRoot(elem));
  root.render(app);
} else {
  createRoot(elem).render(app);
}


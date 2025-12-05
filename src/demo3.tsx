/**
 * Demo3 entry point
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Demo3 } from "./pages/Demo3";

const elem = document.getElementById("root")!;
const app = (
  <StrictMode>
    <Demo3 />
  </StrictMode>
);

if (import.meta.hot) {
  const root = (import.meta.hot.data.root ??= createRoot(elem));
  root.render(app);
} else {
  createRoot(elem).render(app);
}


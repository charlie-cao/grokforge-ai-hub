import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Demo6 } from "./pages/Demo6";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Demo6 />
  </StrictMode>
);


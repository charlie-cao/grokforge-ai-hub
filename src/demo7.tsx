import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Demo7 } from "./pages/Demo7";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <Demo7 />
  </StrictMode>
);


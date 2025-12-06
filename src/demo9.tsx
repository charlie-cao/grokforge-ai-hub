import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Demo9 } from "./pages/Demo9";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <Demo9 />
  </StrictMode>
);


/**
 * Test utilities for React Testing Library
 */
import { render, type RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";

/**
 * Custom render function that includes any providers
 * This can be extended to include theme providers, router, etc.
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, {
    ...options,
  });
}

// Re-export everything from @testing-library/react
export * from "@testing-library/react";

// Override render method
export { customRender as render };


/**
 * Tests for BackToHome component
 */

import { describe, it, expect, beforeEach } from "bun:test";
import { render } from "../test/test-utils";
import userEvent from "@testing-library/user-event";
import { BackToHome } from "./BackToHome";

// Mock window.location
const mockLocation = {
  href: "http://localhost:3000/demo1",
  origin: "http://localhost:3000",
  pathname: "/demo1",
};

describe("BackToHome", () => {
  beforeEach(() => {
    // Reset location mock before each test
    Object.defineProperty(window, "location", {
      value: { ...mockLocation },
      writable: true,
    });
  });

  it("should render button with text", () => {
    const { getByRole, getByText } = render(<BackToHome />);
    expect(getByRole("button")).toBeInTheDocument();
    expect(getByText(/返回首页|Back to Home/i)).toBeInTheDocument();
  });

  it("should navigate to home when clicked", async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<BackToHome />);
    
    const button = getByRole("button");
    await user.click(button);
    
    // Check that location.href was set to "/"
    expect(window.location.href).toBe("/");
  });

  it("should accept custom className", () => {
    const { container } = render(<BackToHome className="custom-class" />);
    const button = container.querySelector("button");
    expect(button).toHaveClass("custom-class");
  });

  it("should render Home icon", () => {
    const { getByRole } = render(<BackToHome />);
    // The icon should be present (as SVG)
    const button = getByRole("button");
    const svg = button.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});


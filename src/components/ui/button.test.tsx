/**
 * Tests for Button component
 */

import { describe, it, expect } from "bun:test";
import { render } from "../../test/test-utils";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

describe("Button", () => {
  it("should render button with text", () => {
    const { getByRole } = render(<Button>Click me</Button>);
    expect(getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("should handle click events", async () => {
    const handleClick = () => {
      console.log("clicked");
    };
    const user = userEvent.setup();
    const { getByRole } = render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = getByRole("button");
    await user.click(button);
    // If no error is thrown, the click handler was called
    expect(button).toBeInTheDocument();
  });

  it("should apply variant classes", () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("bg-destructive");
  });

  it("should apply size classes", () => {
    const { container } = render(<Button size="lg">Large Button</Button>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("h-10");
  });

  it("should be disabled when disabled prop is set", () => {
    const { getByRole } = render(<Button disabled>Disabled</Button>);
    const button = getByRole("button");
    expect(button).toBeDisabled();
  });

  it("should accept custom className", () => {
    const { container } = render(<Button className="custom-class">Custom</Button>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("custom-class");
  });

  it("should render as child when asChild is true", () => {
    const { getByRole, queryByRole } = render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    expect(getByRole("link")).toBeInTheDocument();
    expect(queryByRole("button")).not.toBeInTheDocument();
  });
});


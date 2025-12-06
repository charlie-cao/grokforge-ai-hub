/**
 * Tests for utility functions
 */

import { describe, it, expect } from "bun:test";
import { cn } from "./utils";

describe("cn (class name utility)", () => {
  it("should merge class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });

  it("should merge Tailwind classes and resolve conflicts", () => {
    // twMerge should resolve conflicting classes
    const result = cn("px-2", "px-4");
    expect(result).toBe("px-4"); // Last one wins
  });

  it("should handle empty inputs", () => {
    expect(cn()).toBe("");
    expect(cn("", null, undefined)).toBe("");
  });

  it("should handle arrays and objects", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
    expect(cn({ foo: true, bar: false })).toBe("foo");
  });
});


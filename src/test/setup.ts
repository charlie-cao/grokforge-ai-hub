/**
 * Test setup file for Bun test runner
 * Import this file at the top of each test file that needs DOM environment
 */

import { expect, afterEach } from "bun:test";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";

// Extend Bun's expect with jest-dom matchers
expect.extend(matchers);

// Setup DOM environment
import { Window } from "happy-dom";
const win = new Window();
const doc = win.document;

// Make DOM available globally - must be set before testing-library imports
(globalThis as any).window = win;
(globalThis as any).document = doc;
(globalThis as any).HTMLElement = win.HTMLElement;
(globalThis as any).Element = win.Element;
(globalThis as any).Node = win.Node;
(globalThis as any).Document = win.Document;
(globalThis as any).HTMLDocument = win.HTMLDocument;

// Mock localStorage
const localStorageMock = {
  getItem: (key: string) => {
    return store[key] || null;
  },
  setItem: (key: string, value: string) => {
    store[key] = value.toString();
  },
  removeItem: (key: string) => {
    delete store[key];
  },
  clear: () => {
    store = {};
  },
  key: (index: number) => {
    const keys = Object.keys(store);
    return keys[index] || null;
  },
  get length() {
    return Object.keys(store).length;
  },
};

let store: Record<string, string> = {};
if (typeof globalThis.localStorage === "undefined") {
  globalThis.localStorage = localStorageMock as any;
}

// Mock window.location
if (!win.location) {
  Object.defineProperty(win, "location", {
    value: {
      href: "http://localhost:3000/",
      origin: "http://localhost:3000",
      pathname: "/",
      search: "",
      hash: "",
    },
    writable: true,
    configurable: true,
  });
}

// Cleanup after each test
afterEach(() => {
  cleanup();
  if (globalThis.localStorage) {
    globalThis.localStorage.clear();
  }
});


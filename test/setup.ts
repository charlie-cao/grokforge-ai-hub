/**
 * Global test setup file for Bun test runner
 * This file is automatically loaded before all tests when using --preload
 */

import { expect, afterEach } from "bun:test";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";

// Extend Bun's expect with jest-dom matchers
expect.extend(matchers);

// Setup DOM environment
import { Window } from "happy-dom";
const win = new Window({
  url: "http://localhost:3000/",
  settings: {
    disableJavaScriptFileLoading: false,
    disableJavaScriptEvaluation: false,
    disableCSSFileLoading: false,
  },
});
const doc = win.document;

// Ensure document.body exists
if (!doc.body) {
  const body = doc.createElement("body");
  doc.appendChild(body);
}

// Make DOM available globally - must be set before testing-library imports
(globalThis as any).window = win;
(globalThis as any).document = doc;
(globalThis as any).HTMLElement = win.HTMLElement;
(globalThis as any).Element = win.Element;
(globalThis as any).Node = win.Node;
(globalThis as any).Document = win.Document;
(globalThis as any).HTMLDocument = win.HTMLDocument;

// Ensure document.body is accessible
if (!(globalThis as any).document.body) {
  (globalThis as any).document.body = doc.body;
}

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
(globalThis as any).localStorage = localStorageMock;

// Mock window.location
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

// Cleanup after each test
afterEach(() => {
  cleanup();
  if (globalThis.localStorage) {
    globalThis.localStorage.clear();
  }
});


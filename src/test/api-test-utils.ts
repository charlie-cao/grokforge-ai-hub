/**
 * API Testing Utilities
 * Helper functions for testing API endpoints
 */

import { describe, it, expect, beforeEach, afterEach } from "bun:test";

/**
 * Create a mock Request object for testing
 */
export function createMockRequest(
  url: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  } = {}
): Request {
  const { method = "GET", body, headers = {} } = options;
  
  const requestInit: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body) {
    requestInit.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  return new Request(url, requestInit);
}

/**
 * Parse JSON response and return data
 */
export async function parseJsonResponse(response: Response) {
  const data = await response.json();
  return { data, status: response.status, headers: response.headers };
}

/**
 * Assert response is successful (2xx)
 */
export function expectSuccess(response: Response, expectedStatus = 200) {
  expect(response.status).toBe(expectedStatus);
  expect(response.ok).toBe(true);
}

/**
 * Assert response is an error (4xx or 5xx)
 */
export function expectError(response: Response, expectedStatus?: number) {
  expect(response.ok).toBe(false);
  if (expectedStatus) {
    expect(response.status).toBe(expectedStatus);
  }
}


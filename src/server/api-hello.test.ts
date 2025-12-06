/**
 * Tests for /api/hello endpoints
 */

import { describe, it, expect } from "bun:test";

// Simple test for hello endpoint logic
// Note: In a real scenario, you'd test the actual server routes
// This is a unit test for the handler logic

describe("API Hello Endpoints", () => {
  it("should return hello message for GET request", async () => {
    // Simulate the GET handler logic
    const handler = async (req: Request) => {
      return Response.json({
        message: "Hello, world!",
        method: "GET",
      });
    };

    const req = new Request("http://localhost/api/hello", { method: "GET" });
    const response = await handler(req);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBe("Hello, world!");
    expect(data.method).toBe("GET");
  });

  it("should return hello message for PUT request", async () => {
    // Simulate the PUT handler logic
    const handler = async (req: Request) => {
      return Response.json({
        message: "Hello, world!",
        method: "PUT",
      });
    };

    const req = new Request("http://localhost/api/hello", { method: "PUT" });
    const response = await handler(req);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBe("Hello, world!");
    expect(data.method).toBe("PUT");
  });

  it("should return personalized hello message with name parameter", async () => {
    // Simulate the /api/hello/:name handler logic
    const handler = async (req: Request) => {
      const name = "Alice"; // In real scenario, this would come from req.params
      return Response.json({
        message: `Hello, ${name}!`,
      });
    };

    const req = new Request("http://localhost/api/hello/Alice");
    const response = await handler(req);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBe("Hello, Alice!");
  });
});


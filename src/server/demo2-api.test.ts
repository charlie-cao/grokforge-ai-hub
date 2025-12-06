/**
 * Tests for Demo2 API (User CRUD operations)
 */

import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { 
  getUsers, 
  getUser, 
  createUser, 
  updateUser, 
  deleteUser 
} from "./demo2-api";
import { db, initDatabase } from "../lib/demo2-db/db";
import { users } from "../lib/demo2-db/schema";
import { eq } from "drizzle-orm";
import { createMockRequest, parseJsonResponse, expectSuccess, expectError } from "../test/api-test-utils";

describe("Demo2 API - User CRUD", () => {
  beforeEach(async () => {
    // Initialize database and clear users table before each test
    await initDatabase();
    await db.delete(users);
  });

  afterEach(async () => {
    // Clean up after each test
    await db.delete(users);
  });

  describe("getUsers", () => {
    it("should return empty array when no users exist", async () => {
      const response = await getUsers();
      expectSuccess(response);
      
      const { data } = await parseJsonResponse(response);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
    });

    it("should return all users", async () => {
      // Create test users
      await db.insert(users).values([
        { name: "Alice", email: "alice@test.com", role: "user" },
        { name: "Bob", email: "bob@test.com", role: "admin" },
      ]);

      const response = await getUsers();
      expectSuccess(response);
      
      const { data } = await parseJsonResponse(response);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.data[0].name).toBe("Alice");
      expect(data.data[1].name).toBe("Bob");
    });
  });

  describe("getUser", () => {
    it("should return 400 for invalid user ID", async () => {
      const response = await getUser("invalid");
      expectError(response, 400);
      
      const { data } = await parseJsonResponse(response);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Invalid user ID");
    });

    it("should return 404 for non-existent user", async () => {
      const response = await getUser("999");
      expectError(response, 404);
      
      const { data } = await parseJsonResponse(response);
      expect(data.success).toBe(false);
      expect(data.error).toBe("User not found");
    });

    it("should return user by ID", async () => {
      // Create a test user
      const [user] = await db.insert(users).values({
        name: "Test User",
        email: "test@test.com",
        role: "user",
      }).returning();

      const response = await getUser(user.id.toString());
      expectSuccess(response);
      
      const { data } = await parseJsonResponse(response);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(user.id);
      expect(data.data.name).toBe("Test User");
      expect(data.data.email).toBe("test@test.com");
    });
  });

  describe("createUser", () => {
    it("should return 400 when name is missing", async () => {
      const req = createMockRequest("http://localhost/api/demo2/users", {
        method: "POST",
        body: { email: "test@test.com" },
      });

      const response = await createUser(req);
      expectError(response, 400);
      
      const { data } = await parseJsonResponse(response);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Name and email are required");
    });

    it("should return 400 when email is missing", async () => {
      const req = createMockRequest("http://localhost/api/demo2/users", {
        method: "POST",
        body: { name: "Test User" },
      });

      const response = await createUser(req);
      expectError(response, 400);
      
      const { data } = await parseJsonResponse(response);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Name and email are required");
    });

    it("should create a new user", async () => {
      const req = createMockRequest("http://localhost/api/demo2/users", {
        method: "POST",
        body: {
          name: "New User",
          email: "newuser@test.com",
          age: 25,
          role: "user",
        },
      });

      const response = await createUser(req);
      expectSuccess(response, 201);
      
      const { data } = await parseJsonResponse(response);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe("New User");
      expect(data.data.email).toBe("newuser@test.com");
      expect(data.data.age).toBe(25);
      expect(data.data.role).toBe("user");
      expect(data.data.id).toBeDefined();
    });

    it("should return 409 when email already exists", async () => {
      // Create first user
      await db.insert(users).values({
        name: "First User",
        email: "duplicate@test.com",
      });

      // Try to create another user with same email
      const req = createMockRequest("http://localhost/api/demo2/users", {
        method: "POST",
        body: {
          name: "Second User",
          email: "duplicate@test.com",
        },
      });

      const response = await createUser(req);
      expectError(response, 409);
      
      const { data } = await parseJsonResponse(response);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Email already exists");
    });
  });

  describe("updateUser", () => {
    it("should return 400 for invalid user ID", async () => {
      const req = createMockRequest("http://localhost/api/demo2/users/invalid", {
        method: "PUT",
        body: { name: "Updated Name" },
      });

      const response = await updateUser("invalid", req);
      expectError(response, 400);
      
      const { data } = await parseJsonResponse(response);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Invalid user ID");
    });

    it("should return 404 for non-existent user", async () => {
      const req = createMockRequest("http://localhost/api/demo2/users/999", {
        method: "PUT",
        body: { name: "Updated Name" },
      });

      const response = await updateUser("999", req);
      expectError(response, 404);
      
      const { data } = await parseJsonResponse(response);
      expect(data.success).toBe(false);
      expect(data.error).toBe("User not found");
    });

    it("should update user", async () => {
      // Create a test user
      const [user] = await db.insert(users).values({
        name: "Original Name",
        email: "update@test.com",
        role: "user",
      }).returning();

      const req = createMockRequest(`http://localhost/api/demo2/users/${user.id}`, {
        method: "PUT",
        body: {
          name: "Updated Name",
          age: 30,
        },
      });

      const response = await updateUser(user.id.toString(), req);
      expectSuccess(response);
      
      const { data } = await parseJsonResponse(response);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe("Updated Name");
      expect(data.data.age).toBe(30);
      expect(data.data.email).toBe("update@test.com"); // Email should remain unchanged
    });

    it("should return 409 when updating to existing email", async () => {
      // Create two users
      const [user1] = await db.insert(users).values({
        name: "User 1",
        email: "user1@test.com",
      }).returning();

      await db.insert(users).values({
        name: "User 2",
        email: "user2@test.com",
      });

      // Try to update user1's email to user2's email
      const req = createMockRequest(`http://localhost/api/demo2/users/${user1.id}`, {
        method: "PUT",
        body: {
          email: "user2@test.com",
        },
      });

      const response = await updateUser(user1.id.toString(), req);
      expectError(response, 409);
      
      const { data } = await parseJsonResponse(response);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Email already exists");
    });
  });

  describe("deleteUser", () => {
    it("should return 400 for invalid user ID", async () => {
      const response = await deleteUser("invalid");
      expectError(response, 400);
      
      const { data } = await parseJsonResponse(response);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Invalid user ID");
    });

    it("should return 404 for non-existent user", async () => {
      const response = await deleteUser("999");
      expectError(response, 404);
      
      const { data } = await parseJsonResponse(response);
      expect(data.success).toBe(false);
      expect(data.error).toBe("User not found");
    });

    it("should delete user", async () => {
      // Create a test user
      const [user] = await db.insert(users).values({
        name: "To Delete",
        email: "delete@test.com",
      }).returning();

      const response = await deleteUser(user.id.toString());
      expectSuccess(response);
      
      const { data } = await parseJsonResponse(response);
      expect(data.success).toBe(true);
      expect(data.message).toBe("User deleted successfully");

      // Verify user is deleted
      const deletedUser = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
      expect(deletedUser).toHaveLength(0);
    });
  });
});


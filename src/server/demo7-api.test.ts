/**
 * Tests for Demo7 API (Scheduled Chat Records)
 * 
 * Note: These tests mock the database layer to avoid requiring actual database setup
 */

import { describe, it, expect, beforeEach, mock, spyOn } from "bun:test";
import { getAllChats, getChatById } from "./demo7-api";
import { createMockRequest, parseJsonResponse, expectSuccess, expectError } from "../test/api-test-utils";
import * as schedulerModule from "./demo7-scheduler";

describe("Demo7 API - Chat Records", () => {
  let getScheduledChatsSpy: ReturnType<typeof spyOn>;
  let getScheduledChatSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    // Spy on the actual functions
    getScheduledChatsSpy = spyOn(schedulerModule, "getScheduledChats");
    getScheduledChatSpy = spyOn(schedulerModule, "getScheduledChat");
  });

  describe("getAllChats", () => {
    it("should return empty array when no chats exist", async () => {
      getScheduledChatsSpy.mockResolvedValueOnce([]);

      const req = createMockRequest("http://localhost/api/demo7/chats");
      const response = await getAllChats(req);
      expectSuccess(response);
      
      const { data } = await parseJsonResponse(response);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
      expect(data.count).toBe(0);
    });

    it("should return all chats", async () => {
      const mockChats = [
        { id: 1, prompt: "Hello", response: "Hi there", createdAt: new Date() },
        { id: 2, prompt: "How are you?", response: "I'm fine", createdAt: new Date() },
      ];
      getScheduledChatsSpy.mockResolvedValueOnce(mockChats);

      const req = createMockRequest("http://localhost/api/demo7/chats");
      const response = await getAllChats(req);
      expectSuccess(response);
      
      const { data } = await parseJsonResponse(response);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.count).toBe(2);
    });

    it("should respect limit query parameter", async () => {
      getScheduledChatsSpy.mockResolvedValueOnce([]);

      const req = createMockRequest("http://localhost/api/demo7/chats?limit=50");
      await getAllChats(req);
      
      expect(getScheduledChatsSpy).toHaveBeenCalledWith(50);
    });

    it("should cap limit at 500", async () => {
      getScheduledChatsSpy.mockResolvedValueOnce([]);

      const req = createMockRequest("http://localhost/api/demo7/chats?limit=1000");
      await getAllChats(req);
      
      expect(getScheduledChatsSpy).toHaveBeenCalledWith(500);
    });

    it("should handle errors", async () => {
      getScheduledChatsSpy.mockRejectedValueOnce(new Error("Database error"));

      const req = createMockRequest("http://localhost/api/demo7/chats");
      const response = await getAllChats(req);
      expectError(response, 500);
      
      const { data } = await parseJsonResponse(response);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Database error");
    });
  });

  describe("getChatById", () => {
    it("should return 400 for invalid chat ID", async () => {
      const req = createMockRequest("http://localhost/api/demo7/chats/invalid");
      const response = await getChatById(req, "invalid");
      expectError(response, 400);
      
      const { data } = await parseJsonResponse(response);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid chat ID");
    });

    it("should return 404 for non-existent chat", async () => {
      getScheduledChatSpy.mockResolvedValueOnce(null);

      const req = createMockRequest("http://localhost/api/demo7/chats/999");
      const response = await getChatById(req, "999");
      expectError(response, 404);
      
      const { data } = await parseJsonResponse(response);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Chat not found");
    });

    it("should return chat by ID", async () => {
      const mockChat = {
        id: 1,
        prompt: "Test prompt",
        response: "Test response",
        createdAt: new Date(),
      };
      getScheduledChatSpy.mockResolvedValueOnce(mockChat);

      const req = createMockRequest("http://localhost/api/demo7/chats/1");
      const response = await getChatById(req, "1");
      expectSuccess(response);
      
      const { data } = await parseJsonResponse(response);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(1);
      expect(data.data.prompt).toBe("Test prompt");
      expect(getScheduledChatSpy).toHaveBeenCalledWith(1);
    });

    it("should handle errors", async () => {
      getScheduledChatSpy.mockRejectedValueOnce(new Error("Database error"));

      const req = createMockRequest("http://localhost/api/demo7/chats/1");
      const response = await getChatById(req, "1");
      expectError(response, 500);
      
      const { data } = await parseJsonResponse(response);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Database error");
    });
  });
});


/**
 * Demo7 API Routes
 * Handles HTTP requests for scheduled chat records
 */

import { getScheduledChats, getScheduledChat } from "./demo7-scheduler";

export async function getAllChats(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "100");
    
    const chats = await getScheduledChats(Math.min(limit, 500)); // Max 500
    
    return Response.json({
      success: true,
      data: chats,
      count: chats.length,
    });
  } catch (error) {
    console.error("Error fetching scheduled chats:", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function getChatById(req: Request, id: string): Promise<Response> {
  try {
    const chatId = parseInt(id);
    if (isNaN(chatId)) {
      return Response.json(
        {
          success: false,
          error: "Invalid chat ID",
        },
        { status: 400 }
      );
    }
    
    const chat = await getScheduledChat(chatId);
    
    if (!chat) {
      return Response.json(
        {
          success: false,
          error: "Chat not found",
        },
        { status: 404 }
      );
    }
    
    return Response.json({
      success: true,
      data: chat,
    });
  } catch (error) {
    console.error("Error fetching scheduled chat:", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}


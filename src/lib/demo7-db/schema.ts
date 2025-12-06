/**
 * Demo7 Database Schema
 * Using Drizzle ORM with Bun SQLite
 * Stores scheduled AI chat messages from automated tasks
 */
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Scheduled chat messages table
export const scheduledChats = sqliteTable("scheduled_chats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  prompt: text("prompt").notNull(), // The prompt sent to AI
  response: text("response").notNull(), // AI's response
  model: text("model").notNull().default("qwen3:latest"), // AI model used
  status: text("status").notNull().default("success"), // success, error
  errorMessage: text("error_message"), // Error message if status is error
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type ScheduledChat = typeof scheduledChats.$inferSelect;
export type NewScheduledChat = typeof scheduledChats.$inferInsert;


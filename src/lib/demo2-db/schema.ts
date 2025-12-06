/**
 * Demo2 Database Schema
 * Using Drizzle ORM with Bun SQLite
 */
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Users table - 演示 CRUD 操作
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  age: integer("age"),
  role: text("role").notNull().default("user"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

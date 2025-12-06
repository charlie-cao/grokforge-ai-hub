/**
 * Demo7 Database Connection
 * Using Bun SQLite (built-in, no extra dependencies needed)
 */
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import * as schema from "./schema";
import { mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

// Use independent database file, doesn't affect other demos
const DB_DIR = join(process.cwd(), "data");
const DB_PATH = join(DB_DIR, "demo7.db");

// Initialize database directory (lazy execution)
async function ensureDbDir() {
  if (!existsSync(DB_DIR)) {
    await mkdir(DB_DIR, { recursive: true });
  }
}

// Create SQLite database connection (lazy initialization)
let sqlite: Database | null = null;

function getDatabase(): Database {
  if (!sqlite) {
    ensureDbDir().catch(console.error);
    sqlite = new Database(DB_PATH);
    sqlite.exec("PRAGMA foreign_keys = ON;");
  }
  return sqlite;
}

// Create Drizzle instance
export const db = drizzle(getDatabase(), { schema });

// Initialize database (create tables)
export async function initDatabase() {
  try {
    await ensureDbDir();
    const dbInstance = getDatabase();
    
    // Create scheduled_chats table
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS scheduled_chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prompt TEXT NOT NULL,
        response TEXT NOT NULL,
        model TEXT NOT NULL DEFAULT 'qwen3:latest',
        status TEXT NOT NULL DEFAULT 'success',
        error_message TEXT,
        created_at INTEGER NOT NULL
      );
    `);

    // Create index for faster queries
    dbInstance.exec(`
      CREATE INDEX IF NOT EXISTS idx_scheduled_chats_created_at ON scheduled_chats(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_scheduled_chats_status ON scheduled_chats(status);
    `);

    console.log("✅ Demo7 database initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize Demo7 database:", error);
    throw error;
  }
}

// Close database connection (called when app shuts down)
export function closeDatabase() {
  if (sqlite) {
    sqlite.close();
    sqlite = null;
  }
}


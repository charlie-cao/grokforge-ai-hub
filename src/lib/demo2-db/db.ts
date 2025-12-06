/**
 * Demo2 Database Connection
 * Using Bun SQLite (built-in, no extra dependencies needed)
 */
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import * as schema from "./schema";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

// 使用独立的数据库文件，不影响其他 demo
import { mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

// 使用绝对路径，确保数据库文件在项目根目录的 data 文件夹中
const DB_DIR = join(process.cwd(), "data");
const DB_PATH = join(DB_DIR, "demo2.db");

// 初始化数据库目录（延迟执行）
async function ensureDbDir() {
  if (!existsSync(DB_DIR)) {
    await mkdir(DB_DIR, { recursive: true });
  }
}

// 创建 SQLite 数据库连接（延迟初始化）
let sqlite: Database | null = null;

function getDatabase(): Database {
  if (!sqlite) {
    ensureDbDir().catch(console.error);
    sqlite = new Database(DB_PATH);
    // 启用外键支持
    sqlite.exec("PRAGMA foreign_keys = ON;");
  }
  return sqlite;
}

// 创建 Drizzle 实例
export const db = drizzle(getDatabase(), { schema });

// 初始化数据库（创建表）
export async function initDatabase() {
  try {
    await ensureDbDir();
    const db = getDatabase();
    
    // 创建 users 表
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        age INTEGER,
        role TEXT NOT NULL DEFAULT 'user',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);

    // 创建 posts 表
    db.exec(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        author_id INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        views INTEGER NOT NULL DEFAULT 0,
        rating REAL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // 创建 comments 表
    db.exec(`
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        author_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // 创建索引
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
      CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
      CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
      CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
    `);

    console.log("✅ Demo2 database initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize Demo2 database:", error);
    throw error;
  }
}

// 关闭数据库连接（在应用关闭时调用）
export function closeDatabase() {
  if (sqlite) {
    sqlite.close();
    sqlite = null;
  }
}

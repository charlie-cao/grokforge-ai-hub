# Demo7: Scheduled AI Chat Tasks / 定时 AI 对话任务

## Overview / 概览

Demo7 demonstrates how to use Bun's native timer (`setInterval`) to create automatically executed AI chat tasks. The scheduler runs as an **independent process**, completely separated from the main HTTP server. It executes AI chat tasks every 5 minutes and stores all chat records in a SQLite database.

Demo7 演示了如何使用 Bun 原生定时器（`setInterval`）创建自动执行的 AI 对话任务。调度器作为**独立进程**运行，与主 HTTP 服务器完全分离。它每 5 分钟执行一次 AI 对话任务，并将所有聊天记录存储到 SQLite 数据库中。

## Features / 功能特性

- ✅ **Automatic Scheduling** - Runs every 5 minutes automatically
- ✅ **Independent Process** - Completely separated from main server
- ✅ **Bun Native Timer** - Uses `setInterval` from Bun runtime
- ✅ **AI Integration** - Calls Ollama AI model for responses
- ✅ **Database Storage** - Stores all records in Bun SQLite
- ✅ **Real-time Display** - Frontend auto-refreshes every 10 seconds
- ✅ **Bilingual Support** - Full Chinese/English interface

- ✅ **自动调度** - 每 5 分钟自动执行一次
- ✅ **独立进程** - 与主服务器完全分离
- ✅ **Bun 原生定时器** - 使用 Bun 运行时的 `setInterval`
- ✅ **AI 集成** - 调用 Ollama AI 模型生成回复
- ✅ **数据库存储** - 将所有记录存储到 Bun SQLite
- ✅ **实时显示** - 前端每 10 秒自动刷新
- ✅ **双语支持** - 完整的中英文界面

## Technology Stack / 技术栈

- **Bun Runtime** - Native timer support
- **Bun SQLite** - Built-in database for storage
- **Drizzle ORM** - Type-safe database operations
- **Ollama** - AI model for generating responses
- **React 19** - Frontend UI
- **Shadcn UI** - Component library

## File Structure / 文件结构

```
src/
├── lib/
│   ├── demo7-db/
│   │   ├── schema.ts          # Database schema
│   │   └── db.ts              # Database connection
│   └── demo7-i18n.ts          # Internationalization
├── server/
│   ├── demo7-scheduler.ts            # Shared scheduler functions
│   ├── demo7-scheduler-server.ts     # Standalone scheduler server (独立进程)
│   └── demo7-api.ts                  # API endpoints
├── pages/
│   └── Demo7.tsx              # Frontend page
├── demo7.html                 # HTML entry point
└── demo7.tsx                  # React entry point
```

## How It Works / 工作原理

1. **Independent Process** - The scheduler runs as a separate process from the main HTTP server
2. **Database Initialization** - On startup, the scheduler initializes the SQLite database
3. **Initial Execution** - The first task executes immediately when scheduler starts
4. **Scheduled Tasks** - Every 5 minutes, a new task is executed automatically
5. **AI Generation** - Each task picks a random prompt and calls Ollama AI
6. **Database Storage** - Results are saved to SQLite database
7. **Frontend Display** - The frontend fetches and displays all records via API

1. **独立进程** - 调度器作为独立进程运行，与主 HTTP 服务器分离
2. **数据库初始化** - 启动时，调度器初始化 SQLite 数据库
3. **首次执行** - 调度器启动时第一个任务立即执行
4. **定时任务** - 每 5 分钟自动执行一个新任务
5. **AI 生成** - 每个任务随机选择一个提示词并调用 Ollama AI
6. **数据库存储** - 结果保存到 SQLite 数据库
7. **前端显示** - 前端通过 API 获取并显示所有记录

## API Endpoints / API 端点

- `GET /api/demo7/chats` - Get all chat records (with optional `limit` query parameter)
- `GET /api/demo7/chats/:id` - Get a specific chat record by ID

## Database Schema / 数据库结构

```typescript
scheduledChats {
  id: number (primary key)
  prompt: string
  response: string
  model: string
  status: "success" | "error"
  errorMessage?: string
  createdAt: timestamp
}
```

## Configuration / 配置

- **Interval**: 5 minutes (configurable in `demo7-scheduler.ts`)
- **AI Model**: qwen3:latest (configurable via environment variables)
- **Database**: `data/demo7.db` (SQLite file)

## Usage / 使用方法

### Step 1: Start the main server (Terminal 1)
```bash
bun run dev
```

### Step 2: Start the scheduler (Terminal 2)
```bash
bun run demo7:scheduler
```

### Step 3: Open the frontend
Open `/demo7` in your browser and watch the chat records appear automatically.

---

### 步骤 1: 启动主服务器（终端 1）
```bash
bun run dev
```

### 步骤 2: 启动调度器（终端 2）
```bash
bun run demo7:scheduler
```

### 步骤 3: 打开前端页面
在浏览器中打开 `/demo7`，查看自动出现的聊天记录。

## Key Code Snippets / 关键代码片段

### Standalone Scheduler Server

The scheduler runs as an independent process:

```typescript
// src/server/demo7-scheduler-server.ts
async function startScheduler(): Promise<void> {
  await initDatabase();
  await executeScheduledTask(); // Execute immediately
  schedulerInterval = setInterval(async () => {
    await executeScheduledTask();
  }, 5 * 60 * 1000); // Every 5 minutes
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  stopScheduler();
  process.exit(0);
});
```

### Running the Scheduler

```bash
# Start scheduler as independent process
bun run demo7:scheduler
```

调度器作为独立进程运行，与主服务器完全分离，互不影响。

## Benefits / 优势

1. **Zero Dependencies** - Uses Bun's built-in features only
2. **Type Safety** - Full TypeScript with Drizzle ORM
3. **Modular Design** - Independent from other demos
4. **Production Ready** - Error handling, logging, database persistence

1. **零依赖** - 仅使用 Bun 内置功能
2. **类型安全** - 完整的 TypeScript 支持，使用 Drizzle ORM
3. **模块化设计** - 独立于其他演示
4. **生产就绪** - 错误处理、日志记录、数据库持久化


# Demo7 调度器方案说明 / Scheduler Options

## 概述 / Overview

Demo7 提供了两种方式来运行定时任务调度器：

1. **独立进程方式**（推荐）- 完全与主服务器分离
2. **Bree 任务调度器方式**（可选）- 使用专业的 cron 任务调度器

## 方案 1：独立进程方式（当前实现）/ Standalone Process

### 特点 / Features

- ✅ **完全分离** - 运行在独立的进程中，不影响主服务器
- ✅ **零依赖** - 只使用 Bun 原生功能
- ✅ **简单直接** - 使用 `setInterval` 实现
- ✅ **易于管理** - 可以独立启动、停止、重启

### 使用方法 / Usage

1. **启动主服务器**（终端 1）
   ```bash
   bun run dev
   ```

2. **启动调度器**（终端 2）
   ```bash
   bun run demo7:scheduler
   ```

### 优势 / Advantages

- 主服务器和调度器完全独立
- 调度器崩溃不会影响主服务器
- 可以分别监控和调试
- 适合生产环境

### 配置 / Configuration

调度间隔可以在 `src/server/demo7-scheduler-server.ts` 中修改：

```typescript
const INTERVAL_MS = 5 * 60 * 1000; // 5分钟
```

---

## 方案 2：Bree 任务调度器方式（可选）/ Bree Task Scheduler

### 特点 / Features

- ✅ **专业调度器** - 支持 cron 表达式
- ✅ **更灵活的调度** - 可以设置复杂的时间规则
- ✅ **任务管理** - 更好的任务管理和监控
- ⚠️ **需要额外依赖** - 需要安装 `bree` 包

### 安装 Bree / Installation

```bash
bun add bree
```

### 实现方式 / Implementation

创建一个新的调度器文件 `src/server/demo7-scheduler-bree.ts`：

```typescript
import Bree from "bree";
import { initDatabase } from "../lib/demo7-db/db";

// 初始化数据库
await initDatabase();

const bree = new Bree({
  jobs: [
    {
      name: "ai-chat-task",
      interval: "*/5 * * * *", // 每5分钟执行一次 (cron 表达式)
      path: "./src/server/jobs/demo7-ai-chat.ts",
    },
  ],
});

bree.start();
```

### Cron 表达式示例 / Cron Examples

- `*/5 * * * *` - 每5分钟
- `0 * * * *` - 每小时
- `0 0 * * *` - 每天午夜
- `0 9 * * 1-5` - 工作日上午9点

---

## 推荐方案 / Recommended Approach

对于 Demo7，**推荐使用方案 1（独立进程方式）**，因为：

1. 零依赖，使用 Bun 原生功能
2. 完全分离，不影响主服务器
3. 简单直接，易于理解和维护
4. 符合 Bun 的最佳实践

如果未来需要更复杂的调度规则（如不同时间执行不同任务），可以考虑升级到方案 2（Bree）。

---

## 生产环境部署 / Production Deployment

### Docker Compose 示例

可以创建两个独立的服务：

```yaml
services:
  app:
    # 主服务器
    build: .
    command: bun run start
  
  scheduler:
    # 调度器服务
    build: .
    command: bun run demo7:scheduler
    depends_on:
      - app
```

### Systemd 服务（Linux）

可以创建两个 systemd 服务文件来分别管理主服务器和调度器。

---

## 监控和日志 / Monitoring & Logging

调度器会输出详细的日志，包括：
- 任务执行时间
- 任务状态（成功/失败）
- 错误信息

可以通过日志文件或日志收集系统监控调度器的运行状态。


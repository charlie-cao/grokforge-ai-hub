# Demo6: AI 对话队列系统

基于 Bun.js + BullMQ + Redis + Ollama 的企业级队列式 AI 对话平台。

## 🎯 核心特性

### 技术栈
- **Bun.js**: 高性能 JavaScript 运行时，原生支持 TypeScript、SSE
- **BullMQ**: 基于 Redis 的现代队列系统
- **Redis**: 内存数据库，作为队列后端
- **Ollama**: 本地大语言模型服务（qwen3:latest）
- **SSE**: Server-Sent Events 实现实时状态推送

### 核心功能
- ✅ 任务队列管理（等待/处理/完成/失败）
- ✅ 实时进度追踪（0-100%）
- ✅ 优先级队列（高/中/低）
- ✅ 自动重试机制（失败自动重试 3 次）
- ✅ 速率限制（防止 API 过载）
- ✅ 并发处理（同时处理 3 个任务）
- ✅ 流式响应（SSE 实时推送）
- ✅ 任务历史记录（最近 50 条）
- ✅ 性能监控（响应时间、成功率、吞吐量）

## 🚀 快速开始

### 前置要求

1. **Bun.js**: 已安装 Bun (v1.0+)
2. **Docker**: 用于运行 Redis
3. **Ollama**: 本地 LLM 服务，已安装并运行

### 安装依赖

```bash
bun install
```

### 启动服务

#### 方式 1: 使用启动脚本 (推荐)

**Linux/macOS:**
```bash
chmod +x scripts/start-demo6.sh
./scripts/start-demo6.sh
```

**Windows (PowerShell):**
```powershell
.\scripts\start-demo6.ps1
```

#### 方式 2: 手动启动

1. **启动 Redis (Docker)**
```bash
docker-compose -f docker-compose.demo6.yml up -d
```

2. **启动 Ollama** (如果未运行)
```bash
ollama serve
```

3. **启动队列服务器**
```bash
bun run src/server/demo6-server.ts
```

4. **启动前端服务** (另一个终端)
```bash
bun dev
```

### 访问应用

- **前端页面**: http://localhost:3000/demo6
- **队列 API**: http://localhost:3001
- **健康检查**: http://localhost:3001/health
- **队列统计**: http://localhost:3001/api/queue/stats

## 📋 API 端点

### POST /api/chat
添加聊天任务到队列

**请求体:**
```json
{
  "userId": "user-123",
  "prompt": "你好，请介绍一下自己",
  "conversationHistory": [],
  "priority": 5
}
```

**响应:**
```json
{
  "success": true,
  "jobId": "user-123-1234567890",
  "message": "Task queued successfully"
}
```

### GET /api/job/:jobId
获取任务状态

**响应:**
```json
{
  "jobId": "user-123-1234567890",
  "state": "completed",
  "progress": 100,
  "result": {
    "success": true,
    "response": "我是 AI 助手...",
    "timestamp": 1234567890
  }
}
```

### GET /api/queue/stats
获取队列统计信息

**响应:**
```json
{
  "waiting": 2,
  "active": 1,
  "completed": 10,
  "failed": 0,
  "total": 3
}
```

### GET /stream/status/:jobId
SSE 流式推送任务状态更新

**事件格式:**
```
data: {"type":"status","jobId":"...","state":"active","progress":50}
```

## 🏗️ 架构设计

```
┌─────────────┐
│  前端应用   │  (React + TypeScript)
│ Port 3000   │
└──────┬───────┘
       │ HTTP/SSE
       ▼
┌─────────────┐
│  队列服务   │  (Bun.js)
│ Port 3001   │
└──────┬───────┘
       │
       ├──► Redis (Port 6379) ──┐
       │                         │
       └──► Ollama (Port 11434) │
                                 │
                          ┌──────┴──────┐
                          │  BullMQ     │
                          │  Worker     │
                          └─────────────┘
```

### 数据流

1. **用户发送消息** → 前端调用 `/api/chat`
2. **任务入队** → BullMQ 将任务添加到 Redis 队列
3. **Worker 处理** → 并发处理任务，调用 Ollama API
4. **状态更新** → Worker 更新任务进度
5. **SSE 推送** → 前端通过 SSE 接收实时状态
6. **完成响应** → 前端显示 AI 生成的响应

## ⚙️ 配置选项

### 环境变量

```bash
# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379

# Ollama 配置
OLLAMA_URL=http://localhost:11434/api/generate

# 队列服务端口
PORT=3001

# 队列 API URL (前端)
QUEUE_API_URL=http://localhost:3001
```

### 队列配置

在 `src/server/demo6-queue.ts` 中可调整：

- **并发数**: `concurrency: 3` (同时处理的任务数)
- **重试次数**: `attempts: 3`
- **速率限制**: `max: 10, duration: 60000` (每分钟 10 个请求)
- **退避策略**: `type: "exponential", delay: 2000`

## 🔧 高级功能

### 优先级管理

任务支持 1-10 的优先级：
- **1-3**: 低优先级
- **4-7**: 中优先级（默认）
- **8-10**: 高优先级

高优先级任务会优先处理。

### 批量处理

可以同时提交多个任务，队列系统会自动管理并发和顺序。

### 性能监控

系统自动追踪：
- 平均响应时间
- 总请求数
- 成功率
- 吞吐量（每分钟请求数）

### 错误处理

- 自动重试 3 次（指数退避）
- 失败任务保留 24 小时
- 完成任务保留 1 小时

## 🐛 故障排查

### Redis 连接失败

```bash
# 检查 Redis 容器状态
docker ps | grep demo6-redis

# 查看 Redis 日志
docker logs demo6-redis

# 重启 Redis
docker-compose -f docker-compose.demo6.yml restart
```

### Ollama 连接失败

```bash
# 检查 Ollama 是否运行
curl http://localhost:11434/api/tags

# 启动 Ollama
ollama serve

# 检查模型是否存在
ollama list
```

### 队列服务器无法启动

1. 检查端口 3001 是否被占用
2. 确认 Redis 已启动
3. 查看控制台错误信息

## 📊 性能优化

### 生产环境建议

1. **Redis 持久化**: 已启用 AOF (Append-Only File)
2. **连接池**: 使用 ioredis 连接池
3. **任务清理**: 自动清理旧任务，避免内存泄漏
4. **监控告警**: 集成 Prometheus/Grafana 监控

### 扩展性

- 可以运行多个 Worker 进程提高并发
- 使用 Redis Cluster 支持高可用
- 使用负载均衡器分发请求

## 📝 开发说明

### 项目结构

```
src/
├── server/
│   ├── demo6-queue.ts    # 队列管理逻辑
│   └── demo6-server.ts   # HTTP 服务器
├── pages/
│   └── Demo6.tsx         # 前端页面
├── demo6.tsx             # 入口文件
└── demo6.html            # HTML 模板
```

### 添加新功能

1. **自定义 Worker**: 在 `demo6-queue.ts` 中添加新的处理器
2. **新 API 端点**: 在 `demo6-server.ts` 中添加路由
3. **UI 组件**: 在 `Demo6.tsx` 中添加 React 组件

## 📚 相关文档

- [BullMQ 文档](https://docs.bullmq.io/)
- [Bun.js 文档](https://bun.sh/docs)
- [Ollama 文档](https://ollama.ai/docs)
- [Redis 文档](https://redis.io/docs/)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License


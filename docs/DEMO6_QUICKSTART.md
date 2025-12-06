# Demo6 快速启动指南

## 🚀 启动步骤

Demo6 需要运行 **3 个服务**：

### 1. Redis (Docker)
```powershell
docker-compose -f docker-compose.demo6.yml up -d
```

### 2. 队列服务器 (端口 3001)
```powershell
# 在第一个终端运行
bun run src/server/demo6-server.ts
```

### 3. 前端服务 (端口 3000)
```powershell
# 在第二个终端运行
bun dev
```

## ✅ 检查服务状态

运行检查脚本：
```powershell
.\scripts\check-demo6.ps1
```

或者手动检查：
- Redis: `docker ps | findstr demo6-redis`
- 队列服务器: 访问 http://localhost:3001/health
- 前端服务: 访问 http://localhost:3000
- Ollama: 访问 http://localhost:11434/api/tags

## 🌐 访问地址

- **前端页面**: http://localhost:3000/demo6
- **队列 API**: http://localhost:3001
- **健康检查**: http://localhost:3001/health
- **队列统计**: http://localhost:3001/api/queue/stats

## ⚠️ 常见问题

### 问题 1: 页面无法访问
**原因**: 前端服务 (3000) 未运行
**解决**: 在另一个终端运行 `bun dev`

### 问题 2: 队列 API 无法连接
**原因**: 队列服务器 (3001) 未运行
**解决**: 运行 `bun run src/server/demo6-server.ts`

### 问题 3: Redis 连接失败
**原因**: Redis 容器未启动
**解决**: 运行 `docker-compose -f docker-compose.demo6.yml up -d`

### 问题 4: Ollama 错误
**原因**: Ollama 服务未运行
**解决**: 运行 `ollama serve` (如果使用本地 LLM)

## 📝 完整启动示例

```powershell
# 终端 1: 启动队列服务器
.\scripts\start-demo6.ps1

# 终端 2: 启动前端服务
bun dev

# 浏览器访问
# http://localhost:3000/demo6
```

## 🔧 使用启动脚本

### 方式 1: 基础脚本（只启动队列服务器）
```powershell
.\scripts\start-demo6.ps1
# 然后在新终端运行: bun dev
```

### 方式 2: 检查服务状态
```powershell
.\scripts\check-demo6.ps1
```


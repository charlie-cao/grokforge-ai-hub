# 容器化部署指南 / Container Deployment Guide

## 概述 / Overview

本项目支持一键容器化启动，包括所有服务：
- **Web 服务器** (主应用) - 端口 3000
- **队列服务器** (Demo6) - 端口 3001
- **调度器服务器** (Demo7) - 后台定时任务
- **Redis** - 队列后端，端口 6379
- **Ollama** - AI 模型服务，端口 11434

This project supports one-command containerized deployment, including all services:
- **Web Server** (Main App) - Port 3000
- **Queue Server** (Demo6) - Port 3001
- **Scheduler Server** (Demo7) - Background scheduled tasks
- **Redis** - Queue backend, Port 6379
- **Ollama** - AI model service, Port 11434

> 📖 **推荐先阅读**: [完整启动指南](START_GUIDE.md) - 包含平台特定的详细说明、环境检查脚本和故障排查
> 
> 📖 **Recommended Reading**: [Complete Startup Guide](START_GUIDE.md) - Includes platform-specific instructions, environment check scripts, and troubleshooting

## 前置要求 / Prerequisites

- Docker (v20.10+)
- Docker Compose (v2.0+)
- Make (可选，但推荐)

- Docker (v20.10+)
- Docker Compose (v2.0+)
- Make (Optional but recommended)

### 快速环境检查 / Quick Environment Check

运行环境检查脚本以验证你的环境：

Run environment check scripts to verify your environment:

- **Windows**: `.\scripts\check-env.ps1`
- **Linux/macOS**: `./scripts/check-env.sh`

## 快速启动 / Quick Start

### 方式 1: 使用 Makefile (推荐 / Recommended)

```bash
# 一键启动所有服务
make run

# 查看服务状态
make status

# 查看日志
make logs

# 停止所有服务
make stop
```

### 方式 2: 使用 Docker Compose

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止所有服务
docker-compose stop
```

## 可用命令 / Available Commands

使用 `make help` 查看所有可用命令：

```bash
make help
```

主要命令：

- `make run` - 启动所有服务
- `make stop` - 停止所有服务
- `make down` - 停止并删除所有容器
- `make logs` - 查看所有服务的日志
- `make logs-app` - 只查看 Web 服务器的日志
- `make logs-queue` - 只查看队列服务器的日志
- `make logs-scheduler` - 只查看调度器服务器的日志
- `make build` - 构建所有 Docker 镜像
- `make rebuild` - 重新构建所有镜像（不使用缓存）
- `make restart` - 重启所有服务
- `make status` - 查看服务状态
- `make check` - 检查所有服务健康状态
- `make clean` - 清理所有容器、卷和镜像（⚠️ 危险）

## 服务说明 / Services

### 1. Web 服务器 (app)

- **容器名**: `grokforge-ai-hub`
- **端口**: 3000
- **访问地址**: http://localhost:3000
- **功能**: 主应用服务器，提供所有 Demo 页面和 API

### 2. 队列服务器 (queue-server)

- **容器名**: `grokforge-queue-server`
- **端口**: 3001
- **访问地址**: http://localhost:3001
- **功能**: Demo6 队列服务，处理 AI 聊天任务队列
- **健康检查**: http://localhost:3001/health

### 3. 调度器服务器 (scheduler-server)

- **容器名**: `grokforge-scheduler-server`
- **端口**: 无（后台服务）
- **功能**: Demo7 定时任务调度器，每分钟执行一次 AI 对话任务

### 4. Redis

- **容器名**: `grokforge-redis`
- **端口**: 6379
- **功能**: 队列后端存储

### 5. Ollama

- **容器名**: `grokforge-ollama`
- **端口**: 11434
- **访问地址**: http://localhost:11434
- **功能**: AI 模型服务
- **注意**: 首次启动需要下载模型（需要时间）

## 数据持久化 / Data Persistence

所有数据存储在 Docker 卷中：

- `app-data` - 应用数据（SQLite 数据库、上传的文件等）
- `redis-data` - Redis 数据
- `ollama-data` - Ollama 模型数据

数据在容器重启后仍然保留。

## 环境变量 / Environment Variables

可以通过环境变量或 `.env` 文件配置：

```bash
# 应用端口
APP_PORT=3000

# 队列服务端口
QUEUE_PORT=3001

# Redis 配置
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# Ollama 配置
OLLAMA_HOST=ollama
OLLAMA_PORT=11434
OLLAMA_MODEL=qwen3:latest
```

## 首次启动注意事项 / First Startup Notes

1. **Ollama 模型下载**: 首次启动时，Ollama 需要下载模型（qwen3:latest），这可能需要几分钟到几十分钟，取决于网络速度。

2. **服务启动顺序**: 
   - Redis 和 Ollama 会先启动
   - 其他服务等待 Redis 和 Ollama 健康检查通过后启动
   - 调度器会在 Ollama 就绪后开始执行任务

3. **检查服务状态**:
   ```bash
   make check
   ```

## 故障排查 / Troubleshooting

### 服务无法启动

```bash
# 查看所有服务日志
make logs

# 查看特定服务日志
make logs-app
make logs-queue
make logs-scheduler

# 检查服务状态
make status
```

### Ollama 连接失败

1. 检查 Ollama 容器是否运行：
   ```bash
   docker ps | grep ollama
   ```

2. 检查 Ollama 是否健康：
   ```bash
   curl http://localhost:11434/api/tags
   ```

3. 查看 Ollama 日志：
   ```bash
   docker logs grokforge-ollama
   ```

### Redis 连接失败

1. 检查 Redis 容器：
   ```bash
   docker ps | grep redis
   ```

2. 测试 Redis 连接：
   ```bash
   docker exec grokforge-redis redis-cli ping
   ```

### 数据库问题

所有 SQLite 数据库存储在共享数据卷 `app-data` 中。如果遇到数据库问题：

1. 检查数据卷：
   ```bash
   docker volume ls | grep app-data
   ```

2. 进入容器检查：
   ```bash
   make shell-app
   ls -la /app/data
   ```

## 生产环境建议 / Production Recommendations

1. **使用环境变量文件**: 创建 `.env` 文件管理配置
2. **设置 Redis 密码**: 配置 `REDIS_PASSWORD` 环境变量
3. **限制资源使用**: 在 `docker-compose.yml` 中添加资源限制
4. **使用外部 Ollama**: 如果已有 Ollama 服务，可以配置 `OLLAMA_HOST` 指向外部服务
5. **备份数据卷**: 定期备份 `app-data` 和 `redis-data` 卷

## 停止和清理 / Stop and Cleanup

### 停止服务

```bash
make stop
# 或
docker-compose stop
```

### 停止并删除容器

```bash
make down
# 或
docker-compose down
```

### 完全清理（⚠️ 危险，会删除所有数据）

```bash
make clean
# 或
docker-compose down -v --rmi all
```

## 更多信息 / More Information

- 项目文档: `docs/`
- Docker Compose 配置: `docker-compose.yml`
- 各个服务的 Dockerfile:
  - 主应用: `Dockerfile`
  - 队列服务器: `Dockerfile.queue`
  - 调度器服务器: `Dockerfile.scheduler`


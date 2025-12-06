# 一键容器化启动指南 / Quick Containerized Start Guide

> 📖 **完整启动指南**: 查看 [完整启动指南](docs/START_GUIDE.md) 获取详细的平台特定说明、环境检查脚本和故障排查指南。
> 
> 📖 **Complete Startup Guide**: See [Complete Startup Guide](docs/START_GUIDE.md) for detailed platform-specific instructions, environment check scripts, and troubleshooting.

## 🚀 快速启动 / Quick Start

### ⚡ 快速开始步骤 / Quick Start Steps

1. **检查环境** / Check Environment
   ```bash
   # Windows
   .\scripts\check-env.ps1
   
   # Linux/macOS
   chmod +x scripts/check-env.sh
   ./scripts/check-env.sh
   ```

2. **启动服务** / Start Services（见下方详细说明）

### Linux/macOS

```bash
# 启动所有服务（包括容器中的 Ollama）
make run

# 使用本地 Ollama（不下载大模型）
make run-local
```

### Windows (使用 PowerShell)

```powershell
# 如果没有安装 make，使用 PowerShell 脚本
.\scripts\docker-run.ps1 run

# 使用本地 Ollama（不下载大模型）
.\scripts\docker-run.ps1 run-local

# 或者直接使用 docker-compose
docker-compose up -d

# 使用本地 Ollama
docker-compose -f docker-compose.yml -f docker-compose.local-ollama.yml up -d
```

### 使用本地 Ollama / Using Local Ollama

如果你想使用本地已安装的 Ollama 服务（避免下载大模型），可以使用：

```bash
# Linux/macOS
make run-local

# Windows PowerShell
.\scripts\docker-run.ps1 run-local

# 或直接使用 docker-compose
docker-compose -f docker-compose.yml -f docker-compose.local-ollama.yml up -d
```

**前提条件 / Prerequisites:**
- 确保本地 Ollama 服务正在运行：`ollama serve`
- 确保 Ollama 监听在端口 11434
- Windows/Mac: 自动支持 `host.docker.internal`
- Linux: 可能需要额外配置，或使用环境变量 `OLLAMA_HOST` 设置主机 IP

## ✅ 启动的服务 / Started Services

运行 `make run` 后，以下服务会自动启动：

1. **Web 服务器** (主应用)
   - 端口: 3000
   - 地址: http://localhost:3000

2. **队列服务器** (Demo6)
   - 端口: 3001
   - 地址: http://localhost:3001
   - 健康检查: http://localhost:3001/health

3. **调度器服务器** (Demo7)
   - 后台服务，每分钟执行一次 AI 对话任务
   - 数据存储在共享数据卷中

4. **Redis**
   - 端口: 6379
   - 队列后端存储

5. **Ollama**
   - 端口: 11434
   - 地址: http://localhost:11434
   - ⚠️ 首次启动需要下载模型，可能需要几分钟

## 📋 常用命令 / Common Commands

```bash
# 启动所有服务
make run

# 使用本地 Ollama 启动（不下载大模型）
make run-local

# 查看服务状态
make status

# 查看所有日志
make logs

# 查看特定服务日志
make logs-app      # Web 服务器
make logs-queue    # 队列服务器
make logs-scheduler # 调度器服务器

# 检查服务健康状态
make check

# 停止所有服务
make stop

# 停止并删除容器
make down

# 查看帮助
make help
```

## 🔍 验证启动 / Verify Startup

启动后，运行以下命令检查服务状态：

```bash
make check
```

或手动检查：

```bash
# Web 服务器
curl http://localhost:3000/

# 队列服务器
curl http://localhost:3001/health

# Redis
docker exec grokforge-redis redis-cli ping

# Ollama
curl http://localhost:11434/api/tags
```

## 📝 注意事项 / Notes

1. **首次启动**: Ollama 需要下载模型（qwen3:latest），可能需要几分钟到几十分钟
2. **数据持久化**: 所有数据存储在 Docker 卷中，容器重启后数据不会丢失
3. **端口占用**: 确保端口 3000, 3001, 6379, 11434 没有被占用

## 📚 更多信息 / More Information

- **完整启动指南** (推荐): [`docs/START_GUIDE.md`](docs/START_GUIDE.md) - 包含平台特定说明、环境检查脚本和故障排查
- 详细的容器化部署文档: `docs/CONTAINER_DEPLOYMENT.md`
- 本地 Ollama 配置指南: `docs/LOCAL_OLLAMA_SETUP.md`

## 🆘 遇到问题? / Having Issues?

1. **运行环境检查脚本** / Run environment check scripts:
   - Windows: `.\scripts\check-env.ps1`
   - Linux/macOS: `./scripts/check-env.sh`
2. 查看日志: `make logs` 或 `.\scripts\docker-run.ps1 logs`
3. 检查服务状态: `make status` 或 `.\scripts\docker-run.ps1 status`
4. 检查健康状态: `make check` 或 `.\scripts\docker-run.ps1 check`
5. 查看详细文档:
   - **完整启动指南** (推荐): [`docs/START_GUIDE.md`](docs/START_GUIDE.md)
   - 容器化部署文档: `docs/CONTAINER_DEPLOYMENT.md`


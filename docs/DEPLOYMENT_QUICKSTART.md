# 快速部署指南 / Quick Deployment Guide

## 🚀 一键部署 / One-Command Deployment

### 开发环境 / Development

```bash
# Linux/macOS
docker-compose up -d

# Windows PowerShell
docker-compose up -d
```

### 生产环境 / Production

```bash
# Linux/macOS
docker-compose -f docker-compose.prod.yml up -d

# 或使用脚本
./scripts/deploy.sh prod

# Windows PowerShell
docker-compose -f docker-compose.prod.yml up -d

# 或使用脚本
.\scripts\deploy.ps1 prod
```

## 📋 部署前准备 / Pre-deployment Checklist

1. **安装 Docker 和 Docker Compose**
   ```bash
   # 检查安装
   docker --version
   docker-compose --version
   ```

2. **配置环境变量**
   ```bash
   cp env.example .env
   # 编辑 .env 文件
   ```

3. **确保端口可用**
   - 3000: 主应用
   - 3001: 队列服务器
   - 6379: Redis
   - 11434: Ollama

## 🔧 环境变量配置 / Environment Variables

最小配置（`.env` 文件）：

```env
APP_PORT=3000
QUEUE_PORT=3001
REDIS_HOST=redis
OLLAMA_HOST=ollama
```

生产环境推荐配置：

```env
APP_PORT=3000
QUEUE_PORT=3001
REDIS_HOST=redis
REDIS_PASSWORD=your-secure-password
OLLAMA_HOST=ollama
CORS_ORIGIN=https://yourdomain.com
NODE_ENV=production
```

## 📊 验证部署 / Verify Deployment

```bash
# 检查服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 测试应用
curl http://localhost:3000
curl http://localhost:3001/health
```

## 🆘 常见问题 / Common Issues

### 端口被占用 / Port Already in Use

```bash
# 修改 .env 文件中的端口
APP_PORT=3001
QUEUE_PORT=3002
```

### Ollama 模型未加载 / Ollama Model Not Loaded

```bash
# 手动拉取模型
docker exec -it grokforge-ollama ollama pull qwen3:latest
```

### Redis 连接失败 / Redis Connection Failed

```bash
# 检查 Redis 状态
docker-compose logs redis

# 测试连接
docker exec -it grokforge-redis redis-cli ping
```

## 📚 详细文档 / Detailed Documentation

- [完整部署指南（中文）](DEPLOYMENT_CN.md)
- [Full Deployment Guide (English)](DEPLOYMENT_EN.md)


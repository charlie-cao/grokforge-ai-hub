# 容器化部署总结 / Containerization Deployment Summary

## 📦 已创建的文件 / Created Files

### Docker 配置文件 / Docker Configuration Files

1. **Dockerfile** - 主应用镜像构建文件
   - 多阶段构建优化
   - 非 root 用户运行
   - 健康检查配置

2. **Dockerfile.queue** - 队列服务器镜像构建文件
   - 独立的队列服务镜像
   - 最小化依赖

3. **docker-compose.yml** - 开发环境配置
   - 包含所有服务（app, queue-server, redis, ollama）
   - 自动健康检查
   - 数据持久化

4. **docker-compose.prod.yml** - 生产环境配置
   - 资源限制
   - 重启策略
   - 安全配置

5. **.dockerignore** - Docker 构建忽略文件
   - 排除不必要的文件
   - 减小镜像大小

### 环境配置 / Environment Configuration

6. **env.example** - 环境变量示例文件
   - 所有可配置项
   - 默认值说明

### 部署脚本 / Deployment Scripts

7. **scripts/deploy.sh** - Linux/macOS 部署脚本
   - 一键部署
   - 自动检查
   - 模型拉取

8. **scripts/deploy.ps1** - Windows PowerShell 部署脚本
   - Windows 环境支持
   - 功能与 shell 脚本相同

### 文档 / Documentation

9. **docs/DEPLOYMENT_CN.md** - 完整部署指南（中文）
10. **docs/DEPLOYMENT_EN.md** - 完整部署指南（英文）
11. **docs/DEPLOYMENT_QUICKSTART.md** - 快速部署指南

## 🚀 快速开始 / Quick Start

### 1. 配置环境变量 / Configure Environment

```bash
cp env.example .env
# 编辑 .env 文件
```

### 2. 启动服务 / Start Services

```bash
# 开发环境
docker-compose up -d

# 生产环境
docker-compose -f docker-compose.prod.yml up -d
```

### 3. 验证部署 / Verify Deployment

```bash
# 检查服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 测试应用
curl http://localhost:3000
```

## 📊 服务架构 / Service Architecture

```
┌─────────────────┐
│   Application   │  Port: 3000
│   (Frontend)    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Queue Server   │  Port: 3001
│   (Demo6)       │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│     Redis       │  Port: 6379
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│    Ollama       │  Port: 11434
└─────────────────┘
```

## 🔧 配置说明 / Configuration

### 必需环境变量 / Required Environment Variables

- `APP_PORT` - 主应用端口（默认: 3000）
- `QUEUE_PORT` - 队列服务器端口（默认: 3001）
- `REDIS_HOST` - Redis 主机（默认: redis）
- `OLLAMA_HOST` - Ollama 主机（默认: ollama）

### 可选环境变量 / Optional Environment Variables

- `REDIS_PASSWORD` - Redis 密码（生产环境推荐）
- `CORS_ORIGIN` - CORS 来源（生产环境推荐）
- `OLLAMA_MODEL` - Ollama 模型（默认: qwen3:latest）

## 🔒 安全建议 / Security Recommendations

1. **设置 Redis 密码** - 生产环境必须
2. **限制 CORS 来源** - 防止跨域攻击
3. **使用 HTTPS** - 通过 Nginx 反向代理
4. **定期更新镜像** - 保持安全补丁最新
5. **配置防火墙** - 只开放必要端口

## 📈 性能优化 / Performance Optimization

1. **多阶段构建** - 减小镜像大小
2. **资源限制** - 防止资源耗尽
3. **健康检查** - 自动重启失败服务
4. **数据持久化** - Redis 和 Ollama 数据持久化

## 🆘 故障排除 / Troubleshooting

### 常见问题 / Common Issues

1. **端口冲突** - 修改 `.env` 中的端口配置
2. **内存不足** - 增加服务器内存或限制容器内存
3. **模型未加载** - 手动拉取模型：`docker exec -it grokforge-ollama ollama pull qwen3:latest`
4. **Redis 连接失败** - 检查 Redis 密码和网络配置

## 📚 相关文档 / Related Documentation

- [完整部署指南（中文）](DEPLOYMENT_CN.md)
- [Full Deployment Guide (English)](DEPLOYMENT_EN.md)
- [快速部署指南](DEPLOYMENT_QUICKSTART.md)

---

**部署愉快！** 🚀


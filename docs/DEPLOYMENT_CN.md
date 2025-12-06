# 容器化部署指南

本指南将帮助你使用 Docker 将 GrokForge AI Hub 部署到服务器。

## 📋 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少 4GB 可用内存
- 至少 10GB 可用磁盘空间（用于 Ollama 模型）

## 🚀 快速部署

### 方式 1: 使用 Docker Compose（推荐）

1. **克隆项目**
```bash
git clone https://github.com/charlie-cao/grokforge-ai-hub.git
cd grokforge-ai-hub
```

2. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件，设置你的配置
```

3. **启动所有服务**
```bash
docker-compose up -d
```

4. **查看服务状态**
```bash
docker-compose ps
```

5. **查看日志**
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f app
docker-compose logs -f queue-server
```

### 方式 2: 单独部署服务

#### 1. 启动 Redis
```bash
docker-compose -f docker-compose.demo6.yml up -d redis
```

#### 2. 启动 Ollama（如果使用容器化）
```bash
docker run -d \
  --name ollama \
  -p 11434:11434 \
  -v ollama-data:/root/.ollama \
  ollama/ollama:latest

# 拉取模型
docker exec -it ollama ollama pull qwen3:latest
```

#### 3. 构建应用镜像
```bash
docker build -t grokforge-ai-hub:latest .
```

#### 4. 运行应用容器
```bash
docker run -d \
  --name grokforge-app \
  -p 3000:3000 \
  --link redis:redis \
  --link ollama:ollama \
  -e REDIS_HOST=redis \
  -e OLLAMA_HOST=ollama \
  grokforge-ai-hub:latest
```

## 🔧 配置说明

### 环境变量

创建 `.env` 文件并配置以下变量：

```env
# 应用端口
APP_PORT=3000

# 队列服务器端口
QUEUE_PORT=3001

# Redis 配置
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your-secure-password  # 生产环境建议设置密码

# Ollama 配置
OLLAMA_HOST=ollama  # 或外部 Ollama 服务地址
OLLAMA_PORT=11434
OLLAMA_MODEL=qwen3:latest

# CORS 配置（生产环境建议设置具体域名）
CORS_ORIGIN=https://yourdomain.com
```

### 端口映射

- **3000**: 主应用（前端 + API）
- **3001**: 队列服务器（Demo6）
- **6379**: Redis
- **11434**: Ollama

## 🏗️ 生产环境部署

### 1. 使用外部 Redis（推荐）

如果已有 Redis 服务，修改 `docker-compose.yml`：

```yaml
services:
  app:
    environment:
      - REDIS_HOST=your-redis-host.com
      - REDIS_PORT=6379
      - REDIS_PASSWORD=your-password
    # 移除 depends_on: redis
```

### 2. 使用外部 Ollama

如果已有 Ollama 服务，修改 `docker-compose.yml`：

```yaml
services:
  app:
    environment:
      - OLLAMA_HOST=your-ollama-host.com
      - OLLAMA_PORT=11434
    # 移除 depends_on: ollama
```

### 3. 使用反向代理（Nginx）

创建 `nginx.conf`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /stream {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_buffering off;
        proxy_cache off;
        chunked_transfer_encoding on;
    }
}
```

### 4. 使用 HTTPS（Let's Encrypt）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d yourdomain.com
```

## 📊 监控和维护

### 查看容器状态
```bash
docker-compose ps
```

### 查看资源使用
```bash
docker stats
```

### 重启服务
```bash
docker-compose restart app
docker-compose restart queue-server
```

### 更新应用
```bash
# 拉取最新代码
git pull

# 重新构建镜像
docker-compose build

# 重启服务
docker-compose up -d
```

### 备份数据
```bash
# 备份 Redis 数据
docker exec grokforge-redis redis-cli SAVE
docker cp grokforge-redis:/data/dump.rdb ./backup/

# 备份 Ollama 模型
docker cp grokforge-ollama:/root/.ollama ./backup/ollama-data
```

## 🔒 安全建议

1. **设置 Redis 密码**
```env
REDIS_PASSWORD=strong-random-password
```

2. **限制 CORS 来源**
```env
CORS_ORIGIN=https://yourdomain.com
```

3. **使用非 root 用户运行容器**（已在 Dockerfile 中配置）

4. **定期更新镜像**
```bash
docker-compose pull
docker-compose up -d
```

5. **配置防火墙**
```bash
# 只开放必要端口
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 🐛 故障排除

### 容器无法启动
```bash
# 查看详细日志
docker-compose logs app

# 检查端口占用
netstat -tulpn | grep :3000
```

### Redis 连接失败
```bash
# 测试 Redis 连接
docker exec grokforge-redis redis-cli ping

# 检查 Redis 日志
docker-compose logs redis
```

### Ollama 模型未加载
```bash
# 进入 Ollama 容器
docker exec -it grokforge-ollama sh

# 手动拉取模型
ollama pull qwen3:latest

# 检查模型列表
ollama list
```

### 内存不足
如果遇到内存不足，可以：
1. 增加服务器内存
2. 限制容器内存使用：
```yaml
services:
  ollama:
    deploy:
      resources:
        limits:
          memory: 4G
```

## 📈 性能优化

### 1. 使用多阶段构建
已在使用，减少镜像大小。

### 2. 启用 Redis 持久化
已在配置中启用 `--appendonly yes`。

### 3. 配置 Ollama 缓存
Ollama 会自动缓存模型，无需额外配置。

### 4. 使用 CDN（可选）
将静态资源部署到 CDN 以提升加载速度。

## 🔄 持续部署（CI/CD）

### GitHub Actions 示例

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /path/to/grokforge-ai-hub
            git pull
            docker-compose build
            docker-compose up -d
```

## 📝 检查清单

部署前检查：

- [ ] 环境变量已配置
- [ ] Redis 密码已设置（生产环境）
- [ ] CORS 来源已限制（生产环境）
- [ ] 防火墙规则已配置
- [ ] SSL 证书已配置（HTTPS）
- [ ] 备份策略已制定
- [ ] 监控工具已配置
- [ ] 日志收集已配置

## 🆘 获取帮助

如果遇到问题：

1. 查看日志：`docker-compose logs`
2. 检查 GitHub Issues
3. 提交新的 Issue

---

**祝你部署顺利！** 🚀


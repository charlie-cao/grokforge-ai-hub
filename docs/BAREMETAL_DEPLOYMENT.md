# 裸机部署指南 / Bare Metal Deployment Guide

不使用 Docker，直接在服务器上运行所有服务。

## 前置要求 / Prerequisites

### 必需软件

1. **Bun** (v1.3.3+)
   ```bash
   curl -fsSL https://bun.sh/install | bash
   source ~/.bashrc  # 或重新打开终端
   bun --version
   ```

2. **Redis** (v7+)
   ```bash
   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install redis-server
   sudo systemctl start redis
   sudo systemctl enable redis
   
   # 验证
   redis-cli ping  # 应该返回 PONG
   ```

3. **Ollama** (最新版)
   ```bash
   # 安装
   curl -fsSL https://ollama.com/install.sh | sh
   
   # 启动服务
   ollama serve
   
   # 在另一个终端下载模型
   ollama pull qwen3:latest
   
   # 验证
   curl http://localhost:11434/api/tags
   ```

## 快速启动 / Quick Start

### 方式 1: 使用启动脚本（推荐）

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd grokforge-ai-hub

# 2. 安装依赖
bun install

# 3. 启动所有服务
chmod +x scripts/run-baremetal.sh
./scripts/run-baremetal.sh start

# 4. 查看服务状态
./scripts/run-baremetal.sh status

# 5. 查看日志
./scripts/run-baremetal.sh logs

# 6. 停止服务
./scripts/run-baremetal.sh stop
```

### 方式 2: 手动启动（分步）

#### 步骤 1: 启动 Redis（如果未运行）

```bash
# 检查 Redis 是否运行
redis-cli ping

# 如果未运行，启动 Redis
redis-server
# 或使用 systemd
sudo systemctl start redis
```

#### 步骤 2: 启动 Ollama（如果未运行）

```bash
# 启动 Ollama 服务
ollama serve

# 在另一个终端验证
curl http://localhost:11434/api/tags
```

#### 步骤 3: 启动 Queue Server

```bash
# 终端 1
export REDIS_HOST=localhost
export REDIS_PORT=6379
export OLLAMA_HOST=localhost
export OLLAMA_PORT=11434
export PORT=3001

bun run src/server/demo6-server.ts
```

#### 步骤 4: 启动 Scheduler Server

```bash
# 终端 2
export OLLAMA_HOST=localhost
export OLLAMA_PORT=11434

bun run src/server/demo7-scheduler-server.ts
```

#### 步骤 5: 启动主应用

```bash
# 终端 3
export NODE_ENV=production
export PORT=3000
export REDIS_HOST=localhost
export REDIS_PORT=6379
export OLLAMA_HOST=localhost
export OLLAMA_PORT=11434
export QUEUE_API_URL=http://localhost:3001

bun run start
# 或开发模式
bun dev
```

## 环境变量配置 / Environment Variables

### 主应用 (Main App)

```bash
export NODE_ENV=production          # 生产环境
export PORT=3000                   # 主应用端口
export REDIS_HOST=localhost         # Redis 主机
export REDIS_PORT=6379             # Redis 端口
export OLLAMA_HOST=localhost        # Ollama 主机
export OLLAMA_PORT=11434           # Ollama 端口
export QUEUE_API_URL=http://localhost:3001  # Queue Server URL
```

### Queue Server

```bash
export PORT=3001                   # Queue Server 端口
export REDIS_HOST=localhost         # Redis 主机
export REDIS_PORT=6379             # Redis 端口
export OLLAMA_HOST=localhost        # Ollama 主机
export OLLAMA_PORT=11434           # Ollama 端口
```

### Scheduler Server

```bash
export OLLAMA_HOST=localhost        # Ollama 主机
export OLLAMA_PORT=11434           # Ollama 端口
```

## 使用 systemd 管理服务（可选）

### 创建 systemd 服务文件

#### 1. Queue Server 服务

创建 `/etc/systemd/system/grokforge-queue.service`:

```ini
[Unit]
Description=GrokForge Queue Server
After=network.target redis.service

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/grokforge-ai-hub
Environment="PORT=3001"
Environment="REDIS_HOST=localhost"
Environment="REDIS_PORT=6379"
Environment="OLLAMA_HOST=localhost"
Environment="OLLAMA_PORT=11434"
ExecStart=/home/your-user/.bun/bin/bun run src/server/demo6-server.ts
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### 2. Scheduler Server 服务

创建 `/etc/systemd/system/grokforge-scheduler.service`:

```ini
[Unit]
Description=GrokForge Scheduler Server
After=network.target ollama.service

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/grokforge-ai-hub
Environment="OLLAMA_HOST=localhost"
Environment="OLLAMA_PORT=11434"
ExecStart=/home/your-user/.bun/bin/bun run src/server/demo7-scheduler-server.ts
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### 3. 主应用服务

创建 `/etc/systemd/system/grokforge-app.service`:

```ini
[Unit]
Description=GrokForge Main Application
After=network.target redis.service grokforge-queue.service

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/grokforge-ai-hub
Environment="NODE_ENV=production"
Environment="PORT=3000"
Environment="REDIS_HOST=localhost"
Environment="REDIS_PORT=6379"
Environment="OLLAMA_HOST=localhost"
Environment="OLLAMA_PORT=11434"
Environment="QUEUE_API_URL=http://localhost:3001"
ExecStart=/home/your-user/.bun/bin/bun run start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 启动 systemd 服务

```bash
# 重新加载 systemd
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start grokforge-queue
sudo systemctl start grokforge-scheduler
sudo systemctl start grokforge-app

# 设置开机自启
sudo systemctl enable grokforge-queue
sudo systemctl enable grokforge-scheduler
sudo systemctl enable grokforge-app

# 查看状态
sudo systemctl status grokforge-queue
sudo systemctl status grokforge-scheduler
sudo systemctl status grokforge-app

# 查看日志
sudo journalctl -u grokforge-queue -f
sudo journalctl -u grokforge-scheduler -f
sudo journalctl -u grokforge-app -f
```

## 使用 PM2 管理服务（推荐用于生产环境）

### 安装 PM2

```bash
npm install -g pm2
# 或使用 bun
bun add -g pm2
```

### 创建 PM2 配置文件

创建 `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'grokforge-queue',
      script: 'src/server/demo6-server.ts',
      interpreter: 'bun',
      env: {
        PORT: 3001,
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
        OLLAMA_HOST: 'localhost',
        OLLAMA_PORT: 11434,
      },
      error_file: './logs/queue-error.log',
      out_file: './logs/queue-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
    },
    {
      name: 'grokforge-scheduler',
      script: 'src/server/demo7-scheduler-server.ts',
      interpreter: 'bun',
      env: {
        OLLAMA_HOST: 'localhost',
        OLLAMA_PORT: 11434,
      },
      error_file: './logs/scheduler-error.log',
      out_file: './logs/scheduler-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '300M',
    },
    {
      name: 'grokforge-app',
      script: 'src/index.ts',
      interpreter: 'bun',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
        OLLAMA_HOST: 'localhost',
        OLLAMA_PORT: 11434,
        QUEUE_API_URL: 'http://localhost:3001',
      },
      error_file: './logs/app-error.log',
      out_file: './logs/app-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
    },
  ],
};
```

### 使用 PM2 管理

```bash
# 启动所有服务
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs

# 查看特定服务日志
pm2 logs grokforge-app
pm2 logs grokforge-queue
pm2 logs grokforge-scheduler

# 停止服务
pm2 stop all

# 重启服务
pm2 restart all

# 删除服务
pm2 delete all

# 保存当前配置（开机自启）
pm2 save
pm2 startup  # 生成启动脚本
```

## 验证服务 / Verify Services

### 检查主应用

```bash
curl http://localhost:3000/
```

### 检查 Queue Server

```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/queue/stats
```

### 检查 Redis

```bash
redis-cli ping  # 应该返回 PONG
```

### 检查 Ollama

```bash
curl http://localhost:11434/api/tags
```

## 故障排查 / Troubleshooting

### 问题 1: Bun 未找到

```bash
# 安装 Bun
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# 验证
bun --version
```

### 问题 2: Redis 连接失败

```bash
# 检查 Redis 是否运行
redis-cli ping

# 启动 Redis
sudo systemctl start redis
# 或
redis-server
```

### 问题 3: Ollama 连接失败

```bash
# 检查 Ollama 是否运行
curl http://localhost:11434/api/tags

# 启动 Ollama
ollama serve

# 确保模型已下载
ollama pull qwen3:latest
```

### 问题 4: 端口被占用

```bash
# 检查端口占用
lsof -i :3000
lsof -i :3001
lsof -i :6379
lsof -i :11434

# 杀死占用进程
kill -9 <PID>
```

### 问题 5: 内存不足

如果系统内存 < 1GB，建议：

1. **只启动必要的服务**：
   ```bash
   # 只启动主应用和 Queue Server
   PORT=3000 bun run start &
   PORT=3001 bun run src/server/demo6-server.ts &
   ```

2. **使用 swap**：
   ```bash
   # 创建 2GB swap
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

3. **限制内存使用**：
   ```bash
   # 使用 ulimit 限制内存
   ulimit -v 500000  # 500MB
   bun run start
   ```

## 性能优化 / Performance Optimization

### 1. 使用生产模式

```bash
export NODE_ENV=production
```

### 2. 限制并发

在低内存系统上，可以限制 Bun 的并发数：

```bash
export BUN_MAX_CONCURRENT_REQUESTS=10
```

### 3. 使用反向代理（Nginx）

创建 `/etc/nginx/sites-available/grokforge`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 总结 / Summary

裸机部署的优势：
- ✅ 不需要 Docker，节省资源
- ✅ 更直接的控制和调试
- ✅ 适合低内存系统（<1GB RAM）
- ✅ 更容易监控和优化

推荐使用：
- **开发环境**: 使用启动脚本 `./scripts/run-baremetal.sh`
- **生产环境**: 使用 PM2 或 systemd 管理服务


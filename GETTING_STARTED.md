# 快速开始指南 / Getting Started Guide

> 📖 **完整启动指南**: 查看 [完整启动指南](docs/START_GUIDE.md) 获取详细的平台特定说明、环境检查脚本和故障排查。
> 
> 📖 **Complete Startup Guide**: See [Complete Startup Guide](docs/START_GUIDE.md) for detailed platform-specific instructions, environment check scripts, and troubleshooting.

## 🚀 三步快速启动 / Three-Step Quick Start

### 步骤 1: 检查环境 / Step 1: Check Environment

在启动前，运行环境检查脚本：

Before starting, run the environment check scripts:

#### Windows

```powershell
.\scripts\check-env.ps1
```

#### Linux / macOS

```bash
chmod +x scripts/check-env.sh
./scripts/check-env.sh
```

### 步骤 2: 选择启动方式 / Step 2: Choose Startup Method

#### 方式 A: 使用容器中的 Ollama（首次启动会下载模型）

**Windows:**
```powershell
.\scripts\docker-run.ps1 run
```

**Linux / macOS:**
```bash
make run
```

**通用方式:**
```bash
docker-compose up -d
```

#### 方式 B: 使用本地 Ollama（不下载大模型，节省磁盘空间）

**前提条件**: 确保本地 Ollama 正在运行 (`ollama serve`)

**Windows:**
```powershell
.\scripts\docker-run.ps1 run-local
```

**Linux / macOS:**
```bash
make run-local
```

**通用方式:**
```bash
docker-compose -f docker-compose.yml -f docker-compose.local-ollama.yml up -d
```

### 步骤 3: 验证启动 / Step 3: Verify Startup

#### Windows

```powershell
.\scripts\docker-run.ps1 check
```

#### Linux / macOS

```bash
make check
```

#### 手动验证

访问以下地址验证服务：

- Web 服务器: http://localhost:3000
- 队列服务器: http://localhost:3001/health
- Redis: 检查容器运行状态
- Ollama: http://localhost:11434/api/tags

---

## 📋 平台特定说明 / Platform-Specific Instructions

### 🪟 Windows

#### 必需工具

1. **Docker Desktop** - 下载并安装: https://www.docker.com/products/docker-desktop
2. **PowerShell** - Windows 10/11 已内置

#### 启动步骤

```powershell
# 1. 检查环境
.\scripts\check-env.ps1

# 2. 启动服务
.\scripts\docker-run.ps1 run
# 或使用本地 Ollama
.\scripts\docker-run.ps1 run-local

# 3. 检查状态
.\scripts\docker-run.ps1 status
.\scripts\docker-run.ps1 check
```

#### 常见问题

- **Docker Desktop 未运行**: 启动 Docker Desktop 应用
- **脚本执行错误**: 运行 `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

---

### 🐧 Linux

#### 必需工具

1. **Docker** - 安装: `sudo apt install docker.io docker-compose` (Ubuntu/Debian)
2. **Make** (可选，推荐) - 安装: `sudo apt install make`

#### 启动步骤

```bash
# 1. 检查环境
chmod +x scripts/check-env.sh
./scripts/check-env.sh

# 2. 启动服务
make run
# 或使用本地 Ollama
make run-local

# 3. 检查状态
make status
make check
```

#### 常见问题

- **Docker 权限错误**: 运行 `sudo usermod -aG docker $USER` 然后重新登录
- **Docker 服务未运行**: 运行 `sudo systemctl start docker`
- **本地 Ollama 连接失败**: 设置 `export OLLAMA_HOST=172.17.0.1` 然后启动

---

### 🍎 macOS

#### 必需工具

1. **Docker Desktop** - 下载并安装: https://www.docker.com/products/docker-desktop
2. **Make** - 通常已内置，或通过 Xcode Command Line Tools 安装

#### 启动步骤

```bash
# 1. 检查环境
chmod +x scripts/check-env.sh
./scripts/check-env.sh

# 2. 启动服务
make run
# 或使用本地 Ollama
make run-local

# 3. 检查状态
make status
make check
```

#### 常见问题

- **Docker Desktop 未运行**: 启动 Docker Desktop 应用
- **端口占用**: 使用 `lsof -i :PORT` 查找并终止占用进程

---

## 🛠️ 环境检查脚本说明 / Environment Check Scripts

### Windows (`scripts/check-env.ps1`)

检查项目：
- ✅ Docker 安装和版本
- ✅ Docker Compose 安装和版本
- ✅ Docker 守护进程运行状态
- ✅ 端口占用情况 (3000, 3001, 6379, 11434)
- ✅ 本地 Ollama（可选）
- ✅ Make（可选）

### Linux / macOS (`scripts/check-env.sh`)

检查项目：
- ✅ Docker 安装和版本
- ✅ Docker Compose 安装和版本
- ✅ Docker 守护进程运行状态
- ✅ 端口占用情况 (3000, 3001, 6379, 11434)
- ✅ 本地 Ollama（可选）
- ✅ Make（可选）

---

## 📖 相关文档 / Related Documentation

- **完整启动指南**: [`docs/START_GUIDE.md`](docs/START_GUIDE.md) - 详细的平台特定说明
- **快速启动**: [`QUICKSTART.md`](QUICKSTART.md) - 快速参考
- **容器化部署**: [`docs/CONTAINER_DEPLOYMENT.md`](docs/CONTAINER_DEPLOYMENT.md) - 详细部署文档
- **本地 Ollama 配置**: [`docs/LOCAL_OLLAMA_SETUP.md`](docs/LOCAL_OLLAMA_SETUP.md) - 使用本地 Ollama

---

## 🆘 需要帮助? / Need Help?

如果遇到问题：

1. 运行环境检查脚本
2. 查看服务日志: `make logs` 或 `.\scripts\docker-run.ps1 logs`
3. 查看完整启动指南: [`docs/START_GUIDE.md`](docs/START_GUIDE.md)

---

祝使用愉快！Happy coding! 🚀


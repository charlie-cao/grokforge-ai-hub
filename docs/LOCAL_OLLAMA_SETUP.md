# 使用本地 Ollama 服务 / Using Local Ollama Service

## 概述 / Overview

为了节省磁盘空间，你可以使用本地已安装的 Ollama 服务，而不是在 Docker 容器中运行 Ollama。这样可以避免下载大模型文件。

To save disk space, you can use your locally installed Ollama service instead of running Ollama in a Docker container. This avoids downloading large model files.

## 快速开始 / Quick Start

### 方式 1: 使用 Makefile (推荐 / Recommended)

```bash
# Linux/macOS
make run-local

# Windows PowerShell (如果没有 make)
.\scripts\docker-run.ps1 run-local
```

### 方式 2: 使用 Docker Compose

```bash
docker-compose -f docker-compose.yml -f docker-compose.local-ollama.yml up -d
```

## 前提条件 / Prerequisites

### 1. 确保本地 Ollama 正在运行

```bash
# 启动 Ollama 服务
ollama serve

# 验证 Ollama 是否运行
curl http://localhost:11434/api/tags
```

### 2. 确保 Ollama 监听在端口 11434

默认情况下，Ollama 监听在 `http://localhost:11434`。如果你的配置不同，需要设置环境变量：

```bash
export OLLAMA_HOST=your-host
export OLLAMA_PORT=your-port
```

## 平台特定配置 / Platform-Specific Configuration

### Windows / macOS

在 Windows 和 macOS 上，Docker Desktop 自动支持 `host.docker.internal`，无需额外配置。

On Windows and macOS, Docker Desktop automatically supports `host.docker.internal`, no additional configuration needed.

### Linux

在 Linux 上，`host.docker.internal` 可能不可用。你需要：

1. **使用环境变量指定主机 IP**:

```bash
# 获取主机 IP（方法 1：使用 docker 网络）
export OLLAMA_HOST=$(docker network inspect bridge | grep Gateway | cut -d'"' -f4)

# 或方法 2：使用主机 IP 地址
export OLLAMA_HOST=172.17.0.1  # Docker 默认网关

# 或方法 3：使用实际的主机 IP
export OLLAMA_HOST=192.168.1.100  # 替换为你的实际 IP

# 然后启动
docker-compose -f docker-compose.yml -f docker-compose.local-ollama.yml up -d
```

2. **或者修改 docker-compose.local-ollama.yml**:

编辑 `docker-compose.local-ollama.yml`，将 `host.docker.internal` 替换为你的主机 IP 地址。

3. **或者使用 host 网络模式** (不推荐，有安全风险):

在 `docker-compose.local-ollama.yml` 中为每个服务添加：
```yaml
network_mode: "host"
```

## 验证配置 / Verify Configuration

启动服务后，检查容器能否访问本地 Ollama：

```bash
# 进入容器
docker exec -it grokforge-ai-hub sh

# 在容器内测试连接
curl http://host.docker.internal:11434/api/tags

# 或使用你配置的主机地址
curl http://YOUR_HOST_IP:11434/api/tags
```

## 常见问题 / Troubleshooting

### 问题 1: 容器无法连接到本地 Ollama

**原因**: `host.docker.internal` 在 Linux 上不可用

**解决方案**:
- 使用环境变量 `OLLAMA_HOST` 指定主机 IP
- 或者使用 `--network host` 模式（不推荐）

### 问题 2: 连接被拒绝

**原因**: 本地 Ollama 未运行或端口不正确

**解决方案**:
```bash
# 检查 Ollama 是否运行
ps aux | grep ollama

# 检查端口
netstat -tuln | grep 11434

# 重启 Ollama
ollama serve
```

### 问题 3: 防火墙阻止连接

**原因**: 防火墙阻止容器访问主机服务

**解决方案**:
```bash
# Linux: 检查防火墙规则
sudo iptables -L

# 如果需要，允许 Docker 网络访问
sudo iptables -I DOCKER-USER -i docker0 -j ACCEPT
```

## 环境变量配置 / Environment Variables

你可以通过环境变量自定义 Ollama 连接：

```bash
# 设置自定义主机和端口
export OLLAMA_HOST=192.168.1.100
export OLLAMA_PORT=11434

# 启动服务
docker-compose -f docker-compose.yml -f docker-compose.local-ollama.yml up -d
```

或在 `.env` 文件中配置：

```env
OLLAMA_HOST=host.docker.internal
OLLAMA_PORT=11434
```

## 优势 / Advantages

✅ **节省磁盘空间**: 不需要下载大模型文件到 Docker 卷中  
✅ **共享模型**: 多个容器可以使用相同的本地模型  
✅ **更快启动**: 不需要等待 Ollama 容器启动和下载模型  
✅ **更灵活**: 可以在主机上直接管理和更新模型

## 注意事项 / Notes

⚠️ **确保本地 Ollama 始终运行**: 如果本地 Ollama 服务停止，容器中的服务将无法工作  
⚠️ **网络配置**: Linux 上可能需要额外的网络配置  
⚠️ **安全性**: 确保本地 Ollama 服务的访问控制配置正确

## 相关文档 / Related Documentation

- 容器化部署指南: `docs/CONTAINER_DEPLOYMENT.md`
- 快速启动指南: `QUICKSTART.md`


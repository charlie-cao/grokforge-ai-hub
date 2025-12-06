# 完整启动指南 / Complete Startup Guide

## 概述 / Overview

本指南将帮助你检查系统环境并正确启动项目，适用于 Windows、Linux 和 macOS 平台。

This guide will help you check your system environment and start the project correctly on Windows, Linux, and macOS platforms.

---

## 1. 系统要求检查 / System Requirements Check

### 自动化检查脚本 / Automated Check Scripts

我们提供了自动化检查脚本来验证你的环境是否满足要求：

We provide automated check scripts to verify if your environment meets the requirements:

#### Windows (PowerShell)

```powershell
# 运行环境检查脚本
.\scripts\check-env.ps1
```

#### Linux / macOS

```bash
# 运行环境检查脚本
chmod +x scripts/check-env.sh
./scripts/check-env.sh
```

### 手动检查 / Manual Check

#### 必需的依赖 / Required Dependencies

1. **Docker** (v20.10+)
   ```bash
   # Windows PowerShell
   docker --version
   
   # Linux / macOS
   docker --version
   ```

2. **Docker Compose** (v2.0+)
   ```bash
   # Windows PowerShell
   docker-compose --version
   
   # Linux / macOS
   docker-compose --version
   ```

3. **Make** (可选，推荐用于 Linux/macOS)
   ```bash
   # Linux / macOS
   make --version
   
   # Windows - Make 不是必需的，可以使用 PowerShell 脚本代替
   ```

#### 可选的依赖 / Optional Dependencies

4. **本地 Ollama** (如果使用本地 Ollama 模式)
   ```bash
   ollama --version
   ```

---

## 2. 端口占用检查 / Port Availability Check

在启动服务前，确保以下端口未被占用：

Before starting services, ensure the following ports are not in use:

### Windows PowerShell

```powershell
# 检查端口占用
function Test-Port {
    param($port)
    $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
    return $connection.TcpTestSucceeded
}

Write-Host "检查端口占用状态:"
Write-Host "  端口 3000 (Web Server): $(if (Test-Port 3000) { '占用' } else { '可用' })"
Write-Host "  端口 3001 (Queue Server): $(if (Test-Port 3001) { '占用' } else { '可用' })"
Write-Host "  端口 6379 (Redis): $(if (Test-Port 6379) { '占用' } else { '可用' })"
Write-Host "  端口 11434 (Ollama): $(if (Test-Port 11434) { '占用' } else { '可用' })"
```

### Linux / macOS

```bash
# 检查端口占用
echo "检查端口占用状态:"
for port in 3000 3001 6379 11434; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo "  端口 $port: 占用"
    else
        echo "  端口 $port: 可用"
    fi
done
```

### 通用方法（使用 netstat）

```bash
# Windows
netstat -ano | findstr ":3000 :3001 :6379 :11434"

# Linux
netstat -tuln | grep -E ":(3000|3001|6379|11434)"

# macOS
lsof -i :3000 -i :3001 -i :6379 -i :11434
```

---

## 3. 平台特定启动指南 / Platform-Specific Startup Guide

### 🪟 Windows

#### 方式 1: 使用 PowerShell 脚本（推荐）

```powershell
# 1. 检查环境
.\scripts\check-env.ps1

# 2. 启动所有服务（包括容器中的 Ollama）
.\scripts\docker-run.ps1 run

# 3. 或者使用本地 Ollama（不下载大模型）
.\scripts\docker-run.ps1 run-local
```

#### 方式 2: 使用 Docker Compose 直接启动

```powershell
# 启动所有服务
docker-compose up -d

# 使用本地 Ollama
docker-compose -f docker-compose.yml -f docker-compose.local-ollama.yml up -d
```

#### 方式 3: 使用 Make（如果已安装）

如果你在 Windows 上安装了 Make（通过 Chocolatey 或其他方式）：

```powershell
# 安装 Make（如果未安装）
choco install make

# 使用 Make 命令
make run
make run-local
```

**Windows 特定注意事项：**

- 确保 Docker Desktop 正在运行
- 确保 WSL2 已启用（如果使用 WSL2 后端）
- PowerShell 执行策略：如果遇到脚本执行错误，运行：
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

---

### 🐧 Linux

#### 方式 1: 使用 Make（推荐）

```bash
# 1. 检查环境
chmod +x scripts/check-env.sh
./scripts/check-env.sh

# 2. 启动所有服务
make run

# 3. 使用本地 Ollama
make run-local
```

#### 方式 2: 使用 Docker Compose

```bash
# 启动所有服务
docker-compose up -d

# 使用本地 Ollama（需要配置主机 IP）
export OLLAMA_HOST=172.17.0.1  # Docker 默认网关，或使用你的主机 IP
docker-compose -f docker-compose.yml -f docker-compose.local-ollama.yml up -d
```

**Linux 特定注意事项：**

- 确保 Docker 服务正在运行：
  ```bash
  sudo systemctl status docker
  # 如果未运行，启动它：
  sudo systemctl start docker
  ```
- 确保当前用户在 docker 组中：
  ```bash
  sudo usermod -aG docker $USER
  # 重新登录后生效
  ```
- 本地 Ollama 连接：Linux 上 `host.docker.internal` 可能不可用，需要设置 `OLLAMA_HOST` 环境变量指向主机 IP

---

### 🍎 macOS

#### 方式 1: 使用 Make（推荐）

```bash
# 1. 检查环境
chmod +x scripts/check-env.sh
./scripts/check-env.sh

# 2. 启动所有服务
make run

# 3. 使用本地 Ollama
make run-local
```

#### 方式 2: 使用 Docker Compose

```bash
# 启动所有服务
docker-compose up -d

# 使用本地 Ollama
docker-compose -f docker-compose.yml -f docker-compose.local-ollama.yml up -d
```

**macOS 特定注意事项：**

- 确保 Docker Desktop 正在运行
- 如果遇到权限问题，确保 Docker Desktop 有足够的资源分配（至少 4GB RAM）
- 本地 Ollama：macOS 支持 `host.docker.internal`，无需额外配置

---

## 4. 环境检查脚本 / Environment Check Scripts

### Windows PowerShell 检查脚本

创建 `scripts/check-env.ps1`：

```powershell
# Environment Check Script for Windows
Write-Host "🔍 检查系统环境..." -ForegroundColor Green
Write-Host ""

$errors = @()
$warnings = @()

# Check Docker
Write-Host -NoNewline "检查 Docker: "
try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ $dockerVersion" -ForegroundColor Green
    } else {
        $errors += "Docker 未安装或未在 PATH 中"
        Write-Host "✗ Docker 未安装" -ForegroundColor Red
    }
} catch {
    $errors += "Docker 未安装或未在 PATH 中"
    Write-Host "✗ Docker 未安装" -ForegroundColor Red
}

# Check Docker Compose
Write-Host -NoNewline "检查 Docker Compose: "
try {
    $composeVersion = docker-compose --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ $composeVersion" -ForegroundColor Green
    } else {
        $errors += "Docker Compose 未安装"
        Write-Host "✗ Docker Compose 未安装" -ForegroundColor Red
    }
} catch {
    $errors += "Docker Compose 未安装"
    Write-Host "✗ Docker Compose 未安装" -ForegroundColor Red
}

# Check Docker daemon
Write-Host -NoNewline "检查 Docker 守护进程: "
try {
    docker info | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 运行中" -ForegroundColor Green
    } else {
        $errors += "Docker 守护进程未运行"
        Write-Host "✗ 未运行" -ForegroundColor Red
    }
} catch {
    $errors += "Docker 守护进程未运行"
    Write-Host "✗ 未运行" -ForegroundColor Red
}

# Check ports
Write-Host ""
Write-Host "检查端口占用:" -ForegroundColor Yellow
function Test-Port {
    param($port, $service)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue -InformationLevel Quiet
        if ($connection) {
            Write-Host "  ✗ 端口 $port ($service): 占用" -ForegroundColor Red
            $warnings += "端口 $port ($service) 被占用，可能导致服务启动失败"
        } else {
            Write-Host "  ✓ 端口 $port ($service): 可用" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ✓ 端口 $port ($service): 可用" -ForegroundColor Green
    }
}

Test-Port 3000 "Web Server"
Test-Port 3001 "Queue Server"
Test-Port 6379 "Redis"
Test-Port 11434 "Ollama"

# Check optional Ollama
Write-Host ""
Write-Host -NoNewline "检查本地 Ollama (可选): "
try {
    $ollamaVersion = ollama --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 已安装 $ollamaVersion" -ForegroundColor Green
        Write-Host "  提示: 可以使用 'make run-local' 使用本地 Ollama" -ForegroundColor Cyan
    } else {
        Write-Host "未安装（可选）" -ForegroundColor Yellow
    }
} catch {
    Write-Host "未安装（可选）" -ForegroundColor Yellow
}

# Summary
Write-Host ""
if ($errors.Count -eq 0) {
    Write-Host "✅ 环境检查通过！" -ForegroundColor Green
    if ($warnings.Count -gt 0) {
        Write-Host ""
        Write-Host "⚠️  警告:" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "  - $warning" -ForegroundColor Yellow
        }
    }
    Write-Host ""
    Write-Host "可以开始启动服务了：" -ForegroundColor Cyan
    Write-Host "  .\scripts\docker-run.ps1 run" -ForegroundColor White
} else {
    Write-Host "❌ 环境检查失败：" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  - $error" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "请先解决上述问题后再继续。" -ForegroundColor Yellow
}
```

### Linux / macOS 检查脚本

创建 `scripts/check-env.sh`：

```bash
#!/bin/bash

# Environment Check Script for Linux/macOS

echo "🔍 检查系统环境..."
echo ""

ERRORS=()
WARNINGS=()

# Check Docker
echo -n "检查 Docker: "
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version 2>&1)
    echo "✓ $DOCKER_VERSION"
else
    ERRORS+=("Docker 未安装或未在 PATH 中")
    echo "✗ Docker 未安装"
fi

# Check Docker Compose
echo -n "检查 Docker Compose: "
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version 2>&1)
    echo "✓ $COMPOSE_VERSION"
else
    ERRORS+=("Docker Compose 未安装")
    echo "✗ Docker Compose 未安装"
fi

# Check Docker daemon
echo -n "检查 Docker 守护进程: "
if docker info &> /dev/null; then
    echo "✓ 运行中"
else
    ERRORS+=("Docker 守护进程未运行")
    echo "✗ 未运行"
fi

# Check ports
echo ""
echo "检查端口占用:"

check_port() {
    local port=$1
    local service=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 || (command -v netstat &> /dev/null && netstat -tuln 2>/dev/null | grep -q ":$port "); then
        echo "  ✗ 端口 $port ($service): 占用"
        WARNINGS+=("端口 $port ($service) 被占用，可能导致服务启动失败")
    else
        echo "  ✓ 端口 $port ($service): 可用"
    fi
}

check_port 3000 "Web Server"
check_port 3001 "Queue Server"
check_port 6379 "Redis"
check_port 11434 "Ollama"

# Check optional Ollama
echo ""
echo -n "检查本地 Ollama (可选): "
if command -v ollama &> /dev/null; then
    OLLAMA_VERSION=$(ollama --version 2>&1)
    echo "✓ 已安装 $OLLAMA_VERSION"
    echo "  提示: 可以使用 'make run-local' 使用本地 Ollama"
else
    echo "未安装（可选）"
fi

# Check Make (optional but recommended)
echo ""
echo -n "检查 Make (可选): "
if command -v make &> /dev/null; then
    MAKE_VERSION=$(make --version | head -n 1)
    echo "✓ 已安装 $MAKE_VERSION"
else
    echo "未安装（可选，推荐安装以便使用 make 命令）"
fi

# Summary
echo ""
if [ ${#ERRORS[@]} -eq 0 ]; then
    echo "✅ 环境检查通过！"
    if [ ${#WARNINGS[@]} -gt 0 ]; then
        echo ""
        echo "⚠️  警告:"
        for warning in "${WARNINGS[@]}"; do
            echo "  - $warning"
        done
    fi
    echo ""
    echo "可以开始启动服务了："
    echo "  make run"
else
    echo "❌ 环境检查失败："
    for error in "${ERRORS[@]}"; do
        echo "  - $error"
    done
    echo ""
    echo "请先解决上述问题后再继续。"
    exit 1
fi
```

---

## 5. 启动后验证 / Post-Startup Verification

### 检查服务状态

#### Windows PowerShell

```powershell
# 使用脚本检查
.\scripts\docker-run.ps1 check

# 或手动检查
docker-compose ps
```

#### Linux / macOS

```bash
# 使用 Make 检查
make check

# 或手动检查
docker-compose ps
```

### 健康检查

#### Windows PowerShell

```powershell
# Web Server
Invoke-WebRequest -Uri http://localhost:3000/ -UseBasicParsing

# Queue Server
Invoke-WebRequest -Uri http://localhost:3001/health -UseBasicParsing

# Redis
docker exec grokforge-redis redis-cli ping

# Ollama
Invoke-WebRequest -Uri http://localhost:11434/api/tags -UseBasicParsing
```

#### Linux / macOS

```bash
# Web Server
curl http://localhost:3000/

# Queue Server
curl http://localhost:3001/health

# Redis
docker exec grokforge-redis redis-cli ping

# Ollama
curl http://localhost:11434/api/tags
```

---

## 6. 常见问题排查 / Troubleshooting

### 问题 1: Docker 未运行

**Windows:**
- 启动 Docker Desktop
- 等待 Docker 完全启动（系统托盘图标不再显示"正在启动"）

**Linux:**
```bash
sudo systemctl start docker
sudo systemctl enable docker  # 设置开机自启
```

**macOS:**
- 启动 Docker Desktop 应用

### 问题 2: 端口被占用

**Windows PowerShell:**
```powershell
# 查找占用端口的进程
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess
# 终止进程（替换 PID）
Stop-Process -Id <PID>
```

**Linux:**
```bash
# 查找占用端口的进程
sudo lsof -i :3000
# 终止进程
sudo kill -9 <PID>
```

**macOS:**
```bash
# 查找占用端口的进程
lsof -i :3000
# 终止进程
kill -9 <PID>
```

### 问题 3: 权限错误

**Linux:**
```bash
# 将当前用户添加到 docker 组
sudo usermod -aG docker $USER
# 重新登录或执行
newgrp docker
```

### 问题 4: 本地 Ollama 连接失败（Linux）

**解决方案:**
```bash
# 获取 Docker 网关 IP
export OLLAMA_HOST=$(docker network inspect bridge | grep Gateway | cut -d'"' -f4)

# 或手动设置主机 IP
export OLLAMA_HOST=172.17.0.1

# 然后启动
docker-compose -f docker-compose.yml -f docker-compose.local-ollama.yml up -d
```

---

## 7. 快速参考命令 / Quick Reference

### 启动服务

| 平台 | 使用容器 Ollama | 使用本地 Ollama |
|------|----------------|----------------|
| Windows | `.\scripts\docker-run.ps1 run` | `.\scripts\docker-run.ps1 run-local` |
| Linux/macOS | `make run` | `make run-local` |
| 通用 | `docker-compose up -d` | `docker-compose -f docker-compose.yml -f docker-compose.local-ollama.yml up -d` |

### 检查状态

| 平台 | 命令 |
|------|------|
| Windows | `.\scripts\docker-run.ps1 status` 或 `.\scripts\docker-run.ps1 check` |
| Linux/macOS | `make status` 或 `make check` |
| 通用 | `docker-compose ps` |

### 查看日志

| 平台 | 命令 |
|------|------|
| Windows | `.\scripts\docker-run.ps1 logs` |
| Linux/macOS | `make logs` |
| 通用 | `docker-compose logs -f` |

### 停止服务

| 平台 | 命令 |
|------|------|
| Windows | `.\scripts\docker-run.ps1 stop` |
| Linux/macOS | `make stop` |
| 通用 | `docker-compose stop` |

---

## 8. 获取帮助 / Getting Help

如果遇到问题：

1. **查看日志**: 使用 `make logs` 或 `.\scripts\docker-run.ps1 logs`
2. **检查状态**: 使用 `make status` 或 `.\scripts\docker-run.ps1 status`
3. **查看详细文档**:
   - 容器化部署: `docs/CONTAINER_DEPLOYMENT.md`
   - 本地 Ollama 配置: `docs/LOCAL_OLLAMA_SETUP.md`
   - 快速开始: `QUICKSTART.md`

---

## 总结 / Summary

1. ✅ 运行环境检查脚本
2. ✅ 确保所有端口可用
3. ✅ 根据平台选择启动方式
4. ✅ 验证服务启动成功
5. ✅ 访问 http://localhost:3000 开始使用

祝使用愉快！Happy coding! 🚀


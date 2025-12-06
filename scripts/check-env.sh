#!/bin/bash

# Environment Check Script for Linux/macOS
# 环境检查脚本 - Linux/macOS 版本

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
    echo "  安装: sudo apt install make (Ubuntu/Debian) 或 brew install make (macOS)"
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
    echo "  make run        # 使用容器中的 Ollama"
    echo "  make run-local  # 使用本地 Ollama"
    exit 0
else
    echo "❌ 环境检查失败："
    for error in "${ERRORS[@]}"; do
        echo "  - $error"
    done
    echo ""
    echo "请先解决上述问题后再继续。"
    echo ""
    echo "安装指南:"
    echo "  Docker: https://docs.docker.com/get-docker/"
    echo "  Make: sudo apt install make (Linux) 或 brew install make (macOS)"
    exit 1
fi


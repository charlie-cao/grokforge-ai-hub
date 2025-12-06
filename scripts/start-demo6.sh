#!/bin/bash

# Demo6 启动脚本
# 启动 Redis (Docker) 和队列服务器

echo "🚀 启动 Demo6: AI 对话队列系统"
echo ""

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

# 检查 Redis 容器是否已运行
if docker ps | grep -q demo6-redis; then
    echo "✅ Redis 容器已在运行"
else
    echo "📦 启动 Redis 容器..."
    docker-compose -f docker-compose.demo6.yml up -d
    sleep 2
fi

# 检查 Ollama 是否运行
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Ollama 服务已运行"
else
    echo "⚠️  警告: Ollama 服务未运行，请确保 Ollama 在 http://localhost:11434 运行"
    echo "   启动命令: ollama serve"
fi

# 启动队列服务器
echo ""
echo "🔧 启动队列服务器 (端口 3001)..."
echo "   前端服务: http://localhost:3000/demo6"
echo "   队列 API: http://localhost:3001"
echo ""

bun run src/server/demo6-server.ts


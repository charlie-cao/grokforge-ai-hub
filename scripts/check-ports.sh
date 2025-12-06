#!/bin/bash

# 端口检查脚本
# 检查哪些端口被占用

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🔍 端口占用检查${NC}"
echo ""

check_port() {
    local port=$1
    local name=$2
    
    if command -v ss > /dev/null; then
        result=$(ss -tlnp | grep ":$port " || true)
    else
        result=$(netstat -tlnp 2>/dev/null | grep ":$port " || true)
    fi
    
    if [ -n "$result" ]; then
        pid=$(echo "$result" | awk '{print $NF}' | cut -d'/' -f1 | grep -o '[0-9]*' | head -1)
        process=$(ps -p "$pid" -o comm= 2>/dev/null || echo "unknown")
        echo -e "${RED}❌ 端口 $port ($name) 被占用${NC}"
        echo "   进程: $process (PID: $pid)"
        echo "   详情: $result"
        return 1
    else
        echo -e "${GREEN}✅ 端口 $port ($name) 可用${NC}"
        return 0
    fi
}

# 检查常用端口
check_port 3000 "主应用"
check_port 3001 "Queue Server"
check_port 6379 "Redis"
check_port 11434 "Ollama"

echo ""

# 检查 Redis 是否运行
echo -e "${YELLOW}检查 Redis 服务...${NC}"
if redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis 正在运行（本地服务）${NC}"
    redis_version=$(redis-cli --version 2>/dev/null || echo "unknown")
    echo "   版本: $redis_version"
    echo ""
    echo -e "${YELLOW}💡 建议: 使用本地 Redis，避免端口冲突${NC}"
    echo "   使用: docker compose -f docker-compose.yml -f docker-compose.local-services.yml up -d"
else
    echo -e "${YELLOW}⚠️  Redis 未运行${NC}"
fi

echo ""

# 检查 Ollama 是否运行
echo -e "${YELLOW}检查 Ollama 服务...${NC}"
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Ollama 正在运行（本地服务）${NC}"
    echo ""
    echo -e "${YELLOW}💡 建议: 使用本地 Ollama，避免下载大镜像${NC}"
    echo "   使用: docker compose -f docker-compose.yml -f docker-compose.local-services.yml up -d"
else
    echo -e "${YELLOW}⚠️  Ollama 未运行${NC}"
fi

echo ""

# 解决方案
echo -e "${GREEN}📋 解决方案:${NC}"
echo ""
echo "如果端口被占用，可以选择："
echo ""
echo "1. 停止本地服务（如果不需要）:"
echo "   sudo systemctl stop redis"
echo "   pkill ollama"
echo ""
echo "2. 使用本地服务（推荐）:"
echo "   docker compose -f docker-compose.yml -f docker-compose.local-services.yml up -d"
echo ""
echo "3. 只使用本地 Redis:"
echo "   # 修改 docker-compose.yml，注释掉 redis 服务"
echo "   # 设置 REDIS_HOST=host.docker.internal"
echo ""


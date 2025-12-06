#!/bin/bash

# GrokForge AI Hub - 裸机运行脚本
# 不使用 Docker，直接在服务器上运行所有服务

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查 Bun 是否安装
if ! command -v bun &> /dev/null; then
    echo -e "${RED}❌ Bun 未安装！${NC}"
    echo "请先安装 Bun: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

# 检查 Redis 是否运行
if ! command -v redis-cli &> /dev/null; then
    echo -e "${YELLOW}⚠️  Redis CLI 未找到，请确保 Redis 服务正在运行${NC}"
else
    if ! redis-cli ping &> /dev/null; then
        echo -e "${YELLOW}⚠️  Redis 未运行，请先启动 Redis${NC}"
        echo "启动 Redis: redis-server 或 systemctl start redis"
    else
        echo -e "${GREEN}✅ Redis 正在运行${NC}"
    fi
fi

# 检查 Ollama 是否运行
if ! curl -s http://localhost:11434/api/tags &> /dev/null; then
    echo -e "${YELLOW}⚠️  Ollama 未运行，请先启动 Ollama${NC}"
    echo "启动 Ollama: ollama serve"
else
    echo -e "${GREEN}✅ Ollama 正在运行${NC}"
fi

# 环境变量
export NODE_ENV=${NODE_ENV:-production}
export PORT=${PORT:-3000}
export REDIS_HOST=${REDIS_HOST:-localhost}
export REDIS_PORT=${REDIS_PORT:-6379}
export OLLAMA_HOST=${OLLAMA_HOST:-localhost}
export OLLAMA_PORT=${OLLAMA_PORT:-11434}

echo ""
echo -e "${GREEN}🚀 启动 GrokForge AI Hub (裸机模式)${NC}"
echo ""
echo "环境变量:"
echo "  NODE_ENV=$NODE_ENV"
echo "  PORT=$PORT"
echo "  REDIS_HOST=$REDIS_HOST"
echo "  REDIS_PORT=$REDIS_PORT"
echo "  OLLAMA_HOST=$OLLAMA_HOST"
echo "  OLLAMA_PORT=$OLLAMA_PORT"
echo ""

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 安装依赖...${NC}"
    bun install
fi

# 创建日志目录
mkdir -p logs
mkdir -p data

# 启动函数
start_queue_server() {
    echo -e "${GREEN}📦 启动 Queue Server (端口 3001)...${NC}"
    PORT=3001 \
    REDIS_HOST=$REDIS_HOST \
    REDIS_PORT=$REDIS_PORT \
    OLLAMA_HOST=$OLLAMA_HOST \
    OLLAMA_PORT=$OLLAMA_PORT \
    bun run src/server/demo6-server.ts > logs/queue-server.log 2>&1 &
    echo $! > logs/queue-server.pid
    echo -e "${GREEN}✅ Queue Server 已启动 (PID: $(cat logs/queue-server.pid))${NC}"
}

start_scheduler_server() {
    echo -e "${GREEN}⏰ 启动 Scheduler Server...${NC}"
    OLLAMA_HOST=$OLLAMA_HOST \
    OLLAMA_PORT=$OLLAMA_PORT \
    bun run src/server/demo7-scheduler-server.ts > logs/scheduler-server.log 2>&1 &
    echo $! > logs/scheduler-server.pid
    echo -e "${GREEN}✅ Scheduler Server 已启动 (PID: $(cat logs/scheduler-server.pid))${NC}"
}

start_main_app() {
    echo -e "${GREEN}🌐 启动主应用 (端口 $PORT)...${NC}"
    PORT=$PORT \
    REDIS_HOST=$REDIS_HOST \
    REDIS_PORT=$REDIS_PORT \
    OLLAMA_HOST=$OLLAMA_HOST \
    OLLAMA_PORT=$OLLAMA_PORT \
    QUEUE_API_URL=http://localhost:3001 \
    bun run start > logs/main-app.log 2>&1 &
    echo $! > logs/main-app.pid
    echo -e "${GREEN}✅ 主应用已启动 (PID: $(cat logs/main-app.pid))${NC}"
}

# 停止函数
stop_all() {
    echo -e "${YELLOW}🛑 停止所有服务...${NC}"
    for pidfile in logs/*.pid; do
        if [ -f "$pidfile" ]; then
            pid=$(cat "$pidfile")
            if kill -0 "$pid" 2>/dev/null; then
                kill "$pid"
                echo "已停止进程 $pid"
            fi
            rm "$pidfile"
        fi
    done
    echo -e "${GREEN}✅ 所有服务已停止${NC}"
}

# 检查服务状态
check_status() {
    echo -e "${GREEN}📊 服务状态:${NC}"
    for pidfile in logs/*.pid; do
        if [ -f "$pidfile" ]; then
            pid=$(cat "$pidfile")
            name=$(basename "$pidfile" .pid)
            if kill -0 "$pid" 2>/dev/null; then
                echo -e "  ${GREEN}✅ $name (PID: $pid)${NC}"
            else
                echo -e "  ${RED}❌ $name (已停止)${NC}"
            fi
        fi
    done
}

# 主逻辑
case "${1:-start}" in
    start)
        start_queue_server
        sleep 2
        start_scheduler_server
        sleep 2
        start_main_app
        sleep 2
        echo ""
        echo -e "${GREEN}✅ 所有服务已启动！${NC}"
        echo ""
        echo "服务地址:"
        echo "  • 主应用:      http://localhost:$PORT"
        echo "  • Queue Server: http://localhost:3001"
        echo "  • Queue Stats:  http://localhost:3001/api/queue/stats"
        echo ""
        echo "查看日志:"
        echo "  tail -f logs/main-app.log"
        echo "  tail -f logs/queue-server.log"
        echo "  tail -f logs/scheduler-server.log"
        echo ""
        echo "停止服务: $0 stop"
        ;;
    stop)
        stop_all
        ;;
    restart)
        stop_all
        sleep 2
        $0 start
        ;;
    status)
        check_status
        ;;
    logs)
        tail -f logs/*.log
        ;;
    *)
        echo "用法: $0 {start|stop|restart|status|logs}"
        exit 1
        ;;
esac


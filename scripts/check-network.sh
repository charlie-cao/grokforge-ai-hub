#!/bin/bash

# 网络连接检查脚本
# 检查服务是否可以从外部访问

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🔍 网络连接检查${NC}"
echo ""

# 1. 检查服务是否运行
echo -e "${YELLOW}1. 检查服务状态...${NC}"
if pgrep -f "bun.*src/index.ts" > /dev/null; then
    echo -e "${GREEN}✅ 主应用正在运行${NC}"
else
    echo -e "${RED}❌ 主应用未运行${NC}"
fi

if pgrep -f "bun.*demo6-server" > /dev/null; then
    echo -e "${GREEN}✅ Queue Server 正在运行${NC}"
else
    echo -e "${RED}❌ Queue Server 未运行${NC}"
fi

echo ""

# 2. 检查端口监听
echo -e "${YELLOW}2. 检查端口监听...${NC}"

check_port() {
    local port=$1
    local name=$2
    
    if command -v ss > /dev/null; then
        result=$(ss -tlnp | grep ":$port " || true)
    else
        result=$(netstat -tlnp 2>/dev/null | grep ":$port " || true)
    fi
    
    if [ -n "$result" ]; then
        if echo "$result" | grep -q "0.0.0.0:$port"; then
            echo -e "${GREEN}✅ $name (端口 $port) 监听所有接口 (0.0.0.0)${NC}"
        elif echo "$result" | grep -q "127.0.0.1:$port"; then
            echo -e "${RED}❌ $name (端口 $port) 只监听本地 (127.0.0.1)${NC}"
            echo -e "${YELLOW}   需要修改配置监听 0.0.0.0${NC}"
        else
            echo -e "${YELLOW}⚠️  $name (端口 $port) 监听状态: $result${NC}"
        fi
    else
        echo -e "${RED}❌ $name (端口 $port) 未监听${NC}"
    fi
}

check_port 3000 "主应用"
check_port 3001 "Queue Server"

echo ""

# 3. 检查本地连接
echo -e "${YELLOW}3. 检查本地连接...${NC}"

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 主应用本地连接正常${NC}"
else
    echo -e "${RED}❌ 主应用本地连接失败${NC}"
fi

if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Queue Server 本地连接正常${NC}"
else
    echo -e "${RED}❌ Queue Server 本地连接失败${NC}"
fi

echo ""

# 4. 获取服务器 IP
echo -e "${YELLOW}4. 服务器网络信息...${NC}"
server_ip=$(hostname -I | awk '{print $1}' 2>/dev/null || ip addr show | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | cut -d/ -f1 | head -1)
if [ -n "$server_ip" ]; then
    echo "服务器 IP: $server_ip"
    echo ""
    echo -e "${YELLOW}从外部测试:${NC}"
    echo "  curl http://$server_ip:3000"
    echo "  curl http://$server_ip:3001/health"
else
    echo -e "${RED}❌ 无法获取服务器 IP${NC}"
fi

echo ""

# 5. 检查防火墙
echo -e "${YELLOW}5. 检查防火墙...${NC}"

if command -v ufw > /dev/null; then
    ufw_status=$(sudo ufw status 2>/dev/null | head -1)
    echo "UFW 状态: $ufw_status"
    
    if echo "$ufw_status" | grep -q "Status: active"; then
        echo "开放的端口:"
        sudo ufw status numbered | grep -E '3000|3001' || echo -e "${RED}  端口 3000/3001 未开放${NC}"
    fi
elif command -v firewall-cmd > /dev/null; then
    echo "Firewalld 状态:"
    sudo firewall-cmd --state 2>/dev/null || echo "未运行"
    echo "开放的端口:"
    sudo firewall-cmd --list-ports 2>/dev/null | grep -E '3000|3001' || echo -e "${RED}  端口 3000/3001 未开放${NC}"
else
    echo -e "${YELLOW}⚠️  未检测到常见防火墙工具${NC}"
    echo "请手动检查 iptables 或云服务器安全组"
fi

echo ""

# 6. 建议
echo -e "${GREEN}📋 建议操作:${NC}"
echo ""
echo "如果外部无法访问，请执行："
echo ""
echo "1. 开放防火墙端口:"
echo "   sudo ufw allow 3000/tcp"
echo "   sudo ufw allow 3001/tcp"
echo ""
echo "2. 检查云服务器安全组（阿里云/腾讯云/AWS）"
echo ""
echo "3. 确认服务监听 0.0.0.0 而不是 127.0.0.1"
echo ""


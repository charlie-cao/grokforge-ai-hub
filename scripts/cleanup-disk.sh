#!/bin/bash

# 磁盘清理脚本
# 清理 Docker 未使用的资源以释放空间

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🧹 磁盘清理工具${NC}"
echo ""

# 检查磁盘空间
echo -e "${YELLOW}📊 当前磁盘使用情况:${NC}"
df -h /
echo ""

# 检查 Docker 磁盘使用
if command -v docker > /dev/null; then
    echo -e "${YELLOW}🐳 Docker 磁盘使用:${NC}"
    docker system df
    echo ""
fi

# 清理选项
cleanup_docker() {
    echo -e "${YELLOW}🧹 清理 Docker 未使用的资源...${NC}"
    
    # 停止所有容器
    echo "停止所有容器..."
    docker compose down 2>/dev/null || true
    
    # 清理未使用的容器、网络、镜像
    echo "清理未使用的资源..."
    docker system prune -a -f --volumes
    
    echo -e "${GREEN}✅ Docker 清理完成${NC}"
    echo ""
    docker system df
}

cleanup_logs() {
    echo -e "${YELLOW}🧹 清理日志文件...${NC}"
    
    # 清理项目日志
    if [ -d "logs" ]; then
        find logs -type f -name "*.log" -mtime +7 -delete
        echo "已清理 7 天前的日志文件"
    fi
    
    # 清理系统日志（可选）
    if [ -d "/var/log" ]; then
        echo "系统日志大小:"
        du -sh /var/log/* 2>/dev/null | sort -h | tail -10
        echo ""
        read -p "是否清理系统日志? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sudo journalctl --vacuum-time=7d
            echo "已清理 7 天前的系统日志"
        fi
    fi
}

cleanup_apt() {
    echo -e "${YELLOW}🧹 清理 APT 缓存...${NC}"
    sudo apt-get clean
    sudo apt-get autoclean
    sudo apt-get autoremove -y
    echo -e "${GREEN}✅ APT 清理完成${NC}"
}

show_large_files() {
    echo -e "${YELLOW}📁 查找大文件 (前 10 个):${NC}"
    sudo find / -type f -size +100M 2>/dev/null | head -10
    echo ""
}

# 主菜单
case "${1:-menu}" in
    docker)
        cleanup_docker
        ;;
    logs)
        cleanup_logs
        ;;
    apt)
        cleanup_apt
        ;;
    all)
        cleanup_docker
        cleanup_logs
        cleanup_apt
        ;;
    large)
        show_large_files
        ;;
    menu)
        echo -e "${GREEN}可用操作:${NC}"
        echo ""
        echo "1. 清理 Docker (推荐，可释放最多空间)"
        echo "2. 清理日志文件"
        echo "3. 清理 APT 缓存"
        echo "4. 清理所有"
        echo "5. 查找大文件"
        echo ""
        read -p "选择操作 (1-5): " choice
        
        case $choice in
            1) cleanup_docker ;;
            2) cleanup_logs ;;
            3) cleanup_apt ;;
            4) cleanup_docker && cleanup_logs && cleanup_apt ;;
            5) show_large_files ;;
            *) echo "无效选择" ;;
        esac
        ;;
    *)
        echo "用法: $0 {docker|logs|apt|all|large|menu}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}📊 清理后磁盘使用情况:${NC}"
df -h /


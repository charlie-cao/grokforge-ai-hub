#!/bin/bash

# 创建 swap 文件脚本
# 用于低内存系统（<1GB RAM）

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SWAP_SIZE=${1:-2G}  # 默认 2GB
SWAP_FILE=/swapfile

echo -e "${GREEN}🔧 设置 Swap 文件 (${SWAP_SIZE})${NC}"

# 检查是否已有 swap
if [ -f "$SWAP_FILE" ]; then
    echo -e "${YELLOW}⚠️  Swap 文件已存在${NC}"
    swapon --show
    read -p "是否重新创建? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🗑️  删除现有 swap...${NC}"
        sudo swapoff "$SWAP_FILE" 2>/dev/null || true
        sudo rm -f "$SWAP_FILE"
    else
        echo -e "${GREEN}✅ 使用现有 swap${NC}"
        exit 0
    fi
fi

# 检查可用磁盘空间
available_space=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
required_space=$(echo "$SWAP_SIZE" | sed 's/G//')

if [ "$available_space" -lt "$required_space" ]; then
    echo -e "${RED}❌ 磁盘空间不足！需要 ${SWAP_SIZE}，但只有 ${available_space}G${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 创建 ${SWAP_SIZE} swap 文件...${NC}"
echo "这可能需要几分钟..."

# 创建 swap 文件
sudo fallocate -l "$SWAP_SIZE" "$SWAP_FILE" || {
    echo -e "${YELLOW}⚠️  fallocate 失败，使用 dd 创建（较慢）...${NC}"
    sudo dd if=/dev/zero of="$SWAP_FILE" bs=1M count=$(($required_space * 1024)) status=progress
}

# 设置权限
sudo chmod 600 "$SWAP_FILE"

# 格式化为 swap
echo -e "${YELLOW}🔧 格式化 swap...${NC}"
sudo mkswap "$SWAP_FILE"

# 启用 swap
echo -e "${YELLOW}🚀 启用 swap...${NC}"
sudo swapon "$SWAP_FILE"

# 显示结果
echo ""
echo -e "${GREEN}✅ Swap 设置完成！${NC}"
echo ""
swapon --show
echo ""
free -h
echo ""

# 添加到 /etc/fstab 使其永久生效
if ! grep -q "$SWAP_FILE" /etc/fstab 2>/dev/null; then
    echo -e "${YELLOW}💾 添加到 /etc/fstab 使其永久生效...${NC}"
    echo "$SWAP_FILE none swap sw 0 0" | sudo tee -a /etc/fstab
    echo -e "${GREEN}✅ 已添加到 /etc/fstab${NC}"
fi

echo ""
echo -e "${GREEN}🎉 完成！现在可以重新运行 bun install${NC}"


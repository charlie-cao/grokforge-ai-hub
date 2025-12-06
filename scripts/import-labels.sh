#!/bin/bash

# 导入 GitHub 标签脚本
# 批量创建或更新标签

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 检查 GitHub CLI
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI 未安装${NC}"
    echo "安装: https://cli.github.com/"
    exit 1
fi

# 检查是否登录
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}⚠️  未登录 GitHub CLI${NC}"
    echo "请先登录: gh auth login"
    exit 1
fi

LABELS_FILE=".github/labels.json"

if [ ! -f "$LABELS_FILE" ]; then
    echo -e "${RED}❌ 标签文件不存在: $LABELS_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}📦 导入 GitHub 标签...${NC}"
echo ""

# 读取仓库信息
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "仓库: $REPO"
echo ""

# 导入标签
cat "$LABELS_FILE" | jq -r '.[] | @json' | while read -r label; do
    name=$(echo "$label" | jq -r '.name')
    color=$(echo "$label" | jq -r '.color')
    description=$(echo "$label" | jq -r '.description')
    
    # 检查标签是否存在
    if gh label view "$name" &> /dev/null; then
        echo -e "${YELLOW}🔄 更新标签: $name${NC}"
        gh label edit "$name" --color "$color" --description "$description" || true
    else
        echo -e "${GREEN}➕ 创建标签: $name${NC}"
        gh label create "$name" --color "$color" --description "$description" || true
    fi
done

echo ""
echo -e "${GREEN}✅ 标签导入完成！${NC}"


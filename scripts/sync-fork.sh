#!/bin/bash

# Fork 同步脚本
# 同步你的 Fork 到上游仓库

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

UPSTREAM=${1:-upstream}
BRANCH=${2:-main}

echo -e "${GREEN}🔄 同步 Fork...${NC}"

# 检查上游仓库是否存在
if ! git remote | grep -q "^${UPSTREAM}$"; then
    echo -e "${RED}❌ 上游仓库 '$UPSTREAM' 不存在${NC}"
    echo ""
    echo "请先添加上游仓库:"
    echo "  git remote add upstream https://github.com/原作者/仓库名.git"
    exit 1
fi

# 获取当前分支
CURRENT_BRANCH=$(git branch --show-current)
echo "当前分支: $CURRENT_BRANCH"

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  有未提交的更改${NC}"
    read -p "是否暂存更改? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git stash
        STASHED=true
    else
        exit 1
    fi
fi

# 获取上游更改
echo -e "${YELLOW}📥 获取上游更改...${NC}"
git fetch $UPSTREAM

# 切换到目标分支
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
    echo -e "${YELLOW}🔀 切换到 $BRANCH 分支...${NC}"
    git checkout $BRANCH
fi

# 合并上游更改
echo -e "${YELLOW}🔀 合并上游更改...${NC}"
git merge $UPSTREAM/$BRANCH || {
    echo -e "${RED}❌ 合并冲突！请手动解决${NC}"
    if [ "$STASHED" = true ]; then
        git stash pop
    fi
    exit 1
}

# 推送到你的 Fork
echo -e "${YELLOW}📤 推送到你的 Fork...${NC}"
git push origin $BRANCH

# 恢复暂存的更改
if [ "$STASHED" = true ]; then
    echo -e "${YELLOW}📦 恢复暂存的更改...${NC}"
    git stash pop
fi

echo ""
echo -e "${GREEN}✅ Fork 已同步到 $UPSTREAM/$BRANCH！${NC}"


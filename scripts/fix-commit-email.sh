#!/bin/bash

# 修复历史提交的邮箱脚本
# 用于修复贡献图不显示的问题

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🔧 修复提交邮箱${NC}"
echo ""

# 检查是否安装了 git-filter-repo
if ! command -v git-filter-repo &> /dev/null; then
    echo -e "${YELLOW}⚠️  git-filter-repo 未安装${NC}"
    echo "安装方式:"
    echo "  pip install git-filter-repo"
    echo "  或"
    echo "  brew install git-filter-repo"
    exit 1
fi

# 获取旧邮箱
read -p "请输入旧邮箱: " OLD_EMAIL

# 获取新邮箱
read -p "请输入新邮箱 (或按 Enter 使用 GitHub no-reply): " NEW_EMAIL

if [ -z "$NEW_EMAIL" ]; then
    # 获取 GitHub 用户名
    read -p "请输入 GitHub 用户名: " GITHUB_USERNAME
    NEW_EMAIL="${GITHUB_USERNAME}@users.noreply.github.com"
fi

echo ""
echo -e "${YELLOW}⚠️  警告: 这将重写 Git 历史！${NC}"
echo "旧邮箱: $OLD_EMAIL"
echo "新邮箱: $NEW_EMAIL"
echo ""
read -p "是否继续? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# 备份当前分支
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${YELLOW}📦 当前分支: $CURRENT_BRANCH${NC}"

# 修复邮箱
echo -e "${YELLOW}🔧 修复邮箱...${NC}"
git filter-repo --email-callback "
    old = b'$OLD_EMAIL'
    new = b'$NEW_EMAIL'
    if email == old:
        return new
    return email
" --force

echo ""
echo -e "${GREEN}✅ 邮箱修复完成！${NC}"
echo ""
echo "下一步:"
echo "  1. 检查提交: git log --format='%ae' | head -10"
echo "  2. 如果满意，强制推送: git push --force --all"
echo "  3. 推送标签: git push --force --tags"
echo ""
echo -e "${RED}⚠️  注意: 强制推送会重写远程历史，请确保团队知道！${NC}"


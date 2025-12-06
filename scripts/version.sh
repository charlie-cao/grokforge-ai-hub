#!/bin/bash

# 版本管理脚本
# 自动更新版本号、创建标签、触发发布

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

VERSION_TYPE=${1:-patch}  # patch, minor, major, prerelease

# 验证版本类型
if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major|prerelease)$ ]]; then
    echo -e "${RED}❌ 无效的版本类型: $VERSION_TYPE${NC}"
    echo "用法: $0 {patch|minor|major|prerelease}"
    exit 1
fi

# 检查是否在 main 分支
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}⚠️  当前不在 main 分支 (当前: $CURRENT_BRANCH)${NC}"
    read -p "是否继续? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}❌ 有未提交的更改，请先提交或暂存${NC}"
    git status --short
    exit 1
fi

# 获取当前版本
CURRENT_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "0.0.0")
echo -e "${GREEN}📦 当前版本: v$CURRENT_VERSION${NC}"

# 更新版本
echo -e "${YELLOW}🔄 更新版本 ($VERSION_TYPE)...${NC}"
npm version $VERSION_TYPE --no-git-tag-version || bun version $VERSION_TYPE

NEW_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}✅ 新版本: v$NEW_VERSION${NC}"

# 提交版本更新
echo -e "${YELLOW}📝 提交版本更新...${NC}"
git add package.json
git commit -m "chore: bump version to $NEW_VERSION"

# 创建标签
echo -e "${YELLOW}🏷️  创建标签 v$NEW_VERSION...${NC}"
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"

# 推送
echo -e "${YELLOW}🚀 推送到远程...${NC}"
git push origin "$CURRENT_BRANCH"
git push origin "v$NEW_VERSION"

echo ""
echo -e "${GREEN}✅ 版本 $NEW_VERSION 发布成功！${NC}"
echo ""
echo "下一步:"
echo "  1. GitHub Actions 会自动构建镜像"
echo "  2. 自动部署到生产环境"
echo "  3. 创建 GitHub Release: https://github.com/$GITHUB_REPOSITORY/releases/new"
echo ""


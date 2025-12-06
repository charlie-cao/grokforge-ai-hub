# GitHub 多人协作完整指南

本指南涵盖 GitHub 多人协作的所有方面，包括 Fork 工作流、Pull Request、协作设置、标签管理、贡献图等。

## 📋 目录

1. [Fork 别人仓库](#fork-别人仓库)
2. [让别人协作你的仓库](#让别人协作你的仓库)
3. [Pull Request 流程](#pull-request-流程)
4. [GitHub 标签系统](#github-标签系统)
5. [贡献图（Contribution Graph）](#贡献图contribution-graph)
6. [Issues 管理](#issues-管理)
7. [Projects 项目管理](#projects-项目管理)
8. [代码审查](#代码审查)
9. [最佳实践](#最佳实践)

---

## 🍴 Fork 别人仓库

### 什么是 Fork？

Fork 是创建别人仓库的完整副本到你的账户，你可以自由修改，但保持与原仓库的关联。

### Fork 流程

#### 步骤 1: Fork 仓库

1. 进入要 Fork 的仓库页面
2. 点击右上角 **Fork** 按钮
3. 选择 Fork 到的账户（个人或组织）
4. 等待 Fork 完成

#### 步骤 2: 克隆你的 Fork

```bash
# 克隆你的 Fork（不是原仓库）
git clone https://github.com/你的用户名/仓库名.git
cd 仓库名

# 查看远程仓库
git remote -v
# 应该看到 origin 指向你的 Fork
```

#### 步骤 3: 添加上游仓库（重要）

```bash
# 添加上游仓库（原仓库）
git remote add upstream https://github.com/原作者/仓库名.git

# 验证
git remote -v
# 应该看到：
# origin    https://github.com/你的用户名/仓库名.git (fetch)
# origin    https://github.com/你的用户名/仓库名.git (push)
# upstream  https://github.com/原作者/仓库名.git (fetch)
# upstream  https://github.com/原作者/仓库名.git (push)
```

#### 步骤 4: 保持 Fork 同步

```bash
# 1. 获取上游仓库的最新更改
git fetch upstream

# 2. 切换到主分支
git checkout main

# 3. 合并上游更改
git merge upstream/main

# 4. 推送到你的 Fork
git push origin main
```

**一键同步脚本：**

```bash
#!/bin/bash
# scripts/sync-fork.sh

echo "🔄 同步 Fork..."

# 获取上游更改
git fetch upstream

# 获取当前分支
CURRENT_BRANCH=$(git branch --show-current)

# 合并上游更改
git merge upstream/$CURRENT_BRANCH

# 推送
git push origin $CURRENT_BRANCH

echo "✅ Fork 已同步！"
```

#### 步骤 5: 创建功能分支

```bash
# 确保在最新的 main 分支
git checkout main
git pull upstream main

# 创建功能分支
git checkout -b feature/my-feature

# 进行更改
# ... 编辑文件 ...

# 提交
git add .
git commit -m "feat: add my feature"

# 推送到你的 Fork
git push origin feature/my-feature
```

#### 步骤 6: 创建 Pull Request

1. 进入你的 Fork 仓库页面
2. 点击 **Pull requests** 标签
3. 点击 **New pull request**
4. 选择：
   - **base repository**: 原仓库
   - **base branch**: main (或 develop)
   - **head repository**: 你的 Fork
   - **compare branch**: feature/my-feature
5. 填写 PR 描述
6. 点击 **Create pull request**

### Fork 工作流完整示例

```bash
# 1. Fork 仓库（在 GitHub 网页上操作）

# 2. 克隆你的 Fork
git clone https://github.com/你的用户名/grokforge-ai-hub.git
cd grokforge-ai-hub

# 3. 添加上游仓库
git remote add upstream https://github.com/原作者/grokforge-ai-hub.git

# 4. 同步上游更改
git fetch upstream
git checkout main
git merge upstream/main
git push origin main

# 5. 创建功能分支
git checkout -b feature/add-new-demo

# 6. 进行更改
# ... 编辑代码 ...

# 7. 提交
git add .
git commit -m "feat: add new demo feature"
git push origin feature/add-new-demo

# 8. 在 GitHub 上创建 Pull Request
```

### 处理 PR 被要求修改

```bash
# 1. 在你的 Fork 上继续修改
git checkout feature/my-feature

# 2. 进行修改
# ... 编辑代码 ...

# 3. 提交修改
git add .
git commit -m "fix: address review comments"
git push origin feature/my-feature

# PR 会自动更新，无需重新创建
```

### 同步多个分支

```bash
# 同步所有分支
git fetch upstream

# 列出所有分支
git branch -r

# 同步特定分支
git checkout develop
git merge upstream/develop
git push origin develop
```

---

## 👥 让别人协作你的仓库

### 方式 1: 添加协作者（Collaborator）

适合：小团队、信任的开发者

#### 步骤：

1. 进入仓库 **Settings** → **Collaborators**
2. 点击 **Add people**
3. 输入用户名或邮箱
4. 选择权限级别：
   - **Read**: 只能查看
   - **Triage**: 可以管理 Issues 和 PR
   - **Write**: 可以推送代码
   - **Maintain**: 可以管理仓库设置
   - **Admin**: 完全权限

### 方式 2: Fork + Pull Request（推荐）

适合：开源项目、大型团队

#### 设置仓库权限

1. **Settings** → **General** → **Features**
   - ✅ Issues
   - ✅ Pull requests
   - ✅ Projects
   - ✅ Wiki (可选)

2. **Settings** → **General** → **Pull Requests**
   - ✅ Allow merge commits
   - ✅ Allow squash merging
   - ✅ Allow rebase merging

### 方式 3: 使用组织（Organization）

适合：团队项目

1. 创建 GitHub 组织
2. 将仓库转移到组织
3. 添加团队成员
4. 设置团队权限

---

## 🔄 Pull Request 流程

### 创建 Pull Request

#### 通过 GitHub 网页

1. Fork 仓库或创建分支
2. 进行更改并推送
3. 点击 **Compare & pull request**
4. 填写 PR 模板
5. 选择审查者
6. 添加标签
7. 提交 PR

#### PR 模板

创建 `.github/pull_request_template.md`:

```markdown
## 📝 描述

简要描述这个 PR 的更改

## 🔗 相关 Issue

Closes #123

## ✅ 检查清单

- [ ] 代码已测试
- [ ] 文档已更新
- [ ] 没有 lint 错误
- [ ] 测试通过
- [ ] 遵循代码规范

## 📸 截图（如适用）

## 🧪 测试说明

如何测试这个更改：
1. 
2. 
3. 

## 📋 变更类型

- [ ] Bug 修复
- [ ] 新功能
- [ ] 重构
- [ ] 文档更新
- [ ] 性能优化
- [ ] 其他
```

### PR 审查流程

#### 审查者操作

1. **查看 PR**
   - 阅读描述和代码变更
   - 运行本地测试
   - 检查 CI 状态

2. **添加评论**
   - 行内评论：点击代码行
   - 总体评论：在 Conversation 标签

3. **批准或请求更改**
   - **Approve**: 代码通过审查
   - **Request changes**: 需要修改
   - **Comment**: 仅评论

#### 作者操作

1. **响应评论**
   - 回复评论
   - 进行修改
   - 重新提交

2. **标记为已解决**
   - 点击评论的 "Resolve conversation"

3. **请求重新审查**
   - 在 PR 中 @ 审查者

### PR 合并策略

#### 1. Merge Commit（保留历史）

```bash
# 在 GitHub 上点击 "Merge pull request"
# 或使用命令行
git checkout main
git merge --no-ff feature/branch
git push origin main
```

**优点**: 保留完整历史
**缺点**: 历史可能较乱

#### 2. Squash and Merge（压缩提交）

```bash
# GitHub 会自动压缩所有提交为一个
```

**优点**: 历史简洁
**缺点**: 丢失详细提交信息

#### 3. Rebase and Merge（线性历史）

```bash
# GitHub 会 rebase 后合并
```

**优点**: 线性历史
**缺点**: 可能冲突较多

### PR 自动化

#### 自动标签

创建 `.github/workflows/pr-labels.yml`:

```yaml
name: Auto Label PR

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  label:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/labeler@v4
        with:
          repo-token: "${{ secrets.GITHUB_TOKEN }}"
          configuration-path: .github/labeler.yml
```

创建 `.github/labeler.yml`:

```yaml
# 根据文件路径自动添加标签
frontend:
  - src/components/**
  - src/pages/**
  - '*.tsx'
  - '*.ts'

backend:
  - src/server/**
  - '*.api.ts'

docs:
  - docs/**
  - '*.md'

docker:
  - Dockerfile*
  - docker-compose*.yml
```

#### 自动检查

```yaml
# .github/workflows/pr-checks.yml
name: PR Checks

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Check PR size
        run: |
          ADDED=$(git diff --numstat ${{ github.event.pull_request.base.sha }}..${{ github.sha }} | awk '{sum+=$1} END {print sum}')
          if [ "$ADDED" -gt 1000 ]; then
            echo "⚠️ PR 过大，建议拆分"
            exit 1
          fi
```

---

## 🏷️ GitHub 标签系统

### 标签类型

#### 1. Issue/PR 标签

**功能标签:**
- `enhancement` - 新功能
- `bug` - Bug 修复
- `documentation` - 文档
- `question` - 问题
- `help wanted` - 需要帮助

**优先级标签:**
- `priority: high` - 高优先级
- `priority: medium` - 中优先级
- `priority: low` - 低优先级

**状态标签:**
- `status: in progress` - 进行中
- `status: blocked` - 被阻塞
- `status: needs review` - 需要审查
- `status: ready` - 就绪

**类型标签:**
- `type: feature` - 功能
- `type: bugfix` - 修复
- `type: refactor` - 重构
- `type: test` - 测试

### 创建和管理标签

#### 在 GitHub 网页上

1. **Issues** 或 **Pull requests** → 点击标签
2. 点击 **New label**
3. 填写：
   - **Label name**: 标签名称
   - **Description**: 描述
   - **Color**: 颜色（十六进制）
4. 点击 **Create label**

#### 使用 GitHub CLI

```bash
# 安装 GitHub CLI
# https://cli.github.com/

# 创建标签
gh label create "enhancement" \
  --description "New feature or request" \
  --color "0E8A16"

# 列出所有标签
gh label list

# 删除标签
gh label delete "old-label"
```

#### 批量创建标签

创建 `.github/labels.json`:

```json
[
  {
    "name": "bug",
    "color": "d73a4a",
    "description": "Something isn't working"
  },
  {
    "name": "enhancement",
    "color": "a2eeef",
    "description": "New feature or request"
  },
  {
    "name": "documentation",
    "color": "0075ca",
    "description": "Improvements or additions to documentation"
  },
  {
    "name": "good first issue",
    "color": "7057ff",
    "description": "Good for newcomers"
  },
  {
    "name": "help wanted",
    "color": "008672",
    "description": "Extra attention is needed"
  },
  {
    "name": "priority: high",
    "color": "b60205",
    "description": "High priority issue"
  },
  {
    "name": "priority: medium",
    "color": "fbca04",
    "description": "Medium priority issue"
  },
  {
    "name": "priority: low",
    "color": "0e8a16",
    "description": "Low priority issue"
  }
]
```

使用脚本导入：

```bash
#!/bin/bash
# scripts/import-labels.sh

# 需要安装 GitHub CLI
gh label list --json name | jq -r '.[].name' | xargs -I {} gh label delete {}

# 导入标签
cat .github/labels.json | jq -r '.[] | "gh label create \(.name) --description \"\(.description)\" --color \(.color)"' | bash
```

### 标签最佳实践

1. **使用标准标签**: 遵循社区约定
2. **颜色编码**: 相同类型使用相似颜色
3. **描述清晰**: 每个标签都有描述
4. **定期清理**: 删除不用的标签

---

## 📊 贡献图（Contribution Graph / Flowers）

### 什么是贡献图？

贡献图是 GitHub 个人主页上的绿色方块图（看起来像花朵/flowers），显示你过去一年的提交活动。每个方块代表一天，颜色越深表示提交越多。

### 如何显示在贡献图中？

贡献会显示在贡献图中，如果满足以下**所有**条件：

1. ✅ **提交到默认分支**（main/master）或 gh-pages 分支
2. ✅ **提交邮箱与 GitHub 账户关联**
   - 使用 GitHub 账户邮箱
   - 或使用 `username@users.noreply.github.com`
3. ✅ **提交是合并的 PR**（对于 Fork 的仓库）
4. ✅ **提交在公开仓库**（或已启用私有贡献显示）

### 配置提交邮箱

#### 方式 1: 使用 GitHub 账户邮箱

```bash
# 查看 GitHub 账户邮箱
# GitHub: Settings → Emails → 查看主邮箱

# 设置 Git 邮箱
git config --global user.email "your-email@example.com"
git config --global user.name "Your Name"

# 验证
git config user.email
```

#### 方式 2: 使用 GitHub no-reply 邮箱（推荐）

```bash
# 获取你的 no-reply 邮箱
# GitHub: Settings → Emails → 找到 "Keep my email addresses private"
# 格式: username@users.noreply.github.com

# 设置
git config --global user.email "your-username@users.noreply.github.com"
git config --global user.name "Your Name"
```

#### 方式 3: 为特定仓库设置

```bash
# 只对当前仓库生效
cd your-repo
git config user.email "your-email@example.com"
git config user.name "Your Name"
```

### 关联邮箱到 GitHub 账户

1. 进入 **GitHub Settings** → **Emails**
2. 添加你的提交邮箱
3. 验证邮箱（点击验证链接）

### 修复历史提交的邮箱

#### 方法 1: 使用 git-filter-repo（推荐）

```bash
# 安装 git-filter-repo
pip install git-filter-repo
# 或
brew install git-filter-repo

# 修复邮箱
git filter-repo --email-callback '
    old_email = b"old-email@example.com"
    new_email = b"your-email@example.com"
    if email == old_email:
        return new_email
    return email
'

# 强制推送（谨慎！会重写历史）
git push --force --all
git push --force --tags
```

#### 方法 2: 使用 GitHub 的邮箱修复工具

1. 进入 **GitHub Settings** → **Emails**
2. 找到 "Add email address" 或 "Add new email"
3. 添加旧邮箱
4. GitHub 会自动关联历史提交

### 贡献图不显示的原因排查

#### 检查清单

```bash
# 1. 检查提交邮箱
git log --format='%H %ae' | head -5

# 2. 检查邮箱是否在 GitHub 账户中
# GitHub: Settings → Emails

# 3. 检查提交是否在默认分支
git branch --show-current

# 4. 检查仓库是否公开
# GitHub: Settings → General → Danger Zone → Change visibility
```

#### 常见问题

1. **邮箱不匹配**
   - 解决：添加邮箱到 GitHub 账户
   - 或：使用 `username@users.noreply.github.com`

2. **提交在 Fork**
   - Fork 的提交不会显示在原仓库的贡献图
   - 但会显示在你自己的贡献图
   - 如果 PR 被合并，会显示在原仓库

3. **提交在非默认分支**
   - 只有默认分支（main/master）的提交会显示
   - 或 gh-pages 分支

4. **私有仓库**
   - 默认不显示在公开贡献图
   - 需要启用：Settings → Contributions → Include private contributions

### 显示私有贡献

1. 进入 **GitHub Settings** → **Contributions**
2. ✅ **Include private contributions on my profile**
3. 保存

### 贡献图统计说明

贡献图显示：

- **方块颜色**:
  - 无颜色: 0 次提交
  - 浅绿 (#c6e48b): 1 次提交
  - 中绿 (#7bc96f): 2-3 次提交
  - 深绿 (#239a3b): 4-5 次提交
  - 最深绿 (#196127): 6+ 次提交

- **统计信息**:
  - 总提交数
  - 贡献天数
  - 最活跃的仓库
  - 最活跃的日期

### 查看贡献统计

#### 在 GitHub 网页上

1. 进入你的个人主页
2. 查看贡献图
3. 点击方块查看当天的提交详情

#### 使用 GitHub CLI

```bash
# 查看贡献统计
gh api user --jq '.contributions'

# 查看特定仓库的贡献
gh api repos/:owner/:repo/stats/contributors
```

### 贡献图最佳实践

1. **统一邮箱**: 所有提交使用同一个邮箱
2. **使用 no-reply 邮箱**: 保护隐私
3. **及时提交**: 保持活跃度
4. **有意义提交**: 不要为了刷贡献而提交

### 贡献图美化技巧

虽然不能"刷"贡献，但可以：

1. **保持规律提交**: 每天或每周提交
2. **参与开源项目**: 贡献会显示在图上
3. **合并 PR**: Fork 的 PR 被合并会显示
4. **创建 Issues**: Issues 也会显示在活动图中

---

## 📝 Issues 管理

### 创建 Issue

#### Issue 模板

创建 `.github/ISSUE_TEMPLATE/bug_report.md`:

```markdown
---
name: Bug Report
about: 报告一个 bug
title: ''
labels: bug
assignees: ''
---

## 🐛 Bug 描述

清晰简洁地描述 bug

## 🔄 复现步骤

1. 进入 '...'
2. 点击 '....'
3. 滚动到 '....'
4. 看到错误

## ✅ 预期行为

清晰简洁地描述你期望发生什么

## 📸 截图

如适用，添加截图

## 🌍 环境

- OS: [e.g. Ubuntu 22.04]
- Browser: [e.g. Chrome 120]
- Version: [e.g. 1.0.0]

## 📋 额外信息

添加其他关于问题的信息
```

创建 `.github/ISSUE_TEMPLATE/feature_request.md`:

```markdown
---
name: Feature Request
about: 建议新功能
title: ''
labels: enhancement
assignees: ''
---

## 🚀 功能描述

清晰简洁地描述你想要的功能

## 💡 动机

为什么需要这个功能？它解决了什么问题？

## 📝 详细说明

详细描述功能应该如何工作

## 🎨 设计/示例

如适用，添加设计图或示例

## ✅ 替代方案

描述你考虑过的替代方案

## 📋 额外信息

添加其他相关信息
```

### Issue 工作流

```
新建 Issue
  ↓
添加标签（bug/enhancement）
  ↓
分配负责人
  ↓
讨论和规划
  ↓
创建分支开发
  ↓
创建 PR 关联 Issue
  ↓
PR 合并后自动关闭 Issue
```

### Issue 自动化

创建 `.github/workflows/issue-automation.yml`:

```yaml
name: Issue Automation

on:
  issues:
    types: [opened, labeled]
  pull_request:
    types: [opened, closed]

jobs:
  auto-assign:
    runs-on: ubuntu-latest
    steps:
      - uses: kentaro-m/auto-assign-action@v1.2.0
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          configuration-path: .github/auto-assign.yml

  close-issue:
    runs-on: ubuntu-latest
    if: github.event.pull_request.merged == true
    steps:
      - name: Close related issue
        uses: actions/github-script@v6
        with:
          script: |
            const prBody = context.payload.pull_request.body;
            const issueNumber = prBody.match(/closes?\s+#(\d+)/i)?.[1];
            if (issueNumber) {
              await github.rest.issues.update({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: issueNumber,
                state: 'closed'
              });
            }
```

---

## 📋 Projects 项目管理

### 创建 Project

1. 进入仓库 → **Projects**
2. 点击 **New project**
3. 选择模板：
   - **Board**: 看板（类似 Trello）
   - **Table**: 表格视图
   - **Roadmap**: 路线图

### 看板配置

#### 列设置

```
📋 Backlog (待办)
  ↓
🔄 In Progress (进行中)
  ↓
👀 In Review (审查中)
  ↓
✅ Done (完成)
```

#### 自动化

1. **Settings** → **Automation**
2. 配置规则：
   - Issue 创建 → 添加到 Backlog
   - PR 创建 → 移动到 In Progress
   - PR 审查请求 → 移动到 In Review
   - PR 合并 → 移动到 Done

### 使用 Projects

```bash
# 通过 GitHub CLI 管理
gh project list
gh project view 1
gh project item-add 1 --owner owner --repo repo --number 123
```

---

## 👀 代码审查

### 审查清单

#### 功能审查

- [ ] 代码实现了需求
- [ ] 没有引入 bug
- [ ] 边界情况已处理
- [ ] 错误处理完善

#### 代码质量

- [ ] 代码清晰易读
- [ ] 遵循项目规范
- [ ] 没有重复代码
- [ ] 命名合理

#### 测试

- [ ] 有单元测试
- [ ] 测试通过
- [ ] 覆盖率足够

#### 文档

- [ ] 代码有注释
- [ ] README 已更新
- [ ] API 文档已更新

### 审查工具

#### GitHub 审查功能

1. **行内评论**: 点击代码行添加评论
2. **建议更改**: 直接建议代码修改
3. **批准/拒绝**: 明确审查结果
4. **审查摘要**: 总体评价

#### 审查命令

```bash
# 查看 PR
gh pr view 123

# 审查 PR
gh pr review 123 --approve
gh pr review 123 --request-changes --body "需要修改"
gh pr review 123 --comment --body "建议"

# 合并 PR
gh pr merge 123 --squash
```

---

## 🎯 最佳实践

### 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# 格式
<type>(<scope>): <subject>

# 类型
feat:     新功能
fix:      Bug 修复
docs:     文档
style:    格式（不影响功能）
refactor: 重构
perf:     性能优化
test:     测试
chore:    构建/工具

# 示例
git commit -m "feat(auth): add user login"
git commit -m "fix(api): resolve timeout issue"
git commit -m "docs: update deployment guide"
```

### PR 规范

1. **标题清晰**: 描述做了什么
2. **描述详细**: 说明为什么和怎么做
3. **关联 Issue**: 使用 `Closes #123`
4. **添加标签**: 帮助分类
5. **请求审查**: @ 相关审查者
6. **保持更新**: 及时响应评论

### 协作规范

1. **及时响应**: 24 小时内响应 PR/Issue
2. **友好沟通**: 保持专业和尊重
3. **提供反馈**: 给出建设性意见
4. **感谢贡献**: 认可他人的工作

### 分支命名

```
feature/功能名称
bugfix/问题描述
hotfix/紧急修复
release/版本号
docs/文档更新
refactor/重构内容
```

---

## 🔧 实用工具和脚本

### 同步 Fork 脚本

创建 `scripts/sync-fork.sh`:

```bash
#!/bin/bash
# 同步 Fork 到上游仓库

UPSTREAM=${1:-upstream}
BRANCH=${2:-main}

echo "🔄 同步 Fork..."

git fetch $UPSTREAM
git checkout $BRANCH
git merge $UPSTREAM/$BRANCH
git push origin $BRANCH

echo "✅ Fork 已同步！"
```

### PR 检查脚本

创建 `scripts/check-pr.sh`:

```bash
#!/bin/bash
# 检查 PR 是否就绪

echo "🔍 检查 PR..."

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ 有未提交的更改"
  exit 1
fi

# 运行测试
echo "🧪 运行测试..."
bun test || exit 1

# 类型检查
echo "📝 类型检查..."
bun run tsc --noEmit || exit 1

# 构建
echo "🔨 构建..."
bun run build || exit 1

echo "✅ PR 检查通过！"
```

---

## 📚 相关资源

- [GitHub 协作文档](https://docs.github.com/en/pull-requests)
- [Fork 工作流](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks)
- [贡献图说明](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/managing-contribution-settings-on-your-profile)
- [标签最佳实践](https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work)

---

**最后更新**: 2024-01-20


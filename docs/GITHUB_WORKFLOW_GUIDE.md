# GitHub 工作流完整指南

本指南涵盖 GitHub 仓库的完整工作流程，包括分支管理、标签管理、自动化发布、版本管理和配置管理。

## 📋 目录

1. [分支管理](#分支管理)
2. [标签管理](#标签管理)
3. [自动化发布](#自动化发布)
4. [版本管理](#版本管理)
5. [配置管理](#配置管理)
6. [最佳实践](#最佳实践)

---

## 🌿 分支管理

### 分支策略

本项目采用 **Git Flow** 分支策略：

```
main (生产环境)
  ├── develop (开发环境)
  │   ├── feature/* (功能分支)
  │   ├── bugfix/* (修复分支)
  │   └── hotfix/* (紧急修复)
  └── release/* (发布分支)
```

### 分支说明

#### 1. **main** - 主分支（生产环境）

- **用途**: 生产环境代码，始终保持稳定可发布状态
- **保护**: 必须通过 PR 合并，需要代码审查
- **CI/CD**: 自动构建镜像并部署到生产环境

```bash
# 查看 main 分支
git checkout main
git pull origin main

# 从 develop 合并到 main（通过 PR）
# GitHub: 创建 Pull Request: develop → main
```

#### 2. **develop** - 开发分支

- **用途**: 开发环境代码，集成所有功能
- **保护**: 建议通过 PR 合并
- **CI/CD**: 自动构建镜像（develop 标签）

```bash
# 创建 develop 分支（如果不存在）
git checkout -b develop
git push -u origin develop

# 从 main 创建 develop
git checkout main
git checkout -b develop
git push -u origin develop
```

#### 3. **feature/** - 功能分支

- **用途**: 开发新功能
- **命名**: `feature/功能名称`，例如 `feature/user-authentication`
- **来源**: 从 `develop` 创建
- **合并**: 完成后合并回 `develop`

```bash
# 创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# 开发并提交
git add .
git commit -m "feat: add new feature"
git push -u origin feature/new-feature

# 创建 PR 合并到 develop
# GitHub: 创建 Pull Request: feature/new-feature → develop
```

#### 4. **bugfix/** - 修复分支

- **用途**: 修复 develop 分支的 bug
- **命名**: `bugfix/问题描述`，例如 `bugfix/fix-login-error`
- **来源**: 从 `develop` 创建

```bash
# 创建修复分支
git checkout develop
git checkout -b bugfix/fix-issue

# 修复并提交
git add .
git commit -m "fix: resolve login error"
git push -u origin bugfix/fix-issue

# 创建 PR 合并到 develop
```

#### 5. **hotfix/** - 紧急修复分支

- **用途**: 修复生产环境的紧急问题
- **命名**: `hotfix/问题描述`，例如 `hotfix/security-patch`
- **来源**: 从 `main` 创建
- **合并**: 同时合并到 `main` 和 `develop`

```bash
# 创建紧急修复分支
git checkout main
git pull origin main
git checkout -b hotfix/critical-fix

# 修复并提交
git add .
git commit -m "fix: critical security patch"
git push -u origin hotfix/critical-fix

# 创建 PR 合并到 main（紧急）
# 然后合并到 develop
```

#### 6. **release/** - 发布分支

- **用途**: 准备新版本发布
- **命名**: `release/v1.0.0`（使用版本号）
- **来源**: 从 `develop` 创建
- **合并**: 完成后合并到 `main` 和 `develop`

```bash
# 创建发布分支
git checkout develop
git checkout -b release/v1.0.0

# 更新版本号
# 编辑 package.json
# "version": "1.0.0"

git add .
git commit -m "chore: bump version to 1.0.0"
git push -u origin release/v1.0.0

# 测试完成后合并到 main
# GitHub: 创建 PR: release/v1.0.0 → main
```

### 分支保护规则

在 GitHub 仓库设置中配置分支保护：

**Settings → Branches → Add rule**

#### main 分支保护

```
Branch name pattern: main
✅ Require a pull request before merging
   - Require approvals: 1
   - Dismiss stale pull request approvals when new commits are pushed
✅ Require status checks to pass before merging
   - Require branches to be up to date before merging
✅ Require conversation resolution before merging
✅ Do not allow bypassing the above settings
```

#### develop 分支保护（可选）

```
Branch name pattern: develop
✅ Require a pull request before merging
   - Require approvals: 0 (可选)
✅ Require status checks to pass before merging
```

### 常用分支操作

```bash
# 查看所有分支
git branch -a

# 查看远程分支
git branch -r

# 删除本地分支
git branch -d feature/old-feature

# 删除远程分支
git push origin --delete feature/old-feature

# 清理已合并的分支
git branch --merged | grep -v "\*\|main\|develop" | xargs -n 1 git branch -d
```

---

## 🏷️ 标签管理

### 标签类型

#### 1. **版本标签** (推荐)

使用语义化版本（Semantic Versioning）:

- **格式**: `v<major>.<minor>.<patch>`
- **示例**: `v1.0.0`, `v1.2.3`, `v2.0.0-beta.1`

```bash
# 创建版本标签
git tag v1.0.0

# 创建带注释的标签（推荐）
git tag -a v1.0.0 -m "Release version 1.0.0"

# 推送标签
git push origin v1.0.0

# 推送所有标签
git push origin --tags
```

#### 2. **预发布标签**

- **格式**: `v<version>-<pre-release>`
- **示例**: `v1.0.0-alpha.1`, `v1.0.0-beta.1`, `v1.0.0-rc.1`

```bash
# 创建预发布标签
git tag -a v1.0.0-beta.1 -m "Beta release 1.0.0"
git push origin v1.0.0-beta.1
```

#### 3. **其他标签**

- **格式**: `release-<date>` 或 `hotfix-<date>`
- **示例**: `release-2025-01-15`, `hotfix-2025-01-20`

### 标签操作

```bash
# 查看所有标签
git tag

# 查看标签详情
git show v1.0.0

# 查看特定模式的标签
git tag -l "v1.*"

# 删除本地标签
git tag -d v1.0.0

# 删除远程标签
git push origin --delete v1.0.0

# 检出到标签
git checkout v1.0.0

# 基于标签创建分支
git checkout -b release-v1.0.0 v1.0.0
```

### 标签命名规范

遵循 [语义化版本 2.0.0](https://semver.org/lang/zh-CN/)：

```
主版本号.次版本号.修订号[-预发布标识][+构建元数据]

示例：
- v1.0.0          # 正式发布
- v1.0.1          # 补丁版本（bug 修复）
- v1.1.0          # 次版本（新功能，向后兼容）
- v2.0.0          # 主版本（不兼容的更改）
- v1.0.0-alpha.1  # 预发布版本
- v1.0.0-beta.2   # 预发布版本
- v1.0.0-rc.1     # 发布候选版本
```

### 自动化标签创建

使用 GitHub Actions 自动创建标签：

```yaml
# .github/workflows/create-release.yml
name: Create Release

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version number (e.g., 1.0.0)'
        required: true

jobs:
  create-release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Create tag
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git tag -a "v${{ github.event.inputs.version }}" -m "Release v${{ github.event.inputs.version }}"
          git push origin "v${{ github.event.inputs.version }}"
```

---

## 🚀 自动化发布

### 发布流程

本项目已配置自动化发布流程：

1. **创建标签** → 触发构建和部署
2. **GitHub Actions** → 自动构建 Docker 镜像
3. **自动部署** → 部署到 Kubernetes

### 手动发布流程

#### 步骤 1: 更新版本号

```bash
# 编辑 package.json
# "version": "1.0.0"

# 提交版本更新
git add package.json
git commit -m "chore: bump version to 1.0.0"
git push origin develop
```

#### 步骤 2: 创建发布分支

```bash
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0
git push -u origin release/v1.0.0
```

#### 步骤 3: 测试和修复

在 release 分支上进行最终测试和修复。

#### 步骤 4: 合并到 main

```bash
# 通过 GitHub 创建 PR: release/v1.0.0 → main
# 或直接合并
git checkout main
git merge release/v1.0.0
git push origin main
```

#### 步骤 5: 创建标签

```bash
# 在 main 分支上创建标签
git checkout main
git pull origin main
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

#### 步骤 6: 创建 GitHub Release

1. 进入 GitHub 仓库
2. 点击 **Releases** → **Draft a new release**
3. 选择标签 `v1.0.0`
4. 填写发布说明
5. 点击 **Publish release**

### 自动化发布配置

#### 使用 GitHub Actions 自动创建 Release

创建 `.github/workflows/release.yml`:

```yaml
name: Create Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Generate changelog
        id: changelog
        run: |
          # 生成变更日志
          echo "## Changes" >> $GITHUB_STEP_SUMMARY
          git log --pretty=format:"- %s" $(git describe --tags --abbrev=0)..HEAD >> $GITHUB_STEP_SUMMARY
      
      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          body: |
            ## What's Changed
            
            See full changelog in the commit history.
          draft: false
          prerelease: false
```

### 发布检查清单

发布前检查：

- [ ] 所有测试通过
- [ ] 代码审查完成
- [ ] 版本号已更新
- [ ] CHANGELOG.md 已更新
- [ ] 文档已更新
- [ ] 依赖已更新
- [ ] 构建成功
- [ ] 部署测试通过

---

## 📦 版本管理

### 版本号管理

#### package.json 版本

```json
{
  "name": "grokforge-ai-hub",
  "version": "1.0.0"
}
```

#### 自动更新版本

使用 `npm version` 或 `bun version`:

```bash
# 补丁版本 (1.0.0 → 1.0.1)
bun version patch
git push --follow-tags

# 次版本 (1.0.0 → 1.1.0)
bun version minor
git push --follow-tags

# 主版本 (1.0.0 → 2.0.0)
bun version major
git push --follow-tags

# 预发布版本
bun version prerelease
git push --follow-tags
```

#### 版本脚本

创建 `scripts/version.sh`:

```bash
#!/bin/bash

# 版本管理脚本

VERSION_TYPE=${1:-patch}  # patch, minor, major, prerelease

echo "Current version: $(node -p "require('./package.json').version")"

# 更新版本
bun version $VERSION_TYPE

NEW_VERSION=$(node -p "require('./package.json').version")
echo "New version: $NEW_VERSION"

# 创建标签
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"

# 推送
git push origin main
git push origin --tags

echo "✅ Version $NEW_VERSION released!"
```

使用：

```bash
chmod +x scripts/version.sh
./scripts/version.sh patch   # 1.0.0 → 1.0.1
./scripts/version.sh minor   # 1.0.0 → 1.1.0
./scripts/version.sh major   # 1.0.0 → 2.0.0
```

### 版本标签与镜像标签

GitHub Actions 会自动根据标签创建镜像标签：

| Git 标签 | 镜像标签 | 说明 |
|---------|---------|------|
| `v1.0.0` | `v1.0.0`, `1.0.0`, `1.0`, `1` | 完整版本 |
| `v1.0.0-beta.1` | `v1.0.0-beta.1`, `1.0.0-beta.1` | 预发布版本 |
| `main` (分支) | `main`, `latest` | 主分支 |
| `develop` (分支) | `develop` | 开发分支 |

### 版本回滚

```bash
# 查看版本历史
git tag -l "v*" | sort -V

# 回滚到特定版本
git checkout v1.0.0

# 创建回滚分支
git checkout -b hotfix/rollback-to-v1.0.0 v1.0.0

# 或使用 Kubernetes 回滚
kubectl rollout undo deployment/app -n grokforge
```

---

## ⚙️ 配置管理

### 环境配置

#### 1. 开发环境 (Development)

配置文件: `.env.development`

```bash
NODE_ENV=development
PORT=3000
REDIS_HOST=localhost
REDIS_PORT=6379
OLLAMA_HOST=localhost
OLLAMA_PORT=11434
LOG_LEVEL=debug
```

#### 2. 测试环境 (Staging)

配置文件: `.env.staging`

```bash
NODE_ENV=staging
PORT=3000
REDIS_HOST=redis-staging.example.com
REDIS_PORT=6379
OLLAMA_HOST=ollama-staging.example.com
OLLAMA_PORT=11434
LOG_LEVEL=info
```

#### 3. 生产环境 (Production)

配置文件: `.env.production`

```bash
NODE_ENV=production
PORT=3000
REDIS_HOST=redis-prod.example.com
REDIS_PORT=6379
OLLAMA_HOST=ollama-prod.example.com
OLLAMA_PORT=11434
LOG_LEVEL=warn
```

### GitHub Secrets 管理

#### 必需 Secrets

在 **Settings → Secrets and variables → Actions** 中配置：

1. **KUBECONFIG**
   ```bash
   # 获取 kubeconfig (base64)
   cat ~/.kube/config | base64 -w 0
   ```

2. **DOCKER_REGISTRY** (可选)
   ```
   ghcr.io
   ```

3. **DOCKER_USERNAME** (可选)
   ```
   your-username
   ```

4. **DOCKER_PASSWORD** (可选)
   ```
   your-token
   ```

#### 环境特定 Secrets

在 **Settings → Environments** 中为每个环境配置：

**staging 环境:**
- `STAGING_REDIS_HOST`
- `STAGING_REDIS_PASSWORD`
- `STAGING_OLLAMA_API_KEY`

**production 环境:**
- `PROD_REDIS_HOST`
- `PROD_REDIS_PASSWORD`
- `PROD_OLLAMA_API_KEY`

### GitHub Environments

配置环境保护规则：

**Settings → Environments → New environment**

#### staging 环境

```
Environment name: staging
Deployment branches: develop
Protection rules:
  - Optional: Required reviewers (1)
```

#### production 环境

```
Environment name: production
Deployment branches: main
Protection rules:
  - Required reviewers (2)
  - Wait timer: 5 minutes
  - Prevent self-review
```

### 配置管理最佳实践

#### 1. 使用环境变量

```typescript
// src/config.ts
export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000'),
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  ollama: {
    host: process.env.OLLAMA_HOST || 'localhost',
    port: parseInt(process.env.OLLAMA_PORT || '11434'),
  },
};
```

#### 2. 配置文件模板

创建 `.env.example`:

```bash
# .env.example
NODE_ENV=development
PORT=3000
REDIS_HOST=localhost
REDIS_PORT=6379
OLLAMA_HOST=localhost
OLLAMA_PORT=11434
```

#### 3. 配置验证

```typescript
// src/config/validate.ts
import { z } from 'zod';

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  PORT: z.string().transform(Number),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string().transform(Number),
});

export function validateConfig() {
  try {
    return configSchema.parse(process.env);
  } catch (error) {
    console.error('Invalid configuration:', error);
    process.exit(1);
  }
}
```

### Kubernetes ConfigMap 和 Secret

#### ConfigMap

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grokforge-config
  namespace: grokforge
data:
  NODE_ENV: "production"
  PORT: "3000"
  REDIS_HOST: "redis"
  REDIS_PORT: "6379"
```

#### Secret

```yaml
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: grokforge-secrets
  namespace: grokforge
type: Opaque
stringData:
  REDIS_PASSWORD: "your-password"
  OLLAMA_API_KEY: "your-api-key"
```

---

## 🎯 最佳实践

### 提交信息规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型 (type):**
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试
- `chore`: 构建/工具变更

**示例:**

```bash
git commit -m "feat(auth): add user login functionality"
git commit -m "fix(api): resolve timeout issue in queue server"
git commit -m "docs: update deployment guide"
git commit -m "chore: bump version to 1.0.0"
```

### 工作流检查清单

#### 开发新功能

- [ ] 从 `develop` 创建 `feature/*` 分支
- [ ] 编写测试
- [ ] 提交代码（遵循提交规范）
- [ ] 创建 PR 到 `develop`
- [ ] 代码审查通过
- [ ] CI 测试通过
- [ ] 合并到 `develop`

#### 发布新版本

- [ ] 更新 `package.json` 版本号
- [ ] 更新 `CHANGELOG.md`
- [ ] 创建 `release/*` 分支
- [ ] 测试通过
- [ ] 合并到 `main`
- [ ] 创建版本标签
- [ ] 创建 GitHub Release
- [ ] 合并回 `develop`

### 自动化工作流

#### 完整 CI/CD 流程

```
开发者提交代码
    ↓
创建 Pull Request
    ↓
自动运行 CI (测试、构建)
    ↓
代码审查
    ↓
合并到 develop/main
    ↓
自动构建 Docker 镜像
    ↓
自动部署到环境
    ↓
(可选) 创建标签触发发布
    ↓
自动部署到生产环境
```

### 故障排查

#### 常见问题

1. **CI 失败**
   - 检查 GitHub Actions 日志
   - 本地运行测试: `bun test`
   - 检查依赖: `bun install`

2. **构建失败**
   - 检查 Dockerfile
   - 查看构建日志
   - 检查资源限制

3. **部署失败**
   - 检查 Kubernetes 配置
   - 验证 Secrets 和 ConfigMap
   - 查看 Pod 日志: `kubectl logs -f <pod>`

---

## 📚 相关资源

- [Git Flow 工作流](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
- [语义化版本](https://semver.org/lang/zh-CN/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Kubernetes 文档](https://kubernetes.io/docs/)

---

## 🔗 相关文件

- `.github/workflows/ci.yml` - CI 工作流
- `.github/workflows/build-images.yml` - 构建镜像
- `.github/workflows/deploy-k8s.yml` - 自动部署
- `.github/workflows/deploy-k8s-manual.yml` - 手动部署
- `package.json` - 版本管理
- `k8s/` - Kubernetes 配置

---

**最后更新**: 2025-01-20


# GitHub Actions CI/CD 配置指南

## 概述

本项目已配置完整的 GitHub Actions CI/CD 工作流，支持：
- ✅ 自动构建和测试
- ✅ 自动构建 Docker 镜像
- ✅ 自动部署到 Kubernetes
- ✅ 多环境支持（staging, production）
- ✅ 版本标签部署

## 工作流文件

### 1. CI 工作流 (`ci.yml`)

**触发：** Push 或 PR 到 main/develop 分支

**功能：**
- 安装依赖
- 类型检查
- 构建应用

### 2. 构建镜像 (`build-images.yml`)

**触发：** Push 到 main/develop 或创建版本标签

**功能：**
- 构建三个 Docker 镜像
- 推送到 GitHub Container Registry
- 支持多架构（amd64, arm64）

### 3. 自动部署 (`deploy-k8s.yml`)

**触发：** Push 到 main 分支或创建版本标签

**功能：**
- 自动更新镜像标签
- 部署到 Kubernetes
- 验证部署状态

### 4. 手动部署 (`deploy-k8s-manual.yml`)

**触发：** 手动触发

**功能：**
- 选择部署环境
- 指定镜像标签
- 用于回滚或测试

## 配置步骤

### 步骤 1: 配置 GitHub Secrets

进入仓库设置 → Secrets and variables → Actions，添加：

#### 必需 Secret

**KUBECONFIG**
```bash
# 获取 kubeconfig（base64 编码）
cat ~/.kube/config | base64 -w 0

# Windows PowerShell
[Convert]::ToBase64String([System.IO.File]::ReadAllBytes("$HOME\.kube\config"))
```

#### 可选 Secrets（如果使用其他镜像仓库）

- `DOCKER_REGISTRY` - 镜像仓库地址
- `DOCKER_USERNAME` - 用户名
- `DOCKER_PASSWORD` - 密码或令牌

### 步骤 2: 配置 GitHub Environments

进入仓库设置 → Environments，创建：

1. **staging** - 测试环境
   - 可选：添加保护规则（需要审批）
   - 可选：限制部署分支

2. **production** - 生产环境
   - 推荐：添加保护规则（必须审批）
   - 推荐：限制只能从 main 分支部署

### 步骤 3: 更新镜像仓库地址（可选）

如果使用 GitHub Container Registry（默认），无需修改。

如果使用其他仓库，编辑 `.github/workflows/build-images.yml`：

```yaml
env:
  REGISTRY: docker.io  # 或你的私有仓库
  IMAGE_PREFIX: your-username/grokforge
```

## 使用方式

### 自动部署流程

```bash
# 1. 开发并提交到 develop
git checkout develop
git add .
git commit -m "feat: new feature"
git push origin develop

# 2. CI 自动运行测试

# 3. 合并到 main（触发自动部署）
git checkout main
git merge develop
git push origin main

# 4. 自动构建镜像并部署到生产环境
```

### 版本发布

```bash
# 创建版本标签
git tag v1.0.0
git push origin v1.0.0

# 这会：
# 1. 构建带版本标签的镜像
# 2. 部署到生产环境
```

### 手动部署

1. 进入 GitHub Actions 页面
2. 选择 "Manual Deploy to Kubernetes"
3. 点击 "Run workflow"
4. 选择：
   - Environment: staging 或 production
   - Image tag: 镜像标签（留空使用 latest）
5. 点击 "Run workflow"

## 镜像地址格式

默认使用 GitHub Container Registry：

```
ghcr.io/<username>/grokforge-app:<tag>
ghcr.io/<username>/grokforge-queue:<tag>
ghcr.io/<username>/grokforge-scheduler:<tag>
```

**标签规则：**
- `latest` - main 分支最新版本
- `main` - main 分支
- `develop` - develop 分支
- `v1.0.0` - 版本标签
- `main-<sha>` - 提交 SHA

## 查看部署状态

### 在 GitHub 上

1. 进入 Actions 标签页
2. 查看工作流运行状态
3. 点击运行查看详细日志

### 在 Kubernetes 集群

```bash
# 查看所有资源
kubectl get all -n grokforge

# 查看 Pod 状态
kubectl get pods -n grokforge

# 查看部署历史
kubectl rollout history deployment/app -n grokforge

# 查看日志
kubectl logs -f deployment/app -n grokforge
```

## 故障排查

### 构建失败

**问题：** Docker 镜像构建失败

**解决：**
1. 检查 Dockerfile 是否正确
2. 查看构建日志
3. 验证依赖是否完整

### 部署失败

**问题：** Kubernetes 部署失败

**解决：**
1. 检查 KUBECONFIG Secret 是否正确
2. 验证集群连接：`kubectl cluster-info`
3. 查看 Pod 事件：`kubectl describe pod <pod-name> -n grokforge`

### 镜像拉取失败

**问题：** Pod 无法拉取镜像

**解决：**
1. 检查镜像是否已成功推送
2. 验证镜像仓库权限
3. 检查镜像标签是否正确

### 权限问题

**问题：** GitHub Actions 没有权限

**解决：**
1. 检查仓库设置 → Actions → General
2. 确保 "Workflow permissions" 设置为 "Read and write permissions"
3. 检查 Environments 的保护规则

## 高级配置

### 使用私有镜像仓库

编辑 `.github/workflows/build-images.yml`：

```yaml
- name: Log in to Container Registry
  uses: docker/login-action@v3
  with:
    registry: ${{ secrets.DOCKER_REGISTRY }}
    username: ${{ secrets.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_PASSWORD }}
```

### 添加部署前测试

在 `deploy-k8s.yml` 中添加：

```yaml
- name: Run integration tests
  run: |
    # 你的测试命令
    bun test
```

### 配置通知

添加 Slack/Discord 通知：

```yaml
- name: Notify deployment
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Deployment completed'
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

## 安全最佳实践

1. ✅ 使用 GitHub Environments 保护生产环境
2. ✅ 限制 Secrets 访问范围
3. ✅ 定期轮换 KUBECONFIG
4. ✅ 审查所有部署
5. ✅ 使用最小权限原则
6. ✅ 启用分支保护规则

## 示例：完整 CI/CD 流程

```bash
# 1. 开发功能
git checkout -b feature/new-feature
# ... 开发代码 ...
git commit -m "feat: add new feature"
git push origin feature/new-feature

# 2. 创建 PR
# GitHub: 创建 Pull Request 到 develop

# 3. CI 自动运行测试
# GitHub Actions: 自动运行 ci.yml

# 4. 合并到 develop
# GitHub: 合并 PR
# GitHub Actions: 自动构建镜像（develop 标签）

# 5. 合并到 main
git checkout main
git merge develop
git push origin main
# GitHub Actions: 自动构建并部署到生产

# 6. 创建版本
git tag v1.0.0
git push origin v1.0.0
# GitHub Actions: 构建带版本标签的镜像并部署
```

## 相关文件

- `.github/workflows/ci.yml` - CI 工作流
- `.github/workflows/build-images.yml` - 构建镜像
- `.github/workflows/deploy-k8s.yml` - 自动部署
- `.github/workflows/deploy-k8s-manual.yml` - 手动部署
- `k8s/` - Kubernetes 配置文件


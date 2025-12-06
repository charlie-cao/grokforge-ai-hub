# GitHub Actions CI/CD 工作流说明

## 工作流概览

### 1. CI - Build and Test (`ci.yml`)

**触发条件：**
- Push 到 `main` 或 `develop` 分支
- Pull Request 到 `main` 或 `develop` 分支

**执行内容：**
- 安装依赖
- 类型检查
- 构建应用
- 验证构建输出

### 2. Build Docker Images (`build-images.yml`)

**触发条件：**
- Push 到 `main` 或 `develop` 分支
- 创建版本标签（`v*`）
- 手动触发

**执行内容：**
- 构建三个 Docker 镜像：
  - `app` (主应用)
  - `queue` (队列服务器)
  - `scheduler` (调度服务器)
- 推送到 GitHub Container Registry (ghcr.io)
- 支持多架构（amd64, arm64）
- 使用缓存加速构建

**镜像标签：**
- `latest` - main 分支
- `main` - main 分支
- `develop` - develop 分支
- `v1.0.0` - 版本标签
- `main-<sha>` - 提交 SHA

### 3. Deploy to Kubernetes (`deploy-k8s.yml`)

**触发条件：**
- Push 到 `main` 分支
- 创建版本标签（`v*`）
- 手动触发（可选择环境）

**执行内容：**
- 更新 Kubernetes 清单中的镜像标签
- 部署到 Kubernetes 集群
- 等待部署完成
- 验证部署状态

### 4. Manual Deploy (`deploy-k8s-manual.yml`)

**触发条件：**
- 仅手动触发

**用途：**
- 手动部署到指定环境
- 指定特定镜像标签
- 用于回滚或测试

## 配置要求

### GitHub Secrets

在 GitHub 仓库设置中添加以下 Secrets：

1. **KUBECONFIG** (必需)
   - 你的 Kubernetes 集群 kubeconfig 文件（base64 编码）
   - 获取方式：
     ```bash
     cat ~/.kube/config | base64
     ```

2. **DOCKER_REGISTRY** (可选)
   - 如果使用非 GitHub Container Registry
   - 例如：`docker.io/your-username`

3. **DOCKER_USERNAME** (可选)
   - Docker 仓库用户名

4. **DOCKER_PASSWORD** (可选)
   - Docker 仓库密码或访问令牌

### GitHub Environments

在仓库设置中创建 Environments：

1. **staging** - 测试环境
2. **production** - 生产环境

每个环境可以配置：
- Protection rules（需要审批）
- Secrets（环境特定）
- Deployment branches（允许的分支）

## 使用方式

### 自动部署

**推送到 main 分支：**
```bash
git push origin main
```

这会自动：
1. 运行 CI 测试
2. 构建 Docker 镜像
3. 部署到 Kubernetes

**创建版本标签：**
```bash
git tag v1.0.0
git push origin v1.0.0
```

这会：
1. 构建镜像（带版本标签）
2. 部署到生产环境

### 手动部署

1. 进入 GitHub Actions 页面
2. 选择 "Manual Deploy to Kubernetes"
3. 点击 "Run workflow"
4. 选择环境和镜像标签
5. 点击 "Run workflow"

### 查看部署状态

```bash
# 在本地查看
kubectl get all -n grokforge

# 查看日志
kubectl logs -f deployment/app -n grokforge
```

## 自定义配置

### 使用其他镜像仓库

编辑 `.github/workflows/build-images.yml`：

```yaml
env:
  REGISTRY: docker.io  # 或你的私有仓库
  IMAGE_PREFIX: your-username/grokforge
```

### 修改部署环境

编辑 `.github/workflows/deploy-k8s.yml` 中的 `environment` 字段。

### 添加部署前测试

在 `deploy-k8s.yml` 中添加测试步骤：

```yaml
- name: Run tests
  run: |
    # 你的测试命令
    bun test
```

## 安全建议

1. **使用 GitHub Environments** 保护生产环境
2. **限制 Secrets 访问** - 只给需要的环境
3. **使用 OIDC** 而不是长期凭证（如果支持）
4. **定期轮换密钥**
5. **审查部署日志**

## 故障排查

### 构建失败

- 检查 Dockerfile 是否正确
- 查看构建日志
- 验证依赖是否完整

### 部署失败

- 检查 KUBECONFIG 是否正确
- 验证集群连接
- 查看 Pod 事件：`kubectl describe pod <pod-name> -n grokforge`

### 镜像拉取失败

- 检查镜像仓库权限
- 验证镜像标签是否正确
- 确认镜像已成功推送

## 示例：完整 CI/CD 流程

```bash
# 1. 开发并提交
git add .
git commit -m "feat: new feature"
git push origin develop

# 2. CI 自动运行测试和构建

# 3. 合并到 main
git checkout main
git merge develop
git push origin main

# 4. 自动部署到生产环境

# 5. 创建版本标签
git tag v1.0.0
git push origin v1.0.0
```


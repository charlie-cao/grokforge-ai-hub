# Kubernetes 快速部署指南

## 前置要求

- Kubernetes 集群 (v1.20+)
- kubectl 已配置
- Docker 镜像已推送到仓库

## 快速部署步骤

### 1. 构建并推送镜像

```bash
# 设置镜像仓库
export DOCKER_REGISTRY=your-registry.com/grokforge

# 构建镜像
docker build -t ${DOCKER_REGISTRY}/app:latest -f Dockerfile .
docker build -t ${DOCKER_REGISTRY}/queue:latest -f Dockerfile.queue .
docker build -t ${DOCKER_REGISTRY}/scheduler:latest -f Dockerfile.scheduler .

# 推送镜像
docker push ${DOCKER_REGISTRY}/app:latest
docker push ${DOCKER_REGISTRY}/queue:latest
docker push ${DOCKER_REGISTRY}/scheduler:latest
```

### 2. 更新镜像地址

编辑 `k8s/app.yaml`, `k8s/queue-server.yaml`, `k8s/scheduler-server.yaml`，将 `your-registry` 替换为你的镜像仓库地址。

### 3. 一键部署

```bash
# 使用部署脚本（推荐）
chmod +x k8s/deploy.sh
export DOCKER_REGISTRY=your-registry.com/grokforge
./k8s/deploy.sh

# 或手动部署
kubectl apply -f k8s/
```

### 4. 检查状态

```bash
kubectl get all -n grokforge
kubectl get pods -n grokforge
```

### 5. 访问应用

```bash
# 端口转发（临时访问）
kubectl port-forward -n grokforge svc/app-service 3000:80

# 或使用 LoadBalancer IP
kubectl get svc app-service -n grokforge
```

## 配置说明

### 存储

- **Redis**: 1Gi
- **Ollama 模型**: 20Gi（大模型存储）
- **应用数据**: 5Gi

### 资源限制

- **App**: 256Mi-512Mi 内存
- **Ollama**: 2Gi-8Gi 内存（AI 模型需要）

### 扩缩容

```bash
# 扩展应用
kubectl scale deployment app -n grokforge --replicas=3
```

## 故障排查

```bash
# 查看 Pod 日志
kubectl logs -f deployment/app -n grokforge

# 查看 Pod 状态
kubectl describe pod <pod-name> -n grokforge

# 查看事件
kubectl get events -n grokforge
```

## 清理

```bash
kubectl delete namespace grokforge
```

